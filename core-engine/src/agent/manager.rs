use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::{
    error::{AppError, AppResult},
    agent::service::Suggestion,
};

pub struct AgentManager {
    sessions: HashMap<String, SessionState>,
    agents: HashMap<String, AgentState>,
}

struct SessionState {
    user_id: String,
    agent_ids: Vec<String>,
    context: HashMap<String, String>,
}

struct AgentState {
    agent_type: String,
    status: String,
    metrics: HashMap<String, String>,
    capabilities: Vec<String>,
}

impl AgentManager {
    pub fn new() -> Self {
        Self {
            sessions: HashMap::new(),
            agents: HashMap::new(),
        }
    }

    pub async fn list_available_agents(&self) -> Vec<String> {
        // In the future, this will load from a configuration or dynamic registry
        vec![
            "aws".to_string(),
            "azure".to_string(),
            "gcp".to_string(),
            "vsphere".to_string(),
            "migration".to_string(),
            "reporting".to_string(),
            "security".to_string(),
            "scripting".to_string(),
            "tutorial".to_string(),
        ]
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

        // Create agent state
        let agent_state = AgentState {
            agent_type: agent_type.to_string(),
            status: "running".to_string(),
            metrics: HashMap::new(),
            capabilities: vec![
                "chat".to_string(),
                "suggest".to_string(),
                format!("{}_specific", agent_type),
            ],
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
        self.verify_session_and_agent(session_id, agent_id)?;

        // TODO: Implement actual message handling
        let message_id = Uuid::new_v4().to_string();
        let response = format!("Received message: {}", message);
        let suggestions = vec![
            Suggestion {
                id: Uuid::new_v4().to_string(),
                title: "Sample suggestion".to_string(),
                description: "This is a sample suggestion".to_string(),
                action_type: "command".to_string(),
                action_params: HashMap::new(),
                confidence: 0.9,
            },
        ];

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
        self.verify_session_and_agent(session_id, agent_id)?;

        // TODO: Implement actual suggestion generation
        Ok(vec![
            Suggestion {
                id: Uuid::new_v4().to_string(),
                title: format!("Suggestion for {}", context_type),
                description: "This is a contextual suggestion".to_string(),
                action_type: "command".to_string(),
                action_params: HashMap::new(),
                confidence: 0.8,
            },
        ])
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
            user_id: "test-user".to_string(),
            agent_ids: Vec::new(),
            context: HashMap::new(),
        });

        // Spawn an agent
        let agent_id = manager.spawn_agent(
            &session_id,
            "test",
            HashMap::new(),
        ).await.unwrap();

        // Get agent status
        let (status, metrics, capabilities) = manager.get_agent_status(
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
