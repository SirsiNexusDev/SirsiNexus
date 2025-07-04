use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};
use tracing::{info, error, warn};
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
        info!("Creating agent of type: {}", req.agent_type);

        let agent_id = Uuid::new_v4().to_string();
        let now = Self::current_timestamp();

        let agent = Agent {
            agent_id: agent_id.clone(),
            session_id: req.session_id,
            agent_type: req.agent_type,
            state: 2, // AGENT_STATE_READY
            created_at: now.clone(),
            updated_at: now,
            config: req.config,
            metadata: req.context,
            parent_agent_id: String::new(),
        };

        let response = CreateAgentResponse {
            agent: Some(agent),
            capabilities: vec![],
        };

        Ok(Response::new(response))
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

    // Agent Interaction
    async fn send_message(
        &self,
        request: Request<SendMessageRequest>,
    ) -> Result<Response<SendMessageResponse>, Status> {
        let req = request.into_inner();
        info!("Sending message to agent: {}", req.agent_id);

        let message_id = Uuid::new_v4().to_string();
        let response_message = Message {
            message_id: Uuid::new_v4().to_string(),
            r#type: 4, // MESSAGE_TYPE_RESPONSE
            content: "Response from agent".to_string(),
            metadata: std::collections::HashMap::new(),
            timestamp: Self::current_timestamp(),
            attachments: vec![],
        };

        let response = SendMessageResponse {
            message_id,
            response: Some(response_message),
            suggestions: vec![],
            metrics: None,
        };

        Ok(Response::new(response))
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
