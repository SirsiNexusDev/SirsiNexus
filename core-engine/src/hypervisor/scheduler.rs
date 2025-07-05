//! # Task Scheduler
//!
//! Advanced task scheduling and workflow orchestration for agent coordination,
//! supporting dependency resolution, priority-based execution, and resource allocation.

use crate::{
    communication::{AgentEvent, AgentEventType, AgentMessage, MessageType, MessagePayload, TaskPayload},
    error::{AppError, AppResult},
    telemetry::metrics::MetricsCollector,
};
use std::collections::{HashMap, BTreeMap, VecDeque};
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use tracing::{debug, error, info, warn};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

/// Task execution status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskStatus {
    Pending,
    Ready,
    Running,
    Completed,
    Failed,
    Cancelled,
    Timeout,
}

/// Task priority levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum TaskPriority {
    Low = 1,
    Normal = 5,
    High = 8,
    Critical = 10,
}

impl From<u8> for TaskPriority {
    fn from(value: u8) -> Self {
        match value {
            1..=3 => TaskPriority::Low,
            4..=6 => TaskPriority::Normal,
            7..=9 => TaskPriority::High,
            10 => TaskPriority::Critical,
            _ => TaskPriority::Normal,
        }
    }
}

/// Scheduled task definition
#[derive(Debug, Clone)]
pub struct ScheduledTask {
    /// Unique task identifier
    pub task_id: String,
    
    /// Session identifier
    pub session_id: String,
    
    /// Task type/name
    pub task_type: String,
    
    /// Target agent for execution
    pub target_agent_id: String,
    
    /// Task configuration
    pub config: HashMap<String, String>,
    
    /// Task payload data
    pub payload: serde_json::Value,
    
    /// Task priority
    pub priority: TaskPriority,
    
    /// Task dependencies (must complete before this task)
    pub dependencies: Vec<String>,
    
    /// Task timeout in seconds
    pub timeout_seconds: u64,
    
    /// Maximum retry attempts
    pub max_retries: u32,
    
    /// Current retry count
    pub retry_count: u32,
    
    /// Task status
    pub status: TaskStatus,
    
    /// Task creation time
    pub created_at: Instant,
    
    /// Task start time (when execution began)
    pub started_at: Option<Instant>,
    
    /// Task completion time
    pub completed_at: Option<Instant>,
    
    /// Task result (if completed)
    pub result: Option<serde_json::Value>,
    
    /// Error information (if failed)
    pub error: Option<String>,
    
    /// Task metadata
    pub metadata: HashMap<String, String>,
}

impl ScheduledTask {
    /// Create a new scheduled task
    pub fn new(
        session_id: String,
        task_type: String,
        target_agent_id: String,
        payload: serde_json::Value,
        priority: TaskPriority,
    ) -> Self {
        Self {
            task_id: Uuid::new_v4().to_string(),
            session_id,
            task_type,
            target_agent_id,
            config: HashMap::new(),
            payload,
            priority,
            dependencies: Vec::new(),
            timeout_seconds: 300, // Default 5 minutes
            max_retries: 3,
            retry_count: 0,
            status: TaskStatus::Pending,
            created_at: Instant::now(),
            started_at: None,
            completed_at: None,
            result: None,
            error: None,
            metadata: HashMap::new(),
        }
    }
    
    /// Check if task dependencies are satisfied
    pub fn dependencies_satisfied(&self, completed_tasks: &HashMap<String, ScheduledTask>) -> bool {
        self.dependencies.iter().all(|dep_id| {
            completed_tasks.get(dep_id)
                .map(|task| task.status == TaskStatus::Completed)
                .unwrap_or(false)
        })
    }
    
    /// Check if task has timed out
    pub fn is_timed_out(&self) -> bool {
        if let Some(started_at) = self.started_at {
            started_at.elapsed().as_secs() > self.timeout_seconds
        } else {
            false
        }
    }
    
