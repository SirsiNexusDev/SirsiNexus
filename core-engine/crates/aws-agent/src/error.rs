use thiserror::Error;
use tonic::Status;

#[derive(Error, Debug)]
pub enum AgentError {
    #[error("AWS SDK error: {0}")]
    AwsSdk(String),

    #[error("Invalid request: {0}")]
    InvalidRequest(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Authentication error: {0}")]
    Auth(String),

    #[error("Operation not supported: {0}")]
    Unsupported(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<AgentError> for Status {
    fn from(error: AgentError) -> Self {
        match error {
            AgentError::AwsSdk(msg) => Status::internal(msg),
            AgentError::InvalidRequest(msg) => Status::invalid_argument(msg),
            AgentError::NotFound(msg) => Status::not_found(msg),
            AgentError::Auth(msg) => Status::unauthenticated(msg),
            AgentError::Unsupported(msg) => Status::unimplemented(msg),
            AgentError::Internal(msg) => Status::internal(msg),
        }
    }
}

pub type AgentResult<T> = Result<T, AgentError>;
