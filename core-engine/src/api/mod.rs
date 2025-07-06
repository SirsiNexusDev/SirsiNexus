use axum::{
    routing::{get, post, put, delete},
    Router,
};
use sqlx::PgPool; // CockroachDB uses PostgreSQL protocol

pub mod auth;
pub mod projects;
mod resources;

// Individual module routers for backwards compatibility
pub mod health {
    use axum::{routing::get, Router};
    
    pub fn router() -> Router {
        Router::new().route("/health", get(super::health_check))
    }
}

pub mod users {
    use axum::Router;
    
    pub fn router() -> Router {
        Router::new()
        // Add user-specific routes here if needed
    }
}

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

pub async fn health_check() -> &'static str {
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
    #[serial_test::serial]
    async fn test_health_check() {
        // Load environment variables from .env file
        dotenv::dotenv().ok();
        
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable".to_string());
        
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(1)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database");
        
        let app = create_router(pool);
        
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