    /// Check if task can be retried
    pub fn can_retry(&self) -> bool {
        self.retry_count < self.max_retries && 
        matches!(self.status, TaskStatus::Failed | TaskStatus::Timeout)
    }
    
    /// Mark task as started
    pub fn mark_started(&mut self) {
        self.status = TaskStatus::Running;
        self.started_at = Some(Instant::now());
    }
    
    /// Mark task as completed
    pub fn mark_completed(&mut self, result: serde_json::Value) {
        self.status = TaskStatus::Completed;
        self.completed_at = Some(Instant::now());
        self.result = Some(result);
    }
    
    /// Mark task as failed
    pub fn mark_failed(&mut self, error: String) {
        self.status = TaskStatus::Failed;
        self.completed_at = Some(Instant::now());
        self.error = Some(error);
    }
    
    /// Retry the task
    pub fn retry(&mut self) {
        if self.can_retry() {
            self.retry_count += 1;
            self.status = TaskStatus::Pending;
            self.started_at = None;
            self.completed_at = None;
            self.error = None;
        }
    }
}

/// Task execution context
#[derive(Debug, Clone)]
pub struct TaskExecutionContext {
    pub session_id: String,
    pub executing_agent_id: String,
    pub task_id: String,
    pub correlation_id: String,
    pub started_at: Instant,
    pub timeout_at: Instant,
}

/// Task scheduler for coordinating agent workflows
pub struct TaskScheduler {
    /// Pending tasks queue (priority-ordered)
    pending_queue: Arc<RwLock<BTreeMap<TaskPriority, VecDeque<ScheduledTask>>>>,
    
    /// Active/running tasks
    active_tasks: Arc<RwLock<HashMap<String, ScheduledTask>>>,
    
    /// Completed tasks
    completed_tasks: Arc<RwLock<HashMap<String, ScheduledTask>>>,
    
    /// Task execution contexts
    execution_contexts: Arc<RwLock<HashMap<String, TaskExecutionContext>>>,
    
    /// Metrics collector
    metrics: Arc<MetricsCollector>,
    
    /// Event sender for task notifications
    event_sender: broadcast::Sender<AgentEvent>,
    
    /// Scheduler configuration
    config: SchedulerConfig,
}

/// Scheduler configuration
#[derive(Debug, Clone)]
pub struct SchedulerConfig {
    /// Maximum concurrent tasks per session
    pub max_concurrent_tasks_per_session: u32,
    
    /// Global maximum concurrent tasks
    pub global_max_concurrent_tasks: u32,
    
    /// Default task timeout in seconds
    pub default_timeout_seconds: u64,
    
    /// Task cleanup interval in seconds
    pub cleanup_interval_seconds: u64,
    
    /// Maximum completed tasks to retain
    pub max_completed_tasks: usize,
    
    /// Enable task metrics collection
    pub enable_metrics: bool,
}

impl Default for SchedulerConfig {
    fn default() -> Self {
        Self {
            max_concurrent_tasks_per_session: 10,
            global_max_concurrent_tasks: 100,
            default_timeout_seconds: 300,
            cleanup_interval_seconds: 60,
            max_completed_tasks: 1000,
            enable_metrics: true,
        }
    }
}

impl TaskScheduler {
    /// Create a new task scheduler
    pub fn new(metrics: Arc<MetricsCollector>, config: Option<SchedulerConfig>) -> Self {
        let (event_sender, _) = broadcast::channel(1000);
        
        Self {
            pending_queue: Arc::new(RwLock::new(BTreeMap::new())),
            active_tasks: Arc::new(RwLock::new(HashMap::new())),
            completed_tasks: Arc::new(RwLock::new(HashMap::new())),
            execution_contexts: Arc::new(RwLock::new(HashMap::new())),
            metrics,
            event_sender,
            config: config.unwrap_or_default(),
        }
    }
    
    /// Start the task scheduler
    pub async fn start(&self) -> AppResult<()> {
        info!("🕐 Starting Task Scheduler");
        
        // Start task execution loop
        self.start_execution_loop().await?;
        
        // Start timeout monitoring
        self.start_timeout_monitoring().await?;
        
        // Start cleanup task
        self.start_cleanup_task().await?;
        
        info!("✅ Task Scheduler started successfully");
        Ok(())
    }
    
