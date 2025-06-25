use aws_config::SdkConfig;
use aws_sdk_ec2::Client as Ec2Client;
use aws_sdk_rds::Client as RdsClient;
use aws_sdk_s3::Client as S3Client;
use aws_sdk_iam::Client as IamClient;
use aws_sdk_eks::Client as EksClient;
use aws_sdk_cloudformation::Client as CloudFormationClient;

use crate::error::{AgentError, AgentResult};
use super::config::AwsConfig;

pub struct AwsClient {
    config: SdkConfig,
    ec2: Ec2Client,
    rds: RdsClient,
    s3: S3Client,
    iam: IamClient,
    eks: EksClient,
    cloudformation: CloudFormationClient,
}

impl AwsClient {
    pub async fn new(aws_config: &AwsConfig) -> AgentResult<Self> {
        let config = aws_config::from_env()
            .region(aws_config.region.clone())
            .load()
            .await;

        Ok(Self {
            ec2: Ec2Client::new(&config),
            rds: RdsClient::new(&config),
            s3: S3Client::new(&config),
            iam: IamClient::new(&config),
            eks: EksClient::new(&config),
            cloudformation: CloudFormationClient::new(&config),
            config,
        })
    }

    pub fn ec2(&self) -> &Ec2Client {
        &self.ec2
    }

    pub fn rds(&self) -> &RdsClient {
        &self.rds
    }

    pub fn s3(&self) -> &S3Client {
        &self.s3
    }

    pub fn iam(&self) -> &IamClient {
        &self.iam
    }

    pub fn eks(&self) -> &EksClient {
        &self.eks
    }

    pub fn cloudformation(&self) -> &CloudFormationClient {
        &self.cloudformation
    }

    pub fn config(&self) -> &SdkConfig {
        &self.config
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use aws_sdk_ec2::Config as Ec2Config;
    use aws_smithy_runtime::test_util::capture::capture_test_output;

    #[tokio::test]
    async fn test_client_creation() {
        let config = AwsConfig {
            region: "us-east-1".to_string(),
            // Add other config fields as needed
        };

        let client = AwsClient::new(&config).await.unwrap();
        
        // Test EC2 client
        let output = capture_test_output(client.ec2().describe_instances())
            .await
            .expect("Failed to capture test output");
        
        assert!(output.was_success());
    }
}
