use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::PgPool;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub is_system_role: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Permission {
    pub id: Uuid,
    pub name: String,
    pub resource: String,
    pub action: String,
    pub description: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserRole {
    pub user_id: Uuid,
    pub role_id: Uuid,
    pub assigned_by: Uuid,
    pub assigned_at: chrono::DateTime<chrono::Utc>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone)]
pub struct RbacManager {
    pool: PgPool,
    role_cache: HashMap<Uuid, Role>,
    permission_cache: HashMap<String, Permission>,
}

impl RbacManager {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            role_cache: HashMap::new(),
            permission_cache: HashMap::new(),
        }
    }

    // Role Management
    pub async fn create_role(&mut self, name: String, description: String, permissions: Vec<String>) -> AppResult<Role> {
        let role_id = Uuid::new_v4();
        let now = chrono::Utc::now();
        
        // Validate permissions exist
        for permission in &permissions {
            self.get_permission(permission).await?;
        }
        
        let role = sqlx::query_as::<_, Role>(
            r#"
            INSERT INTO roles (id, name, description, permissions, is_system_role, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, description, permissions, is_system_role, created_at, updated_at
            "#
        )
        .bind(role_id)
        .bind(&name)
        .bind(&description)
        .bind(&permissions)
        .bind(false)
        .bind(now)
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        self.role_cache.insert(role_id, role.clone());
        Ok(role)
    }

    pub async fn get_role(&mut self, role_id: Uuid) -> AppResult<Role> {
        if let Some(role) = self.role_cache.get(&role_id) {
            return Ok(role.clone());
        }
        
        let role = sqlx::query_as::<_, Role>(
            "SELECT id, name, description, permissions, is_system_role, created_at, updated_at FROM roles WHERE id = $1"
        )
        .bind(role_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::Database)?
        .ok_or_else(|| AppError::NotFound("Role not found".into()))?;
        
        self.role_cache.insert(role_id, role.clone());
        Ok(role)
    }

    pub async fn update_role(&mut self, role_id: Uuid, permissions: Vec<String>) -> AppResult<Role> {
        // Validate permissions exist
        for permission in &permissions {
            self.get_permission(permission).await?;
        }
        
        let role = sqlx::query_as::<_, Role>(
            r#"
            UPDATE roles 
            SET permissions = $2, updated_at = $3
            WHERE id = $1
            RETURNING id, name, description, permissions, is_system_role, created_at, updated_at
            "#
        )
        .bind(role_id)
        .bind(&permissions)
        .bind(chrono::Utc::now())
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::Database)?
        .ok_or_else(|| AppError::NotFound("Role not found".into()))?;
        
        self.role_cache.insert(role_id, role.clone());
        Ok(role)
    }

    pub async fn delete_role(&mut self, role_id: Uuid) -> AppResult<()> {
        // Check if role is system role
        let role = self.get_role(role_id).await?;
        if role.is_system_role {
            return Err(AppError::Configuration("Cannot delete system role".into()));
        }
        
        // Remove role assignments first
        sqlx::query(
            "DELETE FROM user_roles WHERE role_id = $1"
        )
        .bind(role_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        // Delete role
        sqlx::query(
            "DELETE FROM roles WHERE id = $1"
        )
        .bind(role_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        self.role_cache.remove(&role_id);
        Ok(())
    }

    // Permission Management
    pub async fn create_permission(&mut self, name: String, resource: String, action: String, description: String) -> AppResult<Permission> {
        let permission_id = Uuid::new_v4();
        let now = chrono::Utc::now();
        
        let permission = sqlx::query_as::<_, Permission>(
            r#"
            INSERT INTO permissions (id, name, resource, action, description, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, resource, action, description, created_at
            "#
        )
        .bind(permission_id)
        .bind(name)
        .bind(resource)
        .bind(action)
        .bind(description)
        .bind(now)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        self.permission_cache.insert(permission.name.clone(), permission.clone());
        Ok(permission)
    }

    pub async fn get_permission(&mut self, name: &str) -> AppResult<Permission> {
        if let Some(permission) = self.permission_cache.get(name) {
            return Ok(permission.clone());
        }
        
        let permission = sqlx::query_as::<_, Permission>(
            "SELECT id, name, resource, action, description, created_at FROM permissions WHERE name = $1"
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await
        .map_err(AppError::Database)?
        .ok_or_else(|| AppError::NotFound("Permission not found".into()))?;
        
        self.permission_cache.insert(name.to_string(), permission.clone());
        Ok(permission)
    }

    // User Role Management
    pub async fn assign_role_to_user(&self, user_id: Uuid, role_id: Uuid, assigned_by: Uuid, expires_at: Option<chrono::DateTime<chrono::Utc>>) -> AppResult<()> {
        let now = chrono::Utc::now();
        
        sqlx::query(
            r#"
            INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at, expires_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, role_id) 
            DO UPDATE SET assigned_by = $3, assigned_at = $4, expires_at = $5
            "#
        )
        .bind(user_id)
        .bind(role_id)
        .bind(assigned_by)
        .bind(now)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        Ok(())
    }

    pub async fn remove_role_from_user(&self, user_id: Uuid, role_id: Uuid) -> AppResult<()> {
        sqlx::query(
            "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2"
        )
        .bind(user_id)
        .bind(role_id)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        Ok(())
    }

    pub async fn get_user_roles(&mut self, user_id: Uuid) -> AppResult<Vec<Role>> {
        let role_ids: Vec<Uuid> = sqlx::query_scalar::<_, Uuid>(
            r#"
            SELECT role_id FROM user_roles 
            WHERE user_id = $1 
            AND (expires_at IS NULL OR expires_at > NOW())
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        let mut roles = Vec::new();
        for role_id in role_ids {
            roles.push(self.get_role(role_id).await?);
        }
        
        Ok(roles)
    }

    pub async fn get_user_permissions(&mut self, user_id: Uuid) -> AppResult<Vec<String>> {
        let roles = self.get_user_roles(user_id).await?;
        let mut permissions = Vec::new();
        
        for role in roles {
            permissions.extend(role.permissions);
        }
        
        // Remove duplicates
        permissions.sort();
        permissions.dedup();
        
        Ok(permissions)
    }

    // Authorization
    pub async fn check_permission(&mut self, user_id: Uuid, required_permission: &str) -> AppResult<bool> {
        let user_permissions = self.get_user_permissions(user_id).await?;
        Ok(user_permissions.contains(&required_permission.to_string()))
    }

    pub async fn check_permissions(&mut self, user_id: Uuid, required_permissions: &[String]) -> AppResult<bool> {
        let user_permissions = self.get_user_permissions(user_id).await?;
        
        for required in required_permissions {
            if !user_permissions.contains(required) {
                return Ok(false);
            }
        }
        
        Ok(true)
    }

    // System Role Initialization
    pub async fn initialize_system_roles(&mut self) -> AppResult<()> {
        let system_roles = vec![
            ("admin", "System Administrator", vec![
                "users:create", "users:read", "users:update", "users:delete",
                "roles:create", "roles:read", "roles:update", "roles:delete",
                "projects:create", "projects:read", "projects:update", "projects:delete",
                "agents:create", "agents:read", "agents:update", "agents:delete",
                "system:admin", "audit:read"
            ]),
            ("user", "Standard User", vec![
                "projects:create", "projects:read", "projects:update",
                "agents:create", "agents:read", "agents:update"
            ]),
            ("viewer", "Read-Only User", vec![
                "projects:read", "agents:read"
            ]),
        ];

        for (name, description, permissions) in system_roles {
            // Check if role already exists
            let existing = sqlx::query_scalar::<_, Uuid>("SELECT id FROM roles WHERE name = $1")
                .bind(name)
                .fetch_optional(&self.pool)
                .await
                .map_err(AppError::Database)?;

            if existing.is_none() {
                let role_id = Uuid::new_v4();
                let now = chrono::Utc::now();
                
                sqlx::query(
                    r#"
                    INSERT INTO roles (id, name, description, permissions, is_system_role, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    "#
                )
                .bind(role_id)
                .bind(name)
                .bind(description)
                .bind(&permissions)
                .bind(true)
                .bind(now)
                .bind(now)
                .execute(&self.pool)
                .await
                .map_err(AppError::Database)?;
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;

    async fn setup_test_db() -> PgPool {
        // This would connect to a test database
        // For now, we'll skip actual database tests
        todo!("Setup test database")
    }

    #[tokio::test]
    #[ignore] // Skip for now since we need a test database
    async fn test_role_creation() {
        let pool = setup_test_db().await;
        let mut rbac = RbacManager::new(pool);

        let role = rbac.create_role(
            "test_role".to_string(),
            "Test Role".to_string(),
            vec!["test:read".to_string()]
        ).await.unwrap();

        assert_eq!(role.name, "test_role");
        assert!(!role.is_system_role);
    }
}
