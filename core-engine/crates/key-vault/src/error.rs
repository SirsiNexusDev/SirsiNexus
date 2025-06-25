use thiserror::Error;
use tonic::Status;

#[derive(Error, Debug)]
pub enum KeyVaultError {
    #[error("Key management error: {0}")]
    Key(String),

    #[error("Certificate error: {0}")]
    Certificate(String),

    #[error("Secret management error: {0}")]
    Secret(String),

    #[error("HSM error: {0}")]
    HSM(String),

    #[error("Backup error: {0}")]
    Backup(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Permission denied: {0}")]
    Permission(String),

    #[error("Service error: {0}")]
    Service(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<KeyVaultError> for Status {
    fn from(error: KeyVaultError) -> Self {
        match error {
            KeyVaultError::Key(msg) => Status::internal(msg),
            KeyVaultError::Certificate(msg) => Status::internal(msg),
            KeyVaultError::Secret(msg) => Status::internal(msg),
            KeyVaultError::HSM(msg) => Status::internal(msg),
            KeyVaultError::Backup(msg) => Status::internal(msg),
            KeyVaultError::Database(e) => Status::internal(e.to_string()),
            KeyVaultError::Validation(msg) => Status::invalid_argument(msg),
            KeyVaultError::NotFound(msg) => Status::not_found(msg),
            KeyVaultError::Config(msg) => Status::failed_precondition(msg),
            KeyVaultError::Permission(msg) => Status::permission_denied(msg),
            KeyVaultError::Service(msg) => Status::internal(msg),
            KeyVaultError::Internal(msg) => Status::internal(msg),
        }
    }
}

pub type KeyVaultResult<T> = Result<T, KeyVaultError>;
