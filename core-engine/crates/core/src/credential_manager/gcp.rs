use anyhow::{Result, anyhow};
use std::collections::HashMap;
use crate::credential_manager::types::{ProviderCredentials, CredentialTestResult, GCPCredentials};

/// Test GCP credentials by attempting to authenticate and call a simple GCP API
pub async fn test_gcp_credentials(credentials: &ProviderCredentials) -> Result<CredentialTestResult> {
    if let ProviderCredentials::GCP(gcp_creds) = credentials {
        test_gcp_credentials_impl(gcp_creds).await
    } else {
        Err(anyhow!("Invalid credential type for GCP testing"))
    }
}

async fn test_gcp_credentials_impl(creds: &GCPCredentials) -> Result<CredentialTestResult> {
    // Validate credentials first
    creds.validate()?;

    // Parse the service account JSON
    let service_account_info = parse_service_account_key(&creds.service_account_key)?;
    
    // Test authentication by getting an access token
    let token_result = get_gcp_access_token(&service_account_info).await;

    match token_result {
        Ok(access_token) => {
            // If we got a token, try to call a simple GCP API
            let projects_result = list_gcp_projects(&access_token).await;
            
            match projects_result {
                Ok(projects) => {
                    let mut details = HashMap::new();
                    details.insert("service_account_email".to_string(), 
                        service_account_info.client_email.clone());
                    details.insert("project_id".to_string(), 
                        service_account_info.project_id.clone());
                    details.insert("projects_count".to_string(), projects.len().to_string());
                    
                    if let Some(project_id) = &creds.project_id {
                        details.insert("default_project".to_string(), project_id.clone());
                    }

                    Ok(CredentialTestResult {
                        success: true,
                        message: "GCP credentials are valid and working".to_string(),
                        details: Some(details),
                    })
                }
                Err(err) => {
                    let mut details = HashMap::new();
                    details.insert("error_type".to_string(), "api_error".to_string());
                    details.insert("service_account_email".to_string(), 
                        service_account_info.client_email);
                    
                    Ok(CredentialTestResult {
                        success: false,
                        message: format!("GCP API error: {}", err),
                        details: Some(details),
                    })
                }
            }
        }
        Err(err) => {
            let mut details = HashMap::new();
            details.insert("error_type".to_string(), "authentication_failed".to_string());
            details.insert("service_account_email".to_string(), 
                service_account_info.client_email);

            Ok(CredentialTestResult {
                success: false,
                message: format!("GCP authentication failed: {}", err),
                details: Some(details),
            })
        }
    }
}

#[derive(Debug, serde::Deserialize)]
struct ServiceAccountInfo {
    #[serde(rename = "type")]
    account_type: String,
    project_id: String,
    private_key_id: String,
    private_key: String,
    client_email: String,
    client_id: String,
    auth_uri: String,
    token_uri: String,
    auth_provider_x509_cert_url: String,
    client_x509_cert_url: String,
}

fn parse_service_account_key(json_key: &str) -> Result<ServiceAccountInfo> {
    serde_json::from_str(json_key)
        .map_err(|e| anyhow!("Invalid service account JSON: {}", e))
}

