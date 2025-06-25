mod aws;
mod azure;
mod gcp;

pub use aws::AwsProvider;
pub use azure::AzureProvider;
pub use gcp::GcpProvider;

use crate::error::{ComputeError, ComputeResult};
use crate::fleet::{FleetConfig, Instance, InstanceGroup};
use crate::serverless::{Function, FunctionConfig};
use crate::autoscaling::AutoScalingConfig;
use crate::optimization::OptimizationStrategy;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use async_trait::async_trait;
use std::fmt::Debug;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub provider_type: ProviderType,
    pub region: String,
    pub credentials: Credentials,
    pub network_config: NetworkConfig,
    pub monitoring_config: MonitoringConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ProviderType {
    Aws,
    Azure,
    Gcp,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Credentials {
    pub access_key: Option<String>,
    pub secret_key: Option<String>,
    pub token: Option<String>,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
    pub tenant_id: Option<String>,
    pub project_id: Option<String>,
    pub json_key: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub vpc_id: Option<String>,
    pub subnet_ids: Vec<String>,
    pub security_groups: Vec<String>,
    pub enable_public_ip: bool,
    pub dns_zones: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub enable_detailed_monitoring: bool,
    pub metric_resolution_seconds: i32,
    pub log_retention_days: i32,
    pub alert_webhooks: Vec<String>,
}

#[async_trait]
pub trait Provider: Send + Sync + 'static {
    // Initialization
    async fn init(config: ProviderConfig) -> ComputeResult<Box<dyn Provider>>;

    // Fleet Management
    async fn create_fleet(&self, config: FleetConfig) -> ComputeResult<FleetConfig>;
    async fn update_fleet(&self, config: FleetConfig) -> ComputeResult<FleetConfig>;
    async fn delete_fleet(&self, fleet_id: &str) -> ComputeResult<()>;
    async fn get_fleet(&self, fleet_id: &str) -> ComputeResult<FleetConfig>;
    async fn list_fleets(&self) -> ComputeResult<Vec<FleetConfig>>;

    // Instance Group Management
    async fn create_instance_group(&self, fleet_id: &str, group: InstanceGroup) -> ComputeResult<InstanceGroup>;
    async fn update_instance_group(&self, fleet_id: &str, group: InstanceGroup) -> ComputeResult<InstanceGroup>;
    async fn delete_instance_group(&self, fleet_id: &str, group_id: &str) -> ComputeResult<()>;
    async fn get_instance_group(&self, fleet_id: &str, group_id: &str) -> ComputeResult<InstanceGroup>;
    async fn list_instance_groups(&self, fleet_id: &str) -> ComputeResult<Vec<InstanceGroup>>;

    // Instance Operations
    async fn start_instance(&self, instance_id: &str) -> ComputeResult<()>;
    async fn stop_instance(&self, instance_id: &str) -> ComputeResult<()>;
    async fn restart_instance(&self, instance_id: &str) -> ComputeResult<()>;
    async fn terminate_instance(&self, instance_id: &str) -> ComputeResult<()>;
    async fn get_instance(&self, instance_id: &str) -> ComputeResult<Instance>;
    async fn list_instances(&self, fleet_id: &str, group_id: Option<&str>) -> ComputeResult<Vec<Instance>>;

    // Serverless Functions
    async fn create_function(&self, config: FunctionConfig) -> ComputeResult<Function>;
    async fn update_function(&self, config: FunctionConfig) -> ComputeResult<Function>;
    async fn delete_function(&self, function_id: &str) -> ComputeResult<()>;
    async fn get_function(&self, function_id: &str) -> ComputeResult<Function>;
    async fn list_functions(&self) -> ComputeResult<Vec<Function>>;
    async fn invoke_function(&self, function_id: &str, payload: Vec<u8>) -> ComputeResult<Vec<u8>>;

    // Auto-scaling
    async fn configure_auto_scaling(&self, config: AutoScalingConfig) -> ComputeResult<AutoScalingConfig>;
    async fn update_auto_scaling(&self, config: AutoScalingConfig) -> ComputeResult<AutoScalingConfig>;
    async fn delete_auto_scaling(&self, config_id: &str) -> ComputeResult<()>;
    async fn get_auto_scaling(&self, config_id: &str) -> ComputeResult<AutoScalingConfig>;
    async fn list_auto_scaling(&self) -> ComputeResult<Vec<AutoScalingConfig>>;

    // Resource Optimization
    async fn analyze_resources(&self, resource_ids: Vec<String>) -> ComputeResult<Vec<OptimizationStrategy>>;
    async fn apply_optimization(&self, strategy: OptimizationStrategy) -> ComputeResult<()>;
    async fn get_optimization_history(&self, resource_id: &str) -> ComputeResult<Vec<OptimizationStrategy>>;

    // Monitoring
    async fn get_metrics(&self, resource_id: &str, metric_names: Vec<String>) -> ComputeResult<Vec<(String, f64)>>;
    async fn get_logs(&self, resource_id: &str, start_time: i64, end_time: i64) -> ComputeResult<Vec<String>>;
}

impl ProviderConfig {
    pub fn new(provider_type: ProviderType, region: String) -> Self {
        Self {
            provider_type,
            region,
            credentials: Credentials::default(),
            network_config: NetworkConfig {
                vpc_id: None,
                subnet_ids: Vec::new(),
                security_groups: Vec::new(),
                enable_public_ip: false,
                dns_zones: Vec::new(),
            },
            monitoring_config: MonitoringConfig {
                enable_detailed_monitoring: false,
                metric_resolution_seconds: 60,
                log_retention_days: 30,
                alert_webhooks: Vec::new(),
            },
        }
    }

    pub fn with_credentials(mut self, credentials: Credentials) -> Self {
        self.credentials = credentials;
        self
    }

    pub fn with_network_config(mut self, network_config: NetworkConfig) -> Self {
        self.network_config = network_config;
        self
    }

    pub fn with_monitoring_config(mut self, monitoring_config: MonitoringConfig) -> Self {
        self.monitoring_config = monitoring_config;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_provider_config() {
        let config = ProviderConfig::new(
            ProviderType::Aws,
            "us-west-2".to_string(),
        )
        .with_credentials(Credentials {
            access_key: Some("test-key".to_string()),
            secret_key: Some("test-secret".to_string()),
            ..Default::default()
        })
        .with_network_config(NetworkConfig {
            vpc_id: Some("vpc-test".to_string()),
            subnet_ids: vec!["subnet-1".to_string()],
            security_groups: vec!["sg-1".to_string()],
            enable_public_ip: true,
            dns_zones: Vec::new(),
        });

        assert_eq!(config.provider_type, ProviderType::Aws);
        assert_eq!(config.region, "us-west-2");
        assert!(config.credentials.access_key.is_some());
        assert!(config.credentials.secret_key.is_some());
        assert!(config.network_config.vpc_id.is_some());
        assert_eq!(config.network_config.subnet_ids.len(), 1);
        assert!(config.network_config.enable_public_ip);
    }
}
