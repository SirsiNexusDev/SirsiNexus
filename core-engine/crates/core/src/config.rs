use config::{Config, ConfigError, Environment, File};
use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize)]
pub struct Settings {
    pub database_url: String,
    pub http_port: u16,
    pub grpc_port: u16,
    pub jwt_secret: String,
}

impl Settings {
    pub fn new() -> Result<Self, ConfigError> {
        let run_mode = env::var("RUN_MODE").unwrap_or_else(|_| "development".into());

        let s = Config::builder()
            .add_source(File::with_name("config/default"))
            .add_source(File::with_name(&format!("config/{}", run_mode)).required(false))
            .add_source(Environment::with_prefix("app"))
            .build()?;

        s.try_deserialize()
    }
}
