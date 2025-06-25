use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

use crate::error::{KeyVaultError, KeyVaultResult};

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Certificate {
    pub id: Uuid,
    pub name: String,
    pub data: Vec<u8>,
    pub certificate_type: CertificateType,
    pub status: CertificateStatus,
    pub not_before: OffsetDateTime,
    pub not_after: OffsetDateTime,
    pub issuer: String,
    pub subject: String,
    pub sans: Vec<String>,
    pub key_usage: Vec<String>,
    pub extended_key_usage: Vec<String>,
    pub is_ca: bool,
    #[serde(flatten)]
    pub metadata: serde_json::Value,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "certificate_type", rename_all = "lowercase")]
pub enum CertificateType {
    Server,
    Client,
    CA,
    Intermediate,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "certificate_status", rename_all = "lowercase")]
pub enum CertificateStatus {
    Active,
    Expired,
    Revoked,
    Pending,
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct CertificateOptions {
    #[validate(length(min = 1))]
    pub subject: String,
    pub sans: Vec<String>,
    pub key_usage: Vec<String>,
    pub extended_key_usage: Vec<String>,
    pub is_ca: bool,
    pub validity_months: i32,
    pub key_type: String,
    pub key_bits: i32,
}

impl Certificate {
    pub async fn create(pool: &sqlx::PgPool, options: CertificateOptions) -> KeyVaultResult<Self> {
        // Generate certificate using rcgen
        let cert = generate_certificate(&options)?;

        // Store in database
        let certificate = sqlx::query_as!(Self,
            r#"
            INSERT INTO certificates (
                name, data, certificate_type, status, not_before, not_after,
                issuer, subject, sans, key_usage, extended_key_usage,
                is_ca, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
            "#,
            options.subject,
            cert.certificate_der,
            CertificateType::Server as CertificateType, // TODO: Make configurable
            CertificateStatus::Active as CertificateStatus,
            cert.not_before,
            cert.not_after,
            cert.issuer_name,
            cert.subject_name,
            &options.sans,
            &options.key_usage,
            &options.extended_key_usage,
            options.is_ca,
            serde_json::Value::default(),
        )
        .fetch_one(pool)
        .await
        .map_err(KeyVaultError::Database)?;

        Ok(certificate)
    }

    pub async fn find_by_id(pool: &sqlx::PgPool, id: Uuid) -> KeyVaultResult<Option<Self>> {
        let certificate = sqlx::query_as!(Self,
            r#"
            SELECT * FROM certificates WHERE id = $1
            "#,
            id
        )
        .fetch_optional(pool)
        .await
        .map_err(KeyVaultError::Database)?;

        Ok(certificate)
    }

    pub async fn revoke(&mut self, pool: &sqlx::PgPool, reason: &str) -> KeyVaultResult<()> {
        self.status = CertificateStatus::Revoked;

        sqlx::query!(
            r#"
            UPDATE certificates
            SET status = $1,
                metadata = jsonb_set(
                    metadata::jsonb,
                    '{revocation}'::text[],
                    $2::jsonb
                )
            WHERE id = $3
            "#,
            CertificateStatus::Revoked as CertificateStatus,
            serde_json::json!({
                "reason": reason,
                "timestamp": OffsetDateTime::now_utc(),
            }),
            self.id,
        )
        .execute(pool)
        .await
        .map_err(KeyVaultError::Database)?;

        Ok(())
    }

    pub async fn renew(&self, pool: &sqlx::PgPool, options: Option<CertificateOptions>) -> KeyVaultResult<Self> {
        let options = options.unwrap_or_else(|| CertificateOptions {
            subject: self.subject.clone(),
            sans: self.sans.clone(),
            key_usage: self.key_usage.clone(),
            extended_key_usage: self.extended_key_usage.clone(),
            is_ca: self.is_ca,
            validity_months: 12, // Default 1 year
            key_type: "RSA".to_string(),
            key_bits: 2048,
        });

        Certificate::create(pool, options).await
    }
}

fn generate_certificate(options: &CertificateOptions) -> KeyVaultResult<rcgen::Certificate> {
    use rcgen::{Certificate, CertificateParams, DnType, SanType};

    let mut params = CertificateParams::new(vec![]);
    
    // Set subject
    params.distinguished_name.push(DnType::CommonName, &options.subject);

    // Add SANs
    for san in &options.sans {
        params.subject_alt_names.push(SanType::DnsName(san.clone()));
    }

    // Set key usage
    // TODO: Map string key usage to rcgen key usage flags

    // Set CA flag
    params.is_ca = options.is_ca;

    // Set validity
    params.not_before = time::OffsetDateTime::now_utc();
    params.not_after = params.not_before + time::Duration::days(options.validity_months as i64 * 30);

    Certificate::from_params(params)
        .map_err(|e| KeyVaultError::Certificate(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;

    async fn setup() -> sqlx::PgPool {
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/sirsi_test".to_string());
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database");

        sqlx::query!("TRUNCATE certificates CASCADE")
            .execute(&pool)
            .await
            .expect("Failed to clear test database");

        pool
    }

    #[tokio::test]
    async fn test_certificate_lifecycle() {
        let pool = setup().await;

        // Create
        let options = CertificateOptions {
            subject: "test.example.com".to_string(),
            sans: vec!["www.test.example.com".to_string()],
            key_usage: vec!["digitalSignature".to_string()],
            extended_key_usage: vec!["serverAuth".to_string()],
            is_ca: false,
            validity_months: 12,
            key_type: "RSA".to_string(),
            key_bits: 2048,
        };

        let cert = Certificate::create(&pool, options.clone())
            .await
            .expect("Failed to create certificate");

        assert_eq!(cert.subject, options.subject);
        assert_eq!(cert.sans, options.sans);
        assert_eq!(cert.status, CertificateStatus::Active);

        // Read
        let found = Certificate::find_by_id(&pool, cert.id)
            .await
            .expect("Failed to fetch certificate")
            .expect("Certificate not found");

        assert_eq!(found.id, cert.id);
        assert_eq!(found.subject, cert.subject);

        // Revoke
        let mut cert = found;
        cert.revoke(&pool, "Test revocation")
            .await
            .expect("Failed to revoke certificate");

        let revoked = Certificate::find_by_id(&pool, cert.id)
            .await
            .expect("Failed to fetch certificate")
            .expect("Certificate not found");

        assert_eq!(revoked.status, CertificateStatus::Revoked);

        // Renew
        let renewed = revoked.renew(&pool, None)
            .await
            .expect("Failed to renew certificate");

        assert_eq!(renewed.subject, revoked.subject);
        assert_eq!(renewed.sans, revoked.sans);
        assert_eq!(renewed.status, CertificateStatus::Active);
        assert!(renewed.id != revoked.id);
    }
}
