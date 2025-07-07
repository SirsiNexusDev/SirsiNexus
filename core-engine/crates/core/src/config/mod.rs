pub mod db;

use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub http_port: u16,
    pub log_level: String,
}

impl Config {
    pub fn from_env() -> Result<Self, config::ConfigError> {
        let cfg = config::Config::builder()
            .set_default("http_port", 8080)?
            .set_default("log_level", "info")?
            .add_source(config::Environment::default())
            .build()?;
        
        cfg.try_deserialize()
    }
}
