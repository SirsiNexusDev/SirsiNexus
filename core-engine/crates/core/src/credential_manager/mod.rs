// Credential Management Module
// Secure storage and management of cloud provider credentials

use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};
use std::collections::HashMap;
use uuid::Uuid;
use ring::aead::{Aad, LessSafeKey, Nonce, UnboundKey, AES_256_GCM};
use ring::rand::{SecureRandom, SystemRandom};
use base64::{encode, decode};

pub mod aws;
pub mod azure;
pub mod gcp;
pub mod types;
pub mod encryption;

use types::*;
use encryption::*;

#[derive(Debug, Clone)]
pub struct CredentialManager {
    db_pool: PgPool,
    encryption_key: Vec<u8>,
}

impl CredentialManager {
    pub fn new(db_pool: PgPool, encryption_key: Vec<u8>) -> Self {
        Self {
            db_pool,
            encryption_key,
        }
    }

    /// Store credentials securely in the database
    pub async fn store_credentials(
        &self,
        user_id: Uuid,
        provider: CloudProvider,
        credentials: ProviderCredentials,
        alias: Option<String>,
    ) -> Result<Uuid> {
        let credential_id = Uuid::new_v4();
        let encrypted_data = self.encrypt_credentials(&credentials)?;
        
        sqlx::query!(
            r#"
            INSERT INTO credentials (id, user_id, provider, alias, encrypted_data, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            "#,
            credential_id,
            user_id,
            provider.to_string(),
            alias,
            encrypted_data
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| anyhow!("Failed to store credentials: {}", e))?;

        Ok(credential_id)
    }

    /// Retrieve credentials by ID
    pub async fn get_credentials(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
    ) -> Result<Option<StoredCredential>> {
        let row = sqlx::query!(
            r#"
            SELECT id, provider, alias, encrypted_data, created_at, updated_at
            FROM credentials
            WHERE id = $1 AND user_id = $2
            "#,
            credential_id,
            user_id
        )
        .fetch_optional(&self.db_pool)
        .await
        .map_err(|e| anyhow!("Failed to retrieve credentials: {}", e))?;

        if let Some(row) = row {
            let provider = row.provider.parse::<CloudProvider>()?;
            let credentials = self.decrypt_credentials(&row.encrypted_data)?;
            
            Ok(Some(StoredCredential {
                id: row.id,
                user_id,
                provider,
                alias: row.alias,
                credentials,
                created_at: row.created_at.unwrap_or_else(|| sqlx::types::time::OffsetDateTime::now_utc()),
                updated_at: row.updated_at.unwrap_or_else(|| sqlx::types::time::OffsetDateTime::now_utc()),
            }))
        } else {
            Ok(None)
        }
    }

    /// List all credentials for a user
    pub async fn list_credentials(&self, user_id: Uuid) -> Result<Vec<CredentialSummary>> {
        let rows = sqlx::query!(
            r#"
            SELECT id, provider, alias, created_at, updated_at
            FROM credentials
            WHERE user_id = $1
            ORDER BY created_at DESC
            "#,
            user_id
        )
        .fetch_all(&self.db_pool)
        .await
        .map_err(|e| anyhow!("Failed to list credentials: {}", e))?;

        let summaries = rows
            .into_iter()
            .map(|row| {
                let provider = row.provider.parse::<CloudProvider>().unwrap_or(CloudProvider::AWS);
                CredentialSummary {
                    id: row.id,
                    provider,
                    alias: row.alias,
                    created_at: row.created_at.unwrap_or_else(|| sqlx::types::time::OffsetDateTime::now_utc()),
                    updated_at: row.updated_at.unwrap_or_else(|| sqlx::types::time::OffsetDateTime::now_utc()),
                }
            })
            .collect();

        Ok(summaries)
    }

    /// Update credentials
    pub async fn update_credentials(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
        credentials: ProviderCredentials,
        alias: Option<String>,
    ) -> Result<()> {
        let encrypted_data = self.encrypt_credentials(&credentials)?;
        
        let result = sqlx::query!(
            r#"
            UPDATE credentials
            SET encrypted_data = $1, alias = $2, updated_at = NOW()
            WHERE id = $3 AND user_id = $4
            "#,
            encrypted_data,
            alias,
            credential_id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| anyhow!("Failed to update credentials: {}", e))?;

        if result.rows_affected() == 0 {
            return Err(anyhow!("Credential not found or access denied"));
        }

        Ok(())
    }

    /// Delete credentials
    pub async fn delete_credentials(&self, user_id: Uuid, credential_id: Uuid) -> Result<()> {
        let result = sqlx::query!(
            r#"
            DELETE FROM credentials
            WHERE id = $1 AND user_id = $2
            "#,
            credential_id,
            user_id
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| anyhow!("Failed to delete credentials: {}", e))?;

        if result.rows_affected() == 0 {
            return Err(anyhow!("Credential not found or access denied"));
        }

        Ok(())
    }

    /// Test credentials by attempting authentication
    pub async fn test_credentials(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
    ) -> Result<CredentialTestResult> {
        let stored_cred = self.get_credentials(user_id, credential_id).await?;
        
        if let Some(cred) = stored_cred {
            match cred.provider {
                CloudProvider::AWS => {
                    aws::test_aws_credentials(&cred.credentials).await
                }
                CloudProvider::Azure => {
                    azure::test_azure_credentials(&cred.credentials).await
                }
                CloudProvider::GCP => {
                    gcp::test_gcp_credentials(&cred.credentials).await
                }
                CloudProvider::DigitalOcean => {
                    // TODO: Implement DigitalOcean testing
                    Ok(CredentialTestResult {
                        success: false,
                        message: "DigitalOcean testing not yet implemented".to_string(),
                        details: None,
                    })
                }
            }
        } else {
            Err(anyhow!("Credential not found"))
        }
    }

    /// Get credentials for use with cloud providers
    pub async fn get_provider_credentials(
        &self,
        user_id: Uuid,
        provider: CloudProvider,
        alias: Option<&str>,
    ) -> Result<Option<ProviderCredentials>> {
        let mut query = "
            SELECT encrypted_data
            FROM credentials
            WHERE user_id = $1 AND provider = $2
        ".to_string();
        
        if alias.is_some() {
            query.push_str(" AND alias = $3");
        }
        
        query.push_str(" ORDER BY created_at DESC LIMIT 1");

        let row = if let Some(alias) = alias {
            sqlx::query_scalar::<_, String>(&query)
                .bind(user_id)
                .bind(provider.to_string())
                .bind(alias)
                .fetch_optional(&self.db_pool)
                .await
        } else {
            sqlx::query_scalar::<_, String>(&query)
                .bind(user_id)
                .bind(provider.to_string())
                .fetch_optional(&self.db_pool)
                .await
        }
        .map_err(|e| anyhow!("Failed to retrieve provider credentials: {}", e))?;

        if let Some(encrypted_data) = row {
            let credentials = self.decrypt_credentials(&encrypted_data)?;
            Ok(Some(credentials))
        } else {
            Ok(None)
        }
    }

    /// Encrypt credentials using AES-256-GCM
    fn encrypt_credentials(&self, credentials: &ProviderCredentials) -> Result<String> {
        let serialized = serde_json::to_vec(credentials)
            .map_err(|e| anyhow!("Failed to serialize credentials: {}", e))?;
        
        encrypt_data(&self.encryption_key, &serialized)
    }

    /// Decrypt credentials
    fn decrypt_credentials(&self, encrypted_data: &str) -> Result<ProviderCredentials> {
        let decrypted = decrypt_data(&self.encryption_key, encrypted_data)?;
        
        serde_json::from_slice(&decrypted)
            .map_err(|e| anyhow!("Failed to deserialize credentials: {}", e))
    }
}

/// Initialize credential management tables
pub async fn initialize_tables(pool: &PgPool) -> Result<()> {
    sqlx::query!(
        r#"
        CREATE TABLE IF NOT EXISTS credentials (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            provider VARCHAR(50) NOT NULL,
            alias VARCHAR(255),
            encrypted_data TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, provider, alias)
        )
        "#
    )
    .execute(pool)
    .await
    .map_err(|e| anyhow!("Failed to create credentials table: {}", e))?;

    // Create index for faster lookups
    sqlx::query!(
        r#"
        CREATE INDEX IF NOT EXISTS idx_credentials_user_provider 
        ON credentials(user_id, provider)
        "#
    )
    .execute(pool)
    .await
    .map_err(|e| anyhow!("Failed to create credentials index: {}", e))?;

    Ok(())
}
