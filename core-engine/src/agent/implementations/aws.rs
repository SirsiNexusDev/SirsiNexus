use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::error::AppResult;
use crate::proto::sirsi::agent::v1::Suggestion;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwsResource {
    pub id: String,
    pub resource_type: String,
    pub region: String,
    pub name: String,
    pub status: String,
    pub tags: HashMap<String, String>,
    pub cost_estimate: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AwsAgentConfig {
    pub access_key: Option<String>,
    pub secret_key: Option<String>,
    pub region: String,
    pub assume_role_arn: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AwsAgent {
    pub agent_id: String,
    pub session_id: String,
    pub config: AwsAgentConfig,
    pub discovered_resources: Arc<RwLock<Vec<AwsResource>>>,
    pub status: Arc<RwLock<String>>,
}

impl AwsAgent {
    pub fn new(agent_id: String, session_id: String, config: HashMap<String, String>) -> Self {
        let aws_config = AwsAgentConfig {
            access_key: config.get("access_key").cloned(),
            secret_key: config.get("secret_key").cloned(),
            region: config.get("region").unwrap_or(&"us-east-1".to_string()).clone(),
            assume_role_arn: config.get("assume_role_arn").cloned(),
        };

        Self {
            agent_id,
            session_id,
            config: aws_config,
            discovered_resources: Arc::new(RwLock::new(Vec::new())),
            status: Arc::new(RwLock::new("initializing".to_string())),
        }
    }

    pub async fn initialize(&self) -> AppResult<()> {
        *self.status.write().await = "ready".to_string();
        Ok(())
    }

    pub async fn process_message(&self, message: &str, _context: HashMap<String, String>) -> AppResult<(String, Vec<Suggestion>)> {
        let message_lower = message.to_lowercase();
        let mut suggestions = Vec::new();

        let response = if message_lower.contains("discover") || message_lower.contains("resources") {
            self.discover_resources().await?;
            let resource_count = self.discovered_resources.read().await.len();
            
            suggestions.push(Suggestion {
                id: Uuid::new_v4().to_string(),
                title: "View Resource Details".to_string(),
                description: "Get detailed information about discovered resources".to_string(),
                action_type: "action".to_string(),
                action_params: HashMap::new(),
                confidence: 0.95,
            });

            if resource_count > 0 {
                suggestions.push(Suggestion {
                    id: Uuid::new_v4().to_string(),
                    title: "Analyze Costs".to_string(),
                    description: "Get cost analysis for discovered resources".to_string(),
                    action_type: "optimization".to_string(),
                    action_params: HashMap::new(),
                    confidence: 0.9,
                });
            }

            format!("✅ AWS resource discovery completed! Found {} resources in region {}.", 
                    resource_count, self.config.region)
        } else if message_lower.contains("cost") || message_lower.contains("price") {
            let cost_analysis = self.analyze_costs().await?;
            
            suggestions.push(Suggestion {
                id: Uuid::new_v4().to_string(),
                title: "Optimize Costs".to_string(),
                description: "Apply cost optimization recommendations".to_string(),
                action_type: "optimization".to_string(),
                action_params: HashMap::new(),
                confidence: 0.85,
            });

            format!("💰 Cost Analysis:\n{}", cost_analysis)
        } else if message_lower.contains("security") {
            let security_analysis = self.analyze_security().await?;
            
            suggestions.push(Suggestion {
                id: Uuid::new_v4().to_string(),
                title: "Fix Security Issues".to_string(),
                description: "Apply security recommendations".to_string(),
                action_type: "security".to_string(),
                action_params: HashMap::new(),
                confidence: 0.9,
            });

            format!("🔒 Security Analysis:\n{}", security_analysis)
        } else if message_lower.contains("migrate") {
            suggestions.push(Suggestion {
                id: Uuid::new_v4().to_string(),
                title: "Generate Migration Plan".to_string(),
                description: "Create a detailed migration strategy".to_string(),
                action_type: "action".to_string(),
                action_params: HashMap::new(),
                confidence: 0.88,
            });

            "🚀 I can help you migrate your AWS resources! I'll analyze your current infrastructure and create a comprehensive migration plan. Would you like me to start by discovering your resources?".to_string()
        } else if message_lower.contains("help") {
            suggestions.extend(vec![
                Suggestion {
                    id: Uuid::new_v4().to_string(),
                    title: "Discover Resources".to_string(),
                    description: "Scan and inventory AWS resources".to_string(),
                    action_type: "action".to_string(),
                    action_params: HashMap::new(),
                    confidence: 0.95,
                },
                Suggestion {
                    id: Uuid::new_v4().to_string(),
                    title: "Cost Analysis".to_string(),
                    description: "Analyze AWS spending and optimization opportunities".to_string(),
                    action_type: "optimization".to_string(),
                    action_params: HashMap::new(),
                    confidence: 0.9,
                },
                Suggestion {
                    id: Uuid::new_v4().to_string(),
                    title: "Security Review".to_string(),
                    description: "Check security configurations and compliance".to_string(),
                    action_type: "security".to_string(),
                    action_params: HashMap::new(),
                    confidence: 0.88,
                },
            ]);

            "🤖 **AWS Agent - Available Commands:**\n\n• **discover** - Scan and inventory your AWS resources\n• **cost** - Analyze spending and optimization opportunities\n• **security** - Review security configurations\n• **migrate** - Plan resource migrations\n\nWhat would you like me to help you with?".to_string()
        } else {
            suggestions.push(Suggestion {
                id: Uuid::new_v4().to_string(),
                title: "Get Help".to_string(),
                description: "Show available AWS commands and capabilities".to_string(),
                action_type: "tutorial".to_string(),
                action_params: HashMap::new(),
                confidence: 0.8,
            });

            format!("I'm your AWS agent! I can help with resource discovery, cost analysis, security reviews, and migration planning. Try asking me to 'discover resources' or 'analyze costs'. Type 'help' to see all available commands.")
        };

        Ok((response, suggestions))
    }

    async fn discover_resources(&self) -> AppResult<()> {
        *self.status.write().await = "busy".to_string();
        
        // Simulate resource discovery
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        
        let mock_resources = vec![
            AwsResource {
                id: "i-1234567890abcdef0".to_string(),
                resource_type: "EC2 Instance".to_string(),
                region: self.config.region.clone(),
                name: "web-server-1".to_string(),
                status: "running".to_string(),
                tags: {
                    let mut tags = HashMap::new();
                    tags.insert("Environment".to_string(), "production".to_string());
                    tags.insert("Application".to_string(), "web".to_string());
                    tags
                },
                cost_estimate: Some(245.50),
            },
            AwsResource {
                id: "vol-049df61146c4d7901".to_string(),
                resource_type: "EBS Volume".to_string(),
                region: self.config.region.clone(),
                name: "web-server-1-root".to_string(),
                status: "in-use".to_string(),
                tags: HashMap::new(),
                cost_estimate: Some(8.00),
            },
            AwsResource {
                id: "sg-903004f8".to_string(),
                resource_type: "Security Group".to_string(),
                region: self.config.region.clone(),
                name: "web-server-sg".to_string(),
                status: "active".to_string(),
                tags: HashMap::new(),
                cost_estimate: None,
            },
            AwsResource {
                id: "rds-mysql-prod".to_string(),
                resource_type: "RDS Instance".to_string(),
                region: self.config.region.clone(),
                name: "production-database".to_string(),
                status: "available".to_string(),
                tags: {
                    let mut tags = HashMap::new();
                    tags.insert("Environment".to_string(), "production".to_string());
                    tags.insert("Database".to_string(), "mysql".to_string());
                    tags
                },
                cost_estimate: Some(156.80),
            },
        ];

        *self.discovered_resources.write().await = mock_resources;
        *self.status.write().await = "ready".to_string();
        
        Ok(())
    }

    async fn analyze_costs(&self) -> AppResult<String> {
        let resources = self.discovered_resources.read().await;
        let total_cost: f64 = resources
            .iter()
            .filter_map(|r| r.cost_estimate)
            .sum();

        let cost_breakdown = resources
            .iter()
            .filter(|r| r.cost_estimate.is_some())
            .map(|r| format!("• {}: ${:.2}/month", r.name, r.cost_estimate.unwrap()))
            .collect::<Vec<_>>()
            .join("\n");

        Ok(format!(
            "**Monthly Cost Breakdown:**\n{}\n\n**Total Estimated Cost:** ${:.2}/month\n\n**Optimization Opportunities:**\n• Consider Reserved Instances for EC2 (potential 30% savings)\n• Review EBS volume usage and consider gp3 volumes\n• Implement auto-scaling to optimize compute costs",
            cost_breakdown, total_cost
        ))
    }

    async fn analyze_security(&self) -> AppResult<String> {
        let resources = self.discovered_resources.read().await;
        let mut findings = Vec::new();

        // Mock security analysis
        if resources.iter().any(|r| r.resource_type == "Security Group") {
            findings.push("✅ Security groups configured");
        }

        if resources.iter().any(|r| r.resource_type == "EC2 Instance") {
            findings.push("⚠️  EC2 instances should have IMDSv2 enforced");
            findings.push("⚠️  Consider enabling detailed monitoring");
        }

        if resources.iter().any(|r| r.resource_type == "RDS Instance") {
            findings.push("✅ RDS instance found - ensure encryption at rest is enabled");
            findings.push("⚠️  Verify backup retention period meets requirements");
        }

        findings.push("🔍 Recommendation: Enable AWS Config for compliance monitoring");
        findings.push("🔍 Recommendation: Set up CloudTrail for audit logging");

        Ok(findings.join("\n"))
    }

    pub async fn get_suggestions(&self, suggestion_type: &str, _context: HashMap<String, String>) -> AppResult<Vec<Suggestion>> {
        let mut suggestions = Vec::new();

        match suggestion_type {
            "action" => {
                suggestions.extend(vec![
                    Suggestion {
                        id: Uuid::new_v4().to_string(),
                        title: "Discover AWS Resources".to_string(),
                        description: "Scan your AWS account for resources across all regions".to_string(),
                        action_type: "action".to_string(),
                        action_params: HashMap::new(),
                        confidence: 0.95,
                    },
                    Suggestion {
                        id: Uuid::new_v4().to_string(),
                        title: "Create Migration Plan".to_string(),
                        description: "Generate a comprehensive migration strategy".to_string(),
                        action_type: "action".to_string(),
                        action_params: HashMap::new(),
                        confidence: 0.9,
                    },
                ]);
            }
            "optimization" => {
                suggestions.extend(vec![
                    Suggestion {
                        id: Uuid::new_v4().to_string(),
                        title: "Cost Optimization".to_string(),
                        description: "Identify opportunities to reduce AWS spending".to_string(),
                        action_type: "optimization".to_string(),
                        action_params: HashMap::new(),
                        confidence: 0.88,
                    },
                    Suggestion {
                        id: Uuid::new_v4().to_string(),
                        title: "Right-size Instances".to_string(),
                        description: "Analyze and recommend optimal instance sizes".to_string(),
                        action_type: "optimization".to_string(),
                        action_params: HashMap::new(),
                        confidence: 0.85,
                    },
                ]);
            }
            "security" => {
                suggestions.extend(vec![
                    Suggestion {
                        id: Uuid::new_v4().to_string(),
                        title: "Security Assessment".to_string(),
                        description: "Comprehensive security review of AWS resources".to_string(),
                        action_type: "security".to_string(),
                        action_params: HashMap::new(),
                        confidence: 0.92,
                    },
                    Suggestion {
                        id: Uuid::new_v4().to_string(),
                        title: "Compliance Check".to_string(),
                        description: "Verify compliance with security best practices".to_string(),
                        action_type: "security".to_string(),
                        action_params: HashMap::new(),
                        confidence: 0.89,
                    },
                ]);
            }
            _ => {
                suggestions.push(Suggestion {
                    id: Uuid::new_v4().to_string(),
                    title: "AWS General Help".to_string(),
                    description: "Get general assistance with AWS operations".to_string(),
                    action_type: "tutorial".to_string(),
                    action_params: HashMap::new(),
                    confidence: 0.8,
                });
            }
        }

        Ok(suggestions)
    }

    pub async fn get_status(&self) -> AppResult<(String, HashMap<String, String>, Vec<String>)> {
        let status = self.status.read().await.clone();
        let resource_count = self.discovered_resources.read().await.len();
        
        let mut metrics = HashMap::new();
        metrics.insert("resources_discovered".to_string(), resource_count.to_string());
        metrics.insert("region".to_string(), self.config.region.clone());
        metrics.insert("last_discovery".to_string(), chrono::Utc::now().to_rfc3339());

        let capabilities = vec![
            "resource_discovery".to_string(),
            "cost_analysis".to_string(),
            "security_assessment".to_string(),
            "migration_planning".to_string(),
            "aws_specific".to_string(),
        ];

        Ok((status, metrics, capabilities))
    }
}
