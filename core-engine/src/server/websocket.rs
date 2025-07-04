use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::RwLock;
use tokio_tungstenite::{accept_async, tungstenite::Message, WebSocketStream};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tracing::{info, error, warn, debug};
use tonic::transport::Channel;

use crate::error::{AppError, AppResult};
use crate::proto::sirsi::agent::v1::{
    agent_service_client::AgentServiceClient,
    *,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketRequest {
    #[serde(rename = "requestId")]
    pub request_id: Option<String>,
    pub action: String,
    #[serde(rename = "sessionId")]
    pub session_id: Option<String>,
    #[serde(rename = "agentId")]
    pub agent_id: Option<String>,
    pub data: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketResponse {
    #[serde(rename = "requestId")]
    pub request_id: String,
    pub action: String,
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentSessionData {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "userId")]
    pub user_id: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "availableAgents")]
    pub available_agents: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubAgentData {
    #[serde(rename = "agentId")]
    pub agent_id: String,
    #[serde(rename = "agentType")]
    pub agent_type: String,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub capabilities: Vec<String>,
    pub metrics: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AgentSuggestionData {
    pub id: String,
    pub title: String,
    pub description: String,
    #[serde(rename = "actionType")]
    pub action_type: String,
    pub action: String,
    pub parameters: HashMap<String, String>,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageResponseData {
    #[serde(rename = "responseId")]
    pub response_id: String,
    pub response: String,
    pub suggestions: Vec<AgentSuggestionData>,
}

pub struct WebSocketHandler {
    grpc_client: AgentServiceClient<Channel>,
    sessions: Arc<RwLock<HashMap<String, String>>>, // WebSocket ID -> Session ID
}

impl WebSocketHandler {
    pub async fn new(grpc_endpoint: &str) -> AppResult<Self> {
        let channel = Channel::from_shared(grpc_endpoint.to_string())
            .map_err(|e| AppError::Configuration(format!("Invalid gRPC endpoint: {}", e)))?
            .connect()
            .await
            .map_err(|e| AppError::Connection(format!("Failed to connect to gRPC service: {}", e)))?;

        let grpc_client = AgentServiceClient::new(channel);

        Ok(Self {
            grpc_client,
            sessions: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    pub async fn handle_connection(&mut self, stream: TcpStream, addr: SocketAddr) {
        info!("WebSocket connection from {}", addr);
        
        let ws_stream = match accept_async(stream).await {
            Ok(ws) => ws,
            Err(e) => {
                error!("Failed to accept WebSocket connection: {}", e);
                return;
            }
        };

        let connection_id = Uuid::new_v4().to_string();
        info!("Assigned connection ID: {}", connection_id);

        if let Err(e) = self.handle_websocket(ws_stream, connection_id.clone()).await {
            error!("WebSocket handler error for {}: {}", connection_id, e);
        }

        // Cleanup session mapping
        self.sessions.write().await.remove(&connection_id);
        info!("Connection {} closed", connection_id);
    }

    async fn handle_websocket(
        &mut self,
        ws_stream: WebSocketStream<TcpStream>,
        connection_id: String,
    ) -> AppResult<()> {
        let (mut ws_sender, mut ws_receiver) = ws_stream.split();

        while let Some(msg) = ws_receiver.next().await {
            let msg = match msg {
                Ok(msg) => msg,
                Err(e) => {
                    warn!("WebSocket message error: {}", e);
                    break;
                }
            };

            match msg {
                Message::Text(text) => {
                    debug!("Received message: {}", text);
                    
                    let response = match self.process_request(&text, &connection_id).await {
                        Ok(resp) => resp,
                        Err(e) => {
                            error!("Request processing error: {}", e);
                            WebSocketResponse {
                                request_id: "unknown".to_string(),
                                action: "error".to_string(),
                                success: false,
                                data: None,
                                error: Some(e.to_string()),
                            }
                        }
                    };

                    let response_json = match serde_json::to_string(&response) {
                        Ok(json) => json,
                        Err(e) => {
                            error!("Failed to serialize response: {}", e);
                            continue;
                        }
                    };

                    if let Err(e) = ws_sender.send(Message::Text(response_json)).await {
                        error!("Failed to send WebSocket response: {}", e);
                        break;
                    }
                }
                Message::Ping(data) => {
                    if let Err(e) = ws_sender.send(Message::Pong(data)).await {
                        error!("Failed to send pong: {}", e);
                        break;
                    }
                }
                Message::Close(_) => {
                    info!("WebSocket close received");
                    break;
                }
                _ => {
                    // Ignore other message types
                }
            }
        }

        Ok(())
    }

    async fn process_request(
        &mut self,
        message: &str,
        connection_id: &str,
    ) -> AppResult<WebSocketResponse> {
        let request: WebSocketRequest = serde_json::from_str(message)
            .map_err(|e| AppError::Serialization(format!("Invalid request format: {}", e)))?;

        let request_id = request.request_id.clone()
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        match request.action.as_str() {
            "start_session" => self.handle_start_session(request, request_id, connection_id).await,
            "spawn_agent" => self.handle_spawn_agent(request, request_id).await,
            "send_message" => self.handle_send_message(request, request_id).await,
            "get_suggestions" => self.handle_get_suggestions(request, request_id).await,
            "get_status" => self.handle_get_status(request, request_id).await,
            "stop_session" => {
                // TODO: Implement stop_session when protobuf is updated
                Ok(WebSocketResponse {
                    request_id,
                    action: "stop_session".to_string(),
                    success: true,
                    data: None,
                    error: None,
                })
            }
            _ => {
                let action = request.action.clone();
                Ok(WebSocketResponse {
                    request_id,
                    action: request.action,
                    success: false,
                    data: None,
                    error: Some(format!("Unknown action: {}", action)),
                })
            }
        }
    }

    async fn handle_start_session(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
        connection_id: &str,
    ) -> AppResult<WebSocketResponse> {
        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for start_session".to_string()))?;

        let user_id = data.get("userId")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing userId".to_string()))?;

        let context = data.get("context")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let grpc_request = StartSessionRequest {
            user_id: user_id.to_string(),
            context,
        };

        let response = self.grpc_client.start_session(grpc_request).await
            .map_err(|e| AppError::Connection(format!("gRPC start_session failed: {}", e)))?;

        let session_response = response.into_inner();
        
        // Store session mapping
        self.sessions.write().await.insert(
            connection_id.to_string(),
            session_response.session_id.clone()
        );

        let session_data = AgentSessionData {
            session_id: session_response.session_id,
            user_id: user_id.to_string(),
            status: "active".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            available_agents: vec![
                "aws".to_string(),
                "azure".to_string(),
                "gcp".to_string(),
                "migration".to_string(),
                "security".to_string(),
                "reporting".to_string(),
                "scripting".to_string(),
                "tutorial".to_string(),
            ],
        };

        Ok(WebSocketResponse {
            request_id,
            action: "start_session".to_string(),
            success: true,
            data: Some(serde_json::to_value(session_data)?),
            error: None,
        })
    }

    async fn handle_spawn_agent(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for spawn_agent".to_string()))?;

        let agent_type = data.get("agentType")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing agentType".to_string()))?;

        let config = data.get("config")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let agent_type_enum = match agent_type {
            "aws" => 2,
            "azure" => 3,
            "gcp" => 4,
            "vsphere" => 5,
            "migration" => 6,
            "security" => 7,
            "reporting" => 8,
            "scripting" => 9,
            "tutorial" => 10,
            _ => 1, // General
        };

        let grpc_request = SpawnSubAgentRequest {
            session_id,
            agent_type: agent_type.to_string(),
            config,
        };

        let response = self.grpc_client.spawn_sub_agent(grpc_request).await
            .map_err(|e| AppError::Connection(format!("gRPC spawn_sub_agent failed: {}", e)))?;

        let agent_response = response.into_inner();

        let agent_data = SubAgentData {
            agent_id: agent_response.agent_id,
            agent_type: agent_type.to_string(),
            status: "ready".to_string(),
            created_at: chrono::Utc::now().to_rfc3339(),
            capabilities: vec![
                "chat".to_string(),
                "suggest".to_string(),
                format!("{}_specific", agent_type),
            ],
            metrics: HashMap::new(),
        };

        Ok(WebSocketResponse {
            request_id,
            action: "spawn_agent".to_string(),
            success: true,
            data: Some(serde_json::to_value(agent_data)?),
            error: None,
        })
    }

    async fn handle_send_message(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let agent_id = request.agent_id.ok_or_else(|| 
            AppError::Validation("Missing agentId".to_string()))?;

        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for send_message".to_string()))?;

        let message = data.get("message")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing message".to_string()))?;

        let context = data.get("context")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let grpc_request = SendMessageRequest {
            session_id,
            agent_id,
            message: message.to_string(),
            context,
        };

        let response = self.grpc_client.send_message(grpc_request).await
            .map_err(|e| AppError::Connection(format!("gRPC send_message failed: {}", e)))?;

        let message_response = response.into_inner();

        let suggestions: Vec<AgentSuggestionData> = message_response.suggestions
            .into_iter()
            .map(|s| AgentSuggestionData {
                id: s.id,
                title: s.title,
                description: s.description,
                action_type: s.action_type,
                action: "".to_string(), // Can be derived from action_params if needed
                parameters: s.action_params,
                confidence: s.confidence,
            })
            .collect();

        let response_data = MessageResponseData {
            response_id: message_response.message_id,
            response: message_response.response,
            suggestions,
        };

        Ok(WebSocketResponse {
            request_id,
            action: "send_message".to_string(),
            success: true,
            data: Some(serde_json::to_value(response_data)?),
            error: None,
        })
    }

    async fn handle_get_suggestions(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let agent_id = request.agent_id.ok_or_else(|| 
            AppError::Validation("Missing agentId".to_string()))?;

        let data = request.data.ok_or_else(|| 
            AppError::Validation("Missing data for get_suggestions".to_string()))?;

        let suggestion_type = data.get("suggestionType")
            .and_then(|v| v.as_str())
            .ok_or_else(|| AppError::Validation("Missing suggestionType".to_string()))?;

        let context = data.get("context")
            .and_then(|v| v.as_object())
            .map(|obj| {
                obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect::<HashMap<String, String>>()
            })
            .unwrap_or_default();

        let suggestion_type_enum = match suggestion_type {
            "action" => 1,
            "optimization" => 2,
            "security" => 3,
            "code" => 4,
            "tutorial" => 5,
            "troubleshooting" => 6,
            _ => 1,
        };

        let grpc_request = GetSuggestionsRequest {
            session_id,
            agent_id,
            context_type: suggestion_type.to_string(),
            context,
        };

        let response = self.grpc_client.get_suggestions(grpc_request).await
            .map_err(|e| AppError::Connection(format!("gRPC get_suggestions failed: {}", e)))?;

        let suggestions_response = response.into_inner();

        let suggestions: Vec<AgentSuggestionData> = suggestions_response.suggestions
            .into_iter()
            .map(|s| AgentSuggestionData {
                id: s.id,
                title: s.title,
                description: s.description,
                action_type: s.action_type,
                action: "".to_string(), // Map from action_params if needed
                parameters: s.action_params,
                confidence: s.confidence,
            })
            .collect();

        Ok(WebSocketResponse {
            request_id,
            action: "get_suggestions".to_string(),
            success: true,
            data: Some(serde_json::to_value(suggestions)?),
            error: None,
        })
    }

    async fn handle_get_status(
        &mut self,
        request: WebSocketRequest,
        request_id: String,
    ) -> AppResult<WebSocketResponse> {
        let session_id = request.session_id.ok_or_else(|| 
            AppError::Validation("Missing sessionId".to_string()))?;

        let agent_id = request.agent_id.ok_or_else(|| 
            AppError::Validation("Missing agentId".to_string()))?;

        let grpc_request = GetSubAgentStatusRequest {
            session_id,
            agent_id: agent_id.clone(),
        };

        let response = self.grpc_client.get_sub_agent_status(grpc_request).await
            .map_err(|e| AppError::Connection(format!("gRPC get_sub_agent_status failed: {}", e)))?;

        let status_response = response.into_inner();

        let agent_data = SubAgentData {
            agent_id,
            agent_type: "general".to_string(), // Default agent type
            status: status_response.status,
            created_at: chrono::Utc::now().to_rfc3339(),
            capabilities: status_response.capabilities,
            metrics: status_response.metrics,
        };

        Ok(WebSocketResponse {
            request_id,
            action: "get_status".to_string(),
            success: true,
            data: Some(serde_json::to_value(agent_data)?),
            error: None,
        })
    }

}

pub struct WebSocketServer {
    port: u16,
    grpc_endpoint: String,
}

impl WebSocketServer {
    pub fn new(port: u16, grpc_endpoint: String) -> Self {
        Self {
            port,
            grpc_endpoint,
        }
    }

    pub async fn start(&self) -> AppResult<()> {
        let addr = SocketAddr::from(([127, 0, 0, 1], self.port));
        let listener = TcpListener::bind(&addr).await
            .map_err(|e| AppError::Connection(format!("Failed to bind to {}: {}", addr, e)))?;

        info!("🌐 WebSocket server listening on {}", addr);
        info!("🔗 Connecting to gRPC backend at {}", self.grpc_endpoint);

        while let Ok((stream, addr)) = listener.accept().await {
            let grpc_endpoint = self.grpc_endpoint.clone();
            
            tokio::spawn(async move {
                match WebSocketHandler::new(&grpc_endpoint).await {
                    Ok(mut handler) => {
                        handler.handle_connection(stream, addr).await;
                    }
                    Err(e) => {
                        error!("Failed to create WebSocket handler: {}", e);
                    }
                }
            });
        }

        Ok(())
    }
}

pub async fn start_websocket_server(port: u16, grpc_endpoint: String) -> AppResult<()> {
    let server = WebSocketServer::new(port, grpc_endpoint);
    server.start().await
}
