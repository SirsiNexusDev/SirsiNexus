use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use reqwest::Client as HttpClient;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AzureConfig {
    pub subscription_id: String,
    pub tenant_id: Option<String>,
    pub client_id: Option<String>,
    pub client_secret: Option<String>,
    pub resource_group: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AzureResource {
    pub resource_type: String,
    pub resource_id: String,
    pub name: String,
    pub resource_group: String,
    pub location: String,
    pub tags: HashMap<String, String>,
    pub metadata: HashMap<String, String>,
    pub cost_estimate: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AzureDiscoveryResult {
    pub resources: Vec<AzureResource>,
    pub total_count: usize,
    pub scan_time_ms: u64,
    pub errors: Vec<String>,
}

pub struct AzureAgent {
    config: AzureConfig,
    http_client: Option<HttpClient>,
}

impl AzureAgent {
    pub fn new(config: AzureConfig) -> Self {
        Self {
            config,
            http_client: None,
        }
    }

    pub async fn initialize(&mut self) -> AppResult<()> {
        // Initialize HTTP client for Azure APIs
        self.http_client = Some(HttpClient::new());
        
        // TODO: Implement proper Azure authentication
        // For now, this is a placeholder that assumes credentials are handled externally
        
        Ok(())
    }

    pub async fn discover_resources(&self, resource_types: Vec<String>) -> AppResult<AzureDiscoveryResult> {
        let start_time = std::time::Instant::now();
        let mut resources = Vec::new();
        let mut errors = Vec::new();

        for resource_type in resource_types {
            match resource_type.as_str() {
                "vm" | "virtual_machines" => {
                    match self.discover_virtual_machines().await {
                        Ok(mut vm_resources) => resources.append(&mut vm_resources),
                        Err(e) => errors.push(format!("VM discovery failed: {}", e)),
                    }
                }
                "storage" | "storage_accounts" => {
                    match self.discover_storage_accounts().await {
                        Ok(mut storage_resources) => resources.append(&mut storage_resources),
                        Err(e) => errors.push(format!("Storage discovery failed: {}", e)),
                    }
                }
                "resource_groups" => {
                    match self.discover_resource_groups().await {
                        Ok(mut rg_resources) => resources.append(&mut rg_resources),
                        Err(e) => errors.push(format!("Resource group discovery failed: {}", e)),
                    }
                }
                _ => {
                    errors.push(format!("Unsupported resource type: {}", resource_type));
                }
            }
        }

        // Add artificial delay for mock to simulate real API call
        tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        
        let scan_time_ms = start_time.elapsed().as_millis() as u64;

        Ok(AzureDiscoveryResult {
            total_count: resources.len(),
            resources,
            scan_time_ms,
            errors,
        })
    }

    async fn discover_virtual_machines(&self) -> AppResult<Vec<AzureResource>> {
        // TODO: Implement actual Azure VM discovery
        // For now, return mock data
        let resource_group = self.config.resource_group.as_deref().unwrap_or("mock-rg");
        
        let mut metadata = HashMap::new();
        metadata.insert("vm_size".to_string(), "Standard_B1s".to_string());
        metadata.insert("computer_name".to_string(), "mock-vm".to_string());
        metadata.insert("os_publisher".to_string(), "Canonical".to_string());
        
        let resource = AzureResource {
            resource_type: "microsoft.compute/virtualmachines".to_string(),
            resource_id: format!("/subscriptions/{}/resourceGroups/{}/providers/Microsoft.Compute/virtualMachines/mock-vm", self.config.subscription_id, resource_group),
            name: "mock-azure-vm".to_string(),
            resource_group: resource_group.to_string(),
            location: "East US".to_string(),
            tags: HashMap::new(),
            metadata,
            cost_estimate: None,
        };
        
        Ok(vec![resource])
    }

    async fn discover_storage_accounts(&self) -> AppResult<Vec<AzureResource>> {
        // TODO: Implement actual Azure Storage discovery
        // For now, return mock data
        let resource_group = self.config.resource_group.as_deref().unwrap_or("mock-rg");
        
        let mut metadata = HashMap::new();
        metadata.insert("sku_name".to_string(), "Standard_LRS".to_string());
        metadata.insert("kind".to_string(), "StorageV2".to_string());
        metadata.insert("access_tier".to_string(), "Hot".to_string());
        
        let resource = AzureResource {
            resource_type: "microsoft.storage/storageaccounts".to_string(),
            resource_id: format!("/subscriptions/{}/resourceGroups/{}/providers/Microsoft.Storage/storageAccounts/mockstorageaccount", self.config.subscription_id, resource_group),
            name: "mockstorageaccount".to_string(),
            resource_group: resource_group.to_string(),
            location: "East US".to_string(),
            tags: HashMap::new(),
            metadata,
            cost_estimate: None,
        };
        
        Ok(vec![resource])
    }

    async fn discover_resource_groups(&self) -> AppResult<Vec<AzureResource>> {
        // TODO: Implement actual Azure Resource Groups discovery
        // For now, return mock data
        let resource_group = self.config.resource_group.as_deref().unwrap_or("mock-rg");
        
        let mut metadata = HashMap::new();
        metadata.insert("provisioning_state".to_string(), "Succeeded".to_string());
        
        let resource = AzureResource {
            resource_type: "microsoft.resources/resourcegroups".to_string(),
            resource_id: format!("/subscriptions/{}/resourceGroups/{}", self.config.subscription_id, resource_group),
            name: resource_group.to_string(),
            resource_group: resource_group.to_string(),
            location: "East US".to_string(),
            tags: HashMap::new(),
            metadata,
            cost_estimate: None,
        };
        
        Ok(vec![resource])
    }

    // Note: These helper methods are not needed for the mock implementation
    // TODO: Implement these when real Azure SDK integration is added

    fn extract_resource_group_from_id(&self, resource_id: &str) -> String {
        // Azure resource IDs follow pattern: /subscriptions/{sub}/resourceGroups/{rg}/...
        if let Some(rg_start) = resource_id.find("/resourceGroups/") {
            let rg_part = &resource_id[rg_start + 16..]; // Skip "/resourceGroups/"
            if let Some(rg_end) = rg_part.find('/') {
                rg_part[..rg_end].to_string()
            } else {
                rg_part.to_string()
            }
        } else {
            "unknown".to_string()
        }
    }

    pub async fn estimate_migration_cost(&self, resources: &[AzureResource]) -> AppResult<HashMap<String, f64>> {
        // TODO: Implement actual cost estimation using Azure Pricing API
        let mut cost_estimates = HashMap::new();

        for resource in resources {
            let estimated_cost = match resource.resource_type.as_str() {
                "microsoft.compute/virtualmachines" => {
                    // Simple estimation based on VM size
                    match resource.metadata.get("vm_size") {
                        Some(vm_size) if vm_size.contains("Standard_B1s") => 9.50, // ~$9.50/month
                        Some(vm_size) if vm_size.contains("Standard_B2s") => 19.00,
                        Some(vm_size) if vm_size.contains("Standard_D2s_v3") => 70.08,
                        Some(vm_size) if vm_size.contains("Standard_D4s_v3") => 140.16,
                        _ => 50.0, // Default estimation
                    }
                }
                "microsoft.storage/storageaccounts" => {
                    // Simple estimation for storage accounts
                    match resource.metadata.get("sku_name") {
                        Some(sku) if sku.contains("Standard_LRS") => 20.0, // ~$20/month
                        Some(sku) if sku.contains("Standard_GRS") => 35.0,
                        Some(sku) if sku.contains("Premium_LRS") => 80.0,
                        _ => 25.0, // Default estimation
                    }
                }
                "microsoft.resources/resourcegroups" => {
                    // Resource groups are free
                    0.0
                }
                _ => 0.0,
            };

            cost_estimates.insert(resource.resource_id.clone(), estimated_cost);
        }

        Ok(cost_estimates)
    }

    pub async fn generate_migration_recommendations(&self, resources: &[AzureResource]) -> AppResult<Vec<String>> {
        let mut recommendations = Vec::new();

        for resource in resources {
            match resource.resource_type.as_str() {
                "microsoft.compute/virtualmachines" => {
                    if let Some(vm_size) = resource.metadata.get("vm_size") {
                        if vm_size.contains("Basic_") {
                            recommendations.push(format!(
                                "VM {} uses Basic tier - consider upgrading to Standard for better SLA",
                                resource.name
                            ));
                        }
                        
                        if vm_size.contains("_v1") {
                            recommendations.push(format!(
                                "VM {} uses older generation - consider upgrading to v3 or v4 for better performance/cost",
                                resource.name
                            ));
                        }
                    }
                }
                "microsoft.storage/storageaccounts" => {
                    if let Some(access_tier) = resource.metadata.get("access_tier") {
                        if access_tier == "Hot" {
                            recommendations.push(format!(
                                "Storage account {} uses Hot tier - consider Cool or Archive for infrequently accessed data",
                                resource.name
                            ));
                        }
                    }

                    if let Some(sku_name) = resource.metadata.get("sku_name") {
                        if sku_name.contains("Standard_GRS") {
                            recommendations.push(format!(
                                "Storage account {} uses GRS - consider LRS if cross-region redundancy is not required",
                                resource.name
                            ));
                        }
                    }
                }
                _ => {}
            }
        }

        // General recommendations
        if resources.len() > 15 {
            recommendations.push("Consider consolidating resources into fewer resource groups for better management".to_string());
        }

        if resources.iter().any(|r| r.tags.is_empty()) {
            recommendations.push("Some resources lack tags - implement consistent tagging for cost allocation and governance".to_string());
        }

        // Check for resources in multiple locations
        let locations: std::collections::HashSet<_> = resources.iter().map(|r| &r.location).collect();
        if locations.len() > 3 {
            recommendations.push("Resources are spread across many locations - consider consolidating to reduce data transfer costs".to_string());
        }

        Ok(recommendations)
    }

    pub async fn health_check(&self) -> AppResult<()> {
        // TODO: Implement real Azure health check
        // For now, just check if we have an HTTP client
        if self.http_client.is_none() {
            return Err(AppError::Configuration("Azure client not initialized".into()));
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_azure_agent_creation() {
        let config = AzureConfig {
            subscription_id: "test-subscription-id".to_string(),
            tenant_id: None,
            client_id: None,
            client_secret: None,
            resource_group: None,
        };

        let agent = AzureAgent::new(config);
        assert_eq!(agent.config.subscription_id, "test-subscription-id");
    }

    #[tokio::test]
    async fn test_cost_estimation() {
        let config = AzureConfig {
            subscription_id: "test-subscription-id".to_string(),
            tenant_id: None,
            client_id: None,
            client_secret: None,
            resource_group: None,
        };

        let agent = AzureAgent::new(config);

        let mut metadata = HashMap::new();
        metadata.insert("vm_size".to_string(), "Standard_B1s".to_string());

        let resources = vec![AzureResource {
            resource_type: "microsoft.compute/virtualmachines".to_string(),
            resource_id: "/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.Compute/virtualMachines/test-vm".to_string(),
            name: "test-vm".to_string(),
            resource_group: "test-rg".to_string(),
            location: "East US".to_string(),
            tags: HashMap::new(),
            metadata,
            cost_estimate: None,
        }];

        let cost_estimates = agent.estimate_migration_cost(&resources).await.unwrap();
        assert!(cost_estimates.contains_key("/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.Compute/virtualMachines/test-vm"));
        assert_eq!(cost_estimates["/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.Compute/virtualMachines/test-vm"], 9.50);
    }

    #[test]
    fn test_extract_resource_group_from_id() {
        let config = AzureConfig {
            subscription_id: "test-subscription-id".to_string(),
            tenant_id: None,
            client_id: None,
            client_secret: None,
            resource_group: None,
        };

        let agent = AzureAgent::new(config);

        let resource_id = "/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/my-resource-group/providers/Microsoft.Compute/virtualMachines/my-vm";
        let rg = agent.extract_resource_group_from_id(resource_id);
        assert_eq!(rg, "my-resource-group");
    }

    #[tokio::test]
    async fn test_migration_recommendations() {
        let config = AzureConfig {
            subscription_id: "test-subscription-id".to_string(),
            tenant_id: None,
            client_id: None,
            client_secret: None,
            resource_group: None,
        };

        let agent = AzureAgent::new(config);

        let mut metadata = HashMap::new();
        metadata.insert("vm_size".to_string(), "Basic_A1".to_string());

        let resources = vec![AzureResource {
            resource_type: "microsoft.compute/virtualmachines".to_string(),
            resource_id: "/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.Compute/virtualMachines/test-vm".to_string(),
            name: "test-vm".to_string(),
            resource_group: "test-rg".to_string(),
            location: "East US".to_string(),
            tags: HashMap::new(),
            metadata,
            cost_estimate: None,
        }];

        let recommendations = agent.generate_migration_recommendations(&resources).await.unwrap();
        assert!(!recommendations.is_empty());
        assert!(recommendations.iter().any(|r| r.contains("Basic tier")));
    }
}
