use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::{ComputeError, ComputeResult};
use crate::mesh::{ServiceMesh, VirtualService, TrafficPolicy, SecurityPolicy};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkerdServiceProfile {
    pub api_version: String,
    pub kind: String,
    pub metadata: LinkerdMetadata,
    pub spec: ServiceProfileSpec,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkerdMetadata {
    pub name: String,
    pub namespace: String,
    pub labels: Option<HashMap<String, String>>,
    pub annotations: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceProfileSpec {
    pub routes: Vec<RouteSpec>,
    pub retry_budget: Option<RetryBudget>,
    pub dst_overrides: Option<Vec<DestinationOverride>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteSpec {
    pub name: String,
    pub condition: RouteMatch,
    pub response_classes: Option<Vec<ResponseClass>>,
    pub metrics_labels: Option<HashMap<String, String>>,
    pub is_retry_able: Option<bool>,
    pub timeout: Option<String>,
    pub retry_budget: Option<RetryBudget>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteMatch {
    pub path_regex: Option<String>,
    pub path_exact: Option<String>,
    pub path_prefix: Option<String>,
    pub method: Option<String>,
    pub headers: Option<HashMap<String, HeaderMatch>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeaderMatch {
    pub exact: Option<String>,
    pub regex: Option<String>,
    pub prefix: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseClass {
    pub condition: ResponseMatch,
    pub is_failure: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseMatch {
    pub status_range: Option<StatusRange>,
    pub all: Option<Vec<ResponseMatch>>,
    pub any: Option<Vec<ResponseMatch>>,
    pub not: Option<Box<ResponseMatch>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatusRange {
    pub min: u16,
    pub max: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryBudget {
    pub ttl: String,
    pub min_retries_per_second: i32,
    pub retry_ratio: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DestinationOverride {
    pub authority: String,
    pub metrics_labels: Option<HashMap<String, String>>,
}

#[derive(Debug)]
pub struct LinkerdProvider {
    cluster_domain: String,
    namespace: String,
}

impl LinkerdProvider {
    pub fn new(cluster_domain: String, namespace: String) -> Self {
        Self {
            cluster_domain,
            namespace,
        }
    }

    fn convert_to_service_profile(&self, vs: &VirtualService) -> ComputeResult<LinkerdServiceProfile> {
        let mut routes = Vec::new();
        
        for http_route in &vs.http_routes {
            let mut route_spec = RouteSpec {
                name: http_route.name.clone(),
                condition: RouteMatch {
                    path_regex: http_route.matches.first().and_then(|m| m.regex_path.clone()),
                    path_exact: http_route.matches.first().and_then(|m| m.exact_path.clone()),
                    path_prefix: http_route.matches.first().and_then(|m| m.prefix_path.clone()),
                    method: http_route.matches.first().and_then(|m| m.method.clone()),
                    headers: Some(http_route.matches.first()
                        .map(|m| m.headers.clone())
                        .unwrap_or_default()),
                },
                response_classes: None,
                metrics_labels: None,
                is_retry_able: http_route.retries.as_ref().map(|_| true),
                timeout: http_route.timeout.map(|t| t.to_string()),
                retry_budget: http_route.retries.as_ref().map(|r| RetryBudget {
                    ttl: "10s".to_string(),
                    min_retries_per_second: r.attempts,
                    retry_ratio: 0.2,
                }),
            };

            routes.push(route_spec);
        }

        Ok(LinkerdServiceProfile {
            api_version: "linkerd.io/v1alpha2".to_string(),
            kind: "ServiceProfile".to_string(),
            metadata: LinkerdMetadata {
                name: vs.name.clone(),
                namespace: vs.namespace.clone(),
                labels: Some(vs.labels.clone()),
                annotations: Some(vs.annotations.clone()),
            },
            spec: ServiceProfileSpec {
                routes,
                retry_budget: Some(RetryBudget {
                    ttl: "10s".to_string(),
                    min_retries_per_second: 10,
                    retry_ratio: 0.2,
                }),
                dst_overrides: None,
            },
        })
    }
}

#[async_trait::async_trait]
impl ServiceMesh for LinkerdProvider {
    async fn apply_virtual_service(&self, service: VirtualService) -> ComputeResult<()> {
        let profile = self.convert_to_service_profile(&service)?;
        
        // Apply the service profile using kubectl
        let profile_yaml = serde_yaml::to_string(&profile)
            .map_err(|e| ComputeError::Provider(format!("Failed to serialize profile: {}", e)))?;
        
        let output = std::process::Command::new("kubectl")
            .args(&["apply", "-f", "-"])
            .stdin(std::process::Stdio::piped())
            .output()
            .map_err(|e| ComputeError::Provider(format!("Failed to apply profile: {}", e)))?;

        if !output.status.success() {
            return Err(ComputeError::Provider(format!(
                "Failed to apply profile: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        Ok(())
    }

    async fn delete_virtual_service(&self, name: &str, namespace: &str) -> ComputeResult<()> {
        let output = std::process::Command::new("kubectl")
            .args(&[
                "delete",
                "serviceprofile",
                name,
                "-n",
                namespace,
            ])
            .output()
            .map_err(|e| ComputeError::Provider(format!("Failed to delete profile: {}", e)))?;

        if !output.status.success() {
            return Err(ComputeError::Provider(format!(
                "Failed to delete profile: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        Ok(())
    }

    async fn get_virtual_service(&self, name: &str, namespace: &str) -> ComputeResult<VirtualService> {
        let output = std::process::Command::new("kubectl")
            .args(&[
                "get",
                "serviceprofile",
                name,
                "-n",
                namespace,
                "-o",
                "yaml",
            ])
            .output()
            .map_err(|e| ComputeError::Provider(format!("Failed to get profile: {}", e)))?;

        if !output.status.success() {
            return Err(ComputeError::Provider(format!(
                "Failed to get profile: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        let profile: LinkerdServiceProfile = serde_yaml::from_slice(&output.stdout)
            .map_err(|e| ComputeError::Provider(format!("Failed to parse profile: {}", e)))?;

        let mut vs = VirtualService {
            name: profile.metadata.name,
            namespace: profile.metadata.namespace,
            labels: profile.metadata.labels.unwrap_or_default(),
            annotations: profile.metadata.annotations.unwrap_or_default(),
            hosts: vec![format!("{}.{}.svc.{}", name, namespace, self.cluster_domain)],
            gateways: vec![],
            http_routes: profile.spec.routes.into_iter().map(|r| {
                crate::mesh::HttpRoute {
                    name: r.name,
                    matches: vec![crate::mesh::RouteMatch {
                        exact_path: r.condition.path_exact,
                        prefix_path: r.condition.path_prefix,
                        regex_path: r.condition.path_regex,
                        method: r.condition.method,
                        headers: r.condition.headers.unwrap_or_default(),
                        port: None,
                    }],
                    destinations: vec![],
                    timeout: r.timeout.and_then(|t| t.parse().ok()),
                    retries: r.retry_budget.map(|rb| crate::mesh::RetryPolicy {
                        attempts: rb.min_retries_per_second,
                        timeout: "5s".parse().unwrap(),
                        conditions: vec!["5xx".to_string()],
                    }),
                }
            }).collect(),
        };

        Ok(vs)
    }

    async fn list_virtual_services(&self, namespace: &str) -> ComputeResult<Vec<VirtualService>> {
        let output = std::process::Command::new("kubectl")
            .args(&[
                "get",
                "serviceprofile",
                "-n",
                namespace,
                "-o",
                "yaml",
            ])
            .output()
            .map_err(|e| ComputeError::Provider(format!("Failed to list profiles: {}", e)))?;

        if !output.status.success() {
            return Err(ComputeError::Provider(format!(
                "Failed to list profiles: {}",
                String::from_utf8_lossy(&output.stderr)
            )));
        }

        let profiles: Vec<LinkerdServiceProfile> = serde_yaml::from_slice(&output.stdout)
            .map_err(|e| ComputeError::Provider(format!("Failed to parse profiles: {}", e)))?;

        let services = profiles.into_iter().map(|p| {
            VirtualService {
                name: p.metadata.name.clone(),
                namespace: p.metadata.namespace,
                labels: p.metadata.labels.unwrap_or_default(),
                annotations: p.metadata.annotations.unwrap_or_default(),
                hosts: vec![format!("{}.{}.svc.{}", p.metadata.name, namespace, self.cluster_domain)],
                gateways: vec![],
                http_routes: p.spec.routes.into_iter().map(|r| {
                    crate::mesh::HttpRoute {
                        name: r.name,
                        matches: vec![crate::mesh::RouteMatch {
                            exact_path: r.condition.path_exact,
                            prefix_path: r.condition.path_prefix,
                            regex_path: r.condition.path_regex,
                            method: r.condition.method,
                            headers: r.condition.headers.unwrap_or_default(),
                            port: None,
                        }],
                        destinations: vec![],
                        timeout: r.timeout.and_then(|t| t.parse().ok()),
                        retries: r.retry_budget.map(|rb| crate::mesh::RetryPolicy {
                            attempts: rb.min_retries_per_second,
                            timeout: "5s".parse().unwrap(),
                            conditions: vec!["5xx".to_string()],
                        }),
                    }
                }).collect(),
            }
        }).collect();

        Ok(services)
    }

    async fn apply_traffic_policy(&self, policy: TrafficPolicy) -> ComputeResult<()> {
        // Linkerd doesn't have a direct traffic policy CRD
        // We'll implement this through service profiles
        let mut vs = VirtualService {
            name: policy.name.clone(),
            namespace: policy.namespace.clone(),
            labels: policy.labels.clone(),
            annotations: policy.annotations.clone(),
            hosts: vec![format!("{}.{}.svc.{}", policy.name, policy.namespace, self.cluster_domain)],
            gateways: vec![],
            http_routes: vec![],
        };

        // Convert traffic policies to routes
        for rule in policy.rules {
            let route = crate::mesh::HttpRoute {
                name: format!("traffic-rule-{}", vs.http_routes.len()),
                matches: vec![crate::mesh::RouteMatch {
                    exact_path: None,
                    prefix_path: Some("/".to_string()),
                    regex_path: None,
                    method: None,
                    headers: rule.match_labels,
                    port: None,
                }],
                destinations: vec![],
                timeout: Some(rule.timeout),
                retries: Some(crate::mesh::RetryPolicy {
                    attempts: rule.retry_attempts,
                    timeout: rule.retry_timeout,
                    conditions: vec!["5xx".to_string(), "gateway-error".to_string()],
                }),
            };
            vs.http_routes.push(route);
        }

        self.apply_virtual_service(vs).await
    }

    async fn apply_security_policy(&self, policy: SecurityPolicy) -> ComputeResult<()> {
        // Linkerd handles security through service accounts and RBAC
        // Create necessary service accounts and roles
        for rule in policy.rules {
            // Create service account if it doesn't exist
            let sa_yaml = format!(
                "apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: {}\n  namespace: {}",
                rule.principal, policy.namespace
            );

            let output = std::process::Command::new("kubectl")
                .args(&["apply", "-f", "-"])
                .stdin(std::process::Stdio::piped())
                .output()
                .map_err(|e| ComputeError::Provider(format!("Failed to create service account: {}", e)))?;

            if !output.status.success() {
                return Err(ComputeError::Provider(format!(
                    "Failed to create service account: {}",
                    String::from_utf8_lossy(&output.stderr)
                )));
            }

            // Create role and binding
            let role_yaml = format!(
                "apiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  name: {}-role\n  namespace: {}\nrules:\n- apiGroups: [\"\"]\n  resources: [\"services\"]\n  verbs: [\"get\", \"list\"]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  name: {}-binding\n  namespace: {}\nsubjects:\n- kind: ServiceAccount\n  name: {}\n  namespace: {}\nroleRef:\n  kind: Role\n  name: {}-role\n  apiGroup: rbac.authorization.k8s.io",
                rule.principal, policy.namespace, rule.principal, policy.namespace,
                rule.principal, policy.namespace, rule.principal
            );

            let output = std::process::Command::new("kubectl")
                .args(&["apply", "-f", "-"])
                .stdin(std::process::Stdio::piped())
                .output()
                .map_err(|e| ComputeError::Provider(format!("Failed to create role and binding: {}", e)))?;

            if !output.status.success() {
                return Err(ComputeError::Provider(format!(
                    "Failed to create role and binding: {}",
                    String::from_utf8_lossy(&output.stderr)
                )));
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[tokio::test]
    async fn test_convert_virtual_service() {
        let provider = LinkerdProvider::new(
            "cluster.local".to_string(),
            "default".to_string(),
        );

        let vs = VirtualService {
            name: "test-service".to_string(),
            namespace: "default".to_string(),
            labels: HashMap::new(),
            annotations: HashMap::new(),
            hosts: vec!["test-service.default.svc.cluster.local".to_string()],
            gateways: vec![],
            http_routes: vec![
                crate::mesh::HttpRoute {
                    name: "test-route".to_string(),
                    matches: vec![
                        crate::mesh::RouteMatch {
                            exact_path: Some("/test".to_string()),
                            prefix_path: None,
                            regex_path: None,
                            method: Some("GET".to_string()),
                            headers: HashMap::new(),
                            port: None,
                        },
                    ],
                    destinations: vec![],
                    timeout: Some(Duration::from_secs(5)),
                    retries: Some(crate::mesh::RetryPolicy {
                        attempts: 3,
                        timeout: Duration::from_secs(1),
                        conditions: vec!["5xx".to_string()],
                    }),
                },
            ],
        };

        let profile = provider.convert_to_service_profile(&vs).unwrap();
        assert_eq!(profile.metadata.name, "test-service");
        assert_eq!(profile.spec.routes.len(), 1);
        assert_eq!(profile.spec.routes[0].name, "test-route");
    }
}
