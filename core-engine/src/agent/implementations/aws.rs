use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use crate::error::AppResult;
use crate::proto::sirsi::agent::v1::Suggestion;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwsResource {
    pub id: String,
    pub resource_type: String,
    pub region: String,
    pub name: String,
    pub status: String,
    pub tags: HashMap<String, String>,
    pub cost_estimate: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwsAgentConfig {
    pub access_key: Option<String>,
    pub secret_key: Option<String>,
    pub region: String,
    pub assume_role_arn: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AwsAgent {
    pub agent_id: String,
    pub session_id: String,
    pub config: AwsAgentConfig,
    pub discovered_resources: Arc<RwLock<Vec<AwsResource>>>,
    pub status: Arc<RwLock<String>>,
}

impl AwsAgent {
    pub fn new(agent_id: String, session_id: String, config: HashMap<String, String>) -> Self {
        let aws_config = AwsAgentConfig {
            access_key: config.get("access_key").cloned(),
            secret_key: config.get("secret_key").cloned(),
            region: config.get("region").unwrap_or(&"us-east-1".to_string()).clone(),
            assume_role_arn: config.get("assume_role_arn").cloned(),
        };

        Self {
            agent_id,
            session_id,
            config: aws_config,
            discovered_resources: Arc::new(RwLock::new(Vec::new())),
            status: Arc::new(RwLock::new("initializing".to_string())),
        }
    }

    pub async fn initialize(&self) -> AppResult<()> {
        *self.status.write().await = "ready".to_string();
        Ok(())
    }

    pub async fn process_message(&self, message: &str, _context: HashMap<String, String>) -> AppResult<(String, Vec<Suggestion>)> {
        let suggestions = Vec::new(); // Empty for now
        
        let response = if message.to_lowercase().contains("discover") {
            "AWS resource discovery would happen here"
        } else if message.to_lowercase().contains("cost") {
            "AWS cost analysis would happen here"
        } else if message.to_lowercase().contains("security") {
            "AWS security analysis would happen here"
        } else {
            "AWS agent is ready. Try 'discover', 'cost', or 'security' commands."
        };

        Ok((response.to_string(), suggestions))
    }

    pub async fn get_suggestions(&self, _context_type: &str, _context: HashMap<String, String>) -> AppResult<Vec<Suggestion>> {
        Ok(Vec::new()) // Empty for now
    }

    pub async fn get_status(&self) -> AppResult<(String, HashMap<String, String>, Vec<String>)> {
        let status = self.status.read().await.clone();
        let metrics = HashMap::new();
        let capabilities = vec!["resource_discovery".to_string(), "cost_analysis".to_string()];
        Ok((status, metrics, capabilities))
    }
}
