use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::{
    db::DbPool,
    error::Result,
    middleware::AuthUser,
};

#[axum::debug_handler]
pub async fn update_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(resource): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>> {
    // TODO: Implement resource update logic
    Ok(Json(resource))
}

#[axum::debug_handler]
pub async fn delete_resource_handler(
    State(db): State<DbPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<()>> {
    // TODO: Implement resource deletion logic
    Ok(Json(()))
}
