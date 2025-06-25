use opentelemetry::{
    global,
    sdk::{
        metrics::selectors,
        resource::{OsResourceDetector, ProcessResourceDetector, ResourceDetector},
        trace, Resource,
    },
    KeyValue,
};
use opentelemetry_otlp::{WithExportConfig, OTEL_EXPORTER_OTLP_ENDPOINT};
use opentelemetry_semantic_conventions::resource::{DEPLOYMENT_ENVIRONMENT, SERVICE_NAME, SERVICE_VERSION};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Layer};

use crate::config::AppConfig;

pub fn init_telemetry(config: &AppConfig) -> anyhow::Result<()> {
    // Configure OpenTelemetry
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(&config.telemetry.tracing_endpoint),
        )
        .with_trace_config(trace::config().with_resource(create_resource()))
        .install_batch(opentelemetry::runtime::Tokio)?;

    let meter = opentelemetry_otlp::new_pipeline()
        .metrics()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(&config.telemetry.tracing_endpoint),
        )
        .with_resource(create_resource())
        .with_aggregator_selector(selectors::simple::Selector::Exact)
        .build()?;

    // Configure tracing subscriber
    let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);
    
    let env_filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new(&config.telemetry.log_level))
        .unwrap_or_else(|_| EnvFilter::new("info"));

    tracing_subscriber::registry()
        .with(telemetry)
        .with(
            tracing_subscriber::fmt::layer()
                .with_target(false)
                .compact(),
        )
        .with(env_filter)
        .try_init()?;

    Ok(())
}

fn create_resource() -> Resource {
    Resource::from_detectors(
        std::time::Duration::from_secs(3),
        vec![
            Box::new(OsResourceDetector),
            Box::new(ProcessResourceDetector),
        ],
    )
    .merge(&Resource::new(vec![
        KeyValue::new(SERVICE_NAME, "sirsi-core"),
        KeyValue::new(SERVICE_VERSION, env!("CARGO_PKG_VERSION")),
        KeyValue::new(DEPLOYMENT_ENVIRONMENT, std::env::var("RUN_MODE").unwrap_or_else(|_| "development".into())),
    ]))
}

pub fn shutdown_telemetry() {
    global::shutdown_tracer_provider();
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::TelemetryConfig;

    #[test]
    fn test_create_resource() {
        let resource = create_resource();
        let attributes = resource.into_attributes();

        assert!(attributes.iter().any(|kv| kv.key == SERVICE_NAME));
        assert!(attributes.iter().any(|kv| kv.key == SERVICE_VERSION));
        assert!(attributes.iter().any(|kv| kv.key == DEPLOYMENT_ENVIRONMENT));
    }
}
