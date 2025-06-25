use anyhow::Result;
use opentelemetry::{
    sdk::{
metrics::selectors::exact,
        resource::{OsResourceDetector, ProcessResourceDetector, ResourceDetector},
    },
    KeyValue,
};
use opentelemetry_otlp::WithExportConfig;
use tracing_opentelemetry;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub fn init_telemetry() -> Result<()> {
    let service_name = env!("CARGO_PKG_NAME");

    // Configure OTLP tracer
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic())
        .install_batch(opentelemetry::runtime::Tokio)?;

    // Configure OTLP metrics
    let meter = opentelemetry_otlp::new_pipeline()
        .metrics(opentelemetry::runtime::Tokio)
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_timeout(std::time::Duration::from_secs(5)),
        )
        .with_resource(create_resource())
.with_aggregation_selector(selectors::simple::Selector::Exact)
        .build()?;

    // Create tracing subscriber with OTLP layer
    let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);
    let env_filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("info"))?;

    tracing_subscriber::registry()
        .with(env_filter)
        .with(telemetry)
        .init();

    Ok(())
}

fn create_resource() -> opentelemetry::sdk::Resource {
    let os_detector = OsResourceDetector::new();
    let process_detector = ProcessResourceDetector::new();

    opentelemetry::sdk::Resource::from_detectors(
        std::time::Duration::from_secs(0),
        vec![Box::new(os_detector), Box::new(process_detector)],
    )
    .merge(&opentelemetry::sdk::Resource::new(vec![KeyValue::new(
        "service.name",
        env!("CARGO_PKG_NAME")
    )]))
}
