use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::MLResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub id: String,
    pub name: String,
    pub description: String,
    pub model_type: ModelType,
    pub framework: ModelFramework,
    pub version: String,
    pub status: ModelStatus,
    pub metrics: HashMap<String, f64>,
    pub artifacts: Vec<ModelArtifact>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelType {
    Classification,
    Regression,
    Clustering,
    NeuralNetwork,
    TimeSeries,
    Recommender,
    NLP,
    ComputerVision,
    Reinforcement,
    AutoML,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelFramework {
    PyTorch,
    TensorFlow,
    ScikitLearn,
    XGBoost,
    LightGBM,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelStatus {
    Training,
    Validating,
    Ready,
    Failed,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelArtifact {
    pub id: String,
    pub artifact_type: ArtifactType,
    pub uri: String,
    pub size_bytes: u64,
    pub checksum: String,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ArtifactType {
    Model,
    Weights,
    Config,
    Metrics,
    Dataset,
    Checkpoint,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingJob {
    pub id: String,
    pub model_id: String,
    pub config: TrainingConfig,
    pub dataset: DatasetConfig,
    pub hyperparameters: HashMap<String, String>,
    pub resources: ResourceRequirements,
    pub metrics: Option<TrainingMetrics>,
    pub status: JobStatus,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub logs_uri: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingConfig {
    pub algorithm: String,
    pub objective: String,
    pub max_iterations: i32,
    pub early_stopping: bool,
    pub validation_split: f64,
    pub batch_size: i32,
    pub learning_rate: f64,
    pub optimizer: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatasetConfig {
    pub training_data: DataSource,
    pub validation_data: Option<DataSource>,
    pub test_data: Option<DataSource>,
    pub features: Vec<FeatureDefinition>,
    pub target: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    pub uri: String,
    pub format: DataFormat,
    pub schema: Option<String>,
    pub credentials: Option<DataCredentials>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataFormat {
    CSV,
    Parquet,
    JSON,
    Image,
    Audio,
    Video,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataCredentials {
    pub credential_type: CredentialType,
    pub details: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CredentialType {
    AWS,
    GCP,
    Azure,
    Basic,
    OAuth,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureDefinition {
    pub name: String,
    pub feature_type: FeatureType,
    pub required: bool,
    pub transformations: Vec<Transformation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeatureType {
    Numeric,
    Categorical,
    Text,
    Image,
    Audio,
    Video,
    Timestamp,
    Geolocation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Transformation {
    Normalize,
    StandardScale,
    OneHotEncode,
    Tokenize,
    ImageResize { width: i32, height: i32 },
    Custom { name: String, params: HashMap<String, String> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceRequirements {
    pub cpu_cores: i32,
    pub memory_gb: i32,
    pub gpu_units: i32,
    pub storage_gb: i32,
    pub max_time_minutes: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingMetrics {
    pub loss: f64,
    pub accuracy: f64,
    pub precision: f64,
    pub recall: f64,
    pub f1_score: f64,
    pub custom_metrics: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JobStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Deployment {
    pub id: String,
    pub model_id: String,
    pub name: String,
    pub version: String,
    pub endpoint: String,
    pub config: DeploymentConfig,
    pub status: DeploymentStatus,
    pub metrics: Option<DeploymentMetrics>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentConfig {
    pub instance_type: String,
    pub instance_count: i32,
    pub autoscaling: Option<AutoscalingConfig>,
    pub environment: HashMap<String, String>,
    pub monitoring: MonitoringConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoscalingConfig {
    pub min_instances: i32,
    pub max_instances: i32,
    pub target_concurrency: i32,
    pub scale_in_cooldown: i32,
    pub scale_out_cooldown: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub enable_prediction_logging: bool,
    pub sample_rate: f64,
    pub alert_rules: Vec<AlertRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertRule {
    pub metric: String,
    pub operator: AlertOperator,
    pub threshold: f64,
    pub window_minutes: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertOperator {
    GreaterThan,
    LessThan,
    Equal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DeploymentStatus {
    Deploying,
    Running,
    Failed,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentMetrics {
    pub requests_per_second: f64,
    pub latency_ms: f64,
    pub error_rate: f64,
    pub prediction_drift: f64,
    pub gpu_utilization: f64,
    pub memory_utilization: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionRequest {
    pub id: String,
    pub model_id: String,
    pub deployment_id: String,
    pub inputs: HashMap<String, Value>,
    pub options: PredictionOptions,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Value {
    String(String),
    Integer(i64),
    Float(f64),
    Boolean(bool),
    Array(Vec<Value>),
    Object(HashMap<String, Value>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionOptions {
    pub return_probability: bool,
    pub return_features: bool,
    pub batch_size: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PredictionResponse {
    pub request_id: String,
    pub predictions: Vec<Prediction>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Prediction {
    pub value: Value,
    pub probability: Option<f64>,
    pub features: Option<HashMap<String, f64>>,
}

#[async_trait]
pub trait ModelManager: Send + Sync {
    async fn create_model(&self, model: Model) -> MLResult<Model>;
    async fn update_model(&self, model: Model) -> MLResult<Model>;
    async fn delete_model(&self, id: &str) -> MLResult<()>;
    async fn get_model(&self, id: &str) -> MLResult<Model>;
    async fn list_models(&self) -> MLResult<Vec<Model>>;
    async fn start_training(&self, job: TrainingJob) -> MLResult<TrainingJob>;
    async fn stop_training(&self, job_id: &str) -> MLResult<()>;
    async fn get_training_status(&self, job_id: &str) -> MLResult<TrainingJob>;
}

#[async_trait]
pub trait DeploymentManager: Send + Sync {
    async fn deploy_model(&self, deployment: Deployment) -> MLResult<Deployment>;
    async fn update_deployment(&self, deployment: Deployment) -> MLResult<Deployment>;
    async fn delete_deployment(&self, id: &str) -> MLResult<()>;
    async fn get_deployment(&self, id: &str) -> MLResult<Deployment>;
    async fn list_deployments(&self) -> MLResult<Vec<Deployment>>;
    async fn predict(&self, request: PredictionRequest) -> MLResult<PredictionResponse>;
}

#[async_trait]
pub trait AutoMLManager: Send + Sync {
    async fn create_automl_job(&self, config: AutoMLConfig) -> MLResult<AutoMLJob>;
    async fn get_automl_job(&self, job_id: &str) -> MLResult<AutoMLJob>;
    async fn list_automl_jobs(&self) -> MLResult<Vec<AutoMLJob>>;
    async fn stop_automl_job(&self, job_id: &str) -> MLResult<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoMLConfig {
    pub problem_type: ModelType,
    pub dataset: DatasetConfig,
    pub optimization_metric: String,
    pub max_models: i32,
    pub max_time_hours: i32,
    pub frameworks: Vec<ModelFramework>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoMLJob {
    pub id: String,
    pub config: AutoMLConfig,
    pub status: JobStatus,
    pub best_model: Option<Model>,
    pub all_models: Vec<Model>,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
}

#[async_trait]
pub trait FeatureStore: Send + Sync {
    async fn create_feature_group(&self, group: FeatureGroup) -> MLResult<FeatureGroup>;
    async fn update_feature_group(&self, group: FeatureGroup) -> MLResult<FeatureGroup>;
    async fn delete_feature_group(&self, name: &str) -> MLResult<()>;
    async fn get_feature_group(&self, name: &str) -> MLResult<FeatureGroup>;
    async fn list_feature_groups(&self) -> MLResult<Vec<FeatureGroup>>;
    async fn ingest_features(&self, group_name: &str, features: Vec<Feature>) -> MLResult<()>;
    async fn get_features(&self, group_name: &str, entity_ids: Vec<String>) -> MLResult<Vec<Feature>>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureGroup {
    pub name: String,
    pub description: String,
    pub features: Vec<FeatureDefinition>,
    pub primary_key: String,
    pub frequency: Option<String>,
    pub tags: HashMap<String, String>,
    pub online_enabled: bool,
    pub offline_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Feature {
    pub entity_id: String,
    pub values: HashMap<String, Value>,
    pub timestamp: DateTime<Utc>,
}
