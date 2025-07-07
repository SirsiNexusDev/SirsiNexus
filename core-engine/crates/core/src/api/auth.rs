use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    Extension,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::CurrentUser;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

// Simple mock auth for development
pub async fn login_handler(
    State(_pool): State<PgPool>,
    Json(login): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    // For development - accept any login
    let user = UserInfo {
        id: Uuid::new_v4().to_string(),
        email: login.email.clone(),
        name: login.email.split('@').next().unwrap_or("User").to_string(),
        role: if login.email.contains("admin") { "admin" } else { "user" }.to_string(),
    };
    
    let response = LoginResponse {
        token: "mock_jwt_token_for_development".to_string(),
        user,
    };
    
    Ok(Json(response))
}

pub async fn register_handler(
    State(_pool): State<PgPool>,
    Json(register): Json<RegisterRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    // For development - accept any registration
    let user = UserInfo {
        id: Uuid::new_v4().to_string(),
        email: register.email.clone(),
        name: register.name,
        role: "user".to_string(),
    };
    
    let response = LoginResponse {
        token: "mock_jwt_token_for_development".to_string(),
        user,
    };
    
    Ok(Json(response))
}
