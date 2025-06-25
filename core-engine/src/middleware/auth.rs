use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    RequestPartsExt,
};
use http::header::AUTHORIZATION;
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    models::user::User,
};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: i64,
    iat: i64,
}

#[derive(Debug)]
pub struct AuthUser {
    pub user: User,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
    PgPool: FromRequestParts<S>,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        // Extract the token from the Authorization header
        let auth_header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .and_then(|value| value.strip_prefix("Bearer "))
            .ok_or_else(|| AppError::Auth("Missing authorization header".into()).into_response())?;

        // Decode and validate the token
        let claims = decode::<Claims>(
            auth_header,
            &DecodingKey::from_secret(b"your-secret-key"), // In production, use proper secret
            &Validation::default(),
        )
        .map_err(|_| AppError::Auth("Invalid token".into()).into_response())?
        .claims;

        // Parse the user ID from the token
        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| AppError::Auth("Invalid user ID".into()).into_response())?;

        // Get the database pool from the state
        let pool = PgPool::from_request_parts(parts, state)
            .await
            .map_err(|e| {
                AppError::Internal("Database connection error".into()).into_response()
            })?;

        // Get the user from the database
        let user = User::find_by_id(&pool, user_id)
            .await
            .map_err(|e| e.into_response())?
            .ok_or_else(|| AppError::Auth("User not found".into()).into_response())?;

        Ok(AuthUser { user })
    }
}

// Utility function to verify access token
pub async fn verify_token(token: &str) -> AppResult<Claims> {
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(b"your-secret-key"), // In production, use proper secret
        &Validation::default(),
    )
    .map_err(|_| AppError::Auth("Invalid token".into()))?
    .claims;

    Ok(claims)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        extract::State,
        http::{Request, StatusCode},
        routing::get,
        Router,
    };
    use sqlx::postgres::PgPoolOptions;
    use tower::ServiceExt;

    async fn setup() -> PgPool {
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/sirsi_test".to_string());
        
        PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database")
    }

    #[tokio::test]
    async fn test_auth_middleware() {
        let pool = setup().await;
        
        // Create a test router with a protected endpoint
        let app = Router::new()
            .route("/protected", get(protected_handler))
            .with_state(pool.clone());

        // Create a test request without auth header
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/protected")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

        // Create a test request with invalid auth header
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/protected")
                    .header(AUTHORIZATION, "Bearer invalid_token")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
    }

    async fn protected_handler(auth: AuthUser) -> &'static str {
        "Protected content"
    }
}
