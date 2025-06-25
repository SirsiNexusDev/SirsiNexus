use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

mod auth;
mod projects;
mod resources;

pub fn create_router(pool: PgPool) -> Router {
    Router::new()
        // Auth routes
        .route("/auth/register", post(auth::register_handler))
        .route("/auth/login", post(auth::login_handler))

        // Project routes
        .route("/projects", get(projects::list_projects_handler))
        .route("/projects", post(projects::create_project_handler))
        .route("/projects/:id", get(projects::get_project_handler))
        .route("/projects/:id", put(projects::update_project_handler))
        .route("/projects/:id", delete(projects::delete_project_handler))

        // Resource routes
        .route("/resources", get(resources::list_resources_handler))
        .route("/resources", post(resources::create_resource_handler))
        .route("/resources/:id", get(resources::get_resource_handler))
        .route("/resources/:id", put(resources::update_resource_handler))
        .route("/resources/:id", delete(resources::delete_resource_handler))

        // Add middleware
        .layer(TraceLayer::new_for_http())
        .with_state(pool)
}
