use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::str::FromStr;
use uuid::Uuid;
use sqlx::types::time::OffsetDateTime;
use anyhow::{Result, anyhow};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CloudProvider {
    AWS,
    Azure,
    GCP,
    DigitalOcean,
}

impl std::fmt::Display for CloudProvider {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CloudProvider::AWS => write!(f, "aws"),
            CloudProvider::Azure => write!(f, "azure"),
            CloudProvider::GCP => write!(f, "gcp"),
            CloudProvider::DigitalOcean => write!(f, "digitalocean"),
        }
    }
}

impl FromStr for CloudProvider {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self> {
        match s.to_lowercase().as_str() {
            "aws" => Ok(CloudProvider::AWS),
            "azure" => Ok(CloudProvider::Azure),
            "gcp" => Ok(CloudProvider::GCP),
            "digitalocean" => Ok(CloudProvider::DigitalOcean),
            _ => Err(anyhow!("Unknown cloud provider: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "provider", content = "data")]
pub enum ProviderCredentials {
    AWS(AWSCredentials),
    Azure(AzureCredentials),
    GCP(GCPCredentials),
    DigitalOcean(DigitalOceanCredentials),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AWSCredentials {
    pub access_key_id: String,
    pub secret_access_key: String,
    pub region: Option<String>,
    pub session_token: Option<String>, // For temporary credentials
    pub role_arn: Option<String>, // For role assumption
    pub external_id: Option<String>, // For cross-account access
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AzureCredentials {
    pub client_id: String,
    pub client_secret: String,
    pub tenant_id: String,
    pub subscription_id: Option<String>,
    pub resource_group: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GCPCredentials {
    pub service_account_key: String, // JSON key file content
    pub project_id: Option<String>,
    pub region: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DigitalOceanCredentials {
    pub api_token: String,
    pub spaces_access_key: Option<String>,
    pub spaces_secret_key: Option<String>,
    pub spaces_endpoint: Option<String>,
}

#[derive(Debug, Clone)]
pub struct StoredCredential {
    pub id: Uuid,
    pub user_id: Uuid,
    pub provider: CloudProvider,
    pub alias: Option<String>,
    pub credentials: ProviderCredentials,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialSummary {
    pub id: Uuid,
    pub provider: CloudProvider,
    pub alias: Option<String>,
    #[serde(with = "time::serde::iso8601")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::iso8601")]
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialTestResult {
    pub success: bool,
    pub message: String,
    pub details: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateCredentialRequest {
    pub provider: CloudProvider,
    pub credentials: ProviderCredentials,
    pub alias: Option<String>,
    pub test_connection: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCredentialRequest {
    pub credentials: Option<ProviderCredentials>,
    pub alias: Option<String>,
    pub test_connection: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialResponse {
    pub id: Uuid,
    pub provider: CloudProvider,
    pub alias: Option<String>,
    #[serde(with = "time::serde::iso8601")]
    pub created_at: OffsetDateTime,
    #[serde(with = "time::serde::iso8601")]
    pub updated_at: OffsetDateTime,
    pub test_result: Option<CredentialTestResult>,
}

// Provider-specific validation
impl AWSCredentials {
    pub fn validate(&self) -> Result<()> {
        if self.access_key_id.is_empty() {
            return Err(anyhow!("AWS Access Key ID is required"));
        }
        if self.secret_access_key.is_empty() {
            return Err(anyhow!("AWS Secret Access Key is required"));
        }
        if self.access_key_id.len() < 16 || self.access_key_id.len() > 128 {
            return Err(anyhow!("AWS Access Key ID has invalid length"));
        }
        Ok(())
    }
}

impl AzureCredentials {
    pub fn validate(&self) -> Result<()> {
        if self.client_id.is_empty() {
            return Err(anyhow!("Azure Client ID is required"));
        }
        if self.client_secret.is_empty() {
            return Err(anyhow!("Azure Client Secret is required"));
        }
        if self.tenant_id.is_empty() {
            return Err(anyhow!("Azure Tenant ID is required"));
        }
        // Validate UUID format for Azure IDs
        if Uuid::parse_str(&self.client_id).is_err() {
            return Err(anyhow!("Azure Client ID must be a valid UUID"));
        }
        if Uuid::parse_str(&self.tenant_id).is_err() {
            return Err(anyhow!("Azure Tenant ID must be a valid UUID"));
        }
        Ok(())
    }
}

impl GCPCredentials {
    pub fn validate(&self) -> Result<()> {
        if self.service_account_key.is_empty() {
            return Err(anyhow!("GCP Service Account Key is required"));
        }
        // Validate JSON format
        let _: serde_json::Value = serde_json::from_str(&self.service_account_key)
            .map_err(|_| anyhow!("GCP Service Account Key must be valid JSON"))?;
        Ok(())
    }
}

impl DigitalOceanCredentials {
    pub fn validate(&self) -> Result<()> {
        if self.api_token.is_empty() {
            return Err(anyhow!("DigitalOcean API Token is required"));
        }
        if self.api_token.len() < 64 {
            return Err(anyhow!("DigitalOcean API Token appears to be invalid"));
        }
        Ok(())
    }
}

impl ProviderCredentials {
    pub fn validate(&self) -> Result<()> {
        match self {
            ProviderCredentials::AWS(creds) => creds.validate(),
            ProviderCredentials::Azure(creds) => creds.validate(),
            ProviderCredentials::GCP(creds) => creds.validate(),
            ProviderCredentials::DigitalOcean(creds) => creds.validate(),
        }
    }

    pub fn provider(&self) -> CloudProvider {
        match self {
            ProviderCredentials::AWS(_) => CloudProvider::AWS,
            ProviderCredentials::Azure(_) => CloudProvider::Azure,
            ProviderCredentials::GCP(_) => CloudProvider::GCP,
            ProviderCredentials::DigitalOcean(_) => CloudProvider::DigitalOcean,
        }
    }

    pub fn mask_sensitive_data(&self) -> ProviderCredentials {
        match self {
            ProviderCredentials::AWS(creds) => {
                ProviderCredentials::AWS(AWSCredentials {
                    access_key_id: mask_string(&creds.access_key_id),
                    secret_access_key: mask_string(&creds.secret_access_key),
                    region: creds.region.clone(),
                    session_token: creds.session_token.as_ref().map(|s| mask_string(s)),
                    role_arn: creds.role_arn.clone(),
                    external_id: creds.external_id.as_ref().map(|s| mask_string(s)),
                })
            }
            ProviderCredentials::Azure(creds) => {
                ProviderCredentials::Azure(AzureCredentials {
                    client_id: creds.client_id.clone(),
                    client_secret: mask_string(&creds.client_secret),
                    tenant_id: creds.tenant_id.clone(),
                    subscription_id: creds.subscription_id.clone(),
                    resource_group: creds.resource_group.clone(),
                })
            }
            ProviderCredentials::GCP(creds) => {
                ProviderCredentials::GCP(GCPCredentials {
                    service_account_key: "***MASKED***".to_string(),
                    project_id: creds.project_id.clone(),
                    region: creds.region.clone(),
                })
            }
            ProviderCredentials::DigitalOcean(creds) => {
                ProviderCredentials::DigitalOcean(DigitalOceanCredentials {
                    api_token: mask_string(&creds.api_token),
                    spaces_access_key: creds.spaces_access_key.as_ref().map(|s| mask_string(s)),
                    spaces_secret_key: creds.spaces_secret_key.as_ref().map(|s| mask_string(s)),
                    spaces_endpoint: creds.spaces_endpoint.clone(),
                })
            }
        }
    }
}

fn mask_string(s: &str) -> String {
    if s.len() <= 8 {
        "*".repeat(s.len())
    } else {
        format!("{}...{}", &s[..4], &s[s.len()-4..])
    }
}

// HTTP API request/response types
#[derive(Debug, Serialize, Deserialize)]
pub struct ListCredentialsResponse {
    pub credentials: Vec<CredentialSummary>,
    pub total: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: Option<String>,
    pub details: Option<HashMap<String, String>>,
}
