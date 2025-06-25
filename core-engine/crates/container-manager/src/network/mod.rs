use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::error::ContainerResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub name: String,
    pub driver: NetworkDriver,
    pub subnet: Option<String>,
    pub gateway: Option<String>,
    pub ipv6: bool,
    pub internal: bool,
    pub labels: HashMap<String, String>,
    pub options: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkDriver {
    Bridge,
    Host,
    Overlay,
    Macvlan,
    None,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Network {
    pub id: String,
    pub name: String,
    pub driver: NetworkDriver,
    pub scope: NetworkScope,
    pub subnet: Option<String>,
    pub gateway: Option<String>,
    pub ipv6_enabled: bool,
    pub internal: bool,
    pub created: chrono::DateTime<chrono::Utc>,
    pub containers: HashMap<String, NetworkContainer>,
    pub labels: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkScope {
    Local,
    Global,
    Swarm,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkContainer {
    pub id: String,
    pub name: String,
    pub ipv4_address: Option<String>,
    pub ipv6_address: Option<String>,
    pub mac_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkingStats {
    pub rx_bytes: u64,
    pub rx_packets: u64,
    pub rx_errors: u64,
    pub rx_dropped: u64,
    pub tx_bytes: u64,
    pub tx_packets: u64,
    pub tx_errors: u64,
    pub tx_dropped: u64,
}

#[async_trait]
pub trait NetworkManager: Send + Sync {
    async fn create_network(&self, config: NetworkConfig) -> ContainerResult<Network>;
    async fn delete_network(&self, id: &str) -> ContainerResult<()>;
    async fn get_network(&self, id: &str) -> ContainerResult<Network>;
    async fn list_networks(&self) -> ContainerResult<Vec<Network>>;
    async fn connect_container(&self, network_id: &str, container_id: &str) -> ContainerResult<()>;
    async fn disconnect_container(&self, network_id: &str, container_id: &str) -> ContainerResult<()>;
    async fn get_container_networks(&self, container_id: &str) -> ContainerResult<Vec<Network>>;
    async fn get_network_stats(&self, network_id: &str) -> ContainerResult<NetworkingStats>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPolicy {
    pub name: String,
    pub ingress_rules: Vec<NetworkRule>,
    pub egress_rules: Vec<NetworkRule>,
    pub pod_selector: LabelSelector,
    pub namespace_selector: Option<LabelSelector>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkRule {
    pub ports: Vec<NetworkPort>,
    pub from: Vec<NetworkPeer>,
    pub to: Vec<NetworkPeer>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPort {
    pub protocol: Protocol,
    pub port: Option<i32>,
    pub end_port: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    TCP,
    UDP,
    SCTP,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkPeer {
    pub pod_selector: Option<LabelSelector>,
    pub namespace_selector: Option<LabelSelector>,
    pub ip_block: Option<IpBlock>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LabelSelector {
    pub match_labels: HashMap<String, String>,
    pub match_expressions: Vec<LabelSelectorRequirement>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LabelSelectorRequirement {
    pub key: String,
    pub operator: LabelSelectorOperator,
    pub values: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LabelSelectorOperator {
    In,
    NotIn,
    Exists,
    DoesNotExist,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpBlock {
    pub cidr: String,
    pub except: Vec<String>,
}

#[async_trait]
pub trait NetworkPolicyManager: Send + Sync {
    async fn create_policy(&self, policy: NetworkPolicy) -> ContainerResult<()>;
    async fn delete_policy(&self, name: &str, namespace: &str) -> ContainerResult<()>;
    async fn get_policy(&self, name: &str, namespace: &str) -> ContainerResult<NetworkPolicy>;
    async fn list_policies(&self, namespace: &str) -> ContainerResult<Vec<NetworkPolicy>>;
    async fn update_policy(&self, policy: NetworkPolicy) -> ContainerResult<()>;
}
