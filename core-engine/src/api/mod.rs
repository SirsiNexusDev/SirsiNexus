use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;

mod auth;
mod projects;
mod resources;

pub fn create_router(db: PgPool) -> Router {
    Router::new()
        .route("/health", get(health_check))
        // Auth routes
        .route("/auth/register", post(auth::register_handler))
        .route("/auth/login", post(auth::login_handler))
        // Projects routes
        .route("/projects", get(projects::list_projects_handler))
        .route("/projects", post(projects::create_project_handler))
        .route("/projects/:id", get(projects::get_project_handler))
        .route("/projects/:id", put(projects::update_project_handler))
        .route("/projects/:id", delete(projects::delete_project_handler))
        // Resources routes
        .route("/resources", get(resources::list_resources_handler))
        .route("/resources", post(resources::create_resource_handler))
        .route("/resources/:id", get(resources::get_resource_handler))
        .route("/resources/:id", put(resources::update_resource_handler))
        .route("/resources/:id", delete(resources::delete_resource_handler))
        .with_state(db)
}

async fn health_check() -> &'static str {
    "OK"
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;
    use axum::body::Body;
    use axum::http::Request;
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_health_check() {
        let app = create_router(PgPool::connect("dummy").await.unwrap());
        
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        
        let body = hyper::body::to_bytes(response.into_body()).await.unwrap();
        assert_eq!(&body[..], b"OK");
    }
}
