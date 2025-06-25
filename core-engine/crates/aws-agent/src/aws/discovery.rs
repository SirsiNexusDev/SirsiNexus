use std::collections::HashMap;
use aws_sdk_ec2::types::{Instance, Tag};
use aws_sdk_rds::types::DBInstance;
use aws_sdk_s3::types::Bucket;
use aws_sdk_iam::types::Role;
use aws_sdk_eks::types::Cluster;
use futures::stream::StreamExt;
use tracing::{info, warn};

use crate::{
    error::{AgentError, AgentResult},
    service::{Resource, ResourceMetadata, ResourceStatus, Ec2Instance, RdsInstance, S3Bucket, IamRole, EksCluster},
};
use super::client::AwsClient;

pub struct ResourceDiscovery {
    client: AwsClient,
}

impl ResourceDiscovery {
    pub fn new(client: AwsClient) -> Self {
        Self { client }
    }

    pub async fn discover_ec2_instances(&self) -> AgentResult<Vec<Resource>> {
        let instances = self.client.ec2()
            .describe_instances()
            .send()
            .await
            .map_err(|e| AgentError::AwsSdk(e.to_string()))?;

        let mut resources = Vec::new();
        for reservation in instances.reservations().unwrap_or_default() {
            for instance in reservation.instances().unwrap_or_default() {
                resources.push(self.convert_ec2_instance(instance)?);
            }
        }

        Ok(resources)
    }

    pub async fn discover_rds_instances(&self) -> AgentResult<Vec<Resource>> {
        let instances = self.client.rds()
            .describe_db_instances()
            .send()
            .await
            .map_err(|e| AgentError::AwsSdk(e.to_string()))?;

        let mut resources = Vec::new();
        for instance in instances.db_instances().unwrap_or_default() {
            resources.push(self.convert_rds_instance(instance)?);
        }

        Ok(resources)
    }

    pub async fn discover_s3_buckets(&self) -> AgentResult<Vec<Resource>> {
        let buckets = self.client.s3()
            .list_buckets()
            .send()
            .await
            .map_err(|e| AgentError::AwsSdk(e.to_string()))?;

        let mut resources = Vec::new();
        for bucket in buckets.buckets().unwrap_or_default() {
            resources.push(self.convert_s3_bucket(bucket)?);
        }

        Ok(resources)
    }

    fn convert_ec2_instance(&self, instance: &Instance) -> AgentResult<Resource> {
        let instance_id = instance.instance_id()
            .ok_or_else(|| AgentError::AwsSdk("Missing instance ID".into()))?;

        let metadata = ResourceMetadata {
            details: Some(crate::service::resource_metadata::Details::Ec2Instance(
                Ec2Instance {
                    instance_type: instance.instance_type()
                        .map(|t| t.as_str().to_string())
                        .unwrap_or_default(),
                    platform: instance.platform()
                        .map(|p| p.as_str().to_string())
                        .unwrap_or_default(),
                    security_groups: instance.security_groups()
                        .unwrap_or_default()
                        .iter()
                        .filter_map(|g| g.group_id().map(|id| id.to_string()))
                        .collect(),
                    subnet_ids: vec![instance.subnet_id()
                        .map(|id| id.to_string())
                        .unwrap_or_default()],
                    vpc_id: instance.vpc_id()
                        .map(|id| id.to_string())
                        .unwrap_or_default(),
                    network_interfaces: HashMap::new(), // TODO: Add network interface details
                    volume_ids: instance.block_device_mappings()
                        .unwrap_or_default()
                        .iter()
                        .filter_map(|bdm| bdm.ebs().and_then(|ebs| ebs.volume_id().map(|id| id.to_string())))
                        .collect(),
                }
            )),
        };

        Ok(Resource {
            id: instance_id.to_string(),
            r#type: "ec2".to_string(),
            name: instance.tags()
                .unwrap_or_default()
                .iter()
                .find(|t| t.key() == Some("Name"))
                .and_then(|t| t.value())
                .map(|v| v.to_string())
                .unwrap_or_else(|| instance_id.to_string()),
            region: self.client.config().region().unwrap().to_string(),
            arn: format!("arn:aws:ec2:{}:{}:instance/{}", 
                self.client.config().region().unwrap(),
                "account-id", // TODO: Get actual account ID
                instance_id),
            tags: instance.tags()
                .unwrap_or_default()
                .iter()
                .filter_map(|t| {
                    Some((
                        t.key()?.to_string(),
                        t.value()?.to_string(),
                    ))
                })
                .collect(),
            metadata: Some(metadata),
            dependencies: Vec::new(), // TODO: Discover dependencies
            status: match instance.state().and_then(|s| s.name()) {
                Some(state) if state.as_str() == "running" => ResourceStatus::RESOURCE_STATUS_ACTIVE as i32,
                Some(state) if state.as_str() == "stopped" => ResourceStatus::RESOURCE_STATUS_INACTIVE as i32,
                Some(state) if state.as_str() == "pending" => ResourceStatus::RESOURCE_STATUS_PENDING as i32,
                Some(state) if state.as_str() == "terminated" => ResourceStatus::RESOURCE_STATUS_FAILED as i32,
                _ => ResourceStatus::RESOURCE_STATUS_UNSPECIFIED as i32,
            },
        })
    }

    // TODO: Implement convert_rds_instance, convert_s3_bucket, etc.
}

#[cfg(test)]
mod tests {
    use super::*;
    use aws_sdk_ec2::types::{InstanceState, InstanceStateCode, InstanceStateChange, InstanceStateName};
    use aws_smithy_runtime::test_util::capture::capture_test_output;

    #[tokio::test]
    async fn test_discover_ec2_instances() {
        // TODO: Implement test with mock AWS client
    }
}
