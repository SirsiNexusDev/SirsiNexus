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
        let mut cfg = config::Config::default();
        
        // Add in defaults
        cfg.set_default("http_port", 8080)?;
        cfg.set_default("log_level", "info")?;
        
        // Layer on environment variables
        cfg.merge(config::Environment::default())?;
        
        cfg.try_into()
    }
}
