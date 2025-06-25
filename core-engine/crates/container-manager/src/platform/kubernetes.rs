use k8s_openapi::api::{
    apps::v1::{Deployment, DeploymentSpec, DeploymentStatus},
    core::v1::{Container, EnvVar, PodSpec, PodTemplateSpec, Service, ServiceSpec},
};
use kube::{
    api::{Api, ListParams, PostParams},
    client::Client,
    config::{KubeConfig, Kubeconfig},
    Config, ResourceExt,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::{ContainerError, ContainerResult};

pub struct KubernetesClient {
    client: Client,
    namespace: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KubernetesConfig {
    pub kubeconfig: Option<String>,
    pub context: Option<String>,
    pub namespace: String,
    pub in_cluster: bool,
}

impl KubernetesClient {
    pub async fn new(config: KubernetesConfig) -> ContainerResult<Self> {
        let client = if config.in_cluster {
            Client::try_default()
                .await
                .map_err(|e| ContainerError::Platform(format!("Failed to create in-cluster client: {}", e)))?
        } else {
            let kube_config = if let Some(kubeconfig) = config.kubeconfig {
                Kubeconfig::from_yaml(&kubeconfig)
                    .map_err(|e| ContainerError::Config(format!("Invalid kubeconfig: {}", e)))?
            } else {
                KubeConfig::new()
                    .map_err(|e| ContainerError::Config(format!("Failed to load kubeconfig: {}", e)))?
                    .read()
                    .map_err(|e| ContainerError::Config(format!("Failed to read kubeconfig: {}", e)))?
            };

            let kube_config = Config::from_custom_kubeconfig(kube_config, &config.context)
                .await
                .map_err(|e| ContainerError::Config(format!("Failed to create config: {}", e)))?;

            Client::try_from(kube_config)
                .map_err(|e| ContainerError::Platform(format!("Failed to create client: {}", e)))?
        };

        Ok(Self {
            client,
            namespace: config.namespace,
        })
    }

    pub async fn list_deployments(&self, labels: Option<&str>) -> ContainerResult<Vec<Deployment>> {
        let api: Api<Deployment> = Api::namespaced(self.client.clone(), &self.namespace);
        let params = if let Some(label_selector) = labels {
            ListParams::default().labels(label_selector)
        } else {
            ListParams::default()
        };

        let deployments = api
            .list(&params)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to list deployments: {}", e)))?;

        Ok(deployments.items)
    }

    pub async fn get_deployment(&self, name: &str) -> ContainerResult<Option<Deployment>> {
        let api: Api<Deployment> = Api::namespaced(self.client.clone(), &self.namespace);

        match api.get(name).await {
            Ok(deployment) => Ok(Some(deployment)),
            Err(kube::Error::Api(err)) if err.code == 404 => Ok(None),
            Err(e) => Err(ContainerError::Platform(format!("Failed to get deployment: {}", e))),
        }
    }

    pub async fn create_deployment(&self, deployment: Deployment) -> ContainerResult<Deployment> {
        let api: Api<Deployment> = Api::namespaced(self.client.clone(), &self.namespace);

        let deployment = api
            .create(&PostParams::default(), &deployment)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to create deployment: {}", e)))?;

        Ok(deployment)
    }

    pub async fn update_deployment(&self, deployment: Deployment) -> ContainerResult<Deployment> {
        let api: Api<Deployment> = Api::namespaced(self.client.clone(), &self.namespace);
        let name = deployment.name_any();

        let deployment = api
            .replace(&name, &PostParams::default(), &deployment)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to update deployment: {}", e)))?;

        Ok(deployment)
    }

    pub async fn delete_deployment(&self, name: &str) -> ContainerResult<()> {
        let api: Api<Deployment> = Api::namespaced(self.client.clone(), &self.namespace);

        api.delete(name, &Default::default())
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to delete deployment: {}", e)))?;

        Ok(())
    }

    pub async fn rollback_deployment(&self, name: &str, revision: Option<i32>) -> ContainerResult<Deployment> {
        let api: Api<Deployment> = Api::namespaced(self.client.clone(), &self.namespace);

        let mut deployment = api
            .get(name)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to get deployment: {}", e)))?;

        if let Some(rev) = revision {
            deployment.spec.as_mut().map(|spec| {
                spec.rollback_to = Some(rev);
            });
        }

        let deployment = api
            .replace(name, &PostParams::default(), &deployment)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to rollback deployment: {}", e)))?;

        Ok(deployment)
    }

    pub async fn get_deployment_status(&self, name: &str) -> ContainerResult<DeploymentStatus> {
        let api: Api<Deployment> = Api::namespaced(self.client.clone(), &self.namespace);

        let deployment = api
            .get(name)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to get deployment: {}", e)))?;

        deployment
            .status
            .ok_or_else(|| ContainerError::Platform("Deployment status not available".into()))
    }

    pub async fn list_services(&self, labels: Option<&str>) -> ContainerResult<Vec<Service>> {
        let api: Api<Service> = Api::namespaced(self.client.clone(), &self.namespace);
        let params = if let Some(label_selector) = labels {
            ListParams::default().labels(label_selector)
        } else {
            ListParams::default()
        };

        let services = api
            .list(&params)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to list services: {}", e)))?;

        Ok(services.items)
    }

    pub async fn create_service(&self, service: Service) -> ContainerResult<Service> {
        let api: Api<Service> = Api::namespaced(self.client.clone(), &self.namespace);

        let service = api
            .create(&PostParams::default(), &service)
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to create service: {}", e)))?;

        Ok(service)
    }

    pub async fn delete_service(&self, name: &str) -> ContainerResult<()> {
        let api: Api<Service> = Api::namespaced(self.client.clone(), &self.namespace);

        api.delete(name, &Default::default())
            .await
            .map_err(|e| ContainerError::Platform(format!("Failed to delete service: {}", e)))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use k8s_openapi::apimachinery::pkg::apis::meta::v1::ObjectMeta;

    #[tokio::test]
    async fn test_deployment_lifecycle() {
        // This test requires a running Kubernetes cluster
        // You can use minikube or kind for local testing
        let config = KubernetesConfig {
            kubeconfig: None, // Use default kubeconfig
            context: None,    // Use default context
            namespace: "default".to_string(),
            in_cluster: false,
        };

        let client = KubernetesClient::new(config).await.unwrap();

        // Create deployment
        let deployment = Deployment {
            metadata: ObjectMeta {
                name: Some("test-deployment".to_string()),
                namespace: Some("default".to_string()),
                labels: Some(HashMap::from_iter(vec![
                    ("app".to_string(), "test".to_string()),
                ])),
                ..Default::default()
            },
            spec: Some(DeploymentSpec {
                replicas: Some(1),
                selector: Default::default(),
                template: PodTemplateSpec {
                    metadata: Some(ObjectMeta {
                        labels: Some(HashMap::from_iter(vec![
                            ("app".to_string(), "test".to_string()),
                        ])),
                        ..Default::default()
                    }),
                    spec: Some(PodSpec {
                        containers: vec![Container {
                            name: "nginx".to_string(),
                            image: Some("nginx:latest".to_string()),
                            ..Default::default()
                        }],
                        ..Default::default()
                    }),
                },
                ..Default::default()
            }),
            status: None,
        };

        let created = client.create_deployment(deployment.clone()).await.unwrap();
        assert_eq!(created.name_any(), "test-deployment");

        // List deployments
        let deployments = client
            .list_deployments(Some("app=test"))
            .await
            .unwrap();
        assert!(!deployments.is_empty());

        // Get deployment
        let found = client.get_deployment("test-deployment").await.unwrap().unwrap();
        assert_eq!(found.name_any(), "test-deployment");

        // Update deployment
        let mut updated = found.clone();
        if let Some(spec) = updated.spec.as_mut() {
            spec.replicas = Some(2);
        }
        let updated = client.update_deployment(updated).await.unwrap();
        assert_eq!(updated.spec.unwrap().replicas, Some(2));

        // Get status
        let status = client.get_deployment_status("test-deployment").await.unwrap();
        assert!(status.replicas.is_some());

        // Cleanup
        client.delete_deployment("test-deployment").await.unwrap();
    }
}
