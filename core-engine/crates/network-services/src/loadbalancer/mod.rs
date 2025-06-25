use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::NetworkResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadBalancer {
    pub id: String,
    pub name: String,
    pub lb_type: LoadBalancerType,
    pub status: LoadBalancerStatus,
    pub scheme: LoadBalancerScheme,
    pub ip_address_type: IpAddressType,
    pub subnets: Vec<String>,
    pub security_groups: Vec<String>,
    pub listeners: Vec<Listener>,
    pub health_check: HealthCheck,
    pub tags: HashMap<String, String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LoadBalancerType {
    Application,
    Network,
    Gateway,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LoadBalancerStatus {
    Provisioning,
    Active,
    Failed,
    Modifying,
    Deleting,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LoadBalancerScheme {
    Internal,
    Internet,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IpAddressType {
    IPv4,
    IPv6,
    Dualstack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Listener {
    pub id: String,
    pub protocol: ListenerProtocol,
    pub port: u16,
    pub ssl_policy: Option<String>,
    pub certificates: Option<Vec<Certificate>>,
    pub default_action: ListenerAction,
    pub rules: Vec<ListenerRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ListenerProtocol {
    HTTP,
    HTTPS,
    TCP,
    TLS,
    UDP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Certificate {
    pub arn: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ListenerAction {
    Forward { target_group: String },
    Redirect { url: String, status_code: u16 },
    FixedResponse { content_type: String, message: String, status_code: u16 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListenerRule {
    pub id: String,
    pub priority: i32,
    pub conditions: Vec<RuleCondition>,
    pub action: ListenerAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleCondition {
    PathPattern(String),
    HostHeader(String),
    HttpHeader { name: String, values: Vec<String> },
    QueryString(HashMap<String, String>),
    SourceIp(Vec<String>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub protocol: ListenerProtocol,
    pub port: Option<u16>,
    pub path: Option<String>,
    pub interval_seconds: i32,
    pub timeout_seconds: i32,
    pub healthy_threshold: i32,
    pub unhealthy_threshold: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetGroup {
    pub id: String,
    pub name: String,
    pub protocol: ListenerProtocol,
    pub port: u16,
    pub target_type: TargetType,
    pub vpc_id: String,
    pub health_check: HealthCheck,
    pub attributes: TargetGroupAttributes,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TargetType {
    Instance,
    IP,
    Lambda,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetGroupAttributes {
    pub deregistration_delay_seconds: i32,
    pub stickiness_enabled: bool,
    pub stickiness_type: Option<String>,
    pub stickiness_duration_seconds: Option<i32>,
    pub load_balancing_algorithm: LoadBalancingAlgorithm,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LoadBalancingAlgorithm {
    RoundRobin,
    LeastOutstandingRequests,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Target {
    pub id: String,
    pub target_group_id: String,
    pub target_type: TargetType,
    pub port: Option<u16>,
    pub weight: Option<i32>,
    pub status: TargetHealth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TargetHealth {
    Initial,
    Healthy,
    Unhealthy,
    Unused,
    Draining,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadBalancerMetrics {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub active_connections: i64,
    pub new_connections: i64,
    pub processed_bytes: i64,
    pub request_count: i64,
    pub healthy_host_count: i32,
    pub unhealthy_host_count: i32,
    pub http_2xx: i64,
    pub http_3xx: i64,
    pub http_4xx: i64,
    pub http_5xx: i64,
}

#[async_trait]
pub trait LoadBalancerManager: Send + Sync {
    async fn create_load_balancer(&self, lb: LoadBalancer) -> NetworkResult<LoadBalancer>;
    async fn modify_load_balancer(&self, lb: LoadBalancer) -> NetworkResult<LoadBalancer>;
    async fn delete_load_balancer(&self, id: &str) -> NetworkResult<()>;
    async fn get_load_balancer(&self, id: &str) -> NetworkResult<LoadBalancer>;
    async fn list_load_balancers(&self) -> NetworkResult<Vec<LoadBalancer>>;
    async fn get_metrics(&self, id: &str, window: chrono::Duration) -> NetworkResult<Vec<LoadBalancerMetrics>>;
}

#[async_trait]
pub trait TargetGroupManager: Send + Sync {
    async fn create_target_group(&self, group: TargetGroup) -> NetworkResult<TargetGroup>;
    async fn modify_target_group(&self, group: TargetGroup) -> NetworkResult<TargetGroup>;
    async fn delete_target_group(&self, id: &str) -> NetworkResult<()>;
    async fn get_target_group(&self, id: &str) -> NetworkResult<TargetGroup>;
    async fn list_target_groups(&self) -> NetworkResult<Vec<TargetGroup>>;
    async fn register_targets(&self, group_id: &str, targets: Vec<Target>) -> NetworkResult<()>;
    async fn deregister_targets(&self, group_id: &str, target_ids: Vec<String>) -> NetworkResult<()>;
    async fn describe_target_health(&self, group_id: &str) -> NetworkResult<Vec<Target>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SSLPolicy {
    pub name: String,
    pub protocols: Vec<String>,
    pub ciphers: Vec<String>,
    pub security_level: SecurityLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecurityLevel {
    Modern,
    Intermediate,
    Old,
    Custom,
}

#[async_trait]
pub trait SSLPolicyManager: Send + Sync {
    async fn create_ssl_policy(&self, policy: SSLPolicy) -> NetworkResult<SSLPolicy>;
    async fn modify_ssl_policy(&self, policy: SSLPolicy) -> NetworkResult<SSLPolicy>;
    async fn delete_ssl_policy(&self, name: &str) -> NetworkResult<()>;
    async fn get_ssl_policy(&self, name: &str) -> NetworkResult<SSLPolicy>;
    async fn list_ssl_policies(&self) -> NetworkResult<Vec<SSLPolicy>>;
}
