use std::sync::Arc;
use tokio::sync::RwLock;
use casbin::prelude::*;
use casbin_redis_adapter::RedisAdapter;
use tracing::{info, warn};

use crate::error::{IdentityError, IdentityResult};

pub struct PolicyStore {
    enforcer: Arc<RwLock<Enforcer>>,
}

impl PolicyStore {
    pub async fn new(model_path: &str, redis_url: &str) -> IdentityResult<Self> {
        let m = DefaultModel::from_file(model_path)
            .await
            .map_err(|e| IdentityError::Config(format!("Failed to load RBAC model: {}", e)))?;

        let a = RedisAdapter::new(redis_url)
            .map_err(|e| IdentityError::Config(format!("Failed to connect to Redis: {}", e)))?;

        let enforcer = Enforcer::new(m, a)
            .await
            .map_err(|e| IdentityError::Config(format!("Failed to create enforcer: {}", e)))?;

        Ok(Self {
            enforcer: Arc::new(RwLock::new(enforcer)),
        })
    }

    pub async fn add_policy(&self, policy: Vec<String>) -> IdentityResult<bool> {
        let mut enforcer = self.enforcer.write().await;
        enforcer
            .add_policy(policy)
            .await
            .map_err(|e| IdentityError::Service(format!("Failed to add policy: {}", e)))
    }

    pub async fn remove_policy(&self, policy: Vec<String>) -> IdentityResult<bool> {
        let mut enforcer = self.enforcer.write().await;
        enforcer
            .remove_policy(policy)
            .await
            .map_err(|e| IdentityError::Service(format!("Failed to remove policy: {}", e)))
    }

    pub async fn add_role_for_user(
        &self,
        user: &str,
        role: &str,
        domain: Option<&str>,
    ) -> IdentityResult<bool> {
        let mut enforcer = self.enforcer.write().await;
        match domain {
            Some(d) => {
                enforcer
                    .add_role_for_user_in_domain(user, role, d)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to add role: {}", e)))
            }
            None => {
                enforcer
                    .add_role_for_user(user, role)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to add role: {}", e)))
            }
        }
    }

    pub async fn enforce(&self, rvals: Vec<String>) -> IdentityResult<bool> {
        let enforcer = self.enforcer.read().await;
        enforcer
            .enforce(rvals)
            .map_err(|e| IdentityError::Service(format!("Failed to enforce policy: {}", e)))
    }

    pub async fn get_roles_for_user(&self, user: &str, domain: Option<&str>) -> IdentityResult<Vec<String>> {
        let enforcer = self.enforcer.read().await;
        match domain {
            Some(d) => {
                enforcer
                    .get_roles_for_user_in_domain(user, d)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to get roles: {}", e)))
            }
            None => {
                enforcer
                    .get_roles_for_user(user)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to get roles: {}", e)))
            }
        }
    }

    pub async fn get_users_for_role(&self, role: &str, domain: Option<&str>) -> IdentityResult<Vec<String>> {
        let enforcer = self.enforcer.read().await;
        match domain {
            Some(d) => {
                enforcer
                    .get_users_for_role_in_domain(role, d)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to get users: {}", e)))
            }
            None => {
                enforcer
                    .get_users_for_role(role)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to get users: {}", e)))
            }
        }
    }

    pub async fn has_role_for_user(
        &self,
        user: &str,
        role: &str,
        domain: Option<&str>,
    ) -> IdentityResult<bool> {
        let enforcer = self.enforcer.read().await;
        match domain {
            Some(d) => {
                enforcer
                    .has_role_for_user_in_domain(user, role, d)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to check role: {}", e)))
            }
            None => {
                enforcer
                    .has_role_for_user(user, role)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to check role: {}", e)))
            }
        }
    }

    pub async fn get_permissions_for_user(&self, user: &str, domain: Option<&str>) -> IdentityResult<Vec<Vec<String>>> {
        let enforcer = self.enforcer.read().await;
        match domain {
            Some(d) => {
                enforcer
                    .get_permissions_for_user_in_domain(user, d)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to get permissions: {}", e)))
            }
            None => {
                enforcer
                    .get_permissions_for_user(user)
                    .await
                    .map_err(|e| IdentityError::Service(format!("Failed to get permissions: {}", e)))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;

    async fn setup() -> (PolicyStore, NamedTempFile) {
        let model_content = r#"
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
"#;

        let model_file = NamedTempFile::new().unwrap();
        std::fs::write(&model_file, model_content).unwrap();

        let store = PolicyStore::new(
            model_file.path().to_str().unwrap(),
            "redis://localhost:6379/",
        )
        .await
        .unwrap();

        (store, model_file)
    }

    #[tokio::test]
    async fn test_basic_policy() {
        let (store, _model_file) = setup().await;

        // Add a policy
        let policy = vec![
            "alice".to_string(),
            "data1".to_string(),
            "read".to_string(),
        ];
        assert!(store.add_policy(policy.clone()).await.unwrap());

        // Verify enforcement
        let request = vec![
            "alice".to_string(),
            "data1".to_string(),
            "read".to_string(),
        ];
        assert!(store.enforce(request).await.unwrap());

        // Remove the policy
        assert!(store.remove_policy(policy).await.unwrap());
    }

    #[tokio::test]
    async fn test_role_management() {
        let (store, _model_file) = setup().await;

        // Add role
        assert!(store.add_role_for_user("alice", "admin", None).await.unwrap());

        // Verify role
        assert!(store.has_role_for_user("alice", "admin", None).await.unwrap());

        // Get roles
        let roles = store.get_roles_for_user("alice", None).await.unwrap();
        assert!(roles.contains(&"admin".to_string()));

        // Get users for role
        let users = store.get_users_for_role("admin", None).await.unwrap();
        assert!(users.contains(&"alice".to_string()));
    }
}
