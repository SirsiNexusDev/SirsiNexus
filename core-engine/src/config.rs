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
    // CockroachDB-specific settings
    pub sslmode: Option<String>,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            host: "localhost".to_string(),
            port: 26257, // CockroachDB default port
            username: "root".to_string(),
            password: "".to_string(), // CockroachDB default (empty for insecure mode)
            database: "sirsi_nexus".to_string(),
            max_connections: 20,
            ssl_ca_cert: None,
            sslmode: Some("require".to_string()),
        }
    }
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
pub struct RedisConfig {
    pub url: String,
}

impl Default for RedisConfig {
    fn default() -> Self {
        Self {
            url: "redis://127.0.0.1:6379".to_string(),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct AppConfig {
    pub database: DatabaseConfig,
    pub server: ServerConfig,
    pub jwt: JwtConfig,
    pub telemetry: TelemetryConfig,
    pub redis: RedisConfig,
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
