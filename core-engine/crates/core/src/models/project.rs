use serde::{Deserialize, Serialize};
use sqlx::{types::time::OffsetDateTime, PgPool};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub status: ProjectStatus,
    pub owner_id: Uuid,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProject {
    pub name: String,
    pub description: String,
    pub status: ProjectStatus,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "project_status", rename_all = "lowercase")]
pub enum ProjectStatus {
    Active,
    Archived,
    Completed,
}

impl Project {
    pub async fn create(pool: &PgPool, new_project: CreateProject, owner_id: Uuid) -> sqlx::Result<Self> {
        let project = sqlx::query_as!(Self,
            r#"INSERT INTO projects (name, description, status, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, description, status as "status: ProjectStatus", owner_id, created_at, updated_at"#,
            new_project.name,
            new_project.description,
            new_project.status as ProjectStatus,
            owner_id,
        )
        .fetch_one(pool)
        .await?;

        Ok(project)
    }

    pub async fn get(pool: &PgPool, id: Uuid) -> sqlx::Result<Self> {
        let project = sqlx::query_as!(Self,
            r#"SELECT id, name, description, status as "status: ProjectStatus", owner_id, created_at, updated_at
            FROM projects WHERE id = $1"#,
            id
        )
        .fetch_one(pool)
        .await?;

        Ok(project)
    }

    pub async fn list(pool: &PgPool, owner_id: Uuid) -> sqlx::Result<Vec<Self>> {
        let projects = sqlx::query_as!(Self,
            r#"SELECT id, name, description, status as "status: ProjectStatus", owner_id, created_at, updated_at
            FROM projects WHERE owner_id = $1
            ORDER BY created_at DESC"#,
            owner_id
        )
        .fetch_all(pool)
        .await?;

        Ok(projects)
    }

    pub async fn update(&self, pool: &PgPool) -> sqlx::Result<()> {
        sqlx::query!(
            "UPDATE projects
            SET name = $1, description = $2, status = $3
            WHERE id = $4",
            self.name,
            self.description,
            self.status as ProjectStatus,
            self.id
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> sqlx::Result<()> {
        sqlx::query!("DELETE FROM projects WHERE id = $1", id)
            .execute(pool)
            .await?;

        Ok(())
    }
}
