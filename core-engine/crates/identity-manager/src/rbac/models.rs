use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

use crate::error::{IdentityError, IdentityResult};

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<String>,
    #[serde(flatten)]
    pub metadata: serde_json::Value,
    pub role_type: RoleType,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "role_type", rename_all = "lowercase")]
pub enum RoleType {
    System,
    Custom,
    Temporary,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Policy {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub effect: PolicyEffect,
    pub actions: Vec<String>,
    pub resources: Vec<String>,
    pub conditions: Vec<String>,
    #[serde(flatten)]
    pub metadata: serde_json::Value,
    pub policy_type: PolicyType,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "policy_effect", rename_all = "lowercase")]
pub enum PolicyEffect {
    Allow,
    Deny,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "policy_type", rename_all = "lowercase")]
pub enum PolicyType {
    Identity,
    Resource,
    Permission,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct RoleAssignment {
    pub id: Uuid,
    pub role_id: Uuid,
    pub principal_id: String,
    pub domain: Option<String>,
    pub expiry: Option<OffsetDateTime>,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PolicyAssignment {
    pub id: Uuid,
    pub policy_id: Uuid,
    pub target_id: String,
    pub target_type: String,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct CreateRole {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<String>,
    pub metadata: serde_json::Value,
    pub role_type: RoleType,
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdateRole {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    pub permissions: Option<Vec<String>>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct CreatePolicy {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    pub effect: PolicyEffect,
    pub actions: Vec<String>,
    pub resources: Vec<String>,
    pub conditions: Vec<String>,
    pub metadata: serde_json::Value,
    pub policy_type: PolicyType,
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdatePolicy {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    pub effect: Option<PolicyEffect>,
    pub actions: Option<Vec<String>>,
    pub resources: Option<Vec<String>>,
    pub conditions: Option<Vec<String>>,
    pub metadata: Option<serde_json::Value>,
}

impl Role {
    pub async fn create(pool: &sqlx::PgPool, new_role: CreateRole) -> IdentityResult<Self> {
        let role = sqlx::query_as!(
            Role,
            r#"
            INSERT INTO roles (name, description, permissions, metadata, role_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, description, permissions, metadata,
                      role_type as "role_type: RoleType", created_at, updated_at
            "#,
            new_role.name,
            new_role.description,
            &new_role.permissions,
            new_role.metadata,
            new_role.role_type as RoleType,
        )
        .fetch_one(pool)
        .await
        .map_err(IdentityError::Database)?;

        Ok(role)
    }

    pub async fn find_by_id(pool: &sqlx::PgPool, id: Uuid) -> IdentityResult<Option<Self>> {
        let role = sqlx::query_as!(
            Role,
            r#"
            SELECT id, name, description, permissions, metadata,
                   role_type as "role_type: RoleType", created_at, updated_at
            FROM roles WHERE id = $1
            "#,
            id
        )
        .fetch_optional(pool)
        .await
        .map_err(IdentityError::Database)?;

        Ok(role)
    }

    pub async fn update(&self, pool: &sqlx::PgPool, update: UpdateRole) -> IdentityResult<()> {
        sqlx::query!(
            r#"
            UPDATE roles
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                permissions = COALESCE($3, permissions),
                metadata = COALESCE($4, metadata)
            WHERE id = $5
            "#,
            update.name,
            update.description,
            update.permissions.as_deref(),
            update.metadata,
            self.id,
        )
        .execute(pool)
        .await
        .map_err(IdentityError::Database)?;

        Ok(())
    }

    pub async fn delete(pool: &sqlx::PgPool, id: Uuid) -> IdentityResult<()> {
        sqlx::query!("DELETE FROM roles WHERE id = $1", id)
            .execute(pool)
            .await
            .map_err(IdentityError::Database)?;

        Ok(())
    }
}

impl Policy {
    pub async fn create(pool: &sqlx::PgPool, new_policy: CreatePolicy) -> IdentityResult<Self> {
        let policy = sqlx::query_as!(
            Policy,
            r#"
            INSERT INTO policies (name, description, effect, actions, resources, conditions, metadata, policy_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, description, effect as "effect: PolicyEffect",
                      actions, resources, conditions, metadata,
                      policy_type as "policy_type: PolicyType", created_at, updated_at
            "#,
            new_policy.name,
            new_policy.description,
            new_policy.effect as PolicyEffect,
            &new_policy.actions,
            &new_policy.resources,
            &new_policy.conditions,
            new_policy.metadata,
            new_policy.policy_type as PolicyType,
        )
        .fetch_one(pool)
        .await
        .map_err(IdentityError::Database)?;

        Ok(policy)
    }

    pub async fn find_by_id(pool: &sqlx::PgPool, id: Uuid) -> IdentityResult<Option<Self>> {
        let policy = sqlx::query_as!(
            Policy,
            r#"
            SELECT id, name, description, effect as "effect: PolicyEffect",
                   actions, resources, conditions, metadata,
                   policy_type as "policy_type: PolicyType", created_at, updated_at
            FROM policies WHERE id = $1
            "#,
            id
        )
        .fetch_optional(pool)
        .await
        .map_err(IdentityError::Database)?;

        Ok(policy)
    }

    pub async fn update(&self, pool: &sqlx::PgPool, update: UpdatePolicy) -> IdentityResult<()> {
        sqlx::query!(
            r#"
            UPDATE policies
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                effect = COALESCE($3, effect),
                actions = COALESCE($4, actions),
                resources = COALESCE($5, resources),
                conditions = COALESCE($6, conditions),
                metadata = COALESCE($7, metadata)
            WHERE id = $8
            "#,
            update.name,
            update.description,
            update.effect as Option<PolicyEffect>,
            update.actions.as_deref(),
            update.resources.as_deref(),
            update.conditions.as_deref(),
            update.metadata,
            self.id,
        )
        .execute(pool)
        .await
        .map_err(IdentityError::Database)?;

        Ok(())
    }

    pub async fn delete(pool: &sqlx::PgPool, id: Uuid) -> IdentityResult<()> {
        sqlx::query!("DELETE FROM policies WHERE id = $1", id)
            .execute(pool)
            .await
            .map_err(IdentityError::Database)?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;

    async fn setup() -> sqlx::PgPool {
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/sirsi_test".to_string());
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database");

        sqlx::query!("TRUNCATE roles, policies CASCADE")
            .execute(&pool)
            .await
            .expect("Failed to clear test database");

        pool
    }

    #[tokio::test]
    async fn test_role_crud() {
        let pool = setup().await;

        // Create
        let new_role = CreateRole {
            name: "test_role".to_string(),
            description: Some("Test role".to_string()),
            permissions: vec!["read".to_string(), "write".to_string()],
            metadata: serde_json::json!({}),
            role_type: RoleType::Custom,
        };

        let role = Role::create(&pool, new_role.clone())
            .await
            .expect("Failed to create role");

        assert_eq!(role.name, new_role.name);
        assert_eq!(role.description, new_role.description);
        assert_eq!(role.permissions, new_role.permissions);

        // Read
        let found = Role::find_by_id(&pool, role.id)
            .await
            .expect("Failed to fetch role")
            .expect("Role not found");

        assert_eq!(found.id, role.id);
        assert_eq!(found.name, role.name);

        // Update
        let update = UpdateRole {
            name: Some("updated_role".to_string()),
            description: None,
            permissions: None,
            metadata: None,
        };

        role.update(&pool, update)
            .await
            .expect("Failed to update role");

        let updated = Role::find_by_id(&pool, role.id)
            .await
            .expect("Failed to fetch role")
            .expect("Role not found");

        assert_eq!(updated.name, "updated_role");

        // Delete
        Role::delete(&pool, role.id)
            .await
            .expect("Failed to delete role");

        let not_found = Role::find_by_id(&pool, role.id)
            .await
            .expect("Failed to fetch role");

        assert!(not_found.is_none());
    }

    #[tokio::test]
    async fn test_policy_crud() {
        let pool = setup().await;

        // Create
        let new_policy = CreatePolicy {
            name: "test_policy".to_string(),
            description: Some("Test policy".to_string()),
            effect: PolicyEffect::Allow,
            actions: vec!["read".to_string()],
            resources: vec!["resource:*".to_string()],
            conditions: vec![],
            metadata: serde_json::json!({}),
            policy_type: PolicyType::Resource,
        };

        let policy = Policy::create(&pool, new_policy.clone())
            .await
            .expect("Failed to create policy");

        assert_eq!(policy.name, new_policy.name);
        assert_eq!(policy.description, new_policy.description);
        assert_eq!(policy.actions, new_policy.actions);

        // Read
        let found = Policy::find_by_id(&pool, policy.id)
            .await
            .expect("Failed to fetch policy")
            .expect("Policy not found");

        assert_eq!(found.id, policy.id);
        assert_eq!(found.name, policy.name);

        // Update
        let update = UpdatePolicy {
            name: Some("updated_policy".to_string()),
            description: None,
            effect: None,
            actions: None,
            resources: None,
            conditions: None,
            metadata: None,
        };

        policy.update(&pool, update)
            .await
            .expect("Failed to update policy");

        let updated = Policy::find_by_id(&pool, policy.id)
            .await
            .expect("Failed to fetch policy")
            .expect("Policy not found");

        assert_eq!(updated.name, "updated_policy");

        // Delete
        Policy::delete(&pool, policy.id)
            .await
            .expect("Failed to delete policy");

        let not_found = Policy::find_by_id(&pool, policy.id)
            .await
            .expect("Failed to fetch policy");

        assert!(not_found.is_none());
    }
}
