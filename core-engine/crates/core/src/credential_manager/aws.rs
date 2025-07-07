use anyhow::{Result, anyhow};
use std::collections::HashMap;
use crate::credential_manager::types::{ProviderCredentials, CredentialTestResult, AWSCredentials};

/// Test AWS credentials by attempting to call STS GetCallerIdentity
pub async fn test_aws_credentials(credentials: &ProviderCredentials) -> Result<CredentialTestResult> {
    if let ProviderCredentials::AWS(aws_creds) = credentials {
        test_aws_credentials_impl(aws_creds).await
    } else {
        Err(anyhow!("Invalid credential type for AWS testing"))
    }
}

async fn test_aws_credentials_impl(creds: &AWSCredentials) -> Result<CredentialTestResult> {
    use aws_config::{BehaviorVersion, Region};
    use aws_credential_types::Credentials;
    use aws_sdk_sts::Client as StsClient;

    // Validate credentials first
    creds.validate()?;

    // Create AWS credentials
    let aws_creds = if let Some(session_token) = &creds.session_token {
        Credentials::new(
            &creds.access_key_id,
            &creds.secret_access_key,
            Some(session_token.clone()),
            None,
            "sirsi-nexus",
        )
    } else {
        Credentials::new(
            &creds.access_key_id,
            &creds.secret_access_key,
            None,
            None,
            "sirsi-nexus",
        )
    };

    // Set up AWS config
    let region = if let Some(region) = &creds.region {
        Region::new(region.clone())
    } else {
        Region::new("us-east-1")
    };

    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region.clone())
        .credentials_provider(aws_creds)
        .load()
        .await;

    let sts_client = StsClient::new(&config);

    // Test the credentials by calling GetCallerIdentity
    let timeout = tokio::time::Duration::from_secs(10);
    let result = tokio::time::timeout(timeout, sts_client.get_caller_identity().send()).await;

    match result {
        Ok(Ok(identity)) => {
            let mut details = HashMap::new();
            
            if let Some(account) = identity.account() {
                details.insert("account_id".to_string(), account.to_string());
            }
            if let Some(arn) = identity.arn() {
                details.insert("user_arn".to_string(), arn.to_string());
            }
            if let Some(user_id) = identity.user_id() {
                details.insert("user_id".to_string(), user_id.to_string());
            }
            details.insert("region".to_string(), region.to_string());

            Ok(CredentialTestResult {
                success: true,
                message: "AWS credentials are valid and working".to_string(),
                details: Some(details),
            })
        }
        Ok(Err(err)) => {
            let error_msg = format!("AWS API error: {}", err);
            let mut details = HashMap::new();
            details.insert("error_type".to_string(), "api_error".to_string());
            details.insert("region".to_string(), region.to_string());

            Ok(CredentialTestResult {
                success: false,
                message: error_msg,
                details: Some(details),
            })
        }
        Err(_) => {
            let mut details = HashMap::new();
            details.insert("error_type".to_string(), "timeout".to_string());
            details.insert("region".to_string(), region.to_string());

            Ok(CredentialTestResult {
                success: false,
                message: "Request timed out - check network connectivity".to_string(),
                details: Some(details),
            })
        }
    }
}

