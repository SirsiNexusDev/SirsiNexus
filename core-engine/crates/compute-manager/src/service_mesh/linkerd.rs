use async_trait::async_trait;
use std::sync::Arc;
use k8s_openapi::api::core::v1::{Service, ServiceSpec};
use kube::{
    api::{Api, ListParams, PostParams},
    client::Client,
    config::KubeConfig,
    ResourceExt,
};

use crate::error::{ComputeError, ComputeResult};
use super::{
    ServiceMesh, ServiceMeshConfig, VirtualService, TrafficPolicy,
    CircuitBreakerConfig, RetryPolicy, AuthorizationPolicy, AuthenticationPolicy,
    TracingConfig, MetricsConfig, ServiceMeshMetrics, Trace,
};

const LINKERD_INJECT_ANNOTATION: &str = "linkerd.io/inject";
const LINKERD_PROXY_ANNOTATION: &str = "config.linkerd.io/proxy";
const LINKERD_RETRY_ANNOTATION: &str = "config.linkerd.io/retries";
const LINKERD_TIMEOUT_ANNOTATION: &str = "config.linkerd.io/timeout";

pub struct LinkerdProvider {
    client: Client,
    config: ServiceMeshConfig,
}

#[async_trait]
impl ServiceMesh for LinkerdProvider {
    async fn init(config: ServiceMeshConfig) -> ComputeResult<Box<dyn ServiceMesh>> {
        let client = Client::try_default()
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to create Kubernetes client: {}", e)))?;

        Ok(Box::new(Self { client, config }))
    }

    async fn get_config(&self) -> ComputeResult<ServiceMeshConfig> {
        Ok(self.config.clone())
    }

    async fn update_config(&self, config: ServiceMeshConfig) -> ComputeResult<ServiceMeshConfig> {
        unimplemented!("Linkerd provider update_config not yet implemented")
    }

