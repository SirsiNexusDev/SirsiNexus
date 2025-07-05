//! # Hypervisor Coordinator
//!
//! Centralized coordinator for agent lifecycle management, resource allocation,
//! and cross-agent orchestration in the SirsiNexus AI Hypervisor.

use crate::{
    agent::{AgentManager, AgentCapabilities},
    communication::{EventBus, AgentEvent, AgentEventType},
    error::{AppError, AppResult},
    telemetry::metrics::MetricsCollector,
};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use tracing::{debug, error, info, warn};
use uuid::Uuid;
use serde::{Deserialize, Serialize};

/// Hypervisor system status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HypervisorStatus {
    Initializing,
    Ready,
    Busy,
    Degraded,
    Maintenance,
    Shutdown,
}

/// Agent session information managed by the hypervisor
#[derive(Debug, Clone)]
pub struct ManagedSession {
    pub session_id: String,
    pub user_id: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
    pub active_agents: HashMap<String, String>, // agent_id -> agent_type
    pub resource_allocation: ResourceAllocation,
    pub session_config: SessionConfig,
}

/// Resource allocation per session
#[derive(Debug, Clone)]
pub struct ResourceAllocation {
    pub max_agents: u32,
    pub memory_limit_mb: u64,
    pub cpu_limit_cores: f64,
    pub timeout_seconds: u64,
    pub priority: u8,
}

impl Default for ResourceAllocation {
    fn default() -> Self {
        Self {
            max_agents: 5,
            memory_limit_mb: 1024,
            cpu_limit_cores: 2.0,
            timeout_seconds: 3600,
            priority: 5,
        }
    }
}

/// Session configuration
#[derive(Debug, Clone)]
pub struct SessionConfig {
    pub allowed_agent_types: Vec<String>,
    pub auto_cleanup: bool,
    pub enable_monitoring: bool,
    pub enable_logging: bool,
    pub custom_parameters: HashMap<String, String>,
}

impl Default for SessionConfig {
    fn default() -> Self {
        Self {
            allowed_agent_types: vec![
                "aws".to_string(),
                "azure".to_string(),
                "gcp".to_string(),
                "migration".to_string(),
                "security".to_string(),
                "reporting".to_string(),
            ],
            auto_cleanup: true,
            enable_monitoring: true,
            enable_logging: true,
            custom_parameters: HashMap::new(),
        }
    }
}

/// Agent orchestration plan
#[derive(Debug, Clone)]
pub struct OrchestrationPlan {
    pub plan_id: String,
    pub session_id: String,
    pub target_state: HashMap<String, AgentTargetState>,
    pub execution_order: Vec<String>,
    pub estimated_duration_seconds: u64,
    pub resource_requirements: ResourceAllocation,
}

/// Target state for an agent in an orchestration plan
#[derive(Debug, Clone)]
pub struct AgentTargetState {
    pub agent_type: String,
    pub desired_count: u32,
    pub configuration: HashMap<String, String>,
    pub dependencies: Vec<String>,
    pub priority: u8,
}

/// Hypervisor coordinator - the central orchestration component
pub struct HypervisorCoordinator {
    /// System status
    status: Arc<RwLock<HypervisorStatus>>,
    
    /// Agent manager for lifecycle operations
    agent_manager: Arc<RwLock<AgentManager>>,
    
    /// Event bus for communication
    event_bus: Arc<EventBus>,
    
    /// Metrics collector
    metrics: Arc<MetricsCollector>,
    
    /// Active sessions
    sessions: Arc<RwLock<HashMap<String, ManagedSession>>>,
    
    /// Active orchestration plans
    orchestration_plans: Arc<RwLock<HashMap<String, OrchestrationPlan>>>,
    
    /// Event receiver for coordination
    event_receiver: Option<broadcast::Receiver<AgentEvent>>,
    
    /// System resource limits
    system_limits: ResourceAllocation,
}

impl HypervisorCoordinator {
    /// Create a new hypervisor coordinator
    pub async fn new(
        agent_manager: Arc<RwLock<AgentManager>>,
        event_bus: Arc<EventBus>,
        metrics: Arc<MetricsCollector>,
    ) -> AppResult<Self> {
        let coordinator = Self {
            status: Arc::new(RwLock::new(HypervisorStatus::Initializing)),
            agent_manager,
            event_bus,
            metrics,
            sessions: Arc::new(RwLock::new(HashMap::new())),
            orchestration_plans: Arc::new(RwLock::new(HashMap::new())),
            event_receiver: None,
            system_limits: ResourceAllocation {
                max_agents: 100,
                memory_limit_mb: 16384,
                cpu_limit_cores: 16.0,
                timeout_seconds: 86400,
                priority: 10,
            },
        };
        
        info!("Hypervisor coordinator initialized");
        Ok(coordinator)
    }
    
