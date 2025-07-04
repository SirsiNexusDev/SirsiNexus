use std::collections::HashMap;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    proto::sirsi::agent::v1::{Suggestion, Action},
    agent::implementations::AwsAgent,
    agent::context::ContextStore,
};

pub struct AgentManager {
    sessions: HashMap<String, SessionState>,
    agents: HashMap<String, AgentState>,
}

struct SessionState {
    _user_id: String,
    agent_ids: Vec<String>,
    _context: HashMap<String, String>,
}

enum AgentImplementation {
    Aws(AwsAgent),
    Azure,
    Gcp,
    Security,
    CostOptimization,
    Migration,
    Reporting,
    General,
}

#[derive(Debug, Clone)]
pub enum AgentRole {
    Primary,
    SubAgent,
    Coordinator,
}

#[derive(Debug, Clone)]
pub struct AgentCapabilities {
    pub can_spawn_subagents: bool,
    pub can_coordinate: bool,
    pub domain_expertise: Vec<String>,
    pub required_permissions: Vec<String>,
}

struct AgentState {
    agent_type: String,
    status: String,
    metrics: HashMap<String, String>,
    capabilities: AgentCapabilities,
    role: AgentRole,
    parent_agent_id: Option<String>,
    sub_agent_ids: Vec<String>,
    implementation: AgentImplementation,
    context_store: Arc<ContextStore>,
    memory: HashMap<String, String>,
}

