use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::NetworkResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Zone {
    pub id: String,
    pub name: String,
    pub domain: String,
    pub zone_type: ZoneType,
    pub status: ZoneStatus,
    pub nameservers: Vec<String>,
    pub soa_record: SOARecord,
    pub dnssec_status: DnssecStatus,
    pub tags: HashMap<String, String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ZoneType {
    Public,
    Private { vpc_id: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ZoneStatus {
    Active,
    Pending,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SOARecord {
    pub mname: String,
    pub rname: String,
    pub serial: u32,
    pub refresh: i32,
    pub retry: i32,
    pub expire: i32,
    pub minimum: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DnssecStatus {
    Enabled,
    Disabled,
    SigningInProgress,
    SigningFailed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordSet {
    pub id: String,
    pub zone_id: String,
    pub name: String,
    pub record_type: RecordType,
    pub ttl: i32,
    pub records: Vec<String>,
    pub routing_policy: Option<RoutingPolicy>,
    pub health_check: Option<HealthCheck>,
    pub alias_target: Option<AliasTarget>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecordType {
    A,
    AAAA,
    CNAME,
    MX,
    NS,
    PTR,
    SOA,
    SRV,
    TXT,
    CAA,
    ALIAS,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RoutingPolicy {
    Simple,
    Weighted { weight: i32 },
    Latency { region: String },
    Geolocation { continent: Option<String>, country: Option<String>, subdivision: Option<String> },
    Failover { is_primary: bool, health_check: String },
    Multivalue { health_check: Option<String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub id: String,
    pub target: HealthCheckTarget,
    pub interval_seconds: i32,
    pub timeout_seconds: i32,
    pub failure_threshold: i32,
    pub request_interval: i32,
    pub regions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealthCheckTarget {
    HTTP { endpoint: String, path: String, expected_codes: Vec<i32> },
    HTTPS { endpoint: String, path: String, expected_codes: Vec<i32> },
    TCP { endpoint: String },
    DNS { domain: String, record_type: RecordType, expected_values: Vec<String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AliasTarget {
    pub dns_name: String,
    pub hosted_zone_id: String,
    pub evaluate_target_health: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ZoneMetrics {
    pub zone_id: String,
    pub timestamp: DateTime<Utc>,
    pub queries_per_second: f64,
    pub total_queries: i64,
    pub latency_ms: f64,
}

#[async_trait]
pub trait ZoneManager: Send + Sync {
    async fn create_zone(&self, zone: Zone) -> NetworkResult<Zone>;
    async fn modify_zone(&self, zone: Zone) -> NetworkResult<Zone>;
    async fn delete_zone(&self, id: &str) -> NetworkResult<()>;
    async fn get_zone(&self, id: &str) -> NetworkResult<Zone>;
    async fn list_zones(&self) -> NetworkResult<Vec<Zone>>;
    async fn get_metrics(&self, id: &str, window: chrono::Duration) -> NetworkResult<Vec<ZoneMetrics>>;
}

#[async_trait]
pub trait RecordSetManager: Send + Sync {
    async fn create_record_set(&self, record: RecordSet) -> NetworkResult<RecordSet>;
    async fn modify_record_set(&self, record: RecordSet) -> NetworkResult<RecordSet>;
    async fn delete_record_set(&self, zone_id: &str, record_id: &str) -> NetworkResult<()>;
    async fn get_record_set(&self, zone_id: &str, record_id: &str) -> NetworkResult<RecordSet>;
    async fn list_record_sets(&self, zone_id: &str) -> NetworkResult<Vec<RecordSet>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DnssecKey {
    pub id: String,
    pub zone_id: String,
    pub key_type: DnssecKeyType,
    pub algorithm: DnssecAlgorithm,
    pub public_key: String,
    pub private_key: Option<String>,
    pub status: KeyStatus,
    pub activation_date: DateTime<Utc>,
    pub expiration_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DnssecKeyType {
    KSK,
    ZSK,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DnssecAlgorithm {
    RSASHA1,
    RSASHA256,
    RSASHA512,
    ECDSAP256SHA256,
    ECDSAP384SHA384,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KeyStatus {
    Active,
    Inactive,
    Pending,
    Revoked,
}

#[async_trait]
pub trait DnssecManager: Send + Sync {
    async fn enable_dnssec(&self, zone_id: &str) -> NetworkResult<()>;
    async fn disable_dnssec(&self, zone_id: &str) -> NetworkResult<()>;
    async fn create_key(&self, key: DnssecKey) -> NetworkResult<DnssecKey>;
    async fn rotate_key(&self, key_id: &str) -> NetworkResult<DnssecKey>;
    async fn get_key(&self, key_id: &str) -> NetworkResult<DnssecKey>;
    async fn list_keys(&self, zone_id: &str) -> NetworkResult<Vec<DnssecKey>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolverRule {
    pub id: String,
    pub domain_name: String,
    pub rule_type: ResolverRuleType,
    pub target_ips: Vec<String>,
    pub vpc_id: String,
    pub status: RuleStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResolverRuleType {
    Forward,
    System,
    Recursive,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleStatus {
    Creating,
    Active,
    Updating,
    Deleting,
    Failed,
}

#[async_trait]
pub trait ResolverManager: Send + Sync {
    async fn create_resolver_rule(&self, rule: ResolverRule) -> NetworkResult<ResolverRule>;
    async fn modify_resolver_rule(&self, rule: ResolverRule) -> NetworkResult<ResolverRule>;
    async fn delete_resolver_rule(&self, id: &str) -> NetworkResult<()>;
    async fn get_resolver_rule(&self, id: &str) -> NetworkResult<ResolverRule>;
    async fn list_resolver_rules(&self) -> NetworkResult<Vec<ResolverRule>>;
    async fn associate_vpc(&self, rule_id: &str, vpc_id: &str) -> NetworkResult<()>;
    async fn disassociate_vpc(&self, rule_id: &str, vpc_id: &str) -> NetworkResult<()>;
}
