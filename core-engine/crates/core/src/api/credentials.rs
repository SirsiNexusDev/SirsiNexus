use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
    Extension,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::credential_manager::{
    CredentialManager,
    types::{
        CloudProvider, ProviderCredentials, CreateCredentialRequest, 
        UpdateCredentialRequest, CredentialResponse, CredentialTestResult,
        ListCredentialsResponse, ErrorResponse, CredentialSummary
    }
};
use crate::auth::CurrentUser;

#[derive(Debug, Serialize, Deserialize)]
pub struct CredentialCreateRequest {
    pub provider: CloudProvider,
    pub alias: Option<String>,
    pub credentials: serde_json::Value, // Raw JSON that will be parsed into ProviderCredentials
    pub test_connection: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CredentialUpdateRequest {
    pub alias: Option<String>,
    pub credentials: Option<serde_json::Value>,
    pub test_connection: Option<bool>,
}

/// List all credentials for the authenticated user
pub async fn list_credentials_handler(
    State(pool): State<PgPool>,
    Extension(user): Extension<CurrentUser>,
) -> Result<Json<ListCredentialsResponse>, (StatusCode, Json<ErrorResponse>)> {
    let encryption_key = get_encryption_key(); // TODO: Implement secure key management
    let credential_manager = CredentialManager::new(pool, encryption_key);

    match credential_manager.list_credentials(user.id).await {
        Ok(credentials) => Ok(Json(ListCredentialsResponse {
            credentials,
            total: credentials.len(),
        })),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to list credentials: {}", e),
                code: Some("CREDENTIAL_LIST_ERROR".to_string()),
                details: None,
            }),
        )),
    }
}

/// Create a new credential
pub async fn create_credential_handler(
    State(pool): State<PgPool>,
    Extension(user): Extension<CurrentUser>,
    Json(request): Json<CredentialCreateRequest>,
) -> Result<Json<CredentialResponse>, (StatusCode, Json<ErrorResponse>)> {
    let encryption_key = get_encryption_key();
    let credential_manager = CredentialManager::new(pool, encryption_key);

    // Parse the credentials based on provider
    let provider_credentials = match parse_provider_credentials(&request.provider, &request.credentials) {
        Ok(creds) => creds,
        Err(e) => return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: format!("Invalid credentials format: {}", e),
                code: Some("INVALID_CREDENTIALS".to_string()),
                details: None,
            }),
        )),
    };

    // Validate credentials
    if let Err(e) = provider_credentials.validate() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: format!("Credential validation failed: {}", e),
                code: Some("VALIDATION_ERROR".to_string()),
                details: None,
            }),
        ));
    }

    // Store the credential
    let credential_id = match credential_manager.store_credentials(
        user.id,
        request.provider.clone(),
        provider_credentials.clone(),
        request.alias,
    ).await {
        Ok(id) => id,
        Err(e) => return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to store credential: {}", e),
                code: Some("STORAGE_ERROR".to_string()),
                details: None,
            }),
        )),
    };

    // Test connection if requested
    let test_result = if request.test_connection.unwrap_or(false) {
        match credential_manager.test_credentials(user.id, credential_id).await {
            Ok(result) => Some(result),
            Err(e) => Some(CredentialTestResult {
                success: false,
                message: format!("Test failed: {}", e),
                details: None,
            }),
        }
    } else {
        None
    };

    // Get the stored credential to return
    match credential_manager.get_credentials(user.id, credential_id).await {
        Ok(Some(stored_cred)) => Ok(Json(CredentialResponse {
            id: stored_cred.id,
            provider: stored_cred.provider,
            alias: stored_cred.alias,
            created_at: stored_cred.created_at,
            updated_at: stored_cred.updated_at,
            test_result,
        })),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Credential not found after creation".to_string(),
                code: Some("NOT_FOUND".to_string()),
                details: None,
            }),
        )),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to retrieve created credential: {}", e),
                code: Some("RETRIEVAL_ERROR".to_string()),
                details: None,
            }),
        )),
    }
}

/// Get a specific credential
pub async fn get_credential_handler(
    State(pool): State<PgPool>,
    Extension(user): Extension<CurrentUser>,
    Path(credential_id): Path<Uuid>,
) -> Result<Json<CredentialResponse>, (StatusCode, Json<ErrorResponse>)> {
    let encryption_key = get_encryption_key();
    let credential_manager = CredentialManager::new(pool, encryption_key);

    match credential_manager.get_credentials(user.id, credential_id).await {
        Ok(Some(stored_cred)) => {
            // Don't return sensitive credential data in GET requests
            Ok(Json(CredentialResponse {
                id: stored_cred.id,
                provider: stored_cred.provider,
                alias: stored_cred.alias,
                created_at: stored_cred.created_at,
                updated_at: stored_cred.updated_at,
                test_result: None,
            }))
        }
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Credential not found".to_string(),
                code: Some("NOT_FOUND".to_string()),
                details: None,
            }),
        )),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to retrieve credential: {}", e),
                code: Some("RETRIEVAL_ERROR".to_string()),
                details: None,
            }),
        )),
    }
}

