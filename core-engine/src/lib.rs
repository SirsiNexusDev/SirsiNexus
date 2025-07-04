pub mod agent;
pub mod ai;
pub mod api;
pub mod audit;
pub mod auth;
pub mod compliance;
pub mod config;
pub mod db;
pub mod error;
pub mod middleware;
pub mod models;
pub mod protos;
pub mod security;
pub mod server;
pub mod telemetry;

// Re-export commonly used types for easier access in tests
pub use config::AppConfig;
pub use server::{start_grpc_server};
