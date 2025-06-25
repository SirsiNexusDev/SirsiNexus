use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::transport::Server as TonicServer;
use tracing::info;

use crate::{
    agent::{AgentManager, AgentService, AgentServiceTrait},
    config::AppConfig,
    db,
};

pub struct Server {
    config: AppConfig,
    agent_manager: Arc<RwLock<AgentManager>>,
}

impl Server {
    pub fn new(config: AppConfig) -> Self {
        Self {
            config,
            agent_manager: Arc::new(RwLock::new(AgentManager::new())),
        }
    }

    pub async fn run(&self) -> anyhow::Result<()> {
        // Initialize telemetry
        crate::telemetry::init_telemetry(&self.config)?;

        // Create database pool
        let db_pool = db::create_pool(&self.config.database).await?;

        // Create HTTP server
        let http_addr = format!(
            "{}:{}",
            self.config.server.host, self.config.server.port
        ).parse()?;

        let http_server = axum::Server::bind(&http_addr)
            .serve(crate::api::create_router(db_pool).into_make_service());

        info!("HTTP server listening on {}", http_addr);

        // Create gRPC server
        let grpc_addr = format!(
            "{}:{}",
            self.config.server.host,
            self.config.server.port + 1, // Use next port for gRPC
        ).parse()?;

        let agent_service = AgentService::new(self.agent_manager.clone());
        
        let reflection_service = tonic_reflection::server::Builder::configure()
            .register_encoded_file_descriptor_set(crate::agent::service::FILE_DESCRIPTOR_SET)
            .build()?;

        let grpc_server = TonicServer::builder()
            .add_service(reflection_service)
            .add_service(agent_service)
            .serve(grpc_addr);

        info!("gRPC server listening on {}", grpc_addr);

        // Run both servers concurrently
        tokio::select! {
            result = http_server => {
                if let Err(e) = result {
                    tracing::error!("HTTP server error: {}", e);
                }
            }
            result = grpc_server => {
                if let Err(e) = result {
                    tracing::error!("gRPC server error: {}", e);
                }
            }
        }

        // Shutdown telemetry
        crate::telemetry::shutdown_telemetry();

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use tower::ServiceExt;
    use tonic::Request as TonicRequest;

    #[tokio::test]
    async fn test_server_health() {
        let config = AppConfig::load().unwrap();
        let server = Server::new(config);

        // Test HTTP health check
        let db_pool = db::create_pool(&server.config.database).await.unwrap();
        let app = crate::api::create_router(db_pool);

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

        // Test gRPC service
        let agent_service = AgentService::new(server.agent_manager.clone());
        
        let request = TonicRequest::new(crate::agent::service::StartSessionRequest {
            user_id: "test-user".to_string(),
            context: std::collections::HashMap::new(),
        });

        let response = agent_service.start_session(request).await.unwrap();
        let response = response.into_inner();

        assert!(!response.session_id.is_empty());
        assert!(!response.available_agents.is_empty());
    }
}
