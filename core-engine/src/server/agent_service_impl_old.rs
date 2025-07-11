use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};
use tracing::{info, error, warn};
use uuid::Uuid;

use crate::agent::AgentManager;
use crate::agent::context::ContextStore;
use crate::proto::sirsi::agent::v1::*;


pub struct AgentServiceImpl {
    agent_manager: Arc<RwLock<AgentManager>>,
    context_store: Arc<ContextStore>,
}

impl AgentServiceImpl {
    pub fn new(
        agent_manager: Arc<RwLock<AgentManager>>,
        context_store: Arc<ContextStore>,
    ) -> Self {
        Self {
            agent_manager,
            context_store,
        }
    }
}

#[tonic::async_trait]
impl AgentService for AgentServiceImpl {
    async fn create_session(
        &self,
        request: Request<CreateSessionRequest>,
    ) -> Result<Response<CreateSessionResponse>, Status> {
        let req = request.into_inner();
        info!("Creating session for user: {}", req.user_id);

        let session_id = Uuid::new_v4().to_string();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap();
        
        let session = Session {
            session_id: session_id.clone(),
            user_id: req.user_id,
            state: SessionState::SessionStateActive as i32,
            created_at: Some(prost_types::Timestamp {
                seconds: now.as_secs() as i64,
                nanos: now.subsec_nanos() as i32,
            }),
            updated_at: Some(prost_types::Timestamp {
                seconds: now.as_secs() as i64,
                nanos: now.subsec_nanos() as i32,
            }),
            expires_at: Some(prost_types::Timestamp {
                seconds: (now.as_secs() + 86400) as i64, // 24 hours
                nanos: 0,
            }),
            metadata: req.context,
            config: req.config,
        };

        let available_agent_types = vec![
            AgentType {
                type_id: "aws".to_string(),
                display_name: "AWS Cloud Agent".to_string(),
                description: "Manages AWS resources and operations".to_string(),
                version: "1.0.0".to_string(),
                capabilities: vec![],
                default_config: std::collections::HashMap::new(),
            },
            AgentType {
                type_id: "azure".to_string(),
                display_name: "Azure Cloud Agent".to_string(),
                description: "Manages Azure resources and operations".to_string(),
                version: "1.0.0".to_string(),
                capabilities: vec![],
                default_config: std::collections::HashMap::new(),
            },
            AgentType {
                type_id: "gcp".to_string(),
                display_name: "Google Cloud Agent".to_string(),
                description: "Manages GCP resources and operations".to_string(),
                version: "1.0.0".to_string(),
                capabilities: vec![],
                default_config: std::collections::HashMap::new(),
            },
        ];

        let response = CreateSessionResponse {
            session: Some(session),
            available_agent_types,
        };

        Ok(Response::new(response))
    }

    async fn spawn_sub_agent(
        &self,
        request: Request<SpawnSubAgentRequest>,
    ) -> Result<Response<SpawnSubAgentResponse>, Status> {
        let req = request.into_inner();
        info!("Spawning sub-agent of type: {}", req.agent_type);

        let agent_id = Uuid::new_v4().to_string();

        // Get agent manager and spawn agent
        let mut manager = self.agent_manager.write().await;
        
        match manager.spawn_agent(&req.session_id, &req.agent_type, req.config).await {
            Ok(_) => {
                info!("Successfully spawned agent: {}", agent_id);
                let response = SpawnSubAgentResponse {
                    agent_id,
                    status: "ready".to_string(),
                };
                Ok(Response::new(response))
            }
            Err(e) => {
                error!("Failed to spawn agent: {}", e);
                Err(Status::internal("Failed to spawn agent"))
            }
        }
    }

    async fn send_message(
        &self,
        request: Request<SendMessageRequest>,
    ) -> Result<Response<SendMessageResponse>, Status> {
        let req = request.into_inner();
        info!("Sending message to agent: {}", req.agent_id);

        let manager = self.agent_manager.read().await;
        
        match manager.send_message(&req.session_id, &req.agent_id, &req.message, req.context).await {
            Ok((message_id, response_text, suggestions)) => {
                let grpc_suggestions: Vec<Suggestion> = suggestions
                    .into_iter()
                    .map(|s| Suggestion {
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        action_type: s.action_type,
                        action_params: s.action_params,
                        confidence: s.confidence,
                    })
                    .collect();

                let response = SendMessageResponse {
                    message_id,
                    response: response_text,
                    suggestions: grpc_suggestions,
                };

                Ok(Response::new(response))
            }
            Err(e) => {
                error!("Failed to send message: {}", e);
                Err(Status::internal("Failed to process message"))
            }
        }
    }

    async fn get_suggestions(
        &self,
        request: Request<GetSuggestionsRequest>,
    ) -> Result<Response<GetSuggestionsResponse>, Status> {
        let req = request.into_inner();
        info!("Getting suggestions for agent: {}", req.agent_id);

        let manager = self.agent_manager.read().await;
        
        match manager.get_suggestions(&req.session_id, &req.agent_id, &req.context_type, req.context).await {
            Ok(suggestions) => {
                let grpc_suggestions: Vec<Suggestion> = suggestions
                    .into_iter()
                    .map(|s| Suggestion {
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        action_type: s.action_type,
                        action_params: s.action_params,
                        confidence: s.confidence,
                    })
                    .collect();

                let response = GetSuggestionsResponse {
                    suggestions: grpc_suggestions,
                };

                Ok(Response::new(response))
            }
            Err(e) => {
                error!("Failed to get suggestions: {}", e);
                Err(Status::internal("Failed to get suggestions"))
            }
        }
    }

    async fn get_sub_agent_status(
        &self,
        request: Request<GetSubAgentStatusRequest>,
    ) -> Result<Response<GetSubAgentStatusResponse>, Status> {
        let req = request.into_inner();
        info!("Getting status for agent: {}", req.agent_id);

        let manager = self.agent_manager.read().await;
        
        match manager.get_agent_status(&req.session_id, &req.agent_id).await {
            Ok((status, metrics, capabilities)) => {
                let response = GetSubAgentStatusResponse {
                    status,
                    metrics,
                    capabilities,
                };

                Ok(Response::new(response))
            }
            Err(e) => {
                error!("Failed to get agent status: {}", e);
                Err(Status::internal("Failed to get agent status"))
            }
        }
    }
}
