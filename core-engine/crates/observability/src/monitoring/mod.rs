use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::ObservabilityResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricDefinition {
    pub name: String,
    pub namespace: String,
    pub metric_type: MetricType,
    pub unit: MetricUnit,
    pub dimensions: Vec<String>,
    pub aggregations: Vec<AggregationType>,
    pub retention_days: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricType {
    Counter,
    Gauge,
    Histogram,
    Summary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricUnit {
    Seconds,
    Microseconds,
    Milliseconds,
    Bytes,
    Kilobytes,
    Megabytes,
    Gigabytes,
    Terabytes,
    Bits,
    Kilobits,
    Megabits,
    Gigabits,
    Percent,
    Count,
    BytesPerSecond,
    KilobytesPerSecond,
    MegabytesPerSecond,
    GigabytesPerSecond,
    TerabytesPerSecond,
    BitsPerSecond,
    KilobitsPerSecond,
    MegabitsPerSecond,
    GigabitsPerSecond,
    CountPerSecond,
    None,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AggregationType {
    Average,
    Sum,
    Minimum,
    Maximum,
    Count,
    Percentile(f64),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricDataPoint {
    pub name: String,
    pub namespace: String,
    pub dimensions: HashMap<String, String>,
    pub timestamp: DateTime<Utc>,
    pub value: MetricValue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricValue {
    Single(f64),
    Multiple(Vec<f64>),
    Distribution { sum: f64, count: u64, min: f64, max: f64 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricQuery {
    pub metric_name: String,
    pub namespace: String,
    pub dimensions: Option<HashMap<String, String>>,
    pub aggregation: AggregationType,
    pub period: i32,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
}

#[async_trait]
pub trait MetricsManager: Send + Sync {
    async fn register_metric(&self, definition: MetricDefinition) -> ObservabilityResult<()>;
    async fn put_metric_data(&self, data_points: Vec<MetricDataPoint>) -> ObservabilityResult<()>;
    async fn get_metric_data(&self, query: MetricQuery) -> ObservabilityResult<Vec<MetricDataPoint>>;
    async fn list_metrics(&self, namespace: Option<String>) -> ObservabilityResult<Vec<MetricDefinition>>;
    async fn delete_metric(&self, name: &str, namespace: &str) -> ObservabilityResult<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub widgets: Vec<DashboardWidget>,
    pub variables: Vec<DashboardVariable>,
    pub refresh_interval: i32,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardWidget {
    pub id: String,
    pub title: String,
    pub widget_type: WidgetType,
    pub metrics: Vec<MetricQuery>,
    pub position: WidgetPosition,
    pub properties: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WidgetType {
    LineGraph,
    AreaGraph,
    BarGraph,
    PieChart,
    SingleValue,
    Table,
    Gauge,
    HeatMap,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetPosition {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardVariable {
    pub name: String,
    pub label: String,
    pub type_: VariableType,
    pub default_value: Option<String>,
    pub multi_value: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableType {
    Static { values: Vec<String> },
    Query { query: String },
    Interval { intervals: Vec<String> },
    DataSource { type_: String },
}

#[async_trait]
pub trait DashboardManager: Send + Sync {
    async fn create_dashboard(&self, dashboard: DashboardDefinition) -> ObservabilityResult<DashboardDefinition>;
    async fn update_dashboard(&self, dashboard: DashboardDefinition) -> ObservabilityResult<DashboardDefinition>;
    async fn delete_dashboard(&self, id: &str) -> ObservabilityResult<()>;
    async fn get_dashboard(&self, id: &str) -> ObservabilityResult<DashboardDefinition>;
    async fn list_dashboards(&self) -> ObservabilityResult<Vec<DashboardDefinition>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub severity: AlertSeverity,
    pub query: MetricQuery,
    pub condition: AlertCondition,
    pub notification_channels: Vec<NotificationChannel>,
    pub evaluation_interval: i32,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Critical,
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertCondition {
    Threshold {
        operator: ComparisonOperator,
        threshold: f64,
        duration_seconds: i32,
    },
    Anomaly {
        deviation_type: DeviationType,
        sensitivity: f64,
        duration_seconds: i32,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComparisonOperator {
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Equal,
    NotEqual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeviationType {
    StandardDeviation,
    PercentageChange,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationChannel {
    pub id: String,
    pub name: String,
    pub channel_type: NotificationType,
    pub settings: HashMap<String, String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NotificationType {
    Email,
    Slack,
    Webhook,
    PagerDuty,
    OpsGenie,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertEvent {
    pub id: String,
    pub rule_id: String,
    pub severity: AlertSeverity,
    pub state: AlertState,
    pub message: String,
    pub value: f64,
    pub timestamp: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertState {
    Firing,
    Resolved,
    Suppressed,
}

#[async_trait]
pub trait AlertManager: Send + Sync {
    async fn create_alert_rule(&self, rule: AlertRule) -> ObservabilityResult<AlertRule>;
    async fn update_alert_rule(&self, rule: AlertRule) -> ObservabilityResult<AlertRule>;
    async fn delete_alert_rule(&self, id: &str) -> ObservabilityResult<()>;
    async fn get_alert_rule(&self, id: &str) -> ObservabilityResult<AlertRule>;
    async fn list_alert_rules(&self) -> ObservabilityResult<Vec<AlertRule>>;
    async fn get_alert_events(&self, rule_id: Option<String>) -> ObservabilityResult<Vec<AlertEvent>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub id: String,
    pub name: String,
    pub check_type: HealthCheckType,
    pub endpoint: String,
    pub interval_seconds: i32,
    pub timeout_seconds: i32,
    pub success_threshold: i32,
    pub failure_threshold: i32,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealthCheckType {
    HTTP { method: String, headers: HashMap<String, String>, body: Option<String> },
    HTTPS { method: String, headers: HashMap<String, String>, body: Option<String> },
    TCP,
    UDP,
    DNS { record_type: String, expected_response: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheckResult {
    pub check_id: String,
    pub timestamp: DateTime<Utc>,
    pub success: bool,
    pub latency_ms: f64,
    pub error: Option<String>,
    pub details: HashMap<String, String>,
}

#[async_trait]
pub trait HealthCheckManager: Send + Sync {
    async fn create_health_check(&self, check: HealthCheck) -> ObservabilityResult<HealthCheck>;
    async fn update_health_check(&self, check: HealthCheck) -> ObservabilityResult<HealthCheck>;
    async fn delete_health_check(&self, id: &str) -> ObservabilityResult<()>;
    async fn get_health_check(&self, id: &str) -> ObservabilityResult<HealthCheck>;
    async fn list_health_checks(&self) -> ObservabilityResult<Vec<HealthCheck>>;
    async fn get_health_check_results(&self, check_id: &str) -> ObservabilityResult<Vec<HealthCheckResult>>;
}
