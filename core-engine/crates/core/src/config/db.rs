use anyhow::Result;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use sqlx::PgPool;
use std::time::Duration;
use std::str::FromStr;

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let options = PgConnectOptions::from_str(database_url)?
        .application_name("sirsidx")
        .statement_cache_capacity(500);

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .idle_timeout(Duration::from_secs(600))
        .connect_with(options)
        .await?;

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;

    Ok(pool)
}
