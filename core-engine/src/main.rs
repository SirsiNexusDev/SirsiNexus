mod api;
mod agent;
mod config;
mod db;
mod error;
mod middleware;
mod models;
mod proto;
mod server;
mod telemetry;

use crate::config::AppConfig;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load configuration
    let config = AppConfig::load()?;

    // Create and run server
    let server = server::Server::new(config);
    server.run().await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
        Router,
        routing::get,
    };
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_health_check() {
        let config = AppConfig::load().unwrap();
        let db_pool = db::create_pool(&config.database).await.unwrap();
        
        let app = api::create_router(db_pool.clone());
        
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
    }
}