    async fn create_virtual_service(&self, service: VirtualService) -> ComputeResult<VirtualService> {
        // Linkerd doesn't have VirtualService concept like Istio
        // Instead, we create a Kubernetes Service with appropriate annotations
        let k8s_service = self.create_service_from_virtual_service(&service)?;
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        api.create(&PostParams::default(), &k8s_service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to create service: {}", e)))?;

        Ok(service)
    }

    async fn update_virtual_service(&self, service: VirtualService) -> ComputeResult<VirtualService> {
        let k8s_service = self.create_service_from_virtual_service(&service)?;
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        api.replace(&service.name, &PostParams::default(), &k8s_service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to update service: {}", e)))?;

        Ok(service)
    }

    async fn delete_virtual_service(&self, name: &str) -> ComputeResult<()> {
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        api.delete(name, &Default::default())
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to delete service: {}", e)))?;

        Ok(())
    }

    async fn get_virtual_service(&self, name: &str) -> ComputeResult<VirtualService> {
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        let service = api
            .get(name)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to get service: {}", e)))?;

        self.create_virtual_service_from_service(&service)
    }

    async fn list_virtual_services(&self) -> ComputeResult<Vec<VirtualService>> {
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        let services = api
            .list(&ListParams::default().labels(&format!("{}=true", LINKERD_INJECT_ANNOTATION)))
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to list services: {}", e)))?;

        let mut virtual_services = Vec::new();
        for service in services.items {
            if let Ok(vs) = self.create_virtual_service_from_service(&service) {
                virtual_services.push(vs);
            }
        }

        Ok(virtual_services)
    }

    async fn set_traffic_policy(&self, service: &str, policy: TrafficPolicy) -> ComputeResult<()> {
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        let mut service = api
            .get(service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to get service: {}", e)))?;

        // Add Linkerd traffic policy annotations
        let annotations = service.metadata.annotations.get_or_insert(Default::default());
        self.add_traffic_policy_annotations(annotations, &policy);

        api.replace(service.name_any().as_ref(), &PostParams::default(), &service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to update service: {}", e)))?;

        Ok(())
    }

    async fn get_traffic_policy(&self, service: &str) -> ComputeResult<TrafficPolicy> {
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        let service = api
            .get(service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to get service: {}", e)))?;

        self.extract_traffic_policy(&service)
    }

    async fn create_circuit_breaker(&self, service: &str, config: CircuitBreakerConfig) -> ComputeResult<()> {
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        let mut service = api
            .get(service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to get service: {}", e)))?;

        let annotations = service.metadata.annotations.get_or_insert(Default::default());
        self.add_circuit_breaker_annotations(annotations, &config);

        api.replace(service.name_any().as_ref(), &PostParams::default(), &service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to update service: {}", e)))?;

        Ok(())
    }

    async fn create_retry_policy(&self, service: &str, policy: RetryPolicy) -> ComputeResult<()> {
        let namespace = &self.config.namespace;
        let api: Api<Service> = Api::namespaced(self.client.clone(), namespace);

        let mut service = api
            .get(service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to get service: {}", e)))?;

        let annotations = service.metadata.annotations.get_or_insert(Default::default());
        self.add_retry_policy_annotations(annotations, &policy);

        api.replace(service.name_any().as_ref(), &PostParams::default(), &service)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to update service: {}", e)))?;

        Ok(())
    }

    async fn enable_mtls(&self, namespace: &str) -> ComputeResult<()> {
        // Linkerd enables mTLS by default for meshed pods
        // We just need to ensure the namespace is annotated for injection
        let api: Api<k8s_openapi::api::core::v1::Namespace> = Api::all(self.client.clone());

        let mut ns = api
            .get(namespace)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to get namespace: {}", e)))?;

        let annotations = ns.metadata.annotations.get_or_insert(Default::default());
        annotations.insert(LINKERD_INJECT_ANNOTATION.to_string(), "enabled".to_string());

        api.replace(namespace, &PostParams::default(), &ns)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to update namespace: {}", e)))?;

        Ok(())
    }

    async fn disable_mtls(&self, namespace: &str) -> ComputeResult<()> {
        let api: Api<k8s_openapi::api::core::v1::Namespace> = Api::all(self.client.clone());

        let mut ns = api
            .get(namespace)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to get namespace: {}", e)))?;

        if let Some(annotations) = ns.metadata.annotations.as_mut() {
            annotations.remove(LINKERD_INJECT_ANNOTATION);
        }

        api.replace(namespace, &PostParams::default(), &ns)
            .await
            .map_err(|e| ComputeError::Provider(format!("Failed to update namespace: {}", e)))?;

        Ok(())
    }

    async fn create_authorization_policy(&self, policy: AuthorizationPolicy) -> ComputeResult<()> {
        // Linkerd uses RBAC for authorization, which needs to be handled differently
        unimplemented!("Linkerd provider create_authorization_policy not yet implemented")
    }

    async fn create_authentication_policy(&self, policy: AuthenticationPolicy) -> ComputeResult<()> {
        unimplemented!("Linkerd provider create_authentication_policy not yet implemented")
    }

    async fn enable_tracing(&self, config: TracingConfig) -> ComputeResult<()> {
        unimplemented!("Linkerd provider enable_tracing not yet implemented")
    }

    async fn enable_metrics(&self, config: MetricsConfig) -> ComputeResult<()> {
        unimplemented!("Linkerd provider enable_metrics not yet implemented")
    }

    async fn get_service_metrics(&self, service: &str) -> ComputeResult<ServiceMeshMetrics> {
        unimplemented!("Linkerd provider get_service_metrics not yet implemented")
    }

    async fn get_service_traces(&self, service: &str, start_time: i64, end_time: i64) -> ComputeResult<Vec<Trace>> {
        unimplemented!("Linkerd provider get_service_traces not yet implemented")
    }
}

impl LinkerdProvider {
    fn create_service_from_virtual_service(&self, vs: &VirtualService) -> ComputeResult<Service> {
        let mut annotations = std::collections::HashMap::new();
        annotations.insert(LINKERD_INJECT_ANNOTATION.to_string(), "enabled".to_string());

        // Convert routing rules to Linkerd annotations
        if let Some(route) = vs.http_routes.first() {
            if let Some(timeout) = &route.timeout {
                annotations.insert(format!("{}-timeout", LINKERD_TIMEOUT_ANNOTATION), timeout.clone());
            }

            if let Some(retry) = &route.retry_policy {
                annotations.insert(
                    format!("{}-retry", LINKERD_RETRY_ANNOTATION),
                    serde_json::to_string(retry).map_err(|e| {
                        ComputeError::Provider(format!("Failed to serialize retry policy: {}", e))
                    })?,
                );
            }
        }

        let mut service = Service::default();
        service.metadata.name = Some(vs.name.clone());
        service.metadata.annotations = Some(annotations);

        let mut spec = ServiceSpec::default();
        // Convert routing rules to service ports
        if let Some(route) = vs.http_routes.first() {
            if let Some(dest) = route.route.first() {
                if let Some(port) = dest.port {
                    spec.ports = Some(vec![k8s_openapi::api::core::v1::ServicePort {
                        port,
                        ..Default::default()
                    }]);
                }
            }
        }
        service.spec = Some(spec);

        Ok(service)
    }

    fn create_virtual_service_from_service(&self, service: &Service) -> ComputeResult<VirtualService> {
        let name = service.metadata.name.clone().unwrap_or_default();
        let mut vs = VirtualService {
            name,
            hosts: vec![],
            gateways: vec![],
            http_routes: vec![],
            tcp_routes: vec![],
        };

        if let Some(spec) = &service.spec {
            if let Some(ports) = &spec.ports {
                for port in ports {
                    let route = super::HttpRoute {
                        name: format!("route-{}", port.port),
                        match_rules: vec![],
                        route: vec![super::RouteDestination {
                            host: service.metadata.name.clone().unwrap_or_default(),
                            subset: None,
                            port: Some(port.port),
                            weight: 100,
                        }],
                        retry_policy: None,
                        timeout: None,
                        fault_injection: None,
                    };
                    vs.http_routes.push(route);
                }
            }
        }

        Ok(vs)
    }

    fn add_traffic_policy_annotations(&self, annotations: &mut std::collections::HashMap<String, String>, policy: &TrafficPolicy) {
        // Convert traffic policy to Linkerd annotations
        let policy_json = serde_json::to_string(&policy).unwrap_or_default();
        annotations.insert(LINKERD_PROXY_ANNOTATION.to_string(), policy_json);
    }

    fn add_circuit_breaker_annotations(&self, annotations: &mut std::collections::HashMap<String, String>, config: &CircuitBreakerConfig) {
        // Convert circuit breaker config to Linkerd annotations
        let config_json = serde_json::to_string(&config).unwrap_or_default();
        annotations.insert(format!("{}-circuit-breaker", LINKERD_PROXY_ANNOTATION), config_json);
    }

    fn add_retry_policy_annotations(&self, annotations: &mut std::collections::HashMap<String, String>, policy: &RetryPolicy) {
        // Convert retry policy to Linkerd annotations
        annotations.insert(
            format!("{}-retry-attempts", LINKERD_RETRY_ANNOTATION),
            policy.attempts.to_string(),
        );
        annotations.insert(
            format!("{}-retry-timeout", LINKERD_RETRY_ANNOTATION),
            policy.per_try_timeout.clone(),
        );
    }

    fn extract_traffic_policy(&self, service: &Service) -> ComputeResult<TrafficPolicy> {
        if let Some(annotations) = &service.metadata.annotations {
            if let Some(policy_json) = annotations.get(LINKERD_PROXY_ANNOTATION) {
                return serde_json::from_str(policy_json)
                    .map_err(|e| ComputeError::Provider(format!("Failed to parse traffic policy: {}", e)));
            }
        }

        // Return default traffic policy if no annotations found
        Ok(TrafficPolicy {
            load_balancer: super::LoadBalancerConfig {
                lb_type: super::LoadBalancerType::ClusterIp,
                source_ranges: Vec::new(),
                ip_families: vec!["IPv4".to_string()],
                session_affinity: None,
            },
            connection_pool: super::ConnectionPool {
                tcp: super::TcpSettings {
                    max_connections: 100,
                    connect_timeout: "1s".to_string(),
                },
                http: super::HttpSettings {
                    http1_max_pending_requests: 100,
                    http2_max_requests: 1000,
                    max_requests_per_connection: 100,
                    max_retries: 3,
                },
            },
            outlier_detection: super::OutlierDetection {
                consecutive_errors: 5,
                interval: "10s".to_string(),
                base_ejection_time: "30s".to_string(),
                max_ejection_percent: 10,
            },
            tls: super::TlsConfig {
                mode: super::TlsMode::Mutual,
                certificate_path: None,
                private_key_path: None,
                ca_certificate_path: None,
                min_protocol_version: "TLSv1.2".to_string(),
                cipher_suites: Vec::new(),
            },
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    async fn setup_test_provider() -> ComputeResult<LinkerdProvider> {
        let config = ServiceMeshConfig::new(
            super::super::MeshType::Linkerd,
            "default".to_string(),
        );

        if let Ok(provider) = LinkerdProvider::init(config).await {
            Ok(*provider.downcast::<LinkerdProvider>().unwrap())
        } else {
            Err(ComputeError::Provider("Failed to create test provider".into()))
        }
    }

    #[tokio::test]
    async fn test_create_service_from_virtual_service() {
        let provider = setup_test_provider().await.unwrap();
        let vs = VirtualService {
            name: "test-service".to_string(),
            hosts: vec!["test.example.com".to_string()],
            gateways: vec!["test-gateway".to_string()],
            http_routes: vec![
                super::super::HttpRoute {
                    name: "primary".to_string(),
                    match_rules: vec![],
                    route: vec![
                        super::super::RouteDestination {
                            host: "test-service.default.svc.cluster.local".to_string(),
                            subset: None,
                            port: Some(8080),
                            weight: 100,
                        },
                    ],
                    retry_policy: Some(super::super::RetryPolicy {
                        attempts: 3,
                        per_try_timeout: "2s".to_string(),
                        retry_on: vec!["5xx".to_string()],
                    }),
                    timeout: Some("5s".to_string()),
                    fault_injection: None,
                },
            ],
            tcp_routes: Vec::new(),
        };

        let service = provider.create_service_from_virtual_service(&vs).unwrap();
        
        assert_eq!(service.metadata.name, Some("test-service".to_string()));
        assert!(service.metadata.annotations.is_some());
        assert_eq!(
            service.metadata.annotations.as_ref().unwrap().get(LINKERD_INJECT_ANNOTATION),
            Some(&"enabled".to_string())
        );
    }

    #[tokio::test]
    async fn test_extract_traffic_policy() {
        let provider = setup_test_provider().await.unwrap();
        let mut service = Service::default();
        service.metadata.annotations = Some(HashMap::new());

        let policy = provider.extract_traffic_policy(&service).unwrap();
        assert_eq!(policy.connection_pool.tcp.max_connections, 100);
        assert_eq!(policy.connection_pool.http.max_retries, 3);
    }
}
