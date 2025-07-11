use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};

use crate::agent::manager::AgentManager;
use crate::agent::context::ContextStore;
use crate::proto::sirsi::agent::v1::agent_service_server::AgentService as AgentServiceTrait;
use crate::proto::sirsi::agent::v1::*;

// Re-export FILE_DESCRIPTOR_SET from proto module
pub use crate::proto::sirsi::agent::v1::FILE_DESCRIPTOR_SET;

#[derive(Clone)]
pub struct AgentService {
    manager: Arc<RwLock<AgentManager>>,
    context_store: Arc<ContextStore>,
}

impl AgentService {
    pub fn new(manager: Arc<RwLock<AgentManager>>, context_store: Arc<ContextStore>) -> Self {
        Self { manager, context_store }
    }
}

#[tonic::async_trait]
impl AgentServiceTrait for AgentService {
    async fn start_session(
        &self,
        request: Request<StartSessionRequest>,
    ) -> Result<Response<StartSessionResponse>, Status> {
        let _req = request.into_inner();
        
        let context = self.context_store
            .create_session_context(&_req.user_id, _req.metadata)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
        
        let session_id = context.session_id.clone();
        Ok(Response::new(StartSessionResponse {
            session_id,
            status: "active".to_string(),
            created_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
        }))
    }

    async fn spawn_sub_agent(
        &self,
        request: Request<SpawnSubAgentRequest>,
    ) -> Result<Response<SpawnSubAgentResponse>, Status> {
        let req = request.into_inner();
        
        // Convert AgentType enum to string for manager
        let agent_type_str = match req.agent_type {
            2 => "aws",     // AGENT_TYPE_AWS
            3 => "azure",   // AGENT_TYPE_AZURE
            4 => "gcp",     // AGENT_TYPE_GCP
            5 => "vsphere", // AGENT_TYPE_VSPHERE
            6 => "migration", // AGENT_TYPE_MIGRATION
            7 => "security", // AGENT_TYPE_SECURITY
            8 => "reporting", // AGENT_TYPE_REPORTING
            9 => "scripting", // AGENT_TYPE_SCRIPTING
            10 => "tutorial", // AGENT_TYPE_TUTORIAL
            _ => "general",
        };

        let _manager = self.manager.write().await;
        let agent_context = self.context_store
            .create_agent_context(&req.session_id, agent_type_str, req.config)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        let agent_id = agent_context.agent_id.clone();

        Ok(Response::new(SpawnSubAgentResponse {
            agent_id,
            agent_type: req.agent_type,
            status: "running".to_string(),
            created_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
        }))
    }

