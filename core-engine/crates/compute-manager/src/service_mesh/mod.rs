use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use async_trait::async_trait;

use crate::error::ComputeResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceMeshConfig {
    pub mesh_type: MeshType,
    pub namespace: String,
    pub mtls_enabled: bool,
    pub tracing_enabled: bool,
    pub metrics_enabled: bool,
    pub ingress_gateway: Option<IngressGateway>,
    pub egress_gateway: Option<EgressGateway>,
    pub labels: HashMap<String, String>,
    pub annotations: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MeshType {
    Istio,
    Linkerd,
    ConsulConnect,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IngressGateway {
    pub name: String,
    pub replicas: i32,
    pub ports: Vec<Port>,
    pub tls_config: Option<TlsConfig>,
    pub load_balancer: LoadBalancerConfig,
    pub resources: ResourceRequirements,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EgressGateway {
    pub name: String,
    pub replicas: i32,
    pub outbound_traffic_policy: OutboundTrafficPolicy,
    pub resources: ResourceRequirements,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Port {
    pub name: String,
    pub port: i32,
    pub target_port: i32,
    pub protocol: Protocol,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TlsConfig {
    pub mode: TlsMode,
    pub certificate_path: Option<String>,
    pub private_key_path: Option<String>,
    pub ca_certificate_path: Option<String>,
    pub min_protocol_version: String,
    pub cipher_suites: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadBalancerConfig {
    pub lb_type: LoadBalancerType,
    pub source_ranges: Vec<String>,
    pub ip_families: Vec<String>,
    pub session_affinity: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceRequirements {
    pub cpu_request: String,
    pub memory_request: String,
    pub cpu_limit: String,
    pub memory_limit: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Protocol {
    Http,
    Https,
    Tcp,
    Udp,
    Grpc,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TlsMode {
    Simple,
    Mutual,
    Passthrough,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LoadBalancerType {
    ClusterIp,
    NodePort,
    LoadBalancer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OutboundTrafficPolicy {
    AllowAll,
    RegistryOnly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualService {
    pub name: String,
    pub hosts: Vec<String>,
    pub gateways: Vec<String>,
    pub http_routes: Vec<HttpRoute>,
    pub tcp_routes: Vec<TcpRoute>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpRoute {
    pub name: String,
    pub match_rules: Vec<HttpMatchRule>,
    pub route: Vec<RouteDestination>,
    pub retry_policy: Option<RetryPolicy>,
    pub timeout: Option<String>,
    pub fault_injection: Option<FaultInjection>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TcpRoute {
    pub name: String,
    pub match_rules: Vec<TcpMatchRule>,
    pub route: Vec<RouteDestination>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpMatchRule {
    pub uri_prefix: Option<String>,
    pub uri_exact: Option<String>,
    pub uri_regex: Option<String>,
    pub headers: HashMap<String, String>,
    pub query_params: HashMap<String, String>,
    pub method: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TcpMatchRule {
    pub port: Option<i32>,
    pub source_labels: HashMap<String, String>,
    pub destination_subnet: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteDestination {
    pub host: String,
    pub subset: Option<String>,
    pub port: Option<i32>,
    pub weight: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub attempts: i32,
    pub per_try_timeout: String,
    pub retry_on: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FaultInjection {
    pub delay: Option<Delay>,
    pub abort: Option<Abort>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delay {
    pub percent: f64,
    pub fixed_delay: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Abort {
    pub percent: f64,
    pub http_status: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceMeshMetrics {
    pub request_total: i64,
    pub request_duration_ms: i64,
    pub request_size_bytes: i64,
    pub response_size_bytes: i64,
    pub error_total: i64,
    pub circuit_breaker_open: bool,
    pub retry_total: i64,
}

#[async_trait]
pub trait ServiceMesh: Send + Sync + 'static {
    // Initialization and configuration
    async fn init(config: ServiceMeshConfig) -> ComputeResult<Box<dyn ServiceMesh>>;
    async fn get_config(&self) -> ComputeResult<ServiceMeshConfig>;
    async fn update_config(&self, config: ServiceMeshConfig) -> ComputeResult<ServiceMeshConfig>;

    // Virtual service management
    async fn create_virtual_service(&self, service: VirtualService) -> ComputeResult<VirtualService>;
    async fn update_virtual_service(&self, service: VirtualService) -> ComputeResult<VirtualService>;
    async fn delete_virtual_service(&self, name: &str) -> ComputeResult<()>;
    async fn get_virtual_service(&self, name: &str) -> ComputeResult<VirtualService>;
    async fn list_virtual_services(&self) -> ComputeResult<Vec<VirtualService>>;

    // Traffic management
    async fn set_traffic_policy(&self, service: &str, policy: TrafficPolicy) -> ComputeResult<()>;
    async fn get_traffic_policy(&self, service: &str) -> ComputeResult<TrafficPolicy>;
    async fn create_circuit_breaker(&self, service: &str, config: CircuitBreakerConfig) -> ComputeResult<()>;
    async fn create_retry_policy(&self, service: &str, policy: RetryPolicy) -> ComputeResult<()>;

    // Security
    async fn enable_mtls(&self, namespace: &str) -> ComputeResult<()>;
    async fn disable_mtls(&self, namespace: &str) -> ComputeResult<()>;
    async fn create_authorization_policy(&self, policy: AuthorizationPolicy) -> ComputeResult<()>;
    async fn create_authentication_policy(&self, policy: AuthenticationPolicy) -> ComputeResult<()>;

    // Observability
    async fn enable_tracing(&self, config: TracingConfig) -> ComputeResult<()>;
    async fn enable_metrics(&self, config: MetricsConfig) -> ComputeResult<()>;
    async fn get_service_metrics(&self, service: &str) -> ComputeResult<ServiceMeshMetrics>;
    async fn get_service_traces(&self, service: &str, start_time: i64, end_time: i64) -> ComputeResult<Vec<Trace>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficPolicy {
    pub load_balancer: LoadBalancerConfig,
    pub connection_pool: ConnectionPool,
    pub outlier_detection: OutlierDetection,
    pub tls: TlsConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionPool {
    pub tcp: TcpSettings,
    pub http: HttpSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TcpSettings {
    pub max_connections: i32,
    pub connect_timeout: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpSettings {
    pub http1_max_pending_requests: i32,
    pub http2_max_requests: i32,
    pub max_requests_per_connection: i32,
    pub max_retries: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutlierDetection {
    pub consecutive_errors: i32,
    pub interval: String,
    pub base_ejection_time: String,
    pub max_ejection_percent: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreakerConfig {
    pub max_connections: i32,
    pub max_pending_requests: i32,
    pub max_requests: i32,
    pub max_retries: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthorizationPolicy {
    pub name: String,
    pub namespace: String,
    pub selector: HashMap<String, String>,
    pub rules: Vec<AuthorizationRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthorizationRule {
    pub from: Vec<Source>,
    pub to: Vec<Operation>,
    pub when: Vec<Condition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Source {
    pub principals: Vec<String>,
    pub namespaces: Vec<String>,
    pub ip_blocks: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    pub hosts: Vec<String>,
    pub ports: Vec<i32>,
    pub methods: Vec<String>,
    pub paths: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub key: String,
    pub values: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticationPolicy {
    pub name: String,
    pub namespace: String,
    pub selector: HashMap<String, String>,
    pub peers: Vec<PeerAuthentication>,
    pub origins: Vec<OriginAuthentication>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerAuthentication {
    pub mtls_mode: TlsMode,
    pub jwt_rules: Vec<JwtRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OriginAuthentication {
    pub jwt: JwtRule,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtRule {
    pub issuer: String,
    pub audiences: Vec<String>,
    pub jwks_uri: String,
    pub forward_token: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracingConfig {
    pub provider: TracingProvider,
    pub sampling_rate: f64,
    pub endpoint: String,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TracingProvider {
    Jaeger,
    Zipkin,
    DataDog,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsConfig {
    pub provider: MetricsProvider,
    pub endpoint: String,
    pub scrape_interval: String,
    pub retention: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MetricsProvider {
    Prometheus,
    Datadog,
    NewRelic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trace {
    pub trace_id: String,
    pub span_id: String,
    pub parent_span_id: Option<String>,
    pub name: String,
    pub start_time: i64,
    pub end_time: i64,
    pub duration_ms: i64,
    pub tags: HashMap<String, String>,
    pub events: Vec<TraceEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceEvent {
    pub timestamp: i64,
    pub name: String,
    pub attributes: HashMap<String, String>,
}

impl ServiceMeshConfig {
    pub fn new(mesh_type: MeshType, namespace: String) -> Self {
        Self {
            mesh_type,
            namespace,
            mtls_enabled: true,
            tracing_enabled: false,
            metrics_enabled: true,
            ingress_gateway: None,
            egress_gateway: None,
            labels: HashMap::new(),
            annotations: HashMap::new(),
        }
    }

    pub fn with_ingress(mut self, ingress: IngressGateway) -> Self {
        self.ingress_gateway = Some(ingress);
        self
    }

    pub fn with_egress(mut self, egress: EgressGateway) -> Self {
        self.egress_gateway = Some(egress);
        self
    }
}

impl IngressGateway {
    pub fn new(name: String) -> Self {
        Self {
            name,
            replicas: 1,
            ports: Vec::new(),
            tls_config: None,
            load_balancer: LoadBalancerConfig {
                lb_type: LoadBalancerType::LoadBalancer,
                source_ranges: Vec::new(),
                ip_families: vec!["IPv4".to_string()],
                session_affinity: None,
            },
            resources: ResourceRequirements {
                cpu_request: "100m".to_string(),
                memory_request: "128Mi".to_string(),
                cpu_limit: "2000m".to_string(),
                memory_limit: "1Gi".to_string(),
            },
        }
    }

    pub fn add_port(&mut self, name: String, port: i32, target_port: i32, protocol: Protocol) {
        self.ports.push(Port {
            name,
            port,
            target_port,
            protocol,
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_service_mesh_config() {
        let mut ingress = IngressGateway::new("main-ingress".to_string());
        ingress.add_port(
            "http".to_string(),
            80,
            8080,
            Protocol::Http,
        );
        ingress.add_port(
            "https".to_string(),
            443,
            8443,
            Protocol::Https,
        );

        let config = ServiceMeshConfig::new(
            MeshType::Istio,
            "default".to_string(),
        )
        .with_ingress(ingress);

        assert_eq!(config.mesh_type, MeshType::Istio);
        assert_eq!(config.namespace, "default");
        assert!(config.mtls_enabled);
        assert!(config.metrics_enabled);
        assert!(!config.tracing_enabled);

        let ingress = config.ingress_gateway.unwrap();
        assert_eq!(ingress.ports.len(), 2);
        assert_eq!(ingress.name, "main-ingress");
    }

    #[test]
    fn test_virtual_service() {
        let service = VirtualService {
            name: "web-service".to_string(),
            hosts: vec!["example.com".to_string()],
            gateways: vec!["main-gateway".to_string()],
            http_routes: vec![
                HttpRoute {
                    name: "primary".to_string(),
                    match_rules: vec![
                        HttpMatchRule {
                            uri_prefix: Some("/api".to_string()),
                            uri_exact: None,
                            uri_regex: None,
                            headers: HashMap::new(),
                            query_params: HashMap::new(),
                            method: None,
                        },
                    ],
                    route: vec![
                        RouteDestination {
                            host: "web-service.default.svc.cluster.local".to_string(),
                            subset: None,
                            port: Some(8080),
                            weight: 100,
                        },
                    ],
                    retry_policy: Some(RetryPolicy {
                        attempts: 3,
                        per_try_timeout: "2s".to_string(),
                        retry_on: vec!["5xx".to_string()],
                    }),
                    timeout: Some("5s".to_string()),
                    fault_injection: None,
                },
            ],
            tcp_routes: Vec::new(),
        };

        assert_eq!(service.name, "web-service");
        assert_eq!(service.http_routes.len(), 1);
        assert!(service.http_routes[0].retry_policy.is_some());
    }
}
