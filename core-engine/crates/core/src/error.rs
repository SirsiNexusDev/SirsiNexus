use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use tracing::{error, warn};
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Authentication required")]
    Unauthorized,
    #[error("Access denied")]
    Forbidden,
    #[error("Resource not found")]
    NotFound,
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Internal server error")]
    Internal(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Rate limit exceeded")]
    RateLimit,
    #[error("Bad request: {0}")]
    BadRequest(String),
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match &self {
            AppError::Unauthorized => {
                warn!("Unauthorized access attempt");
                (StatusCode::UNAUTHORIZED, self.to_string())
            },
            AppError::Forbidden => {
                warn!("Forbidden access attempt");
                (StatusCode::FORBIDDEN, self.to_string())
            },
            AppError::NotFound => {
                warn!("Resource not found");
                (StatusCode::NOT_FOUND, self.to_string())
            },
            AppError::Database(e) => {
                error!(error = ?e, "Database error occurred");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string())
            },
            AppError::Internal(e) => {
                error!(error = %e, "Internal error occurred");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".to_string())
            },
            AppError::Validation(msg) => {
                warn!(message = %msg, "Validation error");
                (StatusCode::BAD_REQUEST, self.to_string())
            },
            AppError::RateLimit => {
                warn!("Rate limit exceeded");
                (StatusCode::TOO_MANY_REQUESTS, self.to_string())
            },
            AppError::BadRequest(msg) => {
                warn!(message = %msg, "Bad request");
                (StatusCode::BAD_REQUEST, self.to_string())
            },
        };

        let body = Json(ErrorResponse {
            error: error_message,
        });

        (status, body).into_response()
    }
}
