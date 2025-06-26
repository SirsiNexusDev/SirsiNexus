pub mod agent;
pub mod api;
pub mod config;
pub mod db;
pub mod error;
pub mod middleware;
pub mod models;
pub mod proto;
pub mod server;
pub mod telemetry;

// Re-export commonly used types for easier access in tests
pub use config::AppConfig;
pub use server::{start_grpc_server};
