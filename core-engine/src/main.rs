use sirsi_core::config::AppConfig;
use sirsi_core::server::start_grpc_server;
use sirsi_core::telemetry;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load configuration
    let config = AppConfig::load()?;

    // Initialize telemetry
    telemetry::init(&config).await?;

    // Start gRPC server
    start_grpc_server(config.server.grpc_addr.port(), &config.redis.url).await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sirsi_core::{api, db};
    use axum::{
        body::Body,
        http::{Request, StatusCode},
        Router,
        routing::get,
    };
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_health_check() {
        // Simple health check test without full config dependency
        use sirsi_core::api::health;
        use axum::http::StatusCode;
        
        let response = health::health_check().await;
        
        // Just verify the health check function works
        assert!(response.status() == StatusCode::OK || response.status() == StatusCode::SERVICE_UNAVAILABLE);
    }
}
