use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::NetworkResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub scope: PolicyScope,
    pub priority: i32,
    pub ingress_rules: Vec<IngressRule>,
    pub egress_rules: Vec<EgressRule>,
    pub labels: HashMap<String, String>,
    pub status: PolicyStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyScope {
    pub namespaces: Vec<String>,
    pub selector: ResourceSelector,
    pub exclude: Option<ResourceSelector>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceSelector {
    pub match_labels: HashMap<String, String>,
    pub match_expressions: Vec<SelectorExpression>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectorExpression {
    pub key: String,
    pub operator: SelectorOperator,
    pub values: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SelectorOperator {
    In,
    NotIn,
    Exists,
    DoesNotExist,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IngressRule {
    pub description: Option<String>,
    pub from: Vec<NetworkPeer>,
    pub ports: Vec<PortRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EgressRule {
    pub description: Option<String>,
    pub to: Vec<NetworkPeer>,
    pub ports: Vec<PortRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPeer {
    pub pod_selector: Option<ResourceSelector>,
    pub namespace_selector: Option<ResourceSelector>,
    pub ip_block: Option<IpBlock>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpBlock {
    pub cidr: String,
    pub except: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortRule {
    pub protocol: Protocol,
    pub port: Option<u16>,
    pub end_port: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    TCP,
    UDP,
    SCTP,
    ICMP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyStatus {
    Active,
    Inactive,
    Error,
}

#[async_trait]
pub trait NetworkPolicyManager: Send + Sync {
    async fn create_policy(&self, policy: NetworkPolicy) -> NetworkResult<NetworkPolicy>;
    async fn update_policy(&self, policy: NetworkPolicy) -> NetworkResult<NetworkPolicy>;
    async fn delete_policy(&self, id: &str) -> NetworkResult<()>;
    async fn get_policy(&self, id: &str) -> NetworkResult<NetworkPolicy>;
    async fn list_policies(&self) -> NetworkResult<Vec<NetworkPolicy>>;
    async fn validate_policy(&self, policy: &NetworkPolicy) -> NetworkResult<ValidationResult>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub errors: Vec<ValidationError>,
    pub warnings: Vec<ValidationWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub code: String,
    pub message: String,
    pub field: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationWarning {
    pub code: String,
    pub message: String,
    pub recommendation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityGroup {
    pub id: String,
    pub name: String,
    pub description: String,
    pub vpc_id: String,
    pub ingress_rules: Vec<SecurityGroupRule>,
    pub egress_rules: Vec<SecurityGroupRule>,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityGroupRule {
    pub id: String,
    pub description: Option<String>,
    pub protocol: Protocol,
    pub from_port: Option<i32>,
    pub to_port: Option<i32>,
    pub cidr_blocks: Vec<String>,
    pub source_groups: Vec<String>,
}

#[async_trait]
pub trait SecurityGroupManager: Send + Sync {
    async fn create_security_group(&self, group: SecurityGroup) -> NetworkResult<SecurityGroup>;
    async fn update_security_group(&self, group: SecurityGroup) -> NetworkResult<SecurityGroup>;
    async fn delete_security_group(&self, id: &str) -> NetworkResult<()>;
    async fn get_security_group(&self, id: &str) -> NetworkResult<SecurityGroup>;
    async fn list_security_groups(&self) -> NetworkResult<Vec<SecurityGroup>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkACL {
    pub id: String,
    pub name: String,
    pub vpc_id: String,
    pub inbound_rules: Vec<ACLRule>,
    pub outbound_rules: Vec<ACLRule>,
    pub associations: Vec<SubnetAssociation>,
    pub default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ACLRule {
    pub rule_number: i32,
    pub protocol: Protocol,
    pub rule_action: RuleAction,
    pub cidr_block: String,
    pub from_port: Option<i32>,
    pub to_port: Option<i32>,
    pub icmp_type: Option<i32>,
    pub icmp_code: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleAction {
    Allow,
    Deny,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubnetAssociation {
    pub subnet_id: String,
    pub acl_id: String,
}

#[async_trait]
pub trait NetworkACLManager: Send + Sync {
    async fn create_acl(&self, acl: NetworkACL) -> NetworkResult<NetworkACL>;
    async fn update_acl(&self, acl: NetworkACL) -> NetworkResult<NetworkACL>;
    async fn delete_acl(&self, id: &str) -> NetworkResult<()>;
    async fn get_acl(&self, id: &str) -> NetworkResult<NetworkACL>;
    async fn list_acls(&self) -> NetworkResult<Vec<NetworkACL>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowLog {
    pub id: String,
    pub resource_id: String,
    pub resource_type: FlowLogResourceType,
    pub traffic_type: TrafficType,
    pub log_destination: LogDestination,
    pub format: String,
    pub aggregation_interval: i32,
    pub status: FlowLogStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FlowLogResourceType {
    VPC,
    Subnet,
    NetworkInterface,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrafficType {
    Accept,
    Reject,
    All,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogDestination {
    CloudWatch { log_group: String },
    S3 { bucket: String, prefix: Option<String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FlowLogStatus {
    Active,
    Inactive,
    Error,
}

#[async_trait]
pub trait FlowLogManager: Send + Sync {
    async fn create_flow_log(&self, log: FlowLog) -> NetworkResult<FlowLog>;
    async fn delete_flow_log(&self, id: &str) -> NetworkResult<()>;
    async fn get_flow_log(&self, id: &str) -> NetworkResult<FlowLog>;
    async fn list_flow_logs(&self) -> NetworkResult<Vec<FlowLog>>;
    async fn query_flow_logs(&self, query: FlowLogQuery) -> NetworkResult<Vec<FlowLogRecord>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowLogQuery {
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub filter: Option<String>,
    pub limit: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlowLogRecord {
    pub timestamp: DateTime<Utc>,
    pub version: i32,
    pub account_id: String,
    pub interface_id: String,
    pub source_address: String,
    pub destination_address: String,
    pub source_port: i32,
    pub destination_port: i32,
    pub protocol: i32,
    pub packets: i64,
    pub bytes: i64,
    pub start_time: i64,
    pub end_time: i64,
    pub action: String,
    pub log_status: String,
}