    /// Start the hypervisor coordinator
    pub async fn start(&mut self) -> AppResult<()> {
        info!("🚀 Starting Hypervisor Coordinator");
        
        // Set status to ready
        {
            let mut status = self.status.write().await;
            *status = HypervisorStatus::Ready;
        }
        
        // Start event processing
        self.start_event_processing().await?;
        
        // Start health monitoring
        self.start_health_monitoring().await?;
        
        // Start resource monitoring
        self.start_resource_monitoring().await?;
        
        info!("✅ Hypervisor Coordinator started successfully");
        Ok(())
    }
    
    /// Create a new managed session
    pub async fn create_session(
        &self,
        user_id: String,
        config: Option<SessionConfig>,
    ) -> AppResult<String> {
        let session_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();
        
        let session = ManagedSession {
            session_id: session_id.clone(),
            user_id: user_id.clone(),
            created_at: now,
            last_activity: now,
            active_agents: HashMap::new(),
            resource_allocation: ResourceAllocation::default(),
            session_config: config.unwrap_or_default(),
        };
        
        // Store session
        {
            let mut sessions = self.sessions.write().await;
            sessions.insert(session_id.clone(), session);
        }
        
        // Publish session created event
        let event = AgentEvent::new(
            AgentEventType::AgentCreated,
            "hypervisor".to_string(),
            session_id.clone(),
            serde_json::json!({
                "event": "session_created",
                "user_id": user_id,
                "session_id": session_id
            }),
        );
        
        if let Err(e) = self.event_bus.publish(event).await {
            warn!("Failed to publish session created event: {}", e);
        }
        
        // Update metrics
        self.metrics.increment_counter("hypervisor_sessions_created", 1).await;
        self.metrics.set_gauge("hypervisor_active_sessions", self.get_active_session_count().await as i64).await;
        
        info!("Created managed session {} for user {}", session_id, user_id);
        Ok(session_id)
    }
    
    /// Orchestrate agent creation with coordination
    pub async fn orchestrate_agent_creation(
        &self,
        session_id: &str,
        agent_type: &str,
        config: HashMap<String, String>,
    ) -> AppResult<String> {
        // Validate session exists
        let session = {
            let sessions = self.sessions.read().await;
            sessions.get(session_id).cloned()
                .ok_or_else(|| AppError::NotFound(format!("Session {} not found", session_id)))?
        };
        
        // Check resource limits
        if session.active_agents.len() >= session.resource_allocation.max_agents as usize {
            return Err(AppError::ResourceLimit(
                format!("Session {} has reached agent limit of {}", 
                       session_id, session.resource_allocation.max_agents)
            ));
        }
        
        // Check if agent type is allowed
        if !session.session_config.allowed_agent_types.contains(&agent_type.to_string()) {
            return Err(AppError::Forbidden(
                format!("Agent type {} not allowed for session {}", agent_type, session_id)
            ));
        }
        
        // Create agent through agent manager
        let mut agent_manager = self.agent_manager.write().await;
        let agent_id = agent_manager.spawn_agent(session_id, agent_type, config).await?;
        drop(agent_manager);
        
        // Update session with new agent
        {
            let mut sessions = self.sessions.write().await;
            if let Some(session) = sessions.get_mut(session_id) {
                session.active_agents.insert(agent_id.clone(), agent_type.to_string());
                session.last_activity = chrono::Utc::now();
            }
        }
        
        // Publish agent creation event
        let event = AgentEvent::new(
            AgentEventType::AgentCreated,
            "hypervisor".to_string(),
            session_id.to_string(),
            serde_json::json!({
                "event": "agent_created",
                "agent_id": agent_id,
                "agent_type": agent_type,
                "session_id": session_id
            }),
        );
        
        if let Err(e) = self.event_bus.publish(event).await {
            warn!("Failed to publish agent created event: {}", e);
        }
        
        // Update metrics
        self.metrics.increment_counter("hypervisor_agents_created", 1).await;
        self.metrics.set_gauge("hypervisor_active_agents", self.get_active_agent_count().await as i64).await;
        
        info!("🤖 Orchestrated creation of {} agent {} for session {}", agent_type, agent_id, session_id);
        Ok(agent_id)
    }
    
