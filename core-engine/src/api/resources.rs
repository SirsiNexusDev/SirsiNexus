use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;
use uuid::Uuid;
use validator::Validate;

use crate::{
    db::DbPool,
    error::{AppResult, AppError},
    middleware::AuthUser,
    models::{Resource, CreateResource, UpdateResource},
};

#[derive(Debug, Serialize)]
pub struct ResourceResponse {
    pub id: Uuid,
    pub name: String,
    pub resource_type: String,
    pub data: serde_json::Value,
    pub owner_id: Uuid,
    pub project_id: Uuid,
    pub created_at: Option<time::OffsetDateTime>,
    pub updated_at: Option<time::OffsetDateTime>,
}

impl From<Resource> for ResourceResponse {
    fn from(resource: Resource) -> Self {
        Self {
            id: resource.id,
            name: resource.name,
            resource_type: resource.resource_type,
            data: resource.data,
            owner_id: resource.owner_id,
            project_id: resource.project_id,
            created_at: resource.created_at,
            updated_at: resource.updated_at,
        }
    }
}

#[axum::debug_handler]
pub async fn list_resources_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
) -> AppResult<Json<Vec<ResourceResponse>>> {
    let resources = Resource::find_by_owner(&db, auth.user_id).await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let response: Vec<ResourceResponse> = resources.into_iter().map(ResourceResponse::from).collect();
    Ok(Json(response))
}

#[axum::debug_handler]
pub async fn create_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Json(payload): Json<CreateResource>,
) -> AppResult<Json<ResourceResponse>> {
    // Validate request
    payload.validate().map_err(|e| AppError::Validation(e.to_string()))?;

    // Create resource
    let resource = Resource::create(&db, payload, auth.user_id).await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(Json(ResourceResponse::from(resource)))
}

#[axum::debug_handler]
pub async fn get_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<ResourceResponse>> {
    let resource = Resource::find_by_id(&db, id, auth.user_id).await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound("Resource not found".into()))?;

    Ok(Json(ResourceResponse::from(resource)))
}

#[axum::debug_handler]
pub async fn update_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateResource>,
) -> AppResult<Json<ResourceResponse>> {
    // Validate request
    payload.validate().map_err(|e| AppError::Validation(e.to_string()))?;

    // Check if resource exists and user owns it
    let resource = Resource::find_by_id(&db, id, auth.user_id).await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound("Resource not found".into()))?;

    // Update resource
    resource.update(&db, payload).await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    // Fetch updated resource
    let updated_resource = Resource::find_by_id(&db, id, auth.user_id).await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::Internal("Resource disappeared after update".into()))?;

    Ok(Json(ResourceResponse::from(updated_resource)))
}

#[axum::debug_handler]
pub async fn delete_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<()>> {
    let deleted = Resource::delete(&db, id, auth.user_id).await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if !deleted {
        return Err(AppError::NotFound("Resource not found".into()));
    }

    Ok(Json(()))
}
