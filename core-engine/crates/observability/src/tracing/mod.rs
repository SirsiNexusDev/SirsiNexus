use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::ObservabilityResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trace {
    pub trace_id: String,
    pub name: String,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub spans: Vec<Span>,
    pub status: TraceStatus,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Span {
    pub span_id: String,
    pub trace_id: String,
    pub parent_span_id: Option<String>,
    pub name: String,
    pub kind: SpanKind,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub attributes: HashMap<String, AttributeValue>,
    pub events: Vec<SpanEvent>,
    pub links: Vec<SpanLink>,
    pub status: SpanStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SpanKind {
    Internal,
    Server,
    Client,
    Producer,
    Consumer,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AttributeValue {
    String(String),
    Int(i64),
    Float(f64),
    Bool(bool),
    Array(Vec<AttributeValue>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpanEvent {
    pub name: String,
    pub timestamp: DateTime<Utc>,
    pub attributes: HashMap<String, AttributeValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpanLink {
    pub trace_id: String,
    pub span_id: String,
    pub attributes: HashMap<String, AttributeValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TraceStatus {
    Ok,
    Error { code: i32, message: String },
    Unset,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SpanStatus {
    Ok,
    Error { code: i32, message: String },
    Unset,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceQuery {
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub filter: Option<TraceFilter>,
    pub limit: Option<i32>,
    pub order_by: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceFilter {
    pub service_names: Option<Vec<String>>,
    pub operation_names: Option<Vec<String>>,
    pub tags: Option<HashMap<String, String>>,
    pub min_duration: Option<std::time::Duration>,
    pub max_duration: Option<std::time::Duration>,
    pub status: Option<TraceStatus>,
}

#[async_trait]
pub trait TracingManager: Send + Sync {
    async fn store_trace(&self, trace: Trace) -> ObservabilityResult<String>;
    async fn get_trace(&self, trace_id: &str) -> ObservabilityResult<Trace>;
    async fn search_traces(&self, query: TraceQuery) -> ObservabilityResult<Vec<Trace>>;
    async fn get_service_map(&self, window: std::time::Duration) -> ObservabilityResult<ServiceMap>;
    async fn get_dependencies(&self, service_name: &str) -> ObservabilityResult<Vec<ServiceDependency>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceMap {
    pub nodes: Vec<ServiceNode>,
    pub edges: Vec<ServiceEdge>,
    pub timestamp: DateTime<Utc>,
    pub window_seconds: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceNode {
    pub id: String,
    pub name: String,
    pub service_type: ServiceType,
    pub version: Option<String>,
    pub metadata: HashMap<String, String>,
    pub metrics: ServiceMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ServiceType {
    Application,
    Database,
    Cache,
    Queue,
    Gateway,
    LoadBalancer,
    External,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceMetrics {
    pub requests_per_second: f64,
    pub error_rate: f64,
    pub average_latency_ms: f64,
    pub success_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceEdge {
    pub source: String,
    pub target: String,
    pub protocol: String,
    pub metrics: EdgeMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeMetrics {
    pub requests_per_second: f64,
    pub error_rate: f64,
    pub average_latency_ms: f64,
    pub success_rate: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceDependency {
    pub service_name: String,
    pub dependent_name: String,
    pub dependency_type: DependencyType,
    pub criticality: DependencyCriticality,
    pub metrics: DependencyMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencyType {
    Synchronous,
    Asynchronous,
    Database,
    Cache,
    Queue,
    External,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencyCriticality {
    Critical,
    Important,
    NonCritical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyMetrics {
    pub calls_per_minute: f64,
    pub error_percentage: f64,
    pub average_response_time_ms: f64,
    pub timeout_percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingConfig {
    pub service_name: String,
    pub operation_name: Option<String>,
    pub sample_rate: f64,
    pub rules: Vec<SamplingRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamplingRule {
    pub name: String,
    pub priority: i32,
    pub sample_rate: f64,
    pub attributes: HashMap<String, String>,
    pub condition: SamplingCondition,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SamplingCondition {
    AttributeMatch { key: String, value: String },
    DurationGreaterThan { milliseconds: i64 },
    ErrorPresent,
    Custom { expression: String },
}

#[async_trait]
pub trait SamplingManager: Send + Sync {
    async fn set_sampling_config(&self, config: SamplingConfig) -> ObservabilityResult<()>;
    async fn get_sampling_config(&self, service_name: &str) -> ObservabilityResult<SamplingConfig>;
    async fn list_sampling_configs(&self) -> ObservabilityResult<Vec<SamplingConfig>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportConfig {
    pub id: String,
    pub name: String,
    pub exporter_type: ExporterType,
    pub settings: HashMap<String, String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExporterType {
    Jaeger { endpoint: String },
    Zipkin { endpoint: String },
    OpenTelemetry { endpoint: String, protocol: String },
    CloudWatch { region: String },
    DataDog { api_key: String },
    NewRelic { license_key: String },
}

#[async_trait]
pub trait ExportManager: Send + Sync {
    async fn create_exporter(&self, config: ExportConfig) -> ObservabilityResult<ExportConfig>;
    async fn update_exporter(&self, config: ExportConfig) -> ObservabilityResult<ExportConfig>;
    async fn delete_exporter(&self, id: &str) -> ObservabilityResult<()>;
    async fn get_exporter(&self, id: &str) -> ObservabilityResult<ExportConfig>;
    async fn list_exporters(&self) -> ObservabilityResult<Vec<ExportConfig>>;
    async fn test_exporter(&self, id: &str) -> ObservabilityResult<TestResult>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    pub success: bool,
    pub message: Option<String>,
    pub latency_ms: f64,
    pub timestamp: DateTime<Utc>,
}
