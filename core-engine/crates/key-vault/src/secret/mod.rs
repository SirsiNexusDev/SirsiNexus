use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::KeyVaultResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Secret {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub value: SecretValue,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
    pub metadata: HashMap<String, String>,
    pub labels: HashMap<String, String>,
    pub rotation_policy: Option<RotationPolicy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecretValue {
    Plain(String),
    Encrypted(Vec<u8>),
    Certificate(CertificateSecret),
    SSH(SSHSecret),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CertificateSecret {
    pub certificate: String,
    pub private_key: String,
    pub chain: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SSHSecret {
    pub private_key: String,
    pub public_key: String,
    pub passphrase: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RotationPolicy {
    pub interval: chrono::Duration,
    pub algorithm: RotationAlgorithm,
    pub auto_rotate: bool,
    pub notify_before: Option<chrono::Duration>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RotationAlgorithm {
    AES256,
    RSA2048,
    RSA4096,
    ED25519,
    ECDSA,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RotationEvent {
    pub secret_id: String,
    pub old_version: i32,
    pub new_version: i32,
    pub timestamp: DateTime<Utc>,
    pub triggered_by: String,
    pub reason: RotationReason,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RotationReason {
    Scheduled,
    Manual,
    Compromised,
    PolicyChange,
}

#[async_trait]
pub trait SecretManager: Send + Sync {
    async fn create_secret(&self, secret: Secret) -> KeyVaultResult<Secret>;
    async fn get_secret(&self, id: &str) -> KeyVaultResult<Secret>;
    async fn get_secret_version(&self, id: &str, version: i32) -> KeyVaultResult<Secret>;
    async fn update_secret(&self, secret: Secret) -> KeyVaultResult<Secret>;
    async fn delete_secret(&self, id: &str) -> KeyVaultResult<()>;
    async fn list_secrets(&self) -> KeyVaultResult<Vec<Secret>>;
    async fn rotate_secret(&self, id: &str) -> KeyVaultResult<RotationEvent>;
    async fn get_rotation_history(&self, id: &str) -> KeyVaultResult<Vec<RotationEvent>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessPolicy {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub principals: Vec<String>,
    pub permissions: Vec<SecretPermission>,
    pub conditions: Option<AccessConditions>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretPermission {
    pub actions: Vec<SecretAction>,
    pub secret_patterns: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecretAction {
    Read,
    Write,
    Delete,
    List,
    Rotate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessConditions {
    pub ip_ranges: Option<Vec<String>>,
    pub time_window: Option<TimeWindow>,
    pub requires_mfa: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeWindow {
    pub start_time: chrono::NaiveTime,
    pub end_time: chrono::NaiveTime,
    pub days: Vec<chrono::Weekday>,
}

#[async_trait]
pub trait AccessPolicyManager: Send + Sync {
    async fn create_policy(&self, policy: AccessPolicy) -> KeyVaultResult<AccessPolicy>;
    async fn get_policy(&self, id: &str) -> KeyVaultResult<AccessPolicy>;
    async fn update_policy(&self, policy: AccessPolicy) -> KeyVaultResult<AccessPolicy>;
    async fn delete_policy(&self, id: &str) -> KeyVaultResult<()>;
    async fn list_policies(&self) -> KeyVaultResult<Vec<AccessPolicy>>;
    async fn validate_access(&self, principal: &str, secret_id: &str, action: SecretAction) -> KeyVaultResult<bool>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub principal: String,
    pub action: SecretAction,
    pub secret_id: String,
    pub success: bool,
    pub error: Option<String>,
    pub metadata: HashMap<String, String>,
}

#[async_trait]
pub trait AuditLogger: Send + Sync {
    async fn log_event(&self, event: AuditEvent) -> KeyVaultResult<()>;
    async fn get_events(&self, filter: AuditFilter) -> KeyVaultResult<Vec<AuditEvent>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditFilter {
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
    pub principal: Option<String>,
    pub action: Option<SecretAction>,
    pub secret_id: Option<String>,
    pub success: Option<bool>,
}
