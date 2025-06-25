use sqlx::postgres::{PgPool, PgPoolOptions};
use std::time::Duration;
use crate::config::DatabaseConfig;

pub type DbPool = PgPool;

pub async fn create_pool(config: &DatabaseConfig) -> Result<DbPool, sqlx::Error> {
    let database_url = format!(
        "postgres://{}:{}@{}:{}/{}",
        config.username,
        config.password,
        config.host,
        config.port,
        config.database
    );
    PgPoolOptions::new()
        .max_connections(config.max_connections as u32)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&database_url)
        .await
}
