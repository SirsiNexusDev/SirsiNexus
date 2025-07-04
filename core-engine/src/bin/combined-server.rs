use clap::Parser;
use sirsi_core::server::{start_grpc_server, start_websocket_server};
use tracing::{info, error};
use tracing_subscriber;
use tokio::try_join;

#[derive(Parser)]
#[command(name = "combined-server")]
#[command(about = "Sirsi Nexus Combined gRPC and WebSocket Server")]
struct Cli {
    /// Port to run the gRPC server on
    #[arg(long, default_value_t = 50051)]
    grpc_port: u16,

    /// Port to run the WebSocket server on
    #[arg(long, default_value_t = 8080)]
    websocket_port: u16,

    /// Redis URL for context storage
    #[arg(short, long, default_value = "redis://127.0.0.1:6379")]
    redis_url: String,

    /// Log level
    #[arg(short, long, default_value = "info")]
    log_level: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    // Initialize tracing
    let log_level = cli.log_level.parse().unwrap_or(tracing::Level::INFO);
    tracing_subscriber::fmt()
        .with_max_level(log_level)
        .with_target(false)
        .init();

    info!("🚀 Starting Sirsi Nexus Combined Server");
    info!("📡 gRPC Server will listen on port {}", cli.grpc_port);
    info!("🌐 WebSocket Server will listen on port {}", cli.websocket_port);
    info!("🔄 Redis URL: {}", cli.redis_url);

    // Construct gRPC endpoint for WebSocket server to connect to
    let grpc_endpoint = format!("http://127.0.0.1:{}", cli.grpc_port);

    // Start both servers concurrently
    let result = try_join!(
        start_grpc_server(cli.grpc_port, &cli.redis_url),
        start_websocket_server(cli.websocket_port, grpc_endpoint)
    );

    match result {
        Ok(_) => {
            info!("✅ Both servers shut down gracefully");
            Ok(())
        }
        Err(e) => {
            error!("❌ Server error: {}", e);
            Err(e.into())
        }
    }
}