    /// Schedule a new task
    pub async fn schedule_task(&self, mut task: ScheduledTask) -> AppResult<String> {
        // Validate task
        if task.target_agent_id.is_empty() {
            return Err(AppError::Validation("Target agent ID cannot be empty".to_string()));
        }
        
        if task.session_id.is_empty() {
            return Err(AppError::Validation("Session ID cannot be empty".to_string()));
        }
        
        // Set default timeout if not specified
        if task.timeout_seconds == 0 {
            task.timeout_seconds = self.config.default_timeout_seconds;
        }
        
        let task_id = task.task_id.clone();
        let priority = task.priority;
        
        // Add to pending queue
        {
            let mut queue = self.pending_queue.write().await;
            queue.entry(priority)
                .or_insert_with(VecDeque::new)
                .push_back(task);
        }
        
        // Update metrics
        if self.config.enable_metrics {
            self.metrics.increment_counter("scheduler_tasks_scheduled", &[
                ("priority", &format!("{:?}", priority)),
            ]);
        }
        
        // Publish task scheduled event
        let event = AgentEvent::new(
            AgentEventType::TaskAssigned,
            "scheduler".to_string(),
            task_id.clone(),
            serde_json::json!({
                "event": "task_scheduled",
                "task_id": task_id,
                "priority": format!("{:?}", priority)
            }),
        );
        
        if let Err(e) = self.event_sender.send(event) {
            warn!("Failed to publish task scheduled event: {}", e);
        }
        
        info!("📋 Scheduled task {} with priority {:?}", task_id, priority);
        Ok(task_id)
    }
    
    /// Cancel a task
    pub async fn cancel_task(&self, task_id: &str) -> AppResult<bool> {
        // Try to remove from pending queue first
        {
            let mut queue = self.pending_queue.write().await;
            for (_, task_queue) in queue.iter_mut() {
                if let Some(pos) = task_queue.iter().position(|t| t.task_id == task_id) {
                    let mut task = task_queue.remove(pos).unwrap();
                    task.status = TaskStatus::Cancelled;
                    
                    // Move to completed tasks
                    let mut completed = self.completed_tasks.write().await;
                    completed.insert(task_id.to_string(), task);
                    
                    info!("❌ Cancelled pending task {}", task_id);
                    return Ok(true);
                }
            }
        }
        
        // Try to cancel active task
        {
            let mut active = self.active_tasks.write().await;
            if let Some(mut task) = active.remove(task_id) {
                task.status = TaskStatus::Cancelled;
                task.completed_at = Some(Instant::now());
                
                // Remove execution context
                let mut contexts = self.execution_contexts.write().await;
                contexts.remove(task_id);
                
                // Move to completed tasks
                let mut completed = self.completed_tasks.write().await;
                completed.insert(task_id.to_string(), task);
                
                info!("❌ Cancelled active task {}", task_id);
                return Ok(true);
            }
        }
        
        Err(AppError::NotFound(format!("Task {} not found", task_id)))
    }
    
    /// Get task status
    pub async fn get_task_status(&self, task_id: &str) -> AppResult<TaskStatus> {
        // Check active tasks
        {
            let active = self.active_tasks.read().await;
            if let Some(task) = active.get(task_id) {
                return Ok(task.status.clone());
            }
        }
        
        // Check completed tasks
        {
            let completed = self.completed_tasks.read().await;
            if let Some(task) = completed.get(task_id) {
                return Ok(task.status.clone());
            }
        }
        
        // Check pending tasks
        {
            let queue = self.pending_queue.read().await;
            for task_queue in queue.values() {
                if let Some(task) = task_queue.iter().find(|t| t.task_id == task_id) {
                    return Ok(task.status.clone());
                }
            }
        }
        
        Err(AppError::NotFound(format!("Task {} not found", task_id)))
    }
    
