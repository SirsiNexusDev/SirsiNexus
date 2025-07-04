use serde::{Deserialize, Serialize};

/// Predefined audit event types for consistency
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditEventType {
    Authentication,
    Authorization, 
    DataAccess,
    DataModification,
    SystemEvent,
    UserAction,
    AgentAction,
    Migration,
    SecurityEvent,
}

impl ToString for AuditEventType {
    fn to_string(&self) -> String {
        match self {
            AuditEventType::Authentication => "authentication".to_string(),
            AuditEventType::Authorization => "authorization".to_string(),
            AuditEventType::DataAccess => "data_access".to_string(),
            AuditEventType::DataModification => "data_modification".to_string(),
            AuditEventType::SystemEvent => "system_event".to_string(),
            AuditEventType::UserAction => "user_action".to_string(),
            AuditEventType::AgentAction => "agent_action".to_string(),
            AuditEventType::Migration => "migration".to_string(),
            AuditEventType::SecurityEvent => "security_event".to_string(),
        }
    }
}

/// Predefined resource types for audit logging
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditResourceType {
    User,
    Role,
    Permission,
    Project,
    Agent,
    Resource,
    Migration,
    System,
    AWSResource,
    AzureResource,
    GCPResource,
}

impl ToString for AuditResourceType {
    fn to_string(&self) -> String {
        match self {
            AuditResourceType::User => "user".to_string(),
            AuditResourceType::Role => "role".to_string(),
            AuditResourceType::Permission => "permission".to_string(),
            AuditResourceType::Project => "project".to_string(),
            AuditResourceType::Agent => "agent".to_string(),
            AuditResourceType::Resource => "resource".to_string(),
            AuditResourceType::Migration => "migration".to_string(),
            AuditResourceType::System => "system".to_string(),
            AuditResourceType::AWSResource => "aws_resource".to_string(),
            AuditResourceType::AzureResource => "azure_resource".to_string(),
            AuditResourceType::GCPResource => "gcp_resource".to_string(),
        }
    }
}

/// Predefined action types for audit logging
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuditAction {
    Create,
    Read,
    Update,
    Delete,
    Login,
    Logout,
    LoginFailed,
    AccessGranted,
    AccessDenied,
    PasswordChanged,
    RoleAssigned,
    RoleRevoked,
    AgentSpawned,
    AgentTerminated,
    MigrationStarted,
    MigrationCompleted,
    MigrationFailed,
    ResourceDiscovered,
    ResourceModified,
    SystemStartup,
    SystemShutdown,
    ConfigurationChanged,
}

impl ToString for AuditAction {
    fn to_string(&self) -> String {
        match self {
            AuditAction::Create => "create".to_string(),
            AuditAction::Read => "read".to_string(),
            AuditAction::Update => "update".to_string(),
            AuditAction::Delete => "delete".to_string(),
            AuditAction::Login => "login".to_string(),
            AuditAction::Logout => "logout".to_string(),
            AuditAction::LoginFailed => "login_failed".to_string(),
            AuditAction::AccessGranted => "access_granted".to_string(),
            AuditAction::AccessDenied => "access_denied".to_string(),
            AuditAction::PasswordChanged => "password_changed".to_string(),
            AuditAction::RoleAssigned => "role_assigned".to_string(),
            AuditAction::RoleRevoked => "role_revoked".to_string(),
            AuditAction::AgentSpawned => "agent_spawned".to_string(),
            AuditAction::AgentTerminated => "agent_terminated".to_string(),
            AuditAction::MigrationStarted => "migration_started".to_string(),
            AuditAction::MigrationCompleted => "migration_completed".to_string(),
            AuditAction::MigrationFailed => "migration_failed".to_string(),
            AuditAction::ResourceDiscovered => "resource_discovered".to_string(),
            AuditAction::ResourceModified => "resource_modified".to_string(),
            AuditAction::SystemStartup => "system_startup".to_string(),
            AuditAction::SystemShutdown => "system_shutdown".to_string(),
            AuditAction::ConfigurationChanged => "configuration_changed".to_string(),
        }
    }
}