impl AgentManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            agents: HashMap::new(),
        }
    }
    
    pub fn new_with_context_store(context_store: Arc<ContextStore>) -> Self {
        Self {
            sessions: HashMap::new(),
            agents: HashMap::new(),
        }
    }

    pub async fn list_available_agents(&self) -> Vec<String> {
        vec![
            "aws".to_string(),
            "azure".to_string(),
            "gcp".to_string(),
            "vsphere".to_string(),
            "migration".to_string(),
            "reporting".to_string(),
            "security".to_string(),
            "cost_optimization".to_string(),
            "compliance".to_string(),
            "monitoring".to_string(),
            "automation".to_string(),
            "scripting".to_string(),
            "tutorial".to_string(),
        ]
    }
    
    pub async fn spawn_sub_agent(
        &mut self,
        parent_agent_id: &str,
        agent_type: &str,
        config: HashMap<String, String>,
    ) -> AppResult<String> {
        let parent_agent = self.agents.get_mut(parent_agent_id)
            .ok_or_else(|| AppError::NotFound("Parent agent not found".into()))?;
        
        if !parent_agent.capabilities.can_spawn_subagents {
            return Err(AppError::Configuration("Parent agent cannot spawn sub-agents".into()));
        }
        
        let sub_agent_id = Uuid::new_v4().to_string();
        let context_store = parent_agent.context_store.clone();
        
        let (implementation, capabilities) = self.create_agent_implementation(
            agent_type, 
            &sub_agent_id, 
            Some(parent_agent_id), 
            config
        ).await?;
        
        let agent_state = AgentState {
            agent_type: agent_type.to_string(),
            status: "ready".to_string(),
            metrics: HashMap::new(),
            capabilities,
            role: AgentRole::SubAgent,
            parent_agent_id: Some(parent_agent_id.to_string()),
            sub_agent_ids: Vec::new(),
            implementation,
            context_store,
            memory: HashMap::new(),
        };
        
        parent_agent.sub_agent_ids.push(sub_agent_id.clone());
        self.agents.insert(sub_agent_id.clone(), agent_state);
        
        Ok(sub_agent_id)
    }
    
    async fn create_agent_implementation(
        &self,
        agent_type: &str,
        agent_id: &str,
        parent_agent_id: Option<&str>,
        config: HashMap<String, String>,
    ) -> AppResult<(AgentImplementation, AgentCapabilities)> {
        match agent_type {
            "aws" => {
                let aws_agent = AwsAgent::new(agent_id.to_string(), "".to_string(), config);
                aws_agent.initialize().await?;
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["aws".to_string(), "ec2".to_string(), "s3".to_string()],
                    required_permissions: vec!["aws:read".to_string()],
                };
                Ok((AgentImplementation::Aws(aws_agent), capabilities))
            }
            "azure" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["azure".to_string(), "vm".to_string(), "storage".to_string()],
                    required_permissions: vec!["azure:read".to_string()],
                };
                Ok((AgentImplementation::Azure, capabilities))
            }
            "gcp" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["gcp".to_string(), "compute".to_string(), "storage".to_string()],
                    required_permissions: vec!["gcp:read".to_string()],
                };
                Ok((AgentImplementation::Gcp, capabilities))
            }
            "security" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["security".to_string(), "compliance".to_string(), "audit".to_string()],
                    required_permissions: vec!["security:read".to_string(), "audit:read".to_string()],
                };
                Ok((AgentImplementation::Security, capabilities))
            }
            "cost_optimization" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["cost".to_string(), "optimization".to_string(), "billing".to_string()],
                    required_permissions: vec!["billing:read".to_string()],
                };
                Ok((AgentImplementation::CostOptimization, capabilities))
            }
            "migration" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: true,
                    can_coordinate: true,
                    domain_expertise: vec!["migration".to_string(), "planning".to_string(), "execution".to_string()],
                    required_permissions: vec!["migration:read".to_string(), "migration:write".to_string()],
                };
                Ok((AgentImplementation::Migration, capabilities))
            }
            "reporting" => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["reporting".to_string(), "analytics".to_string(), "visualization".to_string()],
                    required_permissions: vec!["analytics:read".to_string()],
                };
                Ok((AgentImplementation::Reporting, capabilities))
            }
            _ => {
                let capabilities = AgentCapabilities {
                    can_spawn_subagents: false,
                    can_coordinate: false,
                    domain_expertise: vec!["general".to_string()],
                    required_permissions: vec![],
                };
                Ok((AgentImplementation::General, capabilities))
            }
        }
    }

    pub async fn spawn_agent(
        &mut self,
        session_id: &str,
        agent_type: &str,
        config: HashMap<String, String>,
    ) -> AppResult<String> {
        let agent_id = Uuid::new_v4().to_string();

        // Verify session exists
        let session = self.sessions
            .get_mut(session_id)
            .ok_or_else(|| AppError::NotFound("Session not found".into()))?;

        let (implementation, capabilities) = self.create_agent_implementation(
            agent_type,
            &agent_id,
            None,
            config
        ).await?;
        
        // Create default context store for now
        let context_store = Arc::new(ContextStore::new());

        // Create agent state
        let agent_state = AgentState {
            agent_type: agent_type.to_string(),
            status: "ready".to_string(),
            metrics: HashMap::new(),
            capabilities,
            role: AgentRole::Primary,
            parent_agent_id: None,
            sub_agent_ids: Vec::new(),
            implementation,
            context_store,
            memory: HashMap::new(),
        };

        // Add agent to session and global state
        session.agent_ids.push(agent_id.clone());
        self.agents.insert(agent_id.clone(), agent_state);

        Ok(agent_id)
    }

    pub async fn send_message(
        &self,
        session_id: &str,
        agent_id: &str,
        message: &str,
        context: HashMap<String, String>,
    ) -> AppResult<(String, String, Vec<Suggestion>)> {
        // Verify session and agent exist
        let agent = self.verify_session_and_agent(session_id, agent_id)?;

        let message_id = Uuid::new_v4().to_string();
        
        let (response, suggestions) = match &agent.implementation {
            AgentImplementation::Aws(aws_agent) => {
                aws_agent.process_message(message, context).await?
            }
            AgentImplementation::General => {
                let response = format!("General agent received: {}", message);
                let suggestions = vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: "General Help".to_string(),
                        description: "Get general assistance".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "general_help".to_string(),
                            parameters: HashMap::new(),
                            command: "".to_string(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.8,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ];
                (response, suggestions)
            }
        };

        Ok((message_id, response, suggestions))
    }

    pub async fn get_suggestions(
        &self,
        session_id: &str,
        agent_id: &str,
        context_type: &str,
        context: HashMap<String, String>,
    ) -> AppResult<Vec<Suggestion>> {
        // Verify session and agent exist
        let agent = self.verify_session_and_agent(session_id, agent_id)?;

        let suggestions = match &agent.implementation {
            AgentImplementation::Aws(aws_agent) => {
                aws_agent.get_suggestions(context_type, context).await?
            }
            AgentImplementation::General => {
                vec![
                    Suggestion {
                        suggestion_id: Uuid::new_v4().to_string(),
                        title: format!("General {} Suggestion", context_type),
                        description: "This is a general contextual suggestion".to_string(),
                        r#type: 1, // SUGGESTION_TYPE_ACTION
                        action: Some(Action {
                            action_type: "general_action".to_string(),
                            parameters: HashMap::new(),
                            command: "".to_string(),
                            required_permissions: vec![],
                        }),
                        confidence: 0.7,
                        metadata: HashMap::new(),
                        priority: 1,
                    },
                ]
            }
        };

        Ok(suggestions)
    }

    pub async fn get_agent_status(
        &self,
        session_id: &str,
        agent_id: &str,
    ) -> AppResult<(String, HashMap<String, String>, Vec<String>)> {
        // Verify session and agent exist
        let agent = self.verify_session_and_agent(session_id, agent_id)?;

        Ok((
            agent.status.clone(),
            agent.metrics.clone(),
            agent.capabilities.clone(),
        ))
    }

    fn verify_session_and_agent(&self, session_id: &str, agent_id: &str) -> AppResult<&AgentState> {
        let session = self.sessions
            .get(session_id)
            .ok_or_else(|| AppError::NotFound("Session not found".into()))?;

        if !session.agent_ids.contains(&agent_id.to_string()) {
            return Err(AppError::NotFound("Agent not found in session".into()));
        }

        let agent = self.agents
            .get(agent_id)
            .ok_or_else(|| AppError::NotFound("Agent not found".into()))?;

        Ok(agent)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_list_available_agents() {
        let manager = AgentManager::new();
        let agents = manager.list_available_agents().await;
        assert!(!agents.is_empty());
    }

    #[tokio::test]
    async fn test_agent_lifecycle() {
        let mut manager = AgentManager::new();
        
        // Create a session
        let session_id = "test-session".to_string();
        manager.sessions.insert(session_id.clone(), SessionState {
            _user_id: "test-user".to_string(),
            agent_ids: Vec::new(),
            _context: HashMap::new(),
        });

        // Spawn an agent
        let agent_id = manager.spawn_agent(
            &session_id,
            "test",
            HashMap::new(),
        ).await.unwrap();

        // Get agent status
        let (status, _metrics, capabilities) = manager.get_agent_status(
            &session_id,
            &agent_id,
        ).await.unwrap();

        assert_eq!(status, "running");
        assert!(!capabilities.is_empty());

        // Send a message
        let (message_id, response, suggestions) = manager.send_message(
            &session_id,
            &agent_id,
            "test message",
            HashMap::new(),
        ).await.unwrap();

        assert!(!message_id.is_empty());
        assert!(!response.is_empty());
        assert!(!suggestions.is_empty());

        // Get suggestions
        let suggestions = manager.get_suggestions(
            &session_id,
            &agent_id,
            "test",
            HashMap::new(),
        ).await.unwrap();

        assert!(!suggestions.is_empty());
    }
}