    /// Complete a task with result
    pub async fn complete_task(&self, task_id: &str, result: serde_json::Value) -> AppResult<()> {
        let mut task = {
            let mut active = self.active_tasks.write().await;
            active.remove(task_id)
                .ok_or_else(|| AppError::NotFound(format!("Active task {} not found", task_id)))?
        };
        
        // Mark as completed
        task.mark_completed(result.clone());
        
        // Remove execution context
        {
            let mut contexts = self.execution_contexts.write().await;
            contexts.remove(task_id);
        }
        
        // Move to completed tasks
        {
            let mut completed = self.completed_tasks.write().await;
            completed.insert(task_id.to_string(), task);
        }
        
        // Update metrics
        if self.config.enable_metrics {
            self.metrics.increment_counter("scheduler_tasks_completed", &[]);
            
            if let Some(started_at) = task.started_at {
                let duration = started_at.elapsed().as_millis() as f64;
                self.metrics.record_histogram("scheduler_task_duration_ms", duration, &[]);
            }
        }
        
        // Publish task completed event
        let event = AgentEvent::new(
            AgentEventType::TaskCompleted,
            "scheduler".to_string(),
            task_id.to_string(),
            serde_json::json!({
                "event": "task_completed",
                "task_id": task_id,
                "result": result
            }),
        );
        
        if let Err(e) = self.event_sender.send(event) {
            warn!("Failed to publish task completed event: {}", e);
        }
        
        info!("✅ Completed task {}", task_id);
        Ok(())
    }
    
    /// Fail a task with error
    pub async fn fail_task(&self, task_id: &str, error: String) -> AppResult<()> {
        let mut task = {
            let mut active = self.active_tasks.write().await;
            active.remove(task_id)
                .ok_or_else(|| AppError::NotFound(format!("Active task {} not found", task_id)))?
        };
        
        // Mark as failed
        task.mark_failed(error.clone());
        
        // Check if task can be retried
        let should_retry = task.can_retry();
        
        if should_retry {
            // Retry the task
            task.retry();
            info!("🔄 Retrying task {} (attempt {}/{})", task_id, task.retry_count, task.max_retries);
            
            // Add back to pending queue
            let priority = task.priority;
            let mut queue = self.pending_queue.write().await;
            queue.entry(priority)
                .or_insert_with(VecDeque::new)
                .push_back(task);
        } else {
            // Remove execution context
            {
                let mut contexts = self.execution_contexts.write().await;
                contexts.remove(task_id);
            }
            
            // Move to completed tasks
            {
                let mut completed = self.completed_tasks.write().await;
                completed.insert(task_id.to_string(), task);
            }
            
            info!("❌ Failed task {} (no more retries)", task_id);
        }
        
        // Update metrics
        if self.config.enable_metrics {
            self.metrics.increment_counter("scheduler_tasks_failed", &[]);
        }
        
        // Publish task failed event
        let event = AgentEvent::new(
            AgentEventType::TaskFailed,
            "scheduler".to_string(),
            task_id.to_string(),
            serde_json::json!({
                "event": "task_failed",
                "task_id": task_id,
                "error": error,
                "will_retry": should_retry
            }),
        );
        
        if let Err(e) = self.event_sender.send(event) {
            warn!("Failed to publish task failed event: {}", e);
        }
        
        Ok(())
    }
    
    /// Get scheduler statistics
    pub async fn get_statistics(&self) -> HashMap<String, serde_json::Value> {
        let pending_count = {
            let queue = self.pending_queue.read().await;
            queue.values().map(|q| q.len()).sum::<usize>()
        };
        
        let active_count = {
            let active = self.active_tasks.read().await;
            active.len()
        };
        
        let completed_count = {
            let completed = self.completed_tasks.read().await;
            completed.len()
        };
        
        let mut stats = HashMap::new();
        stats.insert("pending_tasks".to_string(), serde_json::json!(pending_count));
        stats.insert("active_tasks".to_string(), serde_json::json!(active_count));
        stats.insert("completed_tasks".to_string(), serde_json::json!(completed_count));
        stats.insert("total_tasks".to_string(), serde_json::json!(pending_count + active_count + completed_count));
        
        // Priority breakdown
        let priority_breakdown = {
            let queue = self.pending_queue.read().await;
            let mut breakdown = HashMap::new();
            for (priority, task_queue) in queue.iter() {
                breakdown.insert(format!("{:?}", priority), task_queue.len());
            }
            breakdown
        };
        stats.insert("pending_by_priority".to_string(), serde_json::json!(priority_breakdown));
        
        stats
    }
    
