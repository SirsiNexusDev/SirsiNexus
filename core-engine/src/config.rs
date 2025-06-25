use serde::Deserialize;
use std::net::SocketAddr;
use config::ConfigError;

#[derive(Debug, Deserialize)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub database: String,
    pub max_connections: u32,
    pub ssl_ca_cert: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ServerConfig {
    pub http_addr: SocketAddr,
    pub grpc_addr: SocketAddr,
}

#[derive(Debug, Deserialize)]
pub struct JwtConfig {
    pub secret: String,
    pub expiration: i64,  // in minutes
}

#[derive(Debug, Deserialize)]
pub struct TelemetryConfig {
    pub service_name: String,
    pub environment: String,
    pub otlp_endpoint: String,
}

#[derive(Debug, Deserialize)]
pub struct AppConfig {
    pub database: DatabaseConfig,
    pub server: ServerConfig,
    pub jwt: JwtConfig,
    pub telemetry: TelemetryConfig,
}

impl AppConfig {
    pub fn load() -> Result<Self, ConfigError> {
        let mut builder = config::Config::builder()
            .add_source(config::File::with_name("config/default"));

        // Add environment-specific config if RUST_ENV is set
        if let Ok(env) = std::env::var("RUST_ENV") {
            builder = builder.add_source(
                config::File::with_name(&format!("config/{}", env))
                    .required(false)
            );
        }

        // Add environment variables with prefix SIRSI_
        builder = builder.add_source(
            config::Environment::with_prefix("SIRSI")
                .separator("_")
        );

        let config = builder.build()?;
        config.try_deserialize()
    }
}
