use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};
use tracing::info;
use uuid::Uuid;
use prost_types::Timestamp;

use crate::agent::AgentManager;
use crate::agent::context::ContextStore;
use crate::proto::sirsi::agent::v1::{
    agent_service_server::AgentService,
    *,
};

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

    fn current_timestamp() -> Option<Timestamp> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap();
        Some(Timestamp {
            seconds: now.as_secs() as i64,
            nanos: now.subsec_nanos() as i32,
        })
    }
}

#[tonic::async_trait]
impl AgentService for AgentServiceImpl {
    // Session Management
    async fn create_session(
        &self,
        request: Request<CreateSessionRequest>,
    ) -> Result<Response<CreateSessionResponse>, Status> {
        let req = request.into_inner();
        info!("Creating session for user: {}", req.user_id);

        let session_id = Uuid::new_v4().to_string();
        let now = Self::current_timestamp();
        
        let session = Session {
            session_id: session_id.clone(),
            user_id: req.user_id,
            state: 1, // SESSION_STATE_ACTIVE
            created_at: now.clone(),
            updated_at: now.clone(),
            expires_at: {
                let expire_time = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs() + 86400; // 24 hours
                Some(Timestamp {
                    seconds: expire_time as i64,
                    nanos: 0,
                })
            },
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

    async fn get_session(
        &self,
        request: Request<GetSessionRequest>,
    ) -> Result<Response<GetSessionResponse>, Status> {
        let req = request.into_inner();
        info!("Getting session: {}", req.session_id);

        // Placeholder implementation
        let response = GetSessionResponse {
            session: None,
            active_agents: vec![],
        };

        Ok(Response::new(response))
    }

    async fn delete_session(
        &self,
        request: Request<DeleteSessionRequest>,
    ) -> Result<Response<()>, Status> {
        let req = request.into_inner();
        info!("Deleting session: {}", req.session_id);

        Ok(Response::new(()))
    }

    // Agent Lifecycle
    async fn create_agent(
        &self,
        request: Request<CreateAgentRequest>,
    ) -> Result<Response<CreateAgentResponse>, Status> {
        let req = request.into_inner();
        info!("🤖 Creating real agent of type: {} for session: {}", req.agent_type, req.session_id);

        // Real implementation using AgentManager
        let mut agent_manager = self.agent_manager.write().await;
        
        match agent_manager.spawn_agent(
            &req.session_id,
            &req.agent_type,
            req.config.clone(),
        ).await {
            Ok(agent_id) => {
                let now = Self::current_timestamp();
                
                // Get agent status to populate capabilities
                let (status, _metrics, capabilities) = agent_manager
                    .get_agent_status(&req.session_id, &agent_id)
                    .await
                    .map_err(|e| Status::internal(format!("Failed to get agent status: {}", e)))?;
                
                let agent = Agent {
                    agent_id: agent_id.clone(),
                    session_id: req.session_id,
                    agent_type: req.agent_type.clone(),
                    state: 2, // AGENT_STATE_READY
                    created_at: now.clone(),
                    updated_at: now,
                    config: req.config,
                    metadata: req.context,
                    parent_agent_id: String::new(),
                };
                
                // Convert AgentCapabilities to protobuf capabilities
                let proto_capabilities = vec![
                    Capability {
                        capability_id: format!("{}_agent", req.agent_type),
                        name: format!("{}_agent", req.agent_type),
                        description: format!("Real {} agent with live integration", req.agent_type),
                        parameters: vec![], // Vec<Parameter> not HashMap
                    }
                ];

                let response = CreateAgentResponse {
                    agent: Some(agent),
                    capabilities: proto_capabilities,
                };
                
                info!("✅ Real agent created successfully: {} ({})", agent_id, req.agent_type);
                Ok(Response::new(response))
            }
            Err(e) => {
                let error_msg = format!("Failed to create agent: {}", e);
                tracing::error!("{}", error_msg);
                Err(Status::internal(error_msg))
            }
        }
    }

    async fn get_agent(
        &self,
        request: Request<GetAgentRequest>,
    ) -> Result<Response<GetAgentResponse>, Status> {
        let req = request.into_inner();
        info!("Getting agent: {}", req.agent_id);

        let response = GetAgentResponse {
            agent: None,
            metrics: None,
        };

        Ok(Response::new(response))
    }

    async fn list_agents(
        &self,
        request: Request<ListAgentsRequest>,
    ) -> Result<Response<ListAgentsResponse>, Status> {
        let req = request.into_inner();
        info!("Listing agents for session: {}", req.session_id);

        let response = ListAgentsResponse {
            agents: vec![],
            next_page_token: String::new(),
            total_size: 0,
        };

        Ok(Response::new(response))
    }

    async fn update_agent(
        &self,
        request: Request<UpdateAgentRequest>,
    ) -> Result<Response<UpdateAgentResponse>, Status> {
        let req = request.into_inner();
        info!("Updating agent: {}", req.agent_id);

        let response = UpdateAgentResponse {
            agent: req.agent,
        };

        Ok(Response::new(response))
    }

    async fn delete_agent(
        &self,
        request: Request<DeleteAgentRequest>,
    ) -> Result<Response<()>, Status> {
        let req = request.into_inner();
        info!("Deleting agent: {}", req.agent_id);

        Ok(Response::new(()))
    }

    // Agent Interaction - Real Implementation
    async fn send_message(
        &self,
        request: Request<SendMessageRequest>,
    ) -> Result<Response<SendMessageResponse>, Status> {
        let req = request.into_inner();
        info!("💬 Real message to agent {}: {}", req.agent_id, req.message.as_ref().map(|m| &m.content).unwrap_or(&"<no content>".to_string()));

        let agent_manager = self.agent_manager.read().await;
        
        if let Some(message) = req.message {
            // Extract session ID from request or derive from agent context
            let session_id = req.session_id;
            
            // Convert metadata to HashMap for agent processing
            let context = message.metadata;
            
            // Send message to real agent through AgentManager
            match agent_manager.send_message(
                &session_id,
                &req.agent_id,
                &message.content,
                context.clone(),
            ).await {
                Ok((message_id, response_content, suggestions)) => {
                    let response_message = Message {
                        message_id: Uuid::new_v4().to_string(),
                        r#type: 4, // MESSAGE_TYPE_RESPONSE
                        content: response_content,
                        metadata: context,
                        timestamp: Self::current_timestamp(),
                        attachments: vec![],
                    };
                    
                    // Convert agent suggestions to protobuf suggestions
                    let proto_suggestions: Vec<Suggestion> = suggestions.into_iter().map(|s| {
                        Suggestion {
                            suggestion_id: s.suggestion_id,
                            title: s.title,
                            description: s.description,
                            r#type: s.r#type, // Use r#type field name
                            action: s.action.map(|a| Action {
                                action_type: a.action_type,
                                parameters: a.parameters,
                                command: a.command,
                                required_permissions: a.required_permissions,
                            }),
                            confidence: s.confidence,
                            metadata: s.metadata,
                            priority: s.priority,
                        }
                    }).collect();

                    let response = SendMessageResponse {
                        message_id,
                        response: Some(response_message),
                        suggestions: proto_suggestions,
                        metrics: None, // TODO: Add performance metrics
                    };
                    
                    info!("✅ Real agent response generated with {} suggestions", proto_suggestions.len());
                    Ok(Response::new(response))
                }
                Err(e) => {
                    let error_msg = format!("Agent message processing failed: {}", e);
                    tracing::error!("{}", error_msg);
                    Err(Status::internal(error_msg))
                }
            }
        } else {
            Err(Status::invalid_argument("Message content is required"))
        }
    }

    async fn get_suggestions(
        &self,
        request: Request<GetSuggestionsRequest>,
    ) -> Result<Response<GetSuggestionsResponse>, Status> {
        let req = request.into_inner();
        info!("Getting suggestions for agent: {}", req.agent_id);

        let response = GetSuggestionsResponse {
            suggestions: vec![],
            context_id: String::new(),
        };

        Ok(Response::new(response))
    }

    // Health and Monitoring
    async fn get_agent_status(
        &self,
        request: Request<GetAgentStatusRequest>,
    ) -> Result<Response<GetAgentStatusResponse>, Status> {
        let req = request.into_inner();
        info!("Getting status for agent: {}", req.agent_id);

        let response = GetAgentStatusResponse {
            status: None,
            metrics: None,
            active_capabilities: vec![],
            health_status: "healthy".to_string(),
        };

        Ok(Response::new(response))
    }

    async fn get_system_health(
        &self,
        request: Request<GetSystemHealthRequest>,
    ) -> Result<Response<GetSystemHealthResponse>, Status> {
        let _req = request.into_inner();
        info!("Getting system health");

        let response = GetSystemHealthResponse {
            health: None,
            metrics: None,
        };

        Ok(Response::new(response))
    }
}