    /// Start task execution loop
    async fn start_execution_loop(&self) -> AppResult<()> {
        let pending_queue = self.pending_queue.clone();
        let active_tasks = self.active_tasks.clone();
        let execution_contexts = self.execution_contexts.clone();
        let completed_tasks = self.completed_tasks.clone();
        let event_sender = self.event_sender.clone();
        let config = self.config.clone();
        let metrics = self.metrics.clone();
        
        tokio::spawn(async move {
            info!("Starting task execution loop");
            let mut interval = tokio::time::interval(Duration::from_millis(100));
            
            loop {
                interval.tick().await;
                
                // Check if we can execute more tasks
                let active_count = {
                    let active = active_tasks.read().await;
                    active.len()
                };
                
                if active_count >= config.global_max_concurrent_tasks as usize {
                    continue;
                }
                
                // Get next ready task (highest priority first)
                let next_task = {
                    let mut queue = pending_queue.write().await;
                    let completed = completed_tasks.read().await;
                    
                    // Iterate through priorities (highest first)
                    for (_, task_queue) in queue.iter_mut().rev() {
                        // Find first task with satisfied dependencies
                        for i in 0..task_queue.len() {
                            if let Some(task) = task_queue.get(i) {
                                if task.dependencies_satisfied(&completed) {
                                    return Some(task_queue.remove(i).unwrap());
                                }
                            }
                        }
                    }
                    None
                };
                
                if let Some(mut task) = next_task {
                    // Mark task as started
                    task.mark_started();
                    let task_id = task.task_id.clone();
                    
                    // Create execution context
                    let context = TaskExecutionContext {
                        session_id: task.session_id.clone(),
                        executing_agent_id: task.target_agent_id.clone(),
                        task_id: task_id.clone(),
                        correlation_id: Uuid::new_v4().to_string(),
                        started_at: Instant::now(),
                        timeout_at: Instant::now() + Duration::from_secs(task.timeout_seconds),
                    };
                    
                    // Store execution context
                    {
                        let mut contexts = execution_contexts.write().await;
                        contexts.insert(task_id.clone(), context);
                    }
                    
                    // Move to active tasks
                    {
                        let mut active = active_tasks.write().await;
                        active.insert(task_id.clone(), task);
                    }
                    
                    // Update metrics
                    if config.enable_metrics {
                        metrics.increment_counter("scheduler_tasks_started", &[]);
                        metrics.set_gauge("scheduler_active_tasks", active_count as f64 + 1.0, &[]);
                    }
                    
                    // Publish task started event
                    let event = AgentEvent::new(
                        AgentEventType::TaskAssigned,
                        "scheduler".to_string(),
                        task_id.clone(),
                        serde_json::json!({
                            "event": "task_started",
                            "task_id": task_id
                        }),
                    );
                    
                    if let Err(e) = event_sender.send(event) {
                        warn!("Failed to publish task started event: {}", e);
                    }
                    
                    debug!("⚡ Started executing task {}", task_id);
                }
            }
        });
        
        Ok(())
    }
    
