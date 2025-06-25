use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::NetworkResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnConnection {
    pub id: String,
    pub name: String,
    pub connection_type: VpnType,
    pub status: ConnectionStatus,
    pub customer_gateway: CustomerGateway,
    pub vpn_gateway: VpnGateway,
    pub routing: RoutingConfiguration,
    pub tunnels: Vec<VpnTunnel>,
    pub tags: HashMap<String, String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VpnType {
    StaticRouting,
    DynamicRouting { bgp_asn: u32 },
    PolicyBased,
    RouteBased,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConnectionStatus {
    Available,
    Pending,
    Deleting,
    Modifying,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomerGateway {
    pub id: String,
    pub ip_address: String,
    pub bgp_asn: Option<u32>,
    pub device: Option<DeviceInfo>,
    pub certificate: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub vendor: String,
    pub platform: String,
    pub software_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnGateway {
    pub id: String,
    pub vpc_id: String,
    pub availability_zone: String,
    pub public_ip: String,
    pub private_ip: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingConfiguration {
    pub propagate_routes: bool,
    pub static_routes: Vec<StaticRoute>,
    pub bgp_config: Option<BgpConfiguration>,
    pub route_tables: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StaticRoute {
    pub destination_cidr: String,
    pub next_hop: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BgpConfiguration {
    pub local_asn: u32,
    pub remote_asn: u32,
    pub keepalive_interval: i32,
    pub hold_time: i32,
    pub advertised_routes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnTunnel {
    pub id: String,
    pub status: TunnelStatus,
    pub outside_ip: String,
    pub inside_cidr: String,
    pub preshared_key: String,
    pub phase1: IkeConfiguration,
    pub phase2: IpsecConfiguration,
    pub last_status_change: DateTime<Utc>,
    pub metrics: Option<TunnelMetrics>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TunnelStatus {
    Up,
    Down,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IkeConfiguration {
    pub version: IkeVersion,
    pub encryption: EncryptionAlgorithm,
    pub integrity: IntegrityAlgorithm,
    pub dh_group: u32,
    pub lifetime_seconds: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IkeVersion {
    V1,
    V2,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EncryptionAlgorithm {
    AES128,
    AES256,
    AES128GCM,
    AES256GCM,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IntegrityAlgorithm {
    SHA1,
    SHA256,
    SHA384,
    SHA512,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpsecConfiguration {
    pub protocol: IpsecProtocol,
    pub encryption: EncryptionAlgorithm,
    pub integrity: IntegrityAlgorithm,
    pub pfs_group: u32,
    pub lifetime_seconds: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IpsecProtocol {
    ESP,
    AH,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TunnelMetrics {
    pub timestamp: DateTime<Utc>,
    pub status_checks: TunnelStatusChecks,
    pub traffic: TunnelTraffic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TunnelStatusChecks {
    pub ike_status: bool,
    pub ipsec_status: bool,
    pub tunnel_status: bool,
    pub route_status: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TunnelTraffic {
    pub bytes_in: u64,
    pub bytes_out: u64,
    pub packets_in: u64,
    pub packets_out: u64,
    pub packet_loss: f64,
    pub latency_ms: f64,
}

#[async_trait]
pub trait VpnManager: Send + Sync {
    async fn create_connection(&self, conn: VpnConnection) -> NetworkResult<VpnConnection>;
    async fn modify_connection(&self, conn: VpnConnection) -> NetworkResult<VpnConnection>;
    async fn delete_connection(&self, id: &str) -> NetworkResult<()>;
    async fn get_connection(&self, id: &str) -> NetworkResult<VpnConnection>;
    async fn list_connections(&self) -> NetworkResult<Vec<VpnConnection>>;
    async fn get_connection_metrics(&self, id: &str) -> NetworkResult<Vec<TunnelMetrics>>;
}

#[async_trait]
pub trait CustomerGatewayManager: Send + Sync {
    async fn create_customer_gateway(&self, gateway: CustomerGateway) -> NetworkResult<CustomerGateway>;
    async fn modify_customer_gateway(&self, gateway: CustomerGateway) -> NetworkResult<CustomerGateway>;
    async fn delete_customer_gateway(&self, id: &str) -> NetworkResult<()>;
    async fn get_customer_gateway(&self, id: &str) -> NetworkResult<CustomerGateway>;
    async fn list_customer_gateways(&self) -> NetworkResult<Vec<CustomerGateway>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VpnPolicy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub traffic_selector: TrafficSelector,
    pub security_policy: SecurityPolicy,
    pub routing_policy: RoutingPolicy,
    pub qos_policy: Option<QosPolicy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficSelector {
    pub local_networks: Vec<String>,
    pub remote_networks: Vec<String>,
    pub protocol: Option<String>,
    pub ports: Option<Vec<u16>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityPolicy {
    pub ike: IkeConfiguration,
    pub ipsec: IpsecConfiguration,
    pub perfect_forward_secrecy: bool,
    pub replay_window_size: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingPolicy {
    pub mode: RoutingMode,
    pub advertise_local_prefixes: bool,
    pub accept_remote_prefixes: bool,
    pub filter_rules: Vec<RouteFilterRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RoutingMode {
    Static,
    Dynamic { protocol: String, parameters: HashMap<String, String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteFilterRule {
    pub action: FilterAction,
    pub prefix: String,
    pub prefix_length: u8,
    pub direction: FilterDirection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterAction {
    Accept,
    Reject,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterDirection {
    In,
    Out,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QosPolicy {
    pub bandwidth_limit_kbps: u64,
    pub traffic_class: TrafficClass,
    pub dscp_marking: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrafficClass {
    BestEffort,
    Background,
    Standard,
    Premium,
}

#[async_trait]
pub trait VpnPolicyManager: Send + Sync {
    async fn create_policy(&self, policy: VpnPolicy) -> NetworkResult<VpnPolicy>;
    async fn modify_policy(&self, policy: VpnPolicy) -> NetworkResult<VpnPolicy>;
    async fn delete_policy(&self, id: &str) -> NetworkResult<()>;
    async fn get_policy(&self, id: &str) -> NetworkResult<VpnPolicy>;
    async fn list_policies(&self) -> NetworkResult<Vec<VpnPolicy>>;
    async fn attach_policy(&self, policy_id: &str, connection_id: &str) -> NetworkResult<()>;
    async fn detach_policy(&self, policy_id: &str, connection_id: &str) -> NetworkResult<()>;
}