async fn get_gcp_access_token(service_account: &ServiceAccountInfo) -> Result<String> {
    use jsonwebtoken::{encode, Algorithm, Header, EncodingKey};
    use serde::{Deserialize, Serialize};
    use std::time::{SystemTime, UNIX_EPOCH};

    // Create JWT claims for Google OAuth2
    #[derive(Debug, Serialize, Deserialize)]
    struct Claims {
        iss: String,
        scope: String,
        aud: String,
        exp: u64,
        iat: u64,
    }

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let claims = Claims {
        iss: service_account.client_email.clone(),
        scope: "https://www.googleapis.com/auth/cloud-platform".to_string(),
        aud: service_account.token_uri.clone(),
        exp: now + 3600, // 1 hour
        iat: now,
    };

    // Create JWT header
    let header = Header::new(Algorithm::RS256);

    // Parse the private key
    let encoding_key = EncodingKey::from_rsa_pem(service_account.private_key.as_bytes())
        .map_err(|e| anyhow!("Invalid private key: {}", e))?;

    // Sign the JWT
    let jwt = encode(&header, &claims, &encoding_key)
        .map_err(|e| anyhow!("Failed to create JWT: {}", e))?;

    // Exchange JWT for access token
    let client = reqwest::Client::new();
    let params = [
        ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
        ("assertion", &jwt),
    ];

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.post(&service_account.token_uri)
            .form(&params)
            .send()
    ).await
    .map_err(|_| anyhow!("Request timed out"))?
    .map_err(|e| anyhow!("HTTP request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(anyhow!("Token request failed ({}): {}", status, text));
    }

    let json: serde_json::Value = response.json().await
        .map_err(|e| anyhow!("Failed to parse token response: {}", e))?;

    let access_token = json["access_token"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing access token in response"))?
        .to_string();

    Ok(access_token)
}

async fn list_gcp_projects(access_token: &str) -> Result<Vec<String>> {
    use reqwest;
    use serde_json::Value;

    let client = reqwest::Client::new();
    let projects_url = "https://cloudresourcemanager.googleapis.com/v1/projects";

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.get(projects_url)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
    ).await
    .map_err(|_| anyhow!("Request timed out"))?
    .map_err(|e| anyhow!("HTTP request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(anyhow!("API call failed ({}): {}", status, text));
    }

    let json: Value = response.json().await
        .map_err(|e| anyhow!("Failed to parse projects response: {}", e))?;

    let projects = json["projects"]
        .as_array()
        .unwrap_or(&Vec::new())
        .iter()
        .filter_map(|project| {
            project["projectId"].as_str().map(|s| s.to_string())
        })
        .collect();

    Ok(projects)
}

/// List GCP regions for compute instances
pub async fn list_gcp_regions(creds: &GCPCredentials, project_id: &str) -> Result<Vec<String>> {
    let service_account_info = parse_service_account_key(&creds.service_account_key)?;
    let access_token = get_gcp_access_token(&service_account_info).await?;
    
    use reqwest;
    use serde_json::Value;

    let client = reqwest::Client::new();
    let regions_url = format!(
        "https://compute.googleapis.com/compute/v1/projects/{}/regions",
        project_id
    );

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.get(&regions_url)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
    ).await
    .map_err(|_| anyhow!("Request timed out"))?
    .map_err(|e| anyhow!("HTTP request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(anyhow!("API call failed ({}): {}", status, text));
    }

    let json: Value = response.json().await
        .map_err(|e| anyhow!("Failed to parse regions response: {}", e))?;

    let regions = json["items"]
        .as_array()
        .unwrap_or(&Vec::new())
        .iter()
        .filter_map(|region| {
            region["name"].as_str().map(|s| s.to_string())
        })
        .collect();

    Ok(regions)
}

/// List GCP zones in a specific region
pub async fn list_gcp_zones(
    creds: &GCPCredentials,
    project_id: &str,
    region: &str,
) -> Result<Vec<String>> {
    let service_account_info = parse_service_account_key(&creds.service_account_key)?;
    let access_token = get_gcp_access_token(&service_account_info).await?;
    
    use reqwest;
    use serde_json::Value;

    let client = reqwest::Client::new();
    let zones_url = format!(
        "https://compute.googleapis.com/compute/v1/projects/{}/zones",
        project_id
    );

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.get(&zones_url)
            .header("Authorization", format!("Bearer {}", access_token))
            .query(&[("filter", &format!("region eq .*{}", region))])
            .send()
    ).await
    .map_err(|_| anyhow!("Request timed out"))?
    .map_err(|e| anyhow!("HTTP request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(anyhow!("API call failed ({}): {}", status, text));
    }

    let json: Value = response.json().await
        .map_err(|e| anyhow!("Failed to parse zones response: {}", e))?;

    let zones = json["items"]
        .as_array()
        .unwrap_or(&Vec::new())
        .iter()
        .filter_map(|zone| {
            zone["name"].as_str().map(|s| s.to_string())
        })
        .collect();

    Ok(zones)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_invalid_service_account() {
        let invalid_json = "{ invalid json }";
        let result = parse_service_account_key(invalid_json);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_valid_service_account() {
        let valid_json = r#"{
            "type": "service_account",
            "project_id": "test-project",
            "private_key_id": "key-id",
            "private_key": "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n",
            "client_email": "test@test-project.iam.gserviceaccount.com",
            "client_id": "123456789",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/test%40test-project.iam.gserviceaccount.com"
        }"#;

        let result = parse_service_account_key(valid_json);
        assert!(result.is_ok());
        
        let info = result.unwrap();
        assert_eq!(info.project_id, "test-project");
        assert_eq!(info.client_email, "test@test-project.iam.gserviceaccount.com");
    }

    #[tokio::test]
    async fn test_invalid_gcp_credentials() {
        let invalid_creds = GCPCredentials {
            service_account_key: "{ invalid json }".to_string(),
            project_id: Some("test-project".to_string()),
            region: Some("us-central1".to_string()),
        };

        let provider_creds = ProviderCredentials::GCP(invalid_creds);
        let result = test_gcp_credentials(&provider_creds).await;
        
        // Should fail during validation
        assert!(result.is_err());
    }

    #[test]
    fn test_gcp_credentials_validation() {
        let invalid_creds = GCPCredentials {
            service_account_key: "".to_string(),
            project_id: None,
            region: None,
        };

        assert!(invalid_creds.validate().is_err());

        let valid_creds = GCPCredentials {
            service_account_key: r#"{"type": "service_account", "project_id": "test"}"#.to_string(),
            project_id: Some("test-project".to_string()),
            region: Some("us-central1".to_string()),
        };

        assert!(valid_creds.validate().is_ok());
    }
}
