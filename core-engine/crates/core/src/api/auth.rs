use axum::{
    extract::State,
    Json,
    handler::Handler,
};
use sqlx::PgPool;

use crate::{
    error::AppError,
    models::user::{CreateUser, User},
};

#[axum::debug_handler]
pub async fn register_handler(
    State(pool): State<PgPool>,
    Json(create_user): Json<CreateUser>,
) -> Result<Json<User>, AppError> {
    let password_hash = argon2::hash_password(
        create_user.password.as_bytes(),
        &argon2::PasswordHasher::default(),
    )?.to_string();

    let user = User::create(&pool, create_user.email, password).await?;
    Ok(Json(user))
}

#[axum::debug_handler]
pub async fn login_handler(
    State(pool): State<PgPool>,
    Json(login): Json<CreateUser>,
) -> Result<Json<String>, AppError> {
    let user = User::get_by_email(&pool, &login.email).await?;

    let is_valid = argon2::verify_password(
        login.password.as_bytes(),
        &argon2::PasswordHash::new(&user.password_hash)?,
    ).is_ok();

    if !is_valid {
        return Err(AppError::Unauthorized);
    }

    let token = crate::middleware::auth::create_token(&user.id)?;
    Ok(Json(token))
}
