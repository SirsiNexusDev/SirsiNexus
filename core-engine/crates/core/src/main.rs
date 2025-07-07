mod api;
mod auth;
mod config;
mod credential_manager;
mod db;
mod error;
mod middleware;
mod models;
// mod telemetry; // Disabled temporarily

use anyhow::Result;
use std::net::SocketAddr;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    // Load configuration
    let config = config::Config::from_env()?;

    // Initialize telemetry - disabled for now
    // telemetry::init_telemetry()?;

    // Connect to database
    let pool = db::create_db_pool(&config.database_url).await?;
    
    // Initialize credential management tables
    credential_manager::initialize_tables(&pool).await?;

    // Create API router
    let app = api::create_router(pool.clone());

    // Start HTTP server
    let addr = SocketAddr::from(([127, 0, 0, 1], config.http_port));
    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Starting HTTP server on {}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
