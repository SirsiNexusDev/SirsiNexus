use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};
use std::time::Duration;
use tracing::info;

pub async fn create_db_pool(database_url: &str) -> Result<Pool<Postgres>, sqlx::Error> {
    info!("Creating database pool...");
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .min_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .idle_timeout(Duration::from_secs(600))
        .connect(database_url)
        .await?;
        
    info!("Running database migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;
    
    info!("Database setup complete");
    Ok(pool)
}
