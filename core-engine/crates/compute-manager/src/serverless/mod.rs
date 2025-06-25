use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Function {
    pub name: String,
    pub runtime: String,
    pub handler: String,
    pub description: Option<String>,
    pub memory_mb: i32,
    pub timeout_sec: i32,
    pub environment: HashMap<String, String>,
    pub labels: HashMap<String, String>,
    pub annotations: HashMap<String, String>,
    pub state: FunctionState,
    pub metrics: Option<FunctionMetrics>,
    pub vpc_config: Option<VpcConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionConfig {
    pub name: String,
    pub runtime: String,
    pub handler: String,
    pub code: Vec<u8>,
    pub description: Option<String>,
    pub memory_mb: i32,
    pub timeout_sec: i32,
    pub environment: HashMap<String, String>,
    pub labels: HashMap<String, String>,
    pub annotations: HashMap<String, String>,
    pub vpc_config: Option<VpcConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpcConfig {
    pub subnet_ids: Vec<String>,
    pub security_group_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FunctionState {
    Pending,
    Active,
    Inactive,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionMetrics {
    pub invocations: i64,
    pub errors: i64,
    pub throttles: i64,
    pub duration_ms: i64,
    pub concurrent_executions: i32,
    pub memory_utilization: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionInvocation {
    pub function_name: String,
    pub request_id: String,
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub end_time: Option<chrono::DateTime<chrono::Utc>>,
    pub duration_ms: Option<i64>,
    pub memory_used_mb: Option<i32>,
    pub error: Option<String>,
    pub logs: Vec<String>,
}

impl Function {
    pub fn new(name: String, runtime: String, handler: String) -> Self {
        Self {
            name,
            runtime,
            handler,
            description: None,
            memory_mb: 128,
            timeout_sec: 30,
            environment: HashMap::new(),
            labels: HashMap::new(),
            annotations: HashMap::new(),
            state: FunctionState::Pending,
            metrics: None,
            vpc_config: None,
        }
    }

    pub fn with_memory(mut self, memory_mb: i32) -> Self {
        self.memory_mb = memory_mb;
        self
    }

    pub fn with_timeout(mut self, timeout_sec: i32) -> Self {
        self.timeout_sec = timeout_sec;
        self
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }

    pub fn with_environment(mut self, env: HashMap<String, String>) -> Self {
        self.environment = env;
        self
    }

    pub fn with_vpc_config(mut self, vpc_config: VpcConfig) -> Self {
        self.vpc_config = Some(vpc_config);
        self
    }
}

impl FunctionConfig {
    pub fn new(name: String, runtime: String, handler: String, code: Vec<u8>) -> Self {
        Self {
            name,
            runtime,
            handler,
            code,
            description: None,
            memory_mb: 128,
            timeout_sec: 30,
            environment: HashMap::new(),
            labels: HashMap::new(),
            annotations: HashMap::new(),
            vpc_config: None,
        }
    }

    pub fn with_memory(mut self, memory_mb: i32) -> Self {
        self.memory_mb = memory_mb;
        self
    }

    pub fn with_timeout(mut self, timeout_sec: i32) -> Self {
        self.timeout_sec = timeout_sec;
        self
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }

    pub fn with_environment(mut self, env: HashMap<String, String>) -> Self {
        self.environment = env;
        self
    }

    pub fn with_vpc_config(mut self, vpc_config: VpcConfig) -> Self {
        self.vpc_config = Some(vpc_config);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function() {
        let mut env = HashMap::new();
        env.insert("API_KEY".to_string(), "secret".to_string());
        env.insert("DEBUG".to_string(), "true".to_string());

        let vpc_config = VpcConfig {
            subnet_ids: vec!["subnet-1".to_string(), "subnet-2".to_string()],
            security_group_ids: vec!["sg-1".to_string()],
        };

        let function = Function::new(
            "test-function".to_string(),
            "nodejs14.x".to_string(),
            "index.handler".to_string(),
        )
        .with_memory(256)
        .with_timeout(60)
        .with_description("Test function".to_string())
        .with_environment(env.clone())
        .with_vpc_config(vpc_config.clone());

        assert_eq!(function.name, "test-function");
        assert_eq!(function.runtime, "nodejs14.x");
        assert_eq!(function.handler, "index.handler");
        assert_eq!(function.memory_mb, 256);
        assert_eq!(function.timeout_sec, 60);
        assert_eq!(function.description, Some("Test function".to_string()));
        assert_eq!(function.environment, env);
        assert!(function.vpc_config.is_some());
        assert_eq!(function.state, FunctionState::Pending);
    }

    #[test]
    fn test_function_config() {
        let code = include_bytes!("../tests/test_function.js").to_vec();
        let config = FunctionConfig::new(
            "test-function".to_string(),
            "nodejs14.x".to_string(),
            "index.handler".to_string(),
            code.clone(),
        )
        .with_memory(512)
        .with_timeout(120);

        assert_eq!(config.name, "test-function");
        assert_eq!(config.runtime, "nodejs14.x");
        assert_eq!(config.handler, "index.handler");
        assert_eq!(config.memory_mb, 512);
        assert_eq!(config.timeout_sec, 120);
        assert_eq!(config.code, code);
        assert!(config.vpc_config.is_none());
    }
}
