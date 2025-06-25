use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::AuthUser,
    models::resource::{CreateResource, Resource},
};

#[axum::debug_handler]
pub async fn list_resources_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
) -> Result<Json<Vec<Resource>>, AppError> {
    let resources = Resource::list(&pool, auth_user.id).await?;
    Ok(Json(resources))
}

#[axum::debug_handler]
pub async fn create_resource_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Json(new_resource): Json<CreateResource>,
) -> Result<Json<Resource>, AppError> {
    let resource = Resource::create(&pool, new_resource, auth_user.id).await?;
    Ok(Json(resource))
}

#[axum::debug_handler]
pub async fn get_resource_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Resource>, AppError> {
    let resource = Resource::get(&pool, id).await?;
    if resource.owner_id != auth_user.id {
        return Err(AppError::Forbidden);
    }
    Ok(Json(resource))
}

#[axum::debug_handler]
pub async fn update_resource_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
    Json(mut resource): Json<Resource>,
) -> Result<Json<Resource>, AppError> {
    let existing = Resource::get(&pool, id).await?;
    if existing.owner_id != auth_user.id {
        return Err(AppError::Forbidden);
    }
    resource.id = id;
    resource.owner_id = auth_user.id;
    resource.update(&pool).await?;
    Ok(Json(resource))
}

#[axum::debug_handler]
pub async fn delete_resource_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<(), AppError> {
    let resource = Resource::get(&pool, id).await?;
    if resource.owner_id != auth_user.id {
        return Err(AppError::Forbidden);
    }
    Resource::delete(&pool, id).await?;
    Ok(())
}
