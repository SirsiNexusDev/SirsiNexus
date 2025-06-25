use std::collections::HashMap;
use std::time::Duration;
use serde::{Deserialize, Serialize};

use crate::error::ComputeResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficPolicy {
    pub name: String,
    pub namespace: String,
    pub labels: HashMap<String, String>,
    pub annotations: HashMap<String, String>,
    pub rules: Vec<TrafficRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficRule {
    pub match_labels: HashMap<String, String>,
    pub timeout: Duration,
    pub retry_attempts: i32,
    pub retry_timeout: Duration,
    pub circuit_breaker: Option<CircuitBreaker>,
    pub rate_limit: Option<RateLimit>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreaker {
    pub max_connections: i32,
    pub max_pending_requests: i32,
    pub max_requests: i32,
    pub max_retries: i32,
    pub consecutive_errors: i32,
    pub interval: Duration,
    pub base_ejection_time: Duration,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimit {
    pub requests_per_unit: i32,
    pub unit: TimeUnit,
    pub burst_multiplier: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TimeUnit {
    Second,
    Minute,
    Hour,
}

pub trait TrafficManager {
    fn apply_traffic_policy(&self, policy: TrafficPolicy) -> ComputeResult<()>;
    fn get_traffic_policy(&self, name: &str, namespace: &str) -> ComputeResult<TrafficPolicy>;
    fn list_traffic_policies(&self, namespace: &str) -> ComputeResult<Vec<TrafficPolicy>>;
    fn delete_traffic_policy(&self, name: &str, namespace: &str) -> ComputeResult<()>;
}

pub trait CircuitBreakerManager {
    fn configure_circuit_breaker(&self, config: CircuitBreaker) -> ComputeResult<()>;
    fn get_circuit_breaker(&self, name: &str) -> ComputeResult<CircuitBreaker>;
    fn reset_circuit_breaker(&self, name: &str) -> ComputeResult<()>;
}

pub trait RateLimitManager {
    fn configure_rate_limit(&self, config: RateLimit) -> ComputeResult<()>;
    fn get_rate_limit(&self, name: &str) -> ComputeResult<RateLimit>;
    fn delete_rate_limit(&self, name: &str) -> ComputeResult<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrafficMetrics {
    pub requests_total: i64,
    pub requests_in_flight: i64,
    pub request_duration_ms: HashMap<String, f64>,
    pub error_rate: f64,
    pub circuit_breaker_trips: i64,
    pub rate_limit_hits: i64,
}

pub trait TrafficMonitor {
    fn get_traffic_metrics(&self, service: &str, window: Duration) -> ComputeResult<TrafficMetrics>;
    fn get_circuit_breaker_stats(&self, name: &str) -> ComputeResult<CircuitBreakerStats>;
    fn get_rate_limit_stats(&self, name: &str) -> ComputeResult<RateLimitStats>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitBreakerStats {
    pub state: CircuitBreakerState,
    pub consecutive_errors: i32,
    pub last_error_time: Option<chrono::DateTime<chrono::Utc>>,
    pub ejection_percent: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CircuitBreakerState {
    Closed,
    HalfOpen,
    Open,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitStats {
    pub current_rate: f64,
    pub burst_capacity: i32,
    pub rejected_requests: i64,
}
