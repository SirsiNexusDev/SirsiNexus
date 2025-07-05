pub mod agent;
pub mod ai;
pub mod api;
pub mod audit;
pub mod auth;
pub mod communication;
pub mod compliance;
pub mod components;
pub mod config;
pub mod error;
pub mod hypervisor;
pub mod middleware;
pub mod models;
pub mod security;
pub mod server;
pub mod telemetry;
pub mod mcp;

// Alias for backward compatibility
pub use proto as protos;

// Re-export commonly used types for easier access in tests
pub use config::AppConfig;
pub use server::{start_grpc_server};

// Re-export protobuf types
pub use proto::sirsi::agent::v1::{agent_service_server, agent_service_client};
