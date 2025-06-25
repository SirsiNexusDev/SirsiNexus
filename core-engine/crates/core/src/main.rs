mod api;
mod config;
mod db;
mod error;
mod models;
mod telemetry;

use anyhow::Result;
use std::net::SocketAddr;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<()> {
    // Load configuration
    let config = config::Settings::new()?;

    // Initialize telemetry
    telemetry::init_telemetry()?;

    // Connect to database
    let pool = db::create_db_pool(&config.database_url).await?;

    // Create API router
    let app = api::create_router(pool.clone());

    // Start HTTP server
    let addr = SocketAddr::from(([127, 0, 0, 1], config.http_port));
    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Starting HTTP server on {}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