    /// Coordinate cross-agent task execution
    pub async fn coordinate_cross_agent_task(
        &self,
        session_id: &str,
        task_description: &str,
        involved_agents: Vec<String>,
    ) -> AppResult<String> {
        let task_id = Uuid::new_v4().to_string();
        
        // Validate session and agents
        let session = {
            let sessions = self.sessions.read().await;
            sessions.get(session_id).cloned()
                .ok_or_else(|| AppError::NotFound(format!("Session {} not found", session_id)))?
        };
        
        // Verify all involved agents exist in the session
        for agent_id in &involved_agents {
            if !session.active_agents.contains_key(agent_id) {
                return Err(AppError::NotFound(
                    format!("Agent {} not found in session {}", agent_id, session_id)
                ));
            }
        }
        
        // Create orchestration plan
        let plan = OrchestrationPlan {
            plan_id: task_id.clone(),
            session_id: session_id.to_string(),
            target_state: HashMap::new(), // Will be populated based on task analysis
            execution_order: involved_agents.clone(),
            estimated_duration_seconds: 300, // Default 5 minutes
            resource_requirements: ResourceAllocation::default(),
        };
        
        // Store orchestration plan
        {
            let mut plans = self.orchestration_plans.write().await;
            plans.insert(task_id.clone(), plan);
        }
        
        // Publish task coordination event
        let event = AgentEvent::new(
            AgentEventType::TaskAssigned,
            "hypervisor".to_string(),
            session_id.to_string(),
            serde_json::json!({
                "event": "cross_agent_task",
                "task_id": task_id,
                "task_description": task_description,
                "involved_agents": involved_agents,
                "session_id": session_id
            }),
        );
        
        if let Err(e) = self.event_bus.publish(event).await {
            warn!("Failed to publish task coordination event: {}", e);
        }
        
        // Update metrics
        self.metrics.increment_counter("hypervisor_cross_agent_tasks", 1).await;
        
        info!("🎯 Coordinating cross-agent task {} for session {} with agents {:?}", 
              task_id, session_id, involved_agents);
        Ok(task_id)
    }
    
    /// Get system health status
    pub async fn get_health_status(&self) -> AppResult<HashMap<String, serde_json::Value>> {
        let status = self.status.read().await;
        let sessions = self.sessions.read().await;
        let active_session_count = sessions.len();
        let total_active_agents: usize = sessions.values()
            .map(|s| s.active_agents.len())
            .sum();
        
        let mut health = HashMap::new();
        health.insert("status".to_string(), serde_json::json!(format!("{:?}", *status)));
        health.insert("active_sessions".to_string(), serde_json::json!(active_session_count));
        health.insert("total_active_agents".to_string(), serde_json::json!(total_active_agents));
        health.insert("system_limits".to_string(), serde_json::json!({
            "max_agents": self.system_limits.max_agents,
            "memory_limit_mb": self.system_limits.memory_limit_mb,
            "cpu_limit_cores": self.system_limits.cpu_limit_cores
        }));
        
        // Get event bus health
        if let Ok(event_bus_health) = self.event_bus.get_health().await {
            health.insert("event_bus".to_string(), serde_json::json!(event_bus_health));
        }
        
        Ok(health)
    }
    
    /// Clean up inactive sessions
    pub async fn cleanup_inactive_sessions(&self) -> AppResult<u32> {
        let cutoff_time = chrono::Utc::now() - chrono::Duration::seconds(3600); // 1 hour
        let mut cleaned_up = 0u32;
        
        let sessions_to_cleanup: Vec<String> = {
            let sessions = self.sessions.read().await;
            sessions.iter()
                .filter(|(_, session)| session.last_activity < cutoff_time)
                .map(|(id, _)| id.clone())
                .collect()
        };
        
        for session_id in sessions_to_cleanup {
            if let Err(e) = self.cleanup_session(&session_id).await {
                error!("Failed to cleanup session {}: {}", session_id, e);
            } else {
                cleaned_up += 1;
            }
        }
        
        if cleaned_up > 0 {
            info!("🧹 Cleaned up {} inactive sessions", cleaned_up);
        }
        
        Ok(cleaned_up)
    }
    
    /// Clean up a specific session
    async fn cleanup_session(&self, session_id: &str) -> AppResult<()> {
        // Get session info
        let session = {
            let mut sessions = self.sessions.write().await;
            sessions.remove(session_id)
        };
        
        if let Some(session) = session {
            // Terminate all agents in the session
            let mut agent_manager = self.agent_manager.write().await;
            for agent_id in session.active_agents.keys() {
                if let Err(e) = agent_manager.terminate_agent(session_id, agent_id).await {
                    warn!("Failed to terminate agent {} in session {}: {}", agent_id, session_id, e);
                }
            }
            drop(agent_manager);
            
            // Publish session cleanup event
            let event = AgentEvent::new(
                AgentEventType::AgentDestroyed,
                "hypervisor".to_string(),
                session_id.to_string(),
                serde_json::json!({
                    "event": "session_cleanup",
                    "session_id": session_id,
                    "cleaned_agents": session.active_agents.len()
                }),
            );
            
            if let Err(e) = self.event_bus.publish(event).await {
                warn!("Failed to publish session cleanup event: {}", e);
            }
            
            info!("🗑️  Cleaned up session {} with {} agents", session_id, session.active_agents.len());
        }
        
        Ok(())
    }
    
