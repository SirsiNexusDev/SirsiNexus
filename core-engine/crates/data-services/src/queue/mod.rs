use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::DataResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Queue {
    pub id: String,
    pub name: String,
    pub engine: QueueEngine,
    pub config: QueueConfig,
    pub status: QueueStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub tags: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QueueEngine {
    RabbitMQ,
    Kafka,
    ActiveMQ,
    AmazonMQ,
    GooglePubSub,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueConfig {
    pub max_size_gb: i32,
    pub message_retention_days: i32,
    pub durability: DurabilityLevel,
    pub delivery_mode: DeliveryMode,
    pub max_message_size_kb: i32,
    pub supports_partitioning: bool,
    pub partition_count: Option<i32>,
    pub replication_factor: i32,
    pub dead_letter_queue: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DurabilityLevel {
    Memory,
    Disk,
    Replicated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeliveryMode {
    AtMostOnce,
    AtLeastOnce,
    ExactlyOnce,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum QueueStatus {
    Creating,
    Active,
    Modifying,
    Deleting,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub queue_id: String,
    pub data: Vec<u8>,
    pub attributes: HashMap<String, String>,
    pub publish_time: DateTime<Utc>,
    pub delivery_count: i32,
    pub scheduled_for: Option<DateTime<Utc>>,
    pub correlation_id: Option<String>,
    pub reply_to: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueueMetrics {
    pub queue_id: String,
    pub timestamp: DateTime<Utc>,
    pub messages_available: i64,
    pub messages_in_flight: i64,
    pub messages_delayed: i64,
    pub oldest_message_age_seconds: i64,
    pub size_bytes: i64,
    pub throughput_per_second: f64,
}

#[async_trait]
pub trait QueueManager: Send + Sync {
    async fn create_queue(&self, queue: Queue) -> DataResult<Queue>;
    async fn modify_queue(&self, queue: Queue) -> DataResult<Queue>;
    async fn delete_queue(&self, id: &str) -> DataResult<()>;
    async fn get_queue(&self, id: &str) -> DataResult<Queue>;
    async fn list_queues(&self) -> DataResult<Vec<Queue>>;
    async fn purge_queue(&self, id: &str) -> DataResult<()>;
    async fn get_metrics(&self, id: &str, window: chrono::Duration) -> DataResult<Vec<QueueMetrics>>;
}

#[async_trait]
pub trait MessageOperations: Send + Sync {
    async fn send_message(&self, queue_id: &str, message: Message) -> DataResult<String>;
    async fn send_batch(&self, queue_id: &str, messages: Vec<Message>) -> DataResult<Vec<String>>;
    async fn receive_messages(&self, queue_id: &str, max_messages: i32, wait_time_seconds: i32) -> DataResult<Vec<Message>>;
    async fn delete_message(&self, queue_id: &str, message_id: &str) -> DataResult<()>;
    async fn peek_messages(&self, queue_id: &str, count: i32) -> DataResult<Vec<Message>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subscription {
    pub id: String,
    pub queue_id: String,
    pub name: String,
    pub filter_expression: Option<String>,
    pub endpoint: SubscriptionEndpoint,
    pub retry_policy: RetryPolicy,
    pub dead_letter_queue: Option<String>,
    pub status: SubscriptionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SubscriptionEndpoint {
    HTTP { url: String, headers: HashMap<String, String> },
    AMQP { connection_string: String, exchange: String },
    AWS { sqs_url: String, role_arn: String },
    GCP { topic: String, project: String },
    Azure { service_bus: String, topic: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_retries: i32,
    pub initial_retry_delay_seconds: i32,
    pub max_retry_delay_seconds: i32,
    pub retry_multiplier: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SubscriptionStatus {
    Active,
    Suspended,
    Failed,
}

#[async_trait]
pub trait SubscriptionManager: Send + Sync {
    async fn create_subscription(&self, sub: Subscription) -> DataResult<Subscription>;
    async fn modify_subscription(&self, sub: Subscription) -> DataResult<Subscription>;
    async fn delete_subscription(&self, id: &str) -> DataResult<()>;
    async fn get_subscription(&self, id: &str) -> DataResult<Subscription>;
    async fn list_subscriptions(&self, queue_id: &str) -> DataResult<Vec<Subscription>>;
    async fn suspend_subscription(&self, id: &str) -> DataResult<()>;
    async fn resume_subscription(&self, id: &str) -> DataResult<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryStatus {
    pub message_id: String,
    pub subscription_id: String,
    pub attempt: i32,
    pub status: DeliveryResult,
    pub timestamp: DateTime<Utc>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeliveryResult {
    Success,
    TemporaryFailure,
    PermanentFailure,
}

#[async_trait]
pub trait DeliveryTracking: Send + Sync {
    async fn record_delivery(&self, status: DeliveryStatus) -> DataResult<()>;
    async fn get_delivery_history(&self, message_id: &str) -> DataResult<Vec<DeliveryStatus>>;
    async fn get_failed_deliveries(&self, subscription_id: &str) -> DataResult<Vec<DeliveryStatus>>;
}
