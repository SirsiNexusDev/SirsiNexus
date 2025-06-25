use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::ComputeResult;

// Core Istio types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IstioVirtualService {
    pub api_version: String,
    pub kind: String,
    pub metadata: IstioMetadata,
    pub spec: VirtualServiceSpec,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IstioMetadata {
    pub name: String,
    pub namespace: String,
    pub labels: Option<HashMap<String, String>>,
    pub annotations: Option<HashMap<String, String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualServiceSpec {
    pub hosts: Vec<String>,
    pub gateways: Option<Vec<String>>,
    pub http: Option<Vec<HTTPRoute>>,
    pub tcp: Option<Vec<TCPRoute>>,
    pub tls: Option<Vec<TLSRoute>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HTTPRoute {
    pub name: Option<String>,
    pub match_rules: Vec<HTTPMatchRequest>,
    pub route: Vec<HTTPRouteDestination>,
    pub timeout: Option<String>,
    pub retries: Option<HTTPRetry>,
    pub fault: Option<HTTPFaultInjection>,
    pub mirror: Option<Destination>,
    pub cors_policy: Option<CorsPolicy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HTTPMatchRequest {
    pub uri: Option<StringMatch>,
    pub scheme: Option<StringMatch>,
    pub method: Option<StringMatch>,
    pub authority: Option<StringMatch>,
    pub headers: Option<HashMap<String, StringMatch>>,
    pub port: Option<u32>,
    pub source_labels: Option<HashMap<String, String>>,
    pub gateways: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StringMatch {
    pub exact: Option<String>,
    pub prefix: Option<String>,
    pub regex: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HTTPRouteDestination {
    pub destination: Destination,
    pub weight: Option<i32>,
    pub headers: Option<Headers>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Destination {
    pub host: String,
    pub subset: Option<String>,
    pub port: Option<PortSelector>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortSelector {
    pub number: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Headers {
    pub request: Option<HeaderOperations>,
    pub response: Option<HeaderOperations>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeaderOperations {
    pub set: Option<HashMap<String, String>>,
    pub add: Option<HashMap<String, String>>,
    pub remove: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HTTPRetry {
    pub attempts: i32,
    pub per_try_timeout: Option<String>,
    pub retry_on: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HTTPFaultInjection {
    pub delay: Option<Delay>,
    pub abort: Option<Abort>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Delay {
    pub fixed_delay: String,
    pub percentage: Option<Percent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Abort {
    pub http_status: i32,
    pub percentage: Option<Percent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Percent {
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorsPolicy {
    pub allow_origin: Vec<String>,
    pub allow_methods: Vec<String>,
    pub allow_headers: Vec<String>,
    pub expose_headers: Vec<String>,
    pub max_age: Option<String>,
    pub allow_credentials: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TCPRoute {
    pub match_rules: Vec<L4MatchAttributes>,
    pub route: Vec<RouteDestination>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TLSRoute {
    pub match_rules: Vec<TLSMatchAttributes>,
    pub route: Vec<RouteDestination>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct L4MatchAttributes {
    pub destination_subnets: Option<Vec<String>>,
    pub port: Option<u32>,
    pub source_subnet: Option<String>,
    pub source_labels: Option<HashMap<String, String>>,
    pub gateways: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TLSMatchAttributes {
    pub sni_hosts: Vec<String>,
    pub destination_subnets: Option<Vec<String>>,
    pub port: Option<u32>,
    pub source_labels: Option<HashMap<String, String>>,
    pub gateways: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteDestination {
    pub destination: Destination,
    pub weight: Option<i32>,
}

// Type conversion traits
pub trait IntoIstio {
    type Output;
    fn into_istio(self) -> ComputeResult<Self::Output>;
}

pub trait FromIstio {
    type Input;
    fn from_istio(istio: Self::Input) -> ComputeResult<Self>;
}

// Implementation for our VirtualService type
impl IntoIstio for crate::mesh::VirtualService {
    type Output = IstioVirtualService;

    fn into_istio(self) -> ComputeResult<Self::Output> {
        Ok(IstioVirtualService {
            api_version: "networking.istio.io/v1beta1".to_string(),
            kind: "VirtualService".to_string(),
            metadata: IstioMetadata {
                name: self.name,
                namespace: self.namespace,
                labels: Some(self.labels),
                annotations: Some(self.annotations),
            },
            spec: VirtualServiceSpec {
                hosts: self.hosts,
                gateways: Some(self.gateways),
                http: Some(self.http_routes.into_iter().map(|route| HTTPRoute {
                    name: Some(route.name),
                    match_rules: route.matches.into_iter().map(|m| HTTPMatchRequest {
                        uri: Some(StringMatch {
                            exact: m.exact_path,
                            prefix: m.prefix_path,
                            regex: m.regex_path,
                        }),
                        scheme: None,
                        method: m.method.map(|method| StringMatch {
                            exact: Some(method),
                            prefix: None,
                            regex: None,
                        }),
                        authority: None,
                        headers: Some(m.headers),
                        port: m.port,
                        source_labels: None,
                        gateways: None,
                    }).collect(),
                    route: route.destinations.into_iter().map(|d| HTTPRouteDestination {
                        destination: Destination {
                            host: d.host,
                            subset: d.subset,
                            port: d.port.map(|p| PortSelector { number: p }),
                        },
                        weight: Some(d.weight),
                        headers: None,
                    }).collect(),
                    timeout: route.timeout.map(|t| t.to_string()),
                    retries: route.retries.map(|r| HTTPRetry {
                        attempts: r.attempts,
                        per_try_timeout: Some(r.timeout.to_string()),
                        retry_on: r.conditions.join(","),
                    }),
                    fault: None,
                    mirror: None,
                    cors_policy: None,
                }).collect()),
                tcp: None,
                tls: None,
            },
        })
    }
}

impl FromIstio for crate::mesh::VirtualService {
    type Input = IstioVirtualService;

    fn from_istio(istio: IstioVirtualService) -> ComputeResult<Self> {
        Ok(crate::mesh::VirtualService {
            name: istio.metadata.name,
            namespace: istio.metadata.namespace,
            labels: istio.metadata.labels.unwrap_or_default(),
            annotations: istio.metadata.annotations.unwrap_or_default(),
            hosts: istio.spec.hosts,
            gateways: istio.spec.gateways.unwrap_or_default(),
            http_routes: istio.spec.http.unwrap_or_default().into_iter().map(|route| {
                crate::mesh::HttpRoute {
                    name: route.name.unwrap_or_default(),
                    matches: route.match_rules.into_iter().map(|m| {
                        crate::mesh::RouteMatch {
                            exact_path: m.uri.as_ref().and_then(|u| u.exact.clone()),
                            prefix_path: m.uri.as_ref().and_then(|u| u.prefix.clone()),
                            regex_path: m.uri.as_ref().and_then(|u| u.regex.clone()),
                            method: m.method.and_then(|method| method.exact),
                            headers: m.headers.unwrap_or_default(),
                            port: m.port,
                        }
                    }).collect(),
                    destinations: route.route.into_iter().map(|d| {
                        crate::mesh::RouteDestination {
                            host: d.destination.host,
                            subset: d.destination.subset,
                            port: d.destination.port.map(|p| p.number),
                            weight: d.weight.unwrap_or(100),
                        }
                    }).collect(),
                    timeout: route.timeout.and_then(|t| t.parse().ok()),
                    retries: route.retries.map(|r| {
                        crate::mesh::RetryPolicy {
                            attempts: r.attempts,
                            timeout: r.per_try_timeout.unwrap_or_default().parse().unwrap_or_default(),
                            conditions: r.retry_on.split(',').map(String::from).collect(),
                        }
                    }),
                }
            }).collect(),
        })
    }
}
