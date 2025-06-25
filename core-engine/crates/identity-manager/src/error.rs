use thiserror::Error;
use tonic::Status;

#[derive(Error, Debug)]
pub enum IdentityError {
    #[error("Authentication error: {0}")]
    Auth(String),

    #[error("Authorization error: {0}")]
    Authorization(String),

    #[error("Identity provider error: {0}")]
    IdP(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Service error: {0}")]
    Service(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<IdentityError> for Status {
    fn from(error: IdentityError) -> Self {
        match error {
            IdentityError::Auth(msg) => Status::unauthenticated(msg),
            IdentityError::Authorization(msg) => Status::permission_denied(msg),
            IdentityError::IdP(msg) => Status::unavailable(msg),
            IdentityError::Database(e) => Status::internal(e.to_string()),
            IdentityError::Validation(msg) => Status::invalid_argument(msg),
            IdentityError::NotFound(msg) => Status::not_found(msg),
            IdentityError::Config(msg) => Status::failed_precondition(msg),
            IdentityError::Service(msg) => Status::internal(msg),
            IdentityError::Internal(msg) => Status::internal(msg),
        }
    }
}

pub type IdentityResult<T> = Result<T, IdentityError>;
