use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::DataResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseInstance {
    pub id: String,
    pub name: String,
    pub engine: DatabaseEngine,
    pub version: String,
    pub status: InstanceStatus,
    pub endpoint: String,
    pub port: u16,
    pub size: String,
    pub storage_gb: i32,
    pub network_id: String,
    pub security_groups: Vec<String>,
    pub backup_config: BackupConfig,
    pub maintenance_window: MaintenanceWindow,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseEngine {
    PostgreSQL,
    MySQL,
    MariaDB,
    MongoDB,
    Redis,
    Elasticsearch,
    Cassandra,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InstanceStatus {
    Creating,
    Available,
    Modifying,
    BackingUp,
    Restoring,
    Maintenance,
    Failed,
    Deleted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupConfig {
    pub retention_days: i32,
    pub backup_window: TimeWindow,
    pub enable_point_in_time: bool,
    pub backup_storage_class: StorageClass,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeWindow {
    pub start_time: chrono::NaiveTime,
    pub duration_hours: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaintenanceWindow {
    pub day: chrono::Weekday,
    pub start_time: chrono::NaiveTime,
    pub duration_hours: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageClass {
    Standard,
    ColdStorage,
    Archive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseMetrics {
    pub instance_id: String,
    pub timestamp: DateTime<Utc>,
    pub cpu_utilization: f64,
    pub memory_utilization: f64,
    pub disk_utilization: f64,
    pub iops: i32,
    pub latency_ms: f64,
    pub connections: i32,
    pub replication_lag: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupJob {
    pub id: String,
    pub instance_id: String,
    pub status: BackupStatus,
    pub type_: BackupType,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub size_bytes: u64,
    pub storage_location: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BackupStatus {
    InProgress,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BackupType {
    Automated,
    Manual,
    Snapshot,
}

#[async_trait]
pub trait DatabaseManager: Send + Sync {
    async fn create_instance(&self, config: DatabaseInstance) -> DataResult<DatabaseInstance>;
    async fn modify_instance(&self, instance: DatabaseInstance) -> DataResult<DatabaseInstance>;
    async fn delete_instance(&self, id: &str) -> DataResult<()>;
    async fn get_instance(&self, id: &str) -> DataResult<DatabaseInstance>;
    async fn list_instances(&self) -> DataResult<Vec<DatabaseInstance>>;
    async fn start_instance(&self, id: &str) -> DataResult<()>;
    async fn stop_instance(&self, id: &str) -> DataResult<()>;
    async fn restart_instance(&self, id: &str) -> DataResult<()>;
    async fn create_backup(&self, instance_id: &str) -> DataResult<BackupJob>;
    async fn restore_backup(&self, backup_id: &str, target_instance_id: &str) -> DataResult<DatabaseInstance>;
    async fn get_metrics(&self, instance_id: &str, window: chrono::Duration) -> DataResult<Vec<DatabaseMetrics>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingPolicy {
    pub instance_id: String,
    pub min_capacity: String,
    pub max_capacity: String,
    pub target_cpu_utilization: f64,
    pub target_memory_utilization: f64,
    pub cooldown_seconds: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplicaConfig {
    pub instance_id: String,
    pub replica_count: i32,
    pub replica_capacity: String,
    pub auto_failover: bool,
    pub regions: Vec<String>,
}

#[async_trait]
pub trait DatabaseScaling: Send + Sync {
    async fn configure_scaling(&self, policy: ScalingPolicy) -> DataResult<()>;
    async fn get_scaling_policy(&self, instance_id: &str) -> DataResult<ScalingPolicy>;
    async fn update_scaling_policy(&self, policy: ScalingPolicy) -> DataResult<()>;
    async fn configure_replicas(&self, config: ReplicaConfig) -> DataResult<()>;
    async fn get_replica_config(&self, instance_id: &str) -> DataResult<ReplicaConfig>;
    async fn update_replica_config(&self, config: ReplicaConfig) -> DataResult<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaintenanceTask {
    pub id: String,
    pub instance_id: String,
    pub task_type: MaintenanceType,
    pub status: MaintenanceStatus,
    pub scheduled_at: DateTime<Utc>,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaintenanceType {
    MinorUpgrade,
    MajorUpgrade,
    SecurityPatch,
    Configuration,
    Backup,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaintenanceStatus {
    Scheduled,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

#[async_trait]
pub trait MaintenanceManager: Send + Sync {
    async fn schedule_maintenance(&self, task: MaintenanceTask) -> DataResult<MaintenanceTask>;
    async fn get_maintenance_task(&self, id: &str) -> DataResult<MaintenanceTask>;
    async fn list_maintenance_tasks(&self, instance_id: &str) -> DataResult<Vec<MaintenanceTask>>;
    async fn cancel_maintenance_task(&self, id: &str) -> DataResult<()>;
}
