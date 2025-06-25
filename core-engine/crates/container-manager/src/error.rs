use thiserror::Error;
use tonic::Status;

#[derive(Error, Debug)]
pub enum ContainerError {
    #[error("Registry error: {0}")]
    Registry(String),

    #[error("Platform error: {0}")]
    Platform(String),

    #[error("Deployment error: {0}")]
    Deployment(String),

    #[error("Service mesh error: {0}")]
    ServiceMesh(String),

    #[error("Kubernetes error: {0}")]
    Kubernetes(#[from] kube::Error),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("OCI error: {0}")]
    OCI(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Permission denied: {0}")]
    Permission(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Service error: {0}")]
    Service(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<ContainerError> for Status {
    fn from(error: ContainerError) -> Self {
        match error {
            ContainerError::Registry(msg) => Status::internal(msg),
            ContainerError::Platform(msg) => Status::internal(msg),
            ContainerError::Deployment(msg) => Status::internal(msg),
            ContainerError::ServiceMesh(msg) => Status::internal(msg),
            ContainerError::Kubernetes(e) => Status::internal(e.to_string()),
            ContainerError::Database(e) => Status::internal(e.to_string()),
            ContainerError::OCI(msg) => Status::internal(msg),
            ContainerError::Network(msg) => Status::unavailable(msg),
            ContainerError::Validation(msg) => Status::invalid_argument(msg),
            ContainerError::NotFound(msg) => Status::not_found(msg),
            ContainerError::Permission(msg) => Status::permission_denied(msg),
            ContainerError::Config(msg) => Status::failed_precondition(msg),
            ContainerError::Service(msg) => Status::internal(msg),
            ContainerError::Internal(msg) => Status::internal(msg),
        }
    }
}

pub type ContainerResult<T> = Result<T, ContainerError>;
