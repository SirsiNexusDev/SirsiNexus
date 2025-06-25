use serde::{Deserialize, Serialize};
use sqlx::{types::time::OffsetDateTime, PgPool};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Resource {
    pub id: Uuid,
    pub name: String,
    pub type_: String,
    pub data: serde_json::Value,
    pub owner_id: Uuid,
    pub project_id: Uuid,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Deserialize)]
pub struct CreateResource {
    pub name: String,
    pub type_: String,
    pub data: serde_json::Value,
    pub project_id: Uuid,
}

impl Resource {
    pub async fn create(pool: &PgPool, new_resource: CreateResource, owner_id: Uuid) -> sqlx::Result<Self> {
        let resource = sqlx::query_as!(Self,
            r#"INSERT INTO resources (name, type, data, owner_id, project_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, type as "type_", data, owner_id, project_id, created_at, updated_at"#,
            new_resource.name,
            new_resource.type_,
            new_resource.data,
            owner_id,
            new_resource.project_id,
        )
        .fetch_one(pool)
        .await?;

        Ok(resource)
    }

    pub async fn get(pool: &PgPool, id: Uuid) -> sqlx::Result<Self> {
        let resource = sqlx::query_as!(Self,
            r#"SELECT id, name, type as "type_", data, owner_id, project_id, created_at, updated_at
            FROM resources WHERE id = $1"#,
            id
        )
        .fetch_one(pool)
        .await?;

        Ok(resource)
    }

    pub async fn list(pool: &PgPool, owner_id: Uuid) -> sqlx::Result<Vec<Self>> {
        let resources = sqlx::query_as!(Self,
            r#"SELECT id, name, type as "type_", data, owner_id, project_id, created_at, updated_at
            FROM resources WHERE owner_id = $1
            ORDER BY created_at DESC"#,
            owner_id
        )
        .fetch_all(pool)
        .await?;

        Ok(resources)
    }

    pub async fn update(&self, pool: &PgPool) -> sqlx::Result<()> {
        sqlx::query!(
            r#"UPDATE resources
            SET name = $1, type = $2, data = $3
            WHERE id = $4"#,
            self.name,
            self.type_,
            self.data,
            self.id
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> sqlx::Result<()> {
        sqlx::query!("DELETE FROM resources WHERE id = $1", id)
            .execute(pool)
            .await?;

        Ok(())
    }
}
