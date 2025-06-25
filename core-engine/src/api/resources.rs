use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::{
    db::DbPool,
    error::{AppResult, AppError},
    middleware::AuthUser,
};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Resource {
    pub id: Uuid,
    pub name: String,
    pub resource_type: String,
    pub description: Option<String>,
    pub data: serde_json::Value,
    pub owner_id: Uuid,
    pub project_id: Option<Uuid>,
    pub created_at: time::PrimitiveDateTime,
    pub updated_at: time::PrimitiveDateTime,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateResourceRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    #[validate(length(min = 1, max = 100))]
    pub resource_type: String,
    pub description: Option<String>,
    pub data: serde_json::Value,
    pub project_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateResourceRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct ResourceResponse {
    pub id: Uuid,
    pub name: String,
    pub resource_type: String,
    pub description: Option<String>,
    pub data: serde_json::Value,
    pub owner_id: Uuid,
    pub project_id: Option<Uuid>,
    pub created_at: time::PrimitiveDateTime,
    pub updated_at: time::PrimitiveDateTime,
}

impl From<Resource> for ResourceResponse {
    fn from(resource: Resource) -> Self {
        Self {
            id: resource.id,
            name: resource.name,
            resource_type: resource.resource_type,
            description: resource.description,
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
    let resources = sqlx::query_as!(
        Resource,
        r#"SELECT id, name, resource_type, description, data, owner_id, project_id, created_at, updated_at
        FROM resources WHERE owner_id = $1
        ORDER BY created_at DESC"#,
        auth.user_id
    )
    .fetch_all(&db)
    .await?;

    let response: Vec<ResourceResponse> = resources.into_iter().map(ResourceResponse::from).collect();
    Ok(Json(response))
}

#[axum::debug_handler]
pub async fn create_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Json(payload): Json<CreateResourceRequest>,
) -> AppResult<Json<ResourceResponse>> {
    // Validate request
    payload.validate().map_err(|e| AppError::Validation(e.to_string()))?;

    // Create resource
    let resource = sqlx::query_as!(
        Resource,
        r#"INSERT INTO resources (name, resource_type, description, data, owner_id, project_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, resource_type, description, data, owner_id, project_id, created_at, updated_at"#,
        payload.name,
        payload.resource_type,
        payload.description,
        payload.data,
        auth.user_id,
        payload.project_id
    )
    .fetch_one(&db)
    .await?;

    Ok(Json(ResourceResponse::from(resource)))
}

#[axum::debug_handler]
pub async fn get_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<ResourceResponse>> {
    let resource = sqlx::query_as!(
        Resource,
        r#"SELECT id, name, resource_type, description, data, owner_id, project_id, created_at, updated_at
        FROM resources WHERE id = $1 AND owner_id = $2"#,
        id,
        auth.user_id
    )
    .fetch_optional(&db)
    .await?
    .ok_or_else(|| AppError::NotFound("Resource not found".into()))?;

    Ok(Json(ResourceResponse::from(resource)))
}

#[axum::debug_handler]
pub async fn update_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateResourceRequest>,
) -> AppResult<Json<ResourceResponse>> {
    // Validate request
    payload.validate().map_err(|e| AppError::Validation(e.to_string()))?;

    // Check if resource exists and user owns it
    let _existing = sqlx::query!(
        "SELECT id FROM resources WHERE id = $1 AND owner_id = $2",
        id,
        auth.user_id
    )
    .fetch_optional(&db)
    .await?
    .ok_or_else(|| AppError::NotFound("Resource not found".into()))?;

    // Update resource
    let resource = sqlx::query_as!(
        Resource,
        r#"UPDATE resources
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            data = COALESCE($3, data),
            updated_at = NOW()
        WHERE id = $4 AND owner_id = $5
        RETURNING id, name, resource_type, description, data, owner_id, project_id, created_at, updated_at"#,
        payload.name,
        payload.description,
        payload.data,
        id,
        auth.user_id
    )
    .fetch_one(&db)
    .await?;

    Ok(Json(ResourceResponse::from(resource)))
}

#[axum::debug_handler]
pub async fn delete_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<()>> {
    // Check if resource exists and user owns it
    let result = sqlx::query!(
        "DELETE FROM resources WHERE id = $1 AND owner_id = $2",
        id,
        auth.user_id
    )
    .execute(&db)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Resource not found".into()));
    }

    Ok(Json(()))
}