/// Test AWS credentials with role assumption
pub async fn test_aws_role_assumption(
    creds: &AWSCredentials,
    role_arn: &str,
    session_name: &str,
    external_id: Option<&str>,
) -> Result<CredentialTestResult> {
    use aws_config::{BehaviorVersion, Region};
    use aws_credential_types::Credentials;
    use aws_sdk_sts::Client as StsClient;

    // Validate credentials first
    creds.validate()?;

    // Create AWS credentials
    let aws_creds = Credentials::new(
        &creds.access_key_id,
        &creds.secret_access_key,
        creds.session_token.clone(),
        None,
        "sirsi-nexus",
    );

    // Set up AWS config
    let region = if let Some(region) = &creds.region {
        Region::new(region.clone())
    } else {
        Region::new("us-east-1")
    };

    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region.clone())
        .credentials_provider(aws_creds)
        .load()
        .await;

    let sts_client = StsClient::new(&config);

    // Attempt to assume the role
    let mut assume_role_request = sts_client
        .assume_role()
        .role_arn(role_arn)
        .role_session_name(session_name);

    if let Some(external_id) = external_id {
        assume_role_request = assume_role_request.external_id(external_id);
    }

    let timeout = tokio::time::Duration::from_secs(15);
    let result = tokio::time::timeout(timeout, assume_role_request.send()).await;

    match result {
        Ok(Ok(assume_role_output)) => {
            let mut details = HashMap::new();
            
            if let Some(credentials) = assume_role_output.credentials() {
                details.insert("assumed_role_id".to_string(), 
                    credentials.access_key_id().to_string());
            }
            
            if let Some(assumed_role_user) = assume_role_output.assumed_role_user() {
                if let arn = assumed_role_user.arn() {
                    details.insert("assumed_role_arn".to_string(), arn.to_string());
                }
                if let id = assumed_role_user.assumed_role_id() {
                    details.insert("assumed_role_user_id".to_string(), id.to_string());
                }
            }
            
            details.insert("region".to_string(), region.to_string());
            details.insert("role_arn".to_string(), role_arn.to_string());

            Ok(CredentialTestResult {
                success: true,
                message: "Successfully assumed AWS role".to_string(),
                details: Some(details),
            })
        }
        Ok(Err(err)) => {
            let error_msg = format!("Failed to assume AWS role: {}", err);
            let mut details = HashMap::new();
            details.insert("error_type".to_string(), "role_assumption_failed".to_string());
            details.insert("role_arn".to_string(), role_arn.to_string());
            details.insert("region".to_string(), region.to_string());

            Ok(CredentialTestResult {
                success: false,
                message: error_msg,
                details: Some(details),
            })
        }
        Err(_) => {
            let mut details = HashMap::new();
            details.insert("error_type".to_string(), "timeout".to_string());
            details.insert("role_arn".to_string(), role_arn.to_string());
            details.insert("region".to_string(), region.to_string());

            Ok(CredentialTestResult {
                success: false,
                message: "Role assumption request timed out".to_string(),
                details: Some(details),
            })
        }
    }
}

/// List available AWS regions for the credentials
pub async fn list_aws_regions(creds: &AWSCredentials) -> Result<Vec<String>> {
    use aws_config::{BehaviorVersion, Region};
    use aws_credential_types::Credentials;
    use aws_sdk_ec2::Client as Ec2Client;

    // Create AWS credentials
    let aws_creds = Credentials::new(
        &creds.access_key_id,
        &creds.secret_access_key,
        creds.session_token.clone(),
        None,
        "sirsi-nexus",
    );

    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(Region::new("us-east-1"))
        .credentials_provider(aws_creds)
        .load()
        .await;

    let ec2_client = Ec2Client::new(&config);

    let timeout = tokio::time::Duration::from_secs(10);
    let result = tokio::time::timeout(
        timeout,
        ec2_client.describe_regions().send()
    ).await;

    match result {
        Ok(Ok(regions_output)) => {
            let regions = regions_output
                .regions()
                .iter()
                .filter_map(|region| region.region_name().map(|s| s.to_string()))
                .collect();
            Ok(regions)
        }
        Ok(Err(err)) => Err(anyhow!("Failed to list AWS regions: {}", err)),
        Err(_) => Err(anyhow!("Request timed out while listing AWS regions")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_invalid_aws_credentials() {
        let invalid_creds = AWSCredentials {
            access_key_id: "INVALID_KEY".to_string(),
            secret_access_key: "invalid_secret".to_string(),
            region: Some("us-east-1".to_string()),
            session_token: None,
            role_arn: None,
            external_id: None,
        };

        let provider_creds = ProviderCredentials::AWS(invalid_creds);
        let result = test_aws_credentials(&provider_creds).await.unwrap();
        
        assert!(!result.success);
        assert!(result.message.contains("error") || result.message.contains("invalid"));
    }

    #[test]
    fn test_aws_credentials_validation() {
        let invalid_creds = AWSCredentials {
            access_key_id: "".to_string(),
            secret_access_key: "secret".to_string(),
            region: None,
            session_token: None,
            role_arn: None,
            external_id: None,
        };

        assert!(invalid_creds.validate().is_err());

        let valid_creds = AWSCredentials {
            access_key_id: "AKIAIOSFODNN7EXAMPLE".to_string(),
            secret_access_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY".to_string(),
            region: Some("us-east-1".to_string()),
            session_token: None,
            role_arn: None,
            external_id: None,
        };

        assert!(valid_creds.validate().is_ok());
    }
}