    async fn send_message(
        &self,
        request: Request<SendMessageRequest>,
    ) -> Result<Response<SendMessageResponse>, Status> {
        let req = request.into_inner();
        
        let manager = self.manager.read().await;
        let (response_id, response, suggestions) = manager
            .send_message(&req.session_id, &req.agent_id, &req.message, req.context)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        self.context_store
            .add_conversation_entry(&req.agent_id, &req.message, &response, vec![])
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(SendMessageResponse {
            response_id,
            agent_id: req.agent_id,
            response,
            response_type: req.message_type, // Echo back the message type
            suggestions,
            timestamp: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
        }))
    }

    async fn get_suggestions(
        &self,
        request: Request<GetSuggestionsRequest>,
    ) -> Result<Response<GetSuggestionsResponse>, Status> {
        let req = request.into_inner();
        
        // Convert suggestion_type enum to context string
        let context_type = match req.suggestion_type {
            1 => "action",        // SUGGESTION_TYPE_ACTION
            2 => "optimization",  // SUGGESTION_TYPE_OPTIMIZATION
            3 => "security",      // SUGGESTION_TYPE_SECURITY
            4 => "code",          // SUGGESTION_TYPE_CODE
            5 => "tutorial",      // SUGGESTION_TYPE_TUTORIAL
            6 => "troubleshooting", // SUGGESTION_TYPE_TROUBLESHOOTING
            _ => "general",
        };

        // Parse context string as a simple context map for now
        let context_map = std::collections::HashMap::new();
        
        let manager = self.manager.read().await;
        let suggestions = manager
            .get_suggestions(&req.session_id, &req.agent_id, context_type, context_map)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(GetSuggestionsResponse {
            suggestions,
            context: req.context,
            generated_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
        }))
    }

    async fn get_sub_agent_status(
        &self,
        request: Request<GetSubAgentStatusRequest>,
    ) -> Result<Response<GetSubAgentStatusResponse>, Status> {
        let req = request.into_inner();
        
        let _manager = self.manager.read().await;
        let agent_context = self.context_store
            .get_agent_context(&req.agent_id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;

        // Convert status string to enum
        let status = match agent_context.status.as_str() {
            "initializing" => 1, // AGENT_STATUS_INITIALIZING
            "ready" => 2,        // AGENT_STATUS_READY
            "busy" => 3,         // AGENT_STATUS_BUSY
            "error" => 4,        // AGENT_STATUS_ERROR
            "stopped" => 5,      // AGENT_STATUS_STOPPED
            _ => 2,               // AGENT_STATUS_READY
        };

        let metrics = agent_context.metadata.clone();

        Ok(Response::new(GetSubAgentStatusResponse {
            agent_id: req.agent_id.clone(),
            agent_type: 1, // AGENT_TYPE_GENERAL - TODO: Store actual agent type
            status,
            metrics,
            last_activity: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
        }))
    }

    async fn stop_session(
        &self,
        request: Request<StopSessionRequest>,
    ) -> Result<Response<StopSessionResponse>, Status> {
        let _req = request.into_inner();
        
        // TODO: Implement session cleanup in manager
        
        Ok(Response::new(StopSessionResponse {
            status: "stopped".to_string(),
            stopped_at: Some(prost_types::Timestamp::from(std::time::SystemTime::now())),
        }))
    }

    type StreamEventsStream = std::pin::Pin<Box<dyn tokio_stream::Stream<Item = Result<AgentEvent, Status>> + Send>>;

    async fn stream_events(
        &self,
        request: Request<StreamEventsRequest>,
    ) -> Result<Response<Self::StreamEventsStream>, Status> {
        let _req = request.into_inner();
        
        // TODO: Implement actual event streaming
        // For now, return empty stream
        let stream = tokio_stream::empty();
        
        Ok(Response::new(Box::pin(stream)))
    }
}

// TODO: Re-enable tests after fixing proto integration issues
// #[cfg(test)]
// mod tests {
//     use super::*;
//     use std::collections::HashMap;
// 
//     #[tokio::test]
//     async fn test_start_session() {
//         let manager = Arc::new(RwLock::new(AgentManager::new()));
//         let service = AgentService::new(manager);
// 
//         let request = Request::new(StartSessionRequest {
//             user_id: "test-user".to_string(),
//             context: HashMap::new(),
//         });
// 
//         let response = service.start_session(request).await.unwrap();
//         let response = response.into_inner();
// 
//         assert!(!response.session_id.is_empty());
//         assert!(!response.available_agents.is_empty());
//     }
// 
//     #[tokio::test]
//     async fn test_spawn_sub_agent() {
//         let manager = Arc::new(RwLock::new(AgentManager::new()));
//         let service = AgentService::new(manager);
// 
//         let request = Request::new(SpawnSubAgentRequest {
//             session_id: Uuid::new_v4().to_string(),
//             agent_type: "test".to_string(),
//             config: HashMap::new(),
//         });
// 
//         let response = service.spawn_sub_agent(request).await.unwrap();
//         let response = response.into_inner();
// 
//         assert!(!response.agent_id.is_empty());
//         assert_eq!(response.status, "running");
//     }
// }
