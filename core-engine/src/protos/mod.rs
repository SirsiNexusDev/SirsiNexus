// Protobuf definitions module
// Mock implementation for Phase 3 development - real protobuf generation pending

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

// Re-export protobuf modules
pub mod sirsi {
    pub mod agent {
        pub mod v1 {
            use super::super::super::*;
            
            // Mock protobuf types for compilation
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct CreateSessionRequest {
                pub user_id: String,
                pub client_info: Option<ClientInfo>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct CreateSessionResponse {
                pub session: Option<Session>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct Session {
                pub id: String,
                pub session_id: String,
                pub user_id: String,
                pub state: i32,
                pub created_at: Option<prost_types::Timestamp>,
                pub updated_at: Option<prost_types::Timestamp>,
                pub expires_at: Option<prost_types::Timestamp>,
                pub agent_types: Vec<AgentType>,
                pub metadata: HashMap<String, String>,
                pub config: HashMap<String, String>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct ClientInfo {
                pub user_agent: String,
                pub ip_address: String,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct AgentType {
                pub name: String,
                pub version: String,
                pub capabilities: Vec<String>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetSessionRequest {
                pub session_id: String,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetSessionResponse {
                pub session: Option<Session>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct DeleteSessionRequest {
                pub session_id: String,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct CreateAgentRequest {
                pub session_id: String,
                pub agent_type: String,
                pub config: Option<AgentConfig>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct CreateAgentResponse {
                pub agent: Option<Agent>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct AgentConfig {
                pub parameters: HashMap<String, String>,
                pub timeout_seconds: i32,
                pub max_concurrent_operations: i32,
                pub enable_caching: bool,
                pub required_capabilities: Vec<String>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct Agent {
                pub id: String,
                pub agent_type: String,
                pub status: String,
                pub capabilities: Vec<Capability>,
                pub metrics: Option<AgentMetrics>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct Capability {
                pub name: String,
                pub description: String,
                pub enabled: bool,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct AgentMetrics {
                pub requests_handled: i64,
                pub avg_response_time: f64,
                pub success_rate: f64,
                pub last_activity: String,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetAgentRequest {
                pub agent_id: String,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetAgentResponse {
                pub agent: Option<Agent>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct ListAgentsRequest {
                pub session_id: String,
                pub agent_type: Option<String>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct ListAgentsResponse {
                pub agents: Vec<Agent>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct UpdateAgentRequest {
                pub agent_id: String,
                pub config: Option<AgentConfig>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct UpdateAgentResponse {
                pub agent: Option<Agent>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct DeleteAgentRequest {
                pub agent_id: String,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct SendMessageRequest {
                pub agent_id: String,
                pub message: Option<Message>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct SendMessageResponse {
                pub response_message: Option<Message>,
                pub suggestions: Vec<Suggestion>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct Message {
                pub id: String,
                pub content: String,
                pub message_type: String,
                pub timestamp: String,
                pub metadata: HashMap<String, String>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct Suggestion {
                pub id: String,
                pub suggestion_id: String,
                pub text: String,
                pub title: String,
                pub description: String,
                pub confidence: f64,
                pub r#type: String,
                pub action: Option<Action>,
                pub metadata: HashMap<String, String>,
                pub priority: i32,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct Action {
                pub action_type: String,
                pub command: String,
                pub parameters: HashMap<String, String>,
                pub required_permissions: Vec<String>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetSuggestionsRequest {
                pub agent_id: String,
                pub context: Option<SuggestionContext>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetSuggestionsResponse {
                pub suggestions: Vec<Suggestion>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct SuggestionContext {
                pub current_context: String,
                pub user_input: String,
                pub history: Vec<Message>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetAgentStatusRequest {
                pub agent_id: String,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetAgentStatusResponse {
                pub status: Option<AgentStatus>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct AgentStatus {
                pub agent_id: String,
                pub status: String,
                pub uptime: i64,
                pub metrics: Option<AgentMetrics>,
                pub active_capabilities: Vec<Capability>,
            }
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetSystemHealthRequest {}
            
            #[derive(Debug, Clone, Serialize, Deserialize, Default)]
            pub struct GetSystemHealthResponse {
                pub status: String,
                pub components: HashMap<String, String>,
            }
            
            // Mock gRPC service definitions  
            pub trait AgentService {
                async fn create_session(&self, request: tonic::Request<CreateSessionRequest>) -> Result<tonic::Response<CreateSessionResponse>, tonic::Status>;
                async fn get_session(&self, request: tonic::Request<GetSessionRequest>) -> Result<tonic::Response<GetSessionResponse>, tonic::Status>;
                async fn delete_session(&self, request: tonic::Request<DeleteSessionRequest>) -> Result<tonic::Response<()>, tonic::Status>;
                async fn create_agent(&self, request: tonic::Request<CreateAgentRequest>) -> Result<tonic::Response<CreateAgentResponse>, tonic::Status>;
                async fn get_agent(&self, request: tonic::Request<GetAgentRequest>) -> Result<tonic::Response<GetAgentResponse>, tonic::Status>;
                async fn list_agents(&self, request: tonic::Request<ListAgentsRequest>) -> Result<tonic::Response<ListAgentsResponse>, tonic::Status>;
                async fn update_agent(&self, request: tonic::Request<UpdateAgentRequest>) -> Result<tonic::Response<UpdateAgentResponse>, tonic::Status>;
                async fn delete_agent(&self, request: tonic::Request<DeleteAgentRequest>) -> Result<tonic::Response<()>, tonic::Status>;
                async fn send_message(&self, request: tonic::Request<SendMessageRequest>) -> Result<tonic::Response<SendMessageResponse>, tonic::Status>;
                async fn get_suggestions(&self, request: tonic::Request<GetSuggestionsRequest>) -> Result<tonic::Response<GetSuggestionsResponse>, tonic::Status>;
                async fn get_agent_status(&self, request: tonic::Request<GetAgentStatusRequest>) -> Result<tonic::Response<GetAgentStatusResponse>, tonic::Status>;
                async fn get_system_health(&self, request: tonic::Request<GetSystemHealthRequest>) -> Result<tonic::Response<GetSystemHealthResponse>, tonic::Status>;
            }
            
            pub mod agent_service_server {
                use super::*;
                
                pub struct AgentServiceServer<T> {
                    inner: T,
                }
                
                impl<T> AgentServiceServer<T> {
                    pub fn new(service: T) -> Self {
                        Self { inner: service }
                    }
                }
            }
            
            pub mod agent_service_client {
                use super::*;
                
                #[derive(Clone)]
                pub struct AgentServiceClient<T> {
                    inner: T,
                }
                
                impl<T> AgentServiceClient<T> {
                    pub fn new(channel: T) -> Self {
                        Self { inner: channel }
                    }
                }
            }
            
            // Mock constants
            pub const FILE_DESCRIPTOR_SET: &[u8] = &[];
        }
    }
}

// Create a top-level proto module for backward compatibility
pub mod proto {
    pub use super::sirsi::agent::v1::*;
}

// Re-export AgentService at the crate level for easier access
pub use sirsi::agent::v1::AgentService;
