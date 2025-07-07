use anyhow::{Result, anyhow};
use std::collections::HashMap;
use crate::credential_manager::types::{ProviderCredentials, CredentialTestResult, AzureCredentials};

/// Test Azure credentials by attempting to authenticate and call Azure Resource Manager
pub async fn test_azure_credentials(credentials: &ProviderCredentials) -> Result<CredentialTestResult> {
    if let ProviderCredentials::Azure(azure_creds) = credentials {
        test_azure_credentials_impl(azure_creds).await
    } else {
        Err(anyhow!("Invalid credential type for Azure testing"))
    }
}

async fn test_azure_credentials_impl(creds: &AzureCredentials) -> Result<CredentialTestResult> {
    // Validate credentials first
    creds.validate()?;

    // Test authentication by getting an access token
    let token_result = get_azure_access_token(creds).await;

    match token_result {
        Ok(token_info) => {
            // If we got a token, try to call a simple Azure API
            let subscriptions_result = list_azure_subscriptions(creds, &token_info.access_token).await;
            
            match subscriptions_result {
                Ok(subscriptions) => {
                    let mut details = HashMap::new();
                    details.insert("tenant_id".to_string(), creds.tenant_id.clone());
                    details.insert("client_id".to_string(), creds.client_id.clone());
                    details.insert("token_type".to_string(), token_info.token_type);
                    details.insert("subscriptions_count".to_string(), subscriptions.len().to_string());
                    
                    if let Some(subscription_id) = &creds.subscription_id {
                        details.insert("default_subscription".to_string(), subscription_id.clone());
                    }

                    Ok(CredentialTestResult {
                        success: true,
                        message: "Azure credentials are valid and working".to_string(),
                        details: Some(details),
                    })
                }
                Err(err) => {
                    let mut details = HashMap::new();
                    details.insert("error_type".to_string(), "api_error".to_string());
                    details.insert("tenant_id".to_string(), creds.tenant_id.clone());
                    
                    Ok(CredentialTestResult {
                        success: false,
                        message: format!("Azure API error: {}", err),
                        details: Some(details),
                    })
                }
            }
        }
        Err(err) => {
            let mut details = HashMap::new();
            details.insert("error_type".to_string(), "authentication_failed".to_string());
            details.insert("tenant_id".to_string(), creds.tenant_id.clone());
            details.insert("client_id".to_string(), creds.client_id.clone());

            Ok(CredentialTestResult {
                success: false,
                message: format!("Azure authentication failed: {}", err),
                details: Some(details),
            })
        }
    }
}

#[derive(Debug)]
struct AzureTokenInfo {
    access_token: String,
    token_type: String,
    expires_in: u64,
}

async fn get_azure_access_token(creds: &AzureCredentials) -> Result<AzureTokenInfo> {
    use reqwest;
    use serde_json::Value;

    let client = reqwest::Client::new();
    let token_url = format!("https://login.microsoftonline.com/{}/oauth2/v2.0/token", creds.tenant_id);

    let params = [
        ("client_id", creds.client_id.as_str()),
        ("client_secret", creds.client_secret.as_str()),
        ("scope", "https://management.azure.com/.default"),
        ("grant_type", "client_credentials"),
    ];

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.post(&token_url)
            .form(&params)
            .send()
    ).await
    .map_err(|_| anyhow!("Request timed out"))?
    .map_err(|e| anyhow!("HTTP request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(anyhow!("Authentication failed ({}): {}", status, text));
    }

    let json: Value = response.json().await
        .map_err(|e| anyhow!("Failed to parse token response: {}", e))?;

    let access_token = json["access_token"]
        .as_str()
        .ok_or_else(|| anyhow!("Missing access token in response"))?
        .to_string();

    let token_type = json["token_type"]
        .as_str()
        .unwrap_or("Bearer")
        .to_string();

    let expires_in = json["expires_in"]
        .as_u64()
        .unwrap_or(3600);

    Ok(AzureTokenInfo {
        access_token,
        token_type,
        expires_in,
    })
}