/// Update a credential
pub async fn update_credential_handler(
    State(pool): State<PgPool>,
    Extension(user): Extension<CurrentUser>,
    Path(credential_id): Path<Uuid>,
    Json(request): Json<CredentialUpdateRequest>,
) -> Result<Json<CredentialResponse>, (StatusCode, Json<ErrorResponse>)> {
    let encryption_key = get_encryption_key();
    let credential_manager = CredentialManager::new(pool, encryption_key);

    // Get existing credential to determine provider
    let existing_cred = match credential_manager.get_credentials(user.id, credential_id).await {
        Ok(Some(cred)) => cred,
        Ok(None) => return Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Credential not found".to_string(),
                code: Some("NOT_FOUND".to_string()),
                details: None,
            }),
        )),
        Err(e) => return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to retrieve credential: {}", e),
                code: Some("RETRIEVAL_ERROR".to_string()),
                details: None,
            }),
        )),
    };

    // Parse new credentials if provided
    let new_credentials = if let Some(creds_json) = request.credentials {
        match parse_provider_credentials(&existing_cred.provider, &creds_json) {
            Ok(creds) => {
                // Validate new credentials
                if let Err(e) = creds.validate() {
                    return Err((
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: format!("Credential validation failed: {}", e),
                            code: Some("VALIDATION_ERROR".to_string()),
                            details: None,
                        }),
                    ));
                }
                creds
            }
            Err(e) => return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: format!("Invalid credentials format: {}", e),
                    code: Some("INVALID_CREDENTIALS".to_string()),
                    details: None,
                }),
            )),
        }
    } else {
        existing_cred.credentials
    };

    // Update the credential
    if let Err(e) = credential_manager.update_credentials(
        user.id,
        credential_id,
        new_credentials,
        request.alias,
    ).await {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to update credential: {}", e),
                code: Some("UPDATE_ERROR".to_string()),
                details: None,
            }),
        ));
    }

    // Test connection if requested
    let test_result = if request.test_connection.unwrap_or(false) {
        match credential_manager.test_credentials(user.id, credential_id).await {
            Ok(result) => Some(result),
            Err(e) => Some(CredentialTestResult {
                success: false,
                message: format!("Test failed: {}", e),
                details: None,
            }),
        }
    } else {
        None
    };

    // Return updated credential
    match credential_manager.get_credentials(user.id, credential_id).await {
        Ok(Some(updated_cred)) => Ok(Json(CredentialResponse {
            id: updated_cred.id,
            provider: updated_cred.provider,
            alias: updated_cred.alias,
            created_at: updated_cred.created_at,
            updated_at: updated_cred.updated_at,
            test_result,
        })),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Credential not found after update".to_string(),
                code: Some("NOT_FOUND".to_string()),
                details: None,
            }),
        )),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Failed to retrieve updated credential: {}", e),
                code: Some("RETRIEVAL_ERROR".to_string()),
                details: None,
            }),
        )),
    }
}

/// Delete a credential
pub async fn delete_credential_handler(
    State(pool): State<PgPool>,
    Extension(user): Extension<CurrentUser>,
    Path(credential_id): Path<Uuid>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    let encryption_key = get_encryption_key();
    let credential_manager = CredentialManager::new(pool, encryption_key);

    match credential_manager.delete_credentials(user.id, credential_id).await {
        Ok(()) => Ok(StatusCode::NO_CONTENT),
        Err(e) => {
            let error_msg = e.to_string();
            if error_msg.contains("not found") || error_msg.contains("access denied") {
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: "Credential not found".to_string(),
                        code: Some("NOT_FOUND".to_string()),
                        details: None,
                    }),
                ))
            } else {
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Failed to delete credential: {}", e),
                        code: Some("DELETE_ERROR".to_string()),
                        details: None,
                    }),
                ))
            }
        }
    }
}

/// Test a credential connection
pub async fn test_credential_handler(
    State(pool): State<PgPool>,
    Extension(user): Extension<CurrentUser>,
    Path(credential_id): Path<Uuid>,
) -> Result<Json<CredentialTestResult>, (StatusCode, Json<ErrorResponse>)> {
    let encryption_key = get_encryption_key();
    let credential_manager = CredentialManager::new(pool, encryption_key);

    match credential_manager.test_credentials(user.id, credential_id).await {
        Ok(result) => Ok(Json(result)),
        Err(e) => {
            let error_msg = e.to_string();
            if error_msg.contains("not found") {
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ErrorResponse {
                        error: "Credential not found".to_string(),
                        code: Some("NOT_FOUND".to_string()),
                        details: None,
                    }),
                ))
            } else {
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Failed to test credential: {}", e),
                        code: Some("TEST_ERROR".to_string()),
                        details: None,
                    }),
                ))
            }
        }
    }
}

// Helper functions

fn parse_provider_credentials(
    provider: &CloudProvider,
    credentials_json: &serde_json::Value,
) -> Result<ProviderCredentials, Box<dyn std::error::Error>> {
    use crate::credential_manager::types::*;

    match provider {
        CloudProvider::AWS => {
            let aws_creds: AWSCredentials = serde_json::from_value(credentials_json.clone())?;
            Ok(ProviderCredentials::AWS(aws_creds))
        }
        CloudProvider::Azure => {
            let azure_creds: AzureCredentials = serde_json::from_value(credentials_json.clone())?;
            Ok(ProviderCredentials::Azure(azure_creds))
        }
        CloudProvider::GCP => {
            let gcp_creds: GCPCredentials = serde_json::from_value(credentials_json.clone())?;
            Ok(ProviderCredentials::GCP(gcp_creds))
        }
        CloudProvider::DigitalOcean => {
            let do_creds: DigitalOceanCredentials = serde_json::from_value(credentials_json.clone())?;
            Ok(ProviderCredentials::DigitalOcean(do_creds))
        }
    }
}

fn get_encryption_key() -> Vec<u8> {
    // TODO: Implement secure key management
    // For now, use environment variable or generate a key
    std::env::var("CREDENTIAL_ENCRYPTION_KEY")
        .map(|key| key.into_bytes())
        .unwrap_or_else(|_| {
            // Generate a default key (NOT for production)
            b"this-is-a-32-byte-key-for-dev!".to_vec()
        })
}
