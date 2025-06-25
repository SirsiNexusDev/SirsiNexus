use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::DataResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheCluster {
    pub id: String,
    pub name: String,
    pub engine: CacheEngine,
    pub version: String,
    pub node_type: String,
    pub num_nodes: i32,
    pub port: u16,
    pub parameter_group: String,
    pub subnet_group: String,
    pub security_groups: Vec<String>,
    pub maintenance_window: MaintenanceWindow,
    pub encryption_enabled: bool,
    pub auto_minor_upgrade: bool,
    pub tags: HashMap<String, String>,
    pub status: ClusterStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CacheEngine {
    Redis,
    Memcached,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ClusterStatus {
    Creating,
    Available,
    Modifying,
    Deleting,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaintenanceWindow {
    pub day: chrono::Weekday,
    pub start_time: chrono::NaiveTime,
    pub duration_hours: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheNode {
    pub id: String,
    pub cluster_id: String,
    pub status: NodeStatus,
    pub address: String,
    pub port: u16,
    pub availability_zone: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeStatus {
    Creating,
    Available,
    Modifying,
    Deleting,
    Failed,
    Rebooting,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheMetrics {
    pub cluster_id: String,
    pub node_id: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub cpu_utilization: f64,
    pub memory_utilization: f64,
    pub network_bytes_in: u64,
    pub network_bytes_out: u64,
    pub curr_connections: i32,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub evictions: u64,
}

#[async_trait]
pub trait CacheManager: Send + Sync {
    async fn create_cluster(&self, config: CacheCluster) -> DataResult<CacheCluster>;
    async fn modify_cluster(&self, cluster: CacheCluster) -> DataResult<CacheCluster>;
    async fn delete_cluster(&self, id: &str) -> DataResult<()>;
    async fn get_cluster(&self, id: &str) -> DataResult<CacheCluster>;
    async fn list_clusters(&self) -> DataResult<Vec<CacheCluster>>;
    async fn get_node(&self, cluster_id: &str, node_id: &str) -> DataResult<CacheNode>;
    async fn list_nodes(&self, cluster_id: &str) -> DataResult<Vec<CacheNode>>;
    async fn reboot_node(&self, cluster_id: &str, node_id: &str) -> DataResult<()>;
    async fn get_metrics(&self, cluster_id: &str, window: chrono::Duration) -> DataResult<Vec<CacheMetrics>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParameterGroup {
    pub name: String,
    pub family: String,
    pub description: String,
    pub parameters: HashMap<String, Parameter>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parameter {
    pub value: String,
    pub description: String,
    pub data_type: ParameterType,
    pub allowed_values: Option<Vec<String>>,
    pub modifiable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ParameterType {
    String,
    Integer,
    Boolean,
}

#[async_trait]
pub trait ParameterManager: Send + Sync {
    async fn create_parameter_group(&self, group: ParameterGroup) -> DataResult<ParameterGroup>;
    async fn modify_parameter_group(&self, group: ParameterGroup) -> DataResult<ParameterGroup>;
    async fn delete_parameter_group(&self, name: &str) -> DataResult<()>;
    async fn get_parameter_group(&self, name: &str) -> DataResult<ParameterGroup>;
    async fn list_parameter_groups(&self) -> DataResult<Vec<ParameterGroup>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventNotification {
    pub id: String,
    pub cluster_id: String,
    pub node_id: Option<String>,
    pub event_type: EventType,
    pub message: String,
    pub severity: EventSeverity,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    Creation,
    Modification,
    Deletion,
    Maintenance,
    Failure,
    Recovery,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupConfig {
    pub cluster_id: String,
    pub retention_days: i32,
    pub backup_window: TimeWindow,
    pub final_backup: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeWindow {
    pub start_time: chrono::NaiveTime,
    pub duration_hours: i32,
}

#[async_trait]
pub trait BackupManager: Send + Sync {
    async fn create_backup(&self, config: BackupConfig) -> DataResult<()>;
    async fn restore_backup(&self, backup_id: &str, target_cluster_id: &str) -> DataResult<CacheCluster>;
    async fn delete_backup(&self, backup_id: &str) -> DataResult<()>;
    async fn list_backups(&self, cluster_id: &str) -> DataResult<Vec<BackupConfig>>;
}