async fn list_azure_subscriptions(creds: &AzureCredentials, access_token: &str) -> Result<Vec<String>> {
    use reqwest;
    use serde_json::Value;

    let client = reqwest::Client::new();
    let subscriptions_url = "https://management.azure.com/subscriptions?api-version=2020-01-01";

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.get(subscriptions_url)
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
        .map_err(|e| anyhow!("Failed to parse subscriptions response: {}", e))?;

    let subscriptions = json["value"]
        .as_array()
        .ok_or_else(|| anyhow!("Invalid subscriptions response format"))?
        .iter()
        .filter_map(|sub| {
            sub["subscriptionId"].as_str().map(|s| s.to_string())
        })
        .collect();

    Ok(subscriptions)
}

/// List Azure resource groups for a specific subscription
pub async fn list_azure_resource_groups(
    creds: &AzureCredentials,
    subscription_id: &str,
) -> Result<Vec<String>> {
    let token_info = get_azure_access_token(creds).await?;
    
    use reqwest;
    use serde_json::Value;

    let client = reqwest::Client::new();
    let rg_url = format!(
        "https://management.azure.com/subscriptions/{}/resourcegroups?api-version=2021-04-01",
        subscription_id
    );

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.get(&rg_url)
            .header("Authorization", format!("Bearer {}", token_info.access_token))
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
        .map_err(|e| anyhow!("Failed to parse resource groups response: {}", e))?;

    let resource_groups = json["value"]
        .as_array()
        .ok_or_else(|| anyhow!("Invalid resource groups response format"))?
        .iter()
        .filter_map(|rg| {
            rg["name"].as_str().map(|s| s.to_string())
        })
        .collect();

    Ok(resource_groups)
}

/// List Azure locations/regions
pub async fn list_azure_locations(creds: &AzureCredentials, subscription_id: &str) -> Result<Vec<String>> {
    let token_info = get_azure_access_token(creds).await?;
    
    use reqwest;
    use serde_json::Value;

    let client = reqwest::Client::new();
    let locations_url = format!(
        "https://management.azure.com/subscriptions/{}/locations?api-version=2020-01-01",
        subscription_id
    );

    let timeout = tokio::time::Duration::from_secs(10);
    let response = tokio::time::timeout(
        timeout,
        client.get(&locations_url)
            .header("Authorization", format!("Bearer {}", token_info.access_token))
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
        .map_err(|e| anyhow!("Failed to parse locations response: {}", e))?;

    let locations = json["value"]
        .as_array()
        .ok_or_else(|| anyhow!("Invalid locations response format"))?
        .iter()
        .filter_map(|loc| {
            loc["name"].as_str().map(|s| s.to_string())
        })
        .collect();

    Ok(locations)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_invalid_azure_credentials() {
        let invalid_creds = AzureCredentials {
            client_id: "00000000-0000-0000-0000-000000000000".to_string(),
            client_secret: "invalid_secret".to_string(),
            tenant_id: "00000000-0000-0000-0000-000000000000".to_string(),
            subscription_id: None,
            resource_group: None,
        };

        let provider_creds = ProviderCredentials::Azure(invalid_creds);
        let result = test_azure_credentials(&provider_creds).await.unwrap();
        
        assert!(!result.success);
        assert!(result.message.contains("failed") || result.message.contains("error"));
    }

    #[test]
    fn test_azure_credentials_validation() {
        let invalid_creds = AzureCredentials {
            client_id: "invalid-uuid".to_string(),
            client_secret: "secret".to_string(),
            tenant_id: "00000000-0000-0000-0000-000000000000".to_string(),
            subscription_id: None,
            resource_group: None,
        };

        assert!(invalid_creds.validate().is_err());

        let valid_creds = AzureCredentials {
            client_id: "12345678-1234-1234-1234-123456789012".to_string(),
            client_secret: "client_secret_value".to_string(),
            tenant_id: "87654321-4321-4321-4321-210987654321".to_string(),
            subscription_id: Some("11111111-1111-1111-1111-111111111111".to_string()),
            resource_group: Some("my-resource-group".to_string()),
        };

        assert!(valid_creds.validate().is_ok());
    }
}
