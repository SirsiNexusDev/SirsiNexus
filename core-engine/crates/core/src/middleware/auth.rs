use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::request::Parts,
    response::{IntoResponse, Response},
    RequestPartsExt,
};
use http::header::AUTHORIZATION;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    error::AppError,
    models::user::User,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    sub: String,
    exp: i64,
}

#[derive(Debug)]
pub struct AuthUser {
    pub id: Uuid,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        let authorization = parts
            .headers
            .get(AUTHORIZATION)
            .ok_or_else(|| AppError::Unauthorized.into_response())?;

        let token = authorization
            .to_str()
            .map_err(|_| AppError::Unauthorized.into_response())?
            .strip_prefix("Bearer ")
            .ok_or_else(|| AppError::Unauthorized.into_response())?;

        let user_id = verify_token(token)
            .map_err(|_| AppError::Unauthorized.into_response())?;

        Ok(AuthUser { id: user_id })
    }
}

pub fn create_token(user_id: &Uuid) -> Result<String, AppError> {
    let claims = Claims {
        sub: user_id.to_string(),
        exp: (chrono::Utc::now() + chrono::Duration::hours(24)).timestamp(),
    };

    let secret = std::env::var("JWT_SECRET").map_err(|_| AppError::Internal("JWT_SECRET not set".into()))?;
    let key = EncodingKey::from_secret(secret.as_bytes());

    encode(&Header::default(), &claims, &key)
        .map_err(|_| AppError::Internal("Failed to create token".into()))
}

fn verify_token(token: &str) -> Result<Uuid, AppError> {
    let secret = std::env::var("JWT_SECRET").map_err(|_| AppError::Internal("JWT_SECRET not set".into()))?;
    let key = DecodingKey::from_secret(secret.as_bytes());

    let claims = decode::<Claims>(token, &key, &Validation::default())
        .map_err(|_| AppError::Unauthorized)?
        .claims;

    Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Internal("Invalid user ID in token".into()))
}
