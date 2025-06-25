use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};
use uuid::Uuid;

use crate::agent::manager::AgentManager;

tonic::include_proto!("sirsi.agent.v1");

pub struct AgentService {
    manager: Arc<RwLock<AgentManager>>,
}

impl AgentService {
    pub fn new(manager: Arc<RwLock<AgentManager>>) -> Self {
        Self { manager }
    }
}

#[tonic::async_trait]
impl agent_service_server::AgentService for AgentService {
    async fn start_session(
        &self,
        request: Request<StartSessionRequest>,
    ) -> Result<Response<StartSessionResponse>, Status> {
        let req = request.into_inner();
        
        let session_id = Uuid::new_v4().to_string();
        let manager = self.manager.read().await;
        
        let available_agents = manager.list_available_agents().await;

        Ok(Response::new(StartSessionResponse {
            session_id,
            available_agents,
        }))
    }

    async fn spawn_sub_agent(
        &self,
        request: Request<SpawnSubAgentRequest>,
    ) -> Result<Response<SpawnSubAgentResponse>, Status> {
        let req = request.into_inner();
        
        let manager = self.manager.write().await;
        let agent_id = manager
            .spawn_agent(&req.session_id, &req.agent_type, req.config)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(SpawnSubAgentResponse {
            agent_id,
            status: "running".to_string(),
        }))
    }

    async fn send_message(
        &self,
        request: Request<SendMessageRequest>,
    ) -> Result<Response<SendMessageResponse>, Status> {
        let req = request.into_inner();
        
        let manager = self.manager.read().await;
        let (message_id, response, suggestions) = manager
            .send_message(&req.session_id, &req.agent_id, &req.message, req.context)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(SendMessageResponse {
            message_id,
            response,
            suggestions,
        }))
    }

    async fn get_suggestions(
        &self,
        request: Request<GetSuggestionsRequest>,
    ) -> Result<Response<GetSuggestionsResponse>, Status> {
        let req = request.into_inner();
        
        let manager = self.manager.read().await;
        let suggestions = manager
            .get_suggestions(&req.session_id, &req.agent_id, &req.context_type, req.context)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetSuggestionsResponse { suggestions }))
    }

    async fn get_sub_agent_status(
        &self,
        request: Request<GetSubAgentStatusRequest>,
    ) -> Result<Response<GetSubAgentStatusResponse>, Status> {
        let req = request.into_inner();
        
        let manager = self.manager.read().await;
        let (status, metrics, capabilities) = manager
            .get_agent_status(&req.session_id, &req.agent_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetSubAgentStatusResponse {
            status,
            metrics,
            capabilities,
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_start_session() {
        let manager = Arc::new(RwLock::new(AgentManager::new()));
        let service = AgentService::new(manager);

        let request = Request::new(StartSessionRequest {
            user_id: "test-user".to_string(),
            context: HashMap::new(),
        });

        let response = service.start_session(request).await.unwrap();
        let response = response.into_inner();

        assert!(!response.session_id.is_empty());
        assert!(!response.available_agents.is_empty());
    }

    #[tokio::test]
    async fn test_spawn_sub_agent() {
        let manager = Arc::new(RwLock::new(AgentManager::new()));
        let service = AgentService::new(manager);

        let request = Request::new(SpawnSubAgentRequest {
            session_id: Uuid::new_v4().to_string(),
            agent_type: "test".to_string(),
            config: HashMap::new(),
        });

        let response = service.spawn_sub_agent(request).await.unwrap();
        let response = response.into_inner();

        assert!(!response.agent_id.is_empty());
        assert_eq!(response.status, "running");
    }
}
