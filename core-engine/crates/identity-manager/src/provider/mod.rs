use std::collections::HashMap;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::error::IdentityResult;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Identity {
    pub id: String,
    pub provider_id: String,
    pub username: String,
    pub email: Option<String>,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_login: Option<DateTime<Utc>>,
    pub groups: Vec<String>,
    pub roles: Vec<String>,
    pub metadata: HashMap<String, String>,
    pub status: IdentityStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IdentityStatus {
    Active,
    Inactive,
    Suspended,
    Deleted,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticationRequest {
    pub username: String,
    pub password: Option<String>,
    pub token: Option<String>,
    pub provider: String,
    pub scope: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthenticationResponse {
    pub identity: Identity,
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub token_type: String,
    pub expires_in: i64,
    pub scope: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    pub id: String,
    pub name: String,
    pub provider_type: ProviderType,
    pub config: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProviderType {
    Local,
    OAuth2,
    OIDC,
    LDAP,
    SAML,
}

#[async_trait]
pub trait IdentityProvider: Send + Sync {
    async fn authenticate(&self, request: AuthenticationRequest) -> IdentityResult<AuthenticationResponse>;
    async fn validate_token(&self, token: &str) -> IdentityResult<Identity>;
    async fn refresh_token(&self, refresh_token: &str) -> IdentityResult<AuthenticationResponse>;
    async fn revoke_token(&self, token: &str) -> IdentityResult<()>;
    async fn get_identity(&self, id: &str) -> IdentityResult<Identity>;
    async fn list_identities(&self) -> IdentityResult<Vec<Identity>>;
    async fn create_identity(&self, identity: Identity) -> IdentityResult<Identity>;
    async fn update_identity(&self, identity: Identity) -> IdentityResult<Identity>;
    async fn delete_identity(&self, id: &str) -> IdentityResult<()>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Group {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub members: Vec<String>,
    pub parent_groups: Vec<String>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<Permission>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Permission {
    pub resource: String,
    pub action: String,
    pub effect: PermissionEffect,
    pub conditions: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PermissionEffect {
    Allow,
    Deny,
}

#[async_trait]
pub trait GroupManager: Send + Sync {
    async fn create_group(&self, group: Group) -> IdentityResult<Group>;
    async fn update_group(&self, group: Group) -> IdentityResult<Group>;
    async fn delete_group(&self, id: &str) -> IdentityResult<()>;
    async fn get_group(&self, id: &str) -> IdentityResult<Group>;
    async fn list_groups(&self) -> IdentityResult<Vec<Group>>;
    async fn add_member(&self, group_id: &str, member_id: &str) -> IdentityResult<()>;
    async fn remove_member(&self, group_id: &str, member_id: &str) -> IdentityResult<()>;
}

#[async_trait]
pub trait RoleManager: Send + Sync {
    async fn create_role(&self, role: Role) -> IdentityResult<Role>;
    async fn update_role(&self, role: Role) -> IdentityResult<Role>;
    async fn delete_role(&self, id: &str) -> IdentityResult<()>;
    async fn get_role(&self, id: &str) -> IdentityResult<Role>;
    async fn list_roles(&self) -> IdentityResult<Vec<Role>>;
    async fn assign_role(&self, identity_id: &str, role_id: &str) -> IdentityResult<()>;
    async fn revoke_role(&self, identity_id: &str, role_id: &str) -> IdentityResult<()>;
}
