use axum::{
    middleware,
    routing::{get, post, put, delete},
    Router,
};
use sqlx::PgPool;
use tower_http::trace::TraceLayer;
use crate::auth::CurrentUser;

mod auth;
mod credentials;
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

        // Credential routes (protected)
        .route("/credentials", get(credentials::list_credentials_handler))
        .route("/credentials", post(credentials::create_credential_handler))
        .route("/credentials/:id", get(credentials::get_credential_handler))
        .route("/credentials/:id", put(credentials::update_credential_handler))
        .route("/credentials/:id", delete(credentials::delete_credential_handler))
        .route("/credentials/:id/test", post(credentials::test_credential_handler))
        .layer(middleware::from_fn(add_mock_user))

        // Add middleware
        .layer(TraceLayer::new_for_http())
        .with_state(pool)
}

// Mock authentication middleware for development
async fn add_mock_user(
    mut request: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    // For development - inject a mock user
    let mock_user = CurrentUser::mock_user();
    request.extensions_mut().insert(mock_user);
    next.run(request).await
}
