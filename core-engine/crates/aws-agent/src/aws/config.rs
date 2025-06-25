use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwsConfig {
    pub region: String,
    #[serde(default)]
    pub profile: Option<String>,
    #[serde(default)]
    pub credentials: Option<AwsCredentials>,
    #[serde(default)]
    pub endpoints: HashMap<String, String>,
    #[serde(default)]
    pub assume_role: Option<AssumeRoleConfig>,
    #[serde(default)]
    pub max_retries: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwsCredentials {
    pub access_key_id: String,
    pub secret_access_key: String,
    #[serde(default)]
    pub session_token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssumeRoleConfig {
    pub role_arn: String,
    pub external_id: Option<String>,
    pub session_name: Option<String>,
    pub duration_seconds: Option<i32>,
}

impl Default for AwsConfig {
    fn default() -> Self {
        Self {
            region: "us-east-1".to_string(),
            profile: None,
            credentials: None,
            endpoints: HashMap::new(),
            assume_role: None,
            max_retries: Some(3),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_serialization() {
        let config = AwsConfig {
            region: "us-west-2".to_string(),
            profile: Some("default".to_string()),
            credentials: Some(AwsCredentials {
                access_key_id: "test_key".to_string(),
                secret_access_key: "test_secret".to_string(),
                session_token: None,
            }),
            endpoints: {
                let mut map = HashMap::new();
                map.insert("s3".to_string(), "http://localhost:4566".to_string());
                map
            },
            assume_role: Some(AssumeRoleConfig {
                role_arn: "arn:aws:iam::123456789012:role/TestRole".to_string(),
                external_id: None,
                session_name: Some("TestSession".to_string()),
                duration_seconds: Some(3600),
            }),
            max_retries: Some(5),
        };

        let json = serde_json::to_string(&config).unwrap();
        let deserialized: AwsConfig = serde_json::from_str(&json).unwrap();

        assert_eq!(config.region, deserialized.region);
        assert_eq!(config.profile, deserialized.profile);
        assert_eq!(config.max_retries, deserialized.max_retries);
        assert_eq!(
            config.endpoints.get("s3"),
            deserialized.endpoints.get("s3")
        );
    }

    #[test]
    fn test_default_config() {
        let config = AwsConfig::default();
        assert_eq!(config.region, "us-east-1");
        assert_eq!(config.max_retries, Some(3));
        assert!(config.profile.is_none());
        assert!(config.credentials.is_none());
        assert!(config.assume_role.is_none());
        assert!(config.endpoints.is_empty());
    }
}