    /// Start timeout monitoring
    async fn start_timeout_monitoring(&self) -> AppResult<()> {
        let active_tasks = self.active_tasks.clone();
        let execution_contexts = self.execution_contexts.clone();
        let completed_tasks = self.completed_tasks.clone();
        let pending_queue = self.pending_queue.clone();
        let event_sender = self.event_sender.clone();
        let metrics = self.metrics.clone();
        let config = self.config.clone();
        
        tokio::spawn(async move {
            info!("Starting timeout monitoring");
            let mut interval = tokio::time::interval(Duration::from_secs(10));
            
            loop {
                interval.tick().await;
                
                let now = Instant::now();
                let mut timed_out_tasks = Vec::new();
                
                // Check for timed out tasks
                {
                    let contexts = execution_contexts.read().await;
                    for (task_id, context) in contexts.iter() {
                        if now >= context.timeout_at {
                            timed_out_tasks.push(task_id.clone());
                        }
                    }
                }
                
                // Handle timed out tasks
                for task_id in timed_out_tasks {
                    let mut task = {
                        let mut active = active_tasks.write().await;
                        if let Some(task) = active.remove(&task_id) {
                            task
                        } else {
                            continue;
                        }
                    };
                    
                    // Mark as timed out
                    task.status = TaskStatus::Timeout;
                    task.completed_at = Some(now);
                    task.error = Some("Task execution timed out".to_string());
                    
                    // Check if task can be retried
                    let should_retry = task.can_retry();
                    
                    if should_retry {
                        // Retry the task
                        task.retry();
                        warn!("⏰ Task {} timed out, retrying (attempt {}/{})", task_id, task.retry_count, task.max_retries);
                        
                        // Add back to pending queue
                        let priority = task.priority;
                        let mut queue = pending_queue.write().await;
                        queue.entry(priority)
                            .or_insert_with(VecDeque::new)
                            .push_back(task);
                    } else {
                        // Move to completed tasks
                        let mut completed = completed_tasks.write().await;
                        completed.insert(task_id.clone(), task);
                        
                        warn!("⏰ Task {} timed out (no more retries)", task_id);
                    }
                    
                    // Remove execution context
                    {
                        let mut contexts = execution_contexts.write().await;
                        contexts.remove(&task_id);
                    }
                    
                    // Update metrics
                    if config.enable_metrics {
                        metrics.increment_counter("scheduler_tasks_timeout", &[]);
                    }
                    
                    // Publish timeout event
                    let event = AgentEvent::new(
                        AgentEventType::TaskFailed,
                        "scheduler".to_string(),
                        task_id.clone(),
                        serde_json::json!({
                            "event": "task_timeout",
                            "task_id": task_id,
                            "will_retry": should_retry
                        }),
                    );
                    
                    if let Err(e) = event_sender.send(event) {
                        warn!("Failed to publish task timeout event: {}", e);
                    }
                }
            }
        });
        
        Ok(())
    }
    
    /// Start cleanup task
    async fn start_cleanup_task(&self) -> AppResult<()> {
        let completed_tasks = self.completed_tasks.clone();
        let config = self.config.clone();
        
        tokio::spawn(async move {
            info!("Starting cleanup task");
            let mut interval = tokio::time::interval(Duration::from_secs(config.cleanup_interval_seconds));
            
            loop {
                interval.tick().await;
                
                // Clean up old completed tasks
                {
                    let mut completed = completed_tasks.write().await;
                    if completed.len() > config.max_completed_tasks {
                        let excess = completed.len() - config.max_completed_tasks;
                        
                        // Remove oldest tasks (by completion time)
                        let mut tasks_to_remove: Vec<_> = completed.iter()
                            .filter_map(|(id, task)| task.completed_at.map(|time| (id.clone(), time)))
                            .collect();
                        
                        tasks_to_remove.sort_by_key(|(_, time)| *time);
                        
                        for (id, _) in tasks_to_remove.iter().take(excess) {
                            completed.remove(id);
                        }
                        
                        if excess > 0 {
                            debug!("🧹 Cleaned up {} old completed tasks", excess);
                        }
                    }
                }
            }
        });
        
        Ok(())
    }
    
    /// Subscribe to task events
    pub fn subscribe_to_events(&self) -> broadcast::Receiver<AgentEvent> {
        self.event_sender.subscribe()
    }
}
