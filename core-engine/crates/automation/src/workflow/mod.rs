use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::AutomationResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub tasks: Vec<Task>,
    pub triggers: Vec<Trigger>,
    pub status: WorkflowStatus,
    pub schedule: Option<Schedule>,
    pub variables: HashMap<String, Variable>,
    pub timeout: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub name: String,
    pub task_type: TaskType,
    pub config: TaskConfig,
    pub dependencies: Vec<TaskDependency>,
    pub retry_policy: Option<RetryPolicy>,
    pub timeout: Option<i32>,
    pub on_failure: Option<FailureAction>,
    pub conditions: Vec<Condition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskType {
    Script { runtime: String },
    Container { image: String },
    Function { name: String, runtime: String },
    HTTP { method: String, url: String },
    AWS { service: String, action: String },
    GCP { service: String, action: String },
    Azure { service: String, action: String },
    Kubernetes { resource: String, action: String },
    Database { operation: String },
    Queue { action: String },
    Notification { channel: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskConfig {
    pub inputs: HashMap<String, Value>,
    pub environment: HashMap<String, String>,
    pub resources: ResourceRequirements,
    pub secrets: Vec<String>,
    pub artifacts: Vec<Artifact>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Value {
    String(String),
    Integer(i64),
    Float(f64),
    Boolean(bool),
    Array(Vec<Value>),
    Object(HashMap<String, Value>),
    Reference(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceRequirements {
    pub cpu: String,
    pub memory: String,
    pub storage: Option<String>,
    pub gpu: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub name: String,
    pub path: String,
    pub type_: ArtifactType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ArtifactType {
    Input,
    Output,
    Cache,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskDependency {
    pub task_id: String,
    pub type_: DependencyType,
    pub condition: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencyType {
    Success,
    Failure,
    Completed,
    Data { key: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: i32,
    pub initial_delay_seconds: i32,
    pub max_delay_seconds: i32,
    pub multiplier: f64,
    pub conditions: Vec<RetryCondition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RetryCondition {
    Error { type_: String },
    Status { code: i32 },
    Custom { expression: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FailureAction {
    Continue,
    Abort,
    Retry { policy: RetryPolicy },
    Callback { url: String },
    Notification { channel: String, message: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub type_: ConditionType,
    pub expression: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionType {
    CEL,
    JSONPath,
    RegEx,
    Custom { evaluator: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trigger {
    pub id: String,
    pub type_: TriggerType,
    pub config: TriggerConfig,
    pub filters: Vec<EventFilter>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TriggerType {
    Schedule,
    Event,
    Webhook,
    Timer,
    Cron,
    Queue,
    Stream,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TriggerConfig {
    pub source: String,
    pub settings: HashMap<String, String>,
    pub auth: Option<AuthConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthConfig {
    pub type_: AuthType,
    pub credentials: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthType {
    Basic,
    Bearer,
    OAuth2,
    APIKey,
    AWS,
    GCP,
    Azure,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventFilter {
    pub field: String,
    pub operator: FilterOperator,
    pub value: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FilterOperator {
    Equals,
    NotEquals,
    Contains,
    StartsWith,
    EndsWith,
    Exists,
    GreaterThan,
    LessThan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Schedule {
    pub cron: String,
    pub timezone: String,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Variable {
    pub type_: VariableType,
    pub value: Option<Value>,
    pub default: Option<Value>,
    pub description: Option<String>,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VariableType {
    String,
    Integer,
    Float,
    Boolean,
    Array,
    Object,
    Secret,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkflowStatus {
    Draft,
    Active,
    Suspended,
    Deprecated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowRun {
    pub id: String,
    pub workflow_id: String,
    pub version: String,
    pub status: RunStatus,
    pub trigger: RunTrigger,
    pub task_runs: Vec<TaskRun>,
    pub variables: HashMap<String, Value>,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub metrics: RunMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RunStatus {
    Pending,
    Running,
    Succeeded,
    Failed,
    Cancelled,
    TimedOut,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunTrigger {
    pub type_: TriggerType,
    pub source: String,
    pub event: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskRun {
    pub id: String,
    pub task_id: String,
    pub status: RunStatus,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub inputs: HashMap<String, Value>,
    pub outputs: HashMap<String, Value>,
    pub error: Option<TaskError>,
    pub logs_uri: Option<String>,
    pub metrics: TaskMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskError {
    pub code: String,
    pub message: String,
    pub details: Option<Value>,
    pub retry_count: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunMetrics {
    pub total_duration_seconds: i64,
    pub task_count: i32,
    pub failed_tasks: i32,
    pub retried_tasks: i32,
    pub resource_usage: ResourceUsage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskMetrics {
    pub duration_seconds: i64,
    pub retry_count: i32,
    pub resource_usage: ResourceUsage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub cpu_seconds: f64,
    pub memory_mb_seconds: f64,
    pub io_bytes: u64,
}

#[async_trait]
pub trait WorkflowManager: Send + Sync {
    async fn create_workflow(&self, workflow: Workflow) -> AutomationResult<Workflow>;
    async fn update_workflow(&self, workflow: Workflow) -> AutomationResult<Workflow>;
    async fn delete_workflow(&self, id: &str) -> AutomationResult<()>;
    async fn get_workflow(&self, id: &str) -> AutomationResult<Workflow>;
    async fn list_workflows(&self) -> AutomationResult<Vec<Workflow>>;
    async fn start_workflow(&self, id: &str, inputs: HashMap<String, Value>) -> AutomationResult<WorkflowRun>;
    async fn stop_workflow(&self, run_id: &str) -> AutomationResult<()>;
    async fn get_workflow_run(&self, run_id: &str) -> AutomationResult<WorkflowRun>;
    async fn list_workflow_runs(&self, workflow_id: &str) -> AutomationResult<Vec<WorkflowRun>>;
}

#[async_trait]
pub trait TaskExecutor: Send + Sync {
    async fn execute_task(&self, task: Task, context: ExecutionContext) -> AutomationResult<TaskResult>;
    async fn validate_task(&self, task: &Task) -> AutomationResult<()>;
    async fn abort_task(&self, task_run_id: &str) -> AutomationResult<()>;
}

#[derive(Debug, Clone)]
pub struct ExecutionContext {
    pub workflow_run_id: String,
    pub task_run_id: String,
    pub variables: HashMap<String, Value>,
    pub previous_results: HashMap<String, TaskResult>,
}

#[derive(Debug, Clone)]
pub struct TaskResult {
    pub status: RunStatus,
    pub outputs: HashMap<String, Value>,
    pub error: Option<TaskError>,
    pub metrics: TaskMetrics,
}

#[async_trait]
pub trait TriggerManager: Send + Sync {
    async fn register_trigger(&self, trigger: Trigger) -> AutomationResult<()>;
    async fn deregister_trigger(&self, id: &str) -> AutomationResult<()>;
    async fn get_trigger(&self, id: &str) -> AutomationResult<Trigger>;
    async fn list_triggers(&self) -> AutomationResult<Vec<Trigger>>;
    async fn test_trigger(&self, trigger: &Trigger) -> AutomationResult<TestResult>;
}

#[derive(Debug, Clone)]
pub struct TestResult {
    pub success: bool,
    pub message: Option<String>,
    pub sample_event: Option<Value>,
}
