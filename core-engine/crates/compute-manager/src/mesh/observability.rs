use std::collections::HashMap;
use std::time::Duration;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::ComputeResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceMetrics {
    pub service_name: String,
    pub namespace: String,
    pub timestamp: DateTime<Utc>,
    pub request_count: i64,
    pub success_rate: f64,
    pub latency_p50: f64,
    pub latency_p90: f64,
    pub latency_p99: f64,
    pub bytes_sent: i64,
    pub bytes_received: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracingSpan {
    pub trace_id: String,
    pub span_id: String,
    pub parent_span_id: Option<String>,
    pub service_name: String,
    pub operation_name: String,
    pub start_time: DateTime<Utc>,
    pub duration: Duration,
    pub tags: HashMap<String, String>,
    pub logs: Vec<SpanLog>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpanLog {
    pub timestamp: DateTime<Utc>,
    pub fields: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    pub service_name: String,
    pub status: HealthState,
    pub last_check: DateTime<Utc>,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HealthState {
    Healthy,
    Unhealthy,
    Degraded,
}

pub trait MetricsCollector {
    fn collect_service_metrics(&self, service: &str, window: Duration) -> ComputeResult<ServiceMetrics>;
    fn get_service_history(&self, service: &str, start: DateTime<Utc>, end: DateTime<Utc>) -> ComputeResult<Vec<ServiceMetrics>>;
    fn get_aggregated_metrics(&self, namespace: &str) -> ComputeResult<HashMap<String, ServiceMetrics>>;
}

pub trait TracingCollector {
    fn collect_traces(&self, service: &str, window: Duration) -> ComputeResult<Vec<TracingSpan>>;
    fn get_trace(&self, trace_id: &str) -> ComputeResult<Vec<TracingSpan>>;
    fn search_traces(&self, query: &str) -> ComputeResult<Vec<TracingSpan>>;
}

pub trait HealthChecker {
    fn check_health(&self, service: &str) -> ComputeResult<HealthStatus>;
    fn get_namespace_health(&self, namespace: &str) -> ComputeResult<Vec<HealthStatus>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertConfig {
    pub name: String,
    pub service: String,
    pub condition: AlertCondition,
    pub threshold: f64,
    pub window: Duration,
    pub channels: Vec<AlertChannel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertCondition {
    HighLatency,
    LowSuccessRate,
    HighErrorRate,
    ResourceUtilization,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertChannel {
    Email(String),
    Slack(String),
    Webhook(String),
}

pub trait AlertManager {
    fn configure_alert(&self, config: AlertConfig) -> ComputeResult<()>;
    fn get_alert_config(&self, name: &str) -> ComputeResult<AlertConfig>;
    fn list_alerts(&self) -> ComputeResult<Vec<AlertConfig>>;
    fn delete_alert(&self, name: &str) -> ComputeResult<()>;
}

// Integration with mesh providers
impl crate::mesh::istio::IstioProvider {
    pub fn configure_metrics(&self) -> ComputeResult<()> {
        // Configure Prometheus scraping
        let config = r#"
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-mesh
  namespace: monitoring
spec:
  selector:
    matchLabels:
      istio: mixer
  namespaceSelector:
    matchNames:
      - istio-system
  endpoints:
  - port: prometheus
"#;
        
        let output = std::process::Command::new("kubectl")
            .args(&["apply", "-f", "-"])
            .stdin(std::process::Stdio::piped())
            .output()
            .map_err(|e| crate::error::ComputeError::Provider(format!("Failed to configure metrics: {}", e)))?;

        if !output.status.success() {
            return Err(crate::error::ComputeError::Provider(format!(
                "Failed to configure metrics: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        Ok(())
    }

    pub fn configure_tracing(&self) -> ComputeResult<()> {
        // Configure Jaeger
        let config = r#"
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: istio-tracing
  namespace: istio-system
spec:
  strategy: production
  storage:
    type: elasticsearch
    options:
      es:
        server-urls: http://elasticsearch:9200
"#;
        
        let output = std::process::Command::new("kubectl")
            .args(&["apply", "-f", "-"])
            .stdin(std::process::Stdio::piped())
            .output()
            .map_err(|e| crate::error::ComputeError::Provider(format!("Failed to configure tracing: {}", e)))?;

        if !output.status.success() {
            return Err(crate::error::ComputeError::Provider(format!(
                "Failed to configure tracing: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        Ok(())
    }
}

impl crate::mesh::linkerd::LinkerdProvider {
    pub fn configure_metrics(&self) -> ComputeResult<()> {
        // Configure Prometheus scraping
        let config = r#"
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: linkerd-mesh
  namespace: monitoring
spec:
  selector:
    matchLabels:
      linkerd.io/control-plane-component: controller
  namespaceSelector:
    matchNames:
      - linkerd
  endpoints:
  - port: admin-http
"#;
        
        let output = std::process::Command::new("kubectl")
            .args(&["apply", "-f", "-"])
            .stdin(std::process::Stdio::piped())
            .output()
            .map_err(|e| crate::error::ComputeError::Provider(format!("Failed to configure metrics: {}", e)))?;

        if !output.status.success() {
            return Err(crate::error::ComputeError::Provider(format!(
                "Failed to configure metrics: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        Ok(())
    }

    pub fn configure_tracing(&self) -> ComputeResult<()> {
        // Configure OpenCensus
        let config = r#"
apiVersion: v1
kind: ConfigMap
metadata:
  name: linkerd-config-tracing
  namespace: linkerd
data:
  config.yaml: |
    receivers:
      opencensus:
        endpoint: 0.0.0.0:55678
    exporters:
      jaeger:
        endpoint: jaeger-collector.observability:14250
        insecure: true
    service:
      pipelines:
        traces:
          receivers: [opencensus]
          exporters: [jaeger]
"#;
        
        let output = std::process::Command::new("kubectl")
            .args(&["apply", "-f", "-"])
            .stdin(std::process::Stdio::piped())
            .output()
            .map_err(|e| crate::error::ComputeError::Provider(format!("Failed to configure tracing: {}", e)))?;

        if !output.status.success() {
            return Err(crate::error::ComputeError::Provider(format!(
                "Failed to configure tracing: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        Ok(())
    }
}