    /// Start event processing for coordination
    async fn start_event_processing(&mut self) -> AppResult<()> {
        // Subscribe to events for coordination
        let subscription = crate::communication::EventSubscription {
            subscription_id: "hypervisor_coordinator".to_string(),
            agent_id: "hypervisor".to_string(),
            event_types: vec![
                AgentEventType::AgentCreated,
                AgentEventType::AgentDestroyed,
                AgentEventType::TaskCompleted,
                AgentEventType::TaskFailed,
            ],
            session_filter: None,
            target_filter: None,
        };
        
        let mut receiver = self.event_bus.subscribe(subscription).await?;
        
        // Start event processing loop
        let sessions = self.sessions.clone();
        let metrics = self.metrics.clone();
        
        tokio::spawn(async move {
            info!("Starting hypervisor event processing");
            
            while let Ok(event) = receiver.recv().await {
                debug!("Hypervisor received event: {:?}", event.event_type);
                
                // Process coordination events
                match event.event_type {
                    AgentEventType::TaskCompleted => {
                        metrics.increment_counter("hypervisor_tasks_completed", 1).await;
                    }
                    AgentEventType::TaskFailed => {
                        metrics.increment_counter("hypervisor_tasks_failed", 1).await;
                    }
                    AgentEventType::AgentDestroyed => {
                        // Update session agent count
                        let mut sessions_write = sessions.write().await;
                        if let Some(session) = sessions_write.get_mut(&event.session_id) {
                            session.active_agents.retain(|id, _| id != &event.source_agent_id);
                            session.last_activity = chrono::Utc::now();
                        }
                    }
                    _ => {}
                }
            }
        });
        
        Ok(())
    }
    
    /// Start health monitoring
    async fn start_health_monitoring(&self) -> AppResult<()> {
        let status = self.status.clone();
        let sessions = self.sessions.clone();
        let metrics = self.metrics.clone();
        
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
            
            loop {
                interval.tick().await;
                
                // Monitor system health
                let session_count = {
                    let sessions_read = sessions.read().await;
                    sessions_read.len()
                };
                
                metrics.set_gauge("hypervisor_health_check", 1).await;
                metrics.set_gauge("hypervisor_active_sessions", session_count as i64).await;
                
                // Check if system is overloaded
                if session_count > 50 {
                    let mut status_write = status.write().await;
                    if matches!(*status_write, HypervisorStatus::Ready) {
                        *status_write = HypervisorStatus::Busy;
                        warn!("Hypervisor status changed to Busy due to high session count: {}", session_count);
                    }
                } else {
                    let mut status_write = status.write().await;
                    if matches!(*status_write, HypervisorStatus::Busy) {
                        *status_write = HypervisorStatus::Ready;
                        info!("Hypervisor status changed back to Ready");
                    }
                }
            }
        });
        
        Ok(())
    }
    
    /// Start resource monitoring
    async fn start_resource_monitoring(&self) -> AppResult<()> {
        let sessions = self.sessions.clone();
        let metrics = self.metrics.clone();
        
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60));
            
            loop {
                interval.tick().await;
                
                // Monitor resource usage
                let (total_agents, memory_usage) = {
                    let sessions_read = sessions.read().await;
                    let total_agents: usize = sessions_read.values()
                        .map(|s| s.active_agents.len())
                        .sum();
                    let memory_usage: u64 = sessions_read.values()
                        .map(|s| s.resource_allocation.memory_limit_mb)
                        .sum();
                    (total_agents, memory_usage)
                };
                
                metrics.set_gauge("hypervisor_total_agents", total_agents as i64).await;
                metrics.set_gauge("hypervisor_memory_usage_mb", memory_usage as i64).await;
                
                debug!("Resource usage - Agents: {}, Memory: {}MB", total_agents, memory_usage);
            }
        });
        
        Ok(())
    }
    
    /// Get active session count
    async fn get_active_session_count(&self) -> usize {
        let sessions = self.sessions.read().await;
        sessions.len()
    }
    
    /// Get active agent count
    async fn get_active_agent_count(&self) -> usize {
        let sessions = self.sessions.read().await;
        sessions.values().map(|s| s.active_agents.len()).sum()
    }
}
