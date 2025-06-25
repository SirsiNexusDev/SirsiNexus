use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::AuthUser,
    models::project::{CreateProject, Project, ProjectStatus},
};

#[axum::debug_handler]
pub async fn list_projects_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
) -> Result<Json<Vec<Project>>, AppError> {
    let projects = Project::list(&pool, auth_user.id).await?;
    Ok(Json(projects))
}

#[axum::debug_handler]
pub async fn create_project_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Json(new_project): Json<CreateProject>,
) -> Result<Json<Project>, AppError> {
    let project = Project::create(&pool, new_project, auth_user.id).await?;
    Ok(Json(project))
}

#[axum::debug_handler]
pub async fn get_project_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Project>, AppError> {
    let project = Project::get(&pool, id).await?;
    if project.owner_id != auth_user.id {
        return Err(AppError::Forbidden);
    }
    Ok(Json(project))
}

#[axum::debug_handler]
pub async fn update_project_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
    Json(mut project): Json<Project>,
) -> Result<Json<Project>, AppError> {
    let existing = Project::get(&pool, id).await?;
    if existing.owner_id != auth_user.id {
        return Err(AppError::Forbidden);
    }
    project.id = id;
    project.owner_id = auth_user.id;
    project.update(&pool).await?;
    Ok(Json(project))
}

#[axum::debug_handler]
pub async fn delete_project_handler(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<(), AppError> {
    let project = Project::get(&pool, id).await?;
    if project.owner_id != auth_user.id {
        return Err(AppError::Forbidden);
    }
    Project::delete(&pool, id).await?;
    Ok(())
}
