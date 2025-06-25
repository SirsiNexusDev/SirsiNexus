use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::error::{ContainerError, ContainerResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerConfig {
    pub image: String,
    pub command: Option<Vec<String>>,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    pub ports: Option<Vec<PortMapping>>,
    pub volumes: Option<Vec<VolumeMount>>,
    pub resources: Option<ResourceRequirements>,
    pub labels: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortMapping {
    pub container_port: i32,
    pub host_port: Option<i32>,
    pub protocol: Protocol,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    TCP,
    UDP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VolumeMount {
    pub name: String,
    pub mount_path: String,
    pub read_only: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceRequirements {
    pub cpu: Option<String>,
    pub memory: Option<String>,
    pub gpu: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Container {
    pub id: String,
    pub name: String,
    pub image: String,
    pub state: ContainerState,
    pub created: chrono::DateTime<chrono::Utc>,
    pub started: Option<chrono::DateTime<chrono::Utc>>,
    pub finished: Option<chrono::DateTime<chrono::Utc>>,
    pub exit_code: Option<i32>,
    pub labels: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContainerState {
    Created,
    Running,
    Paused,
    Restarting,
    Exited,
    Dead,
}

#[async_trait]
pub trait ContainerRuntime: Send + Sync {
    async fn create_container(&self, config: ContainerConfig) -> ContainerResult<Container>;
    async fn start_container(&self, id: &str) -> ContainerResult<()>;
    async fn stop_container(&self, id: &str) -> ContainerResult<()>;
    async fn remove_container(&self, id: &str) -> ContainerResult<()>;
    async fn get_container(&self, id: &str) -> ContainerResult<Container>;
    async fn list_containers(&self) -> ContainerResult<Vec<Container>>;
    async fn container_logs(&self, id: &str) -> ContainerResult<Vec<String>>;
    async fn container_stats(&self, id: &str) -> ContainerResult<ContainerStats>;
    async fn exec_in_container(&self, id: &str, cmd: Vec<String>) -> ContainerResult<ExecResult>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerStats {
    pub cpu_usage: f64,
    pub memory_usage: u64,
    pub memory_limit: u64,
    pub network_rx_bytes: u64,
    pub network_tx_bytes: u64,
    pub block_rx_bytes: u64,
    pub block_tx_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecResult {
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
}
