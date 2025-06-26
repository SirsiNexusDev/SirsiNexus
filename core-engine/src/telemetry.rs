use opentelemetry::{global, KeyValue};
use opentelemetry_sdk::{runtime, trace, Resource};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_semantic_conventions as semconv;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

use crate::config::AppConfig;
use crate::error::{Error, Result};

pub struct TelemetryGuard;

pub async fn init(config: &AppConfig) -> Result<()> {
    let resource = Resource::new(vec![
        KeyValue::new(semconv::resource::SERVICE_NAME, config.telemetry.service_name.clone()),
        KeyValue::new(semconv::resource::SERVICE_VERSION, env!("CARGO_PKG_VERSION")),
        KeyValue::new(semconv::resource::DEPLOYMENT_ENVIRONMENT, config.telemetry.environment.clone()),
    ]);

    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(&config.telemetry.otlp_endpoint)
        )
        .with_trace_config(
            trace::config()
                .with_resource(resource)
                .with_sampler(trace::Sampler::AlwaysOn)
        )
        .install_batch(runtime::Tokio)
        .map_err(|e| Error::Internal(e.to_string()))?;

    let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);
    
    tracing_subscriber::registry()
        .with(telemetry)
        .with(EnvFilter::from_default_env())
        .try_init()
        .map_err(|e| Error::Internal(e.to_string()))?;

    Ok(())
}

impl Drop for TelemetryGuard {
    fn drop(&mut self) {
        global::shutdown_tracer_provider();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::{AppConfig, TelemetryConfig, DatabaseConfig, ServerConfig, JwtConfig, RedisConfig};
    use std::net::{IpAddr, Ipv4Addr, SocketAddr};

    #[tokio::test]
    async fn test_telemetry_init() {
        let config = AppConfig {
            database: DatabaseConfig {
                host: "localhost".to_string(),
                port: 26257,
                username: "root".to_string(),
                password: "".to_string(),
                database: "test".to_string(),
                max_connections: 5,
                ssl_ca_cert: None,
                sslmode: Some("disable".to_string()),
            },
            server: ServerConfig {
                http_addr: SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 8080),
                grpc_addr: SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 50051),
            },
            jwt: JwtConfig {
                secret: "test-secret".to_string(),
                expiration: 60,
            },
            telemetry: TelemetryConfig {
                service_name: "test-service".to_string(),
                environment: "test".to_string(),
                otlp_endpoint: "http://localhost:4317".to_string(),
            },
            redis: RedisConfig {
                url: "redis://127.0.0.1:6379".to_string(),
            },
        };

        let result = init(&config).await;
        assert!(result.is_ok());
    }
}
