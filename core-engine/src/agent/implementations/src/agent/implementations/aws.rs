use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::error::AppResult;
use crate::proto::sirsi::agent::v1::{Suggestion, Action};

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
    fn create_suggestion(
        title: &str,
        description: &str,
        suggestion_type: SuggestionType,
        action_type: &str,
        confidence: f32,
        priority: i32,
    ) -> Suggestion {
        Suggestion {
            suggestion_id: Uuid::new_v4().to_string(),
            title: title.to_string(),
            description: description.to_string(),
            r#type: suggestion_type as i32,
            action: Some(Action {
                action_type: action_type.to_string(),
                parameters: HashMap::new(),
                command: "".to_string(),
                required_permissions: vec![],
            }),
            confidence,
            metadata: HashMap::new(),
            priority,
        }
    }

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
            
            suggestions.push(Self::create_suggestion(
                "View Resource Details",
                "Get detailed information about discovered resources",
                SuggestionType::SuggestionTypeAction,
                "view_details",
                0.95,
                1,
            ));

            if resource_count > 0 {
                suggestions.push(Self::create_suggestion(
                    "Analyze Costs",
                    "Get cost analysis for discovered resources",
                    SuggestionType::SuggestionTypeOptimization,
                    "cost_analysis",
                    0.9,
                    2,
                ));
            }

            format!("✅ AWS resource discovery completed! Found {} resources in region {}.", 
                    resource_count, self.config.region)
        } else if message_lower.contains("cost") || message_lower.contains("price") {
            let cost_analysis = self.analyze_costs().await?;
            
            suggestions.push(Self::create_suggestion(
                "Optimize Costs",
                "Apply cost optimization recommendations",
                SuggestionType::SuggestionTypeOptimization,
                "cost_optimization",
                0.85,
                1,
            ));

            format!("💰 Cost Analysis:\n{}", cost_analysis)
        } else if message_lower.contains("security") {
            let security_analysis = self.analyze_security().await?;
            
            suggestions.push(Self::create_suggestion(
                "Fix Security Issues",
                "Apply security recommendations",
                SuggestionType::SuggestionTypeWarning,
                "security_fix",
                0.9,
                1,
            ));

            format!("🔒 Security Analysis:\n{}", security_analysis)
        } else if message_lower.contains("migrate") {
            suggestions.push(Self::create_suggestion(
                "Generate Migration Plan",
                "Create a detailed migration strategy",
                SuggestionType::SuggestionTypeAction,
                "migration_plan",
                0.88,
                1,
            ));

            "🚀 I can help you migrate your AWS resources! I'll analyze your current infrastructure and create a comprehensive migration plan. Would you like me to start by discovering your resources?".to_string()
        } else if message_lower.contains("help") {
            suggestions.extend(vec![
                Self::create_suggestion(
                    "Discover Resources",
                    "Scan and inventory AWS resources",
                    SuggestionType::SuggestionTypeAction,
                    "discover_resources",
                    0.95,
                    1,
                ),
                Self::create_suggestion(
                    "Cost Analysis",
                    "Analyze AWS spending and optimization opportunities",
                    SuggestionType::SuggestionTypeOptimization,
                    "cost_analysis",
                    0.9,
                    2,
                ),
                Self::create_suggestion(
                    "Security Review",
                    "Check security configurations and compliance",
                    SuggestionType::SuggestionTypeWarning,
                    "security_review",
                    0.88,
                    3,
                ),
            ]);

            "🤖 **AWS Agent - Available Commands:**\n\n• **discover** - Scan and inventory your AWS resources\n• **cost** - Analyze spending and optimization opportunities\n• **security** - Review security configurations\n• **migrate** - Plan resource migrations\n\nWhat would you like me to help you with?".to_string()
        } else {
            suggestions.push(Self::create_suggestion(
                "Get Help",
                "Show available AWS commands and capabilities",
                SuggestionType::SuggestionTypeAction,
                "help",
                0.8,
                1,
            ));

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
                cost_estimate: Some(32.80),
            },
            AwsResource {
                id: "sg-903004f8".to_string(),
                resource_type: "Security Group".to_string(),
                region: self.config.region.clone(),
                name: "web-security-group".to_string(),
                status: "active".to_string(),
                tags: HashMap::new(),
                cost_estimate: None,
            },
        ];

        *self.discovered_resources.write().await = mock_resources;
        *self.status.write().await = "ready".to_string();
        
        Ok(())
    }

    async fn analyze_costs(&self) -> AppResult<String> {
        *self.status.write().await = "busy".to_string();
        
        // Simulate cost analysis
        tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
        
        let resources = self.discovered_resources.read().await;
        let total_cost: f64 = resources.iter()
            .filter_map(|r| r.cost_estimate)
            .sum();
        
        let analysis = format!(
            "📊 **Monthly Cost Breakdown:**\n\
            • EC2 Instances: $245.50\n\
            • EBS Volumes: $32.80\n\
            • **Total Monthly Cost: ${:.2}**\n\n\
            💡 **Optimization Opportunities:**\n\
            • Consider using Reserved Instances for EC2 (potential 30% savings)\n\
            • Review unused EBS volumes\n\
            • Implement automated start/stop schedules for non-prod instances",
            total_cost
        );
        
        *self.status.write().await = "ready".to_string();
        Ok(analysis)
    }

    async fn analyze_security(&self) -> AppResult<String> {
        *self.status.write().await = "busy".to_string();
        
        // Simulate security analysis
        tokio::time::sleep(tokio::time::Duration::from_millis(400)).await;
        
        let analysis = "🛡️ **Security Assessment:**\n\
            ✅ EC2 instances are using security groups\n\
            ⚠️ Security group 'web-security-group' allows inbound traffic from 0.0.0.0/0\n\
            ✅ EBS volumes are encrypted\n\
            ⚠️ No MFA enabled on root account\n\n\
            🔧 **Recommendations:**\n\
            • Restrict security group rules to specific IP ranges\n\
            • Enable MFA on all AWS accounts\n\
            • Implement AWS Config for compliance monitoring\n\
            • Review IAM policies for least privilege access".to_string();
        
        *self.status.write().await = "ready".to_string();
        Ok(analysis)
    }

    pub async fn get_suggestions(&self, context_type: &str, _context: HashMap<String, String>) -> AppResult<Vec<Suggestion>> {
        let mut suggestions = Vec::new();
        
        match context_type {
            "resource_management" => {
                suggestions.push(Self::create_suggestion(
                    "Discover Resources",
                    "Scan and catalog all AWS resources in your account",
                    SuggestionType::SuggestionTypeAction,
                    "discover_resources",
                    0.95,
                    1,
                ));
                
                suggestions.push(Self::create_suggestion(
                    "Resource Tagging",
                    "Implement consistent tagging strategy across resources",
                    SuggestionType::SuggestionTypeOptimization,
                    "implement_tagging",
                    0.85,
                    2,
                ));
            },
            "cost_optimization" => {
                suggestions.push(Self::create_suggestion(
                    "Cost Analysis",
                    "Detailed breakdown of AWS spending with optimization recommendations",
                    SuggestionType::SuggestionTypeOptimization,
                    "cost_analysis",
                    0.92,
                    1,
                ));
                
                suggestions.push(Self::create_suggestion(
                    "Reserved Instance Analysis",
                    "Identify opportunities for Reserved Instance purchases",
                    SuggestionType::SuggestionTypeOptimization,
                    "ri_analysis",
                    0.87,
                    2,
                ));
            },
            "security" => {
                suggestions.push(Self::create_suggestion(
                    "Security Assessment",
                    "Comprehensive security review of AWS resources",
                    SuggestionType::SuggestionTypeWarning,
                    "security_assessment",
                    0.93,
                    1,
                ));
                
                suggestions.push(Self::create_suggestion(
                    "IAM Policy Review",
                    "Analyze and optimize IAM policies for least privilege",
                    SuggestionType::SuggestionTypeWarning,
                    "iam_review",
                    0.89,
                    2,
                ));
            },
            _ => {
                suggestions.push(Self::create_suggestion(
                    "AWS Health Check",
                    "General health check of your AWS environment",
                    SuggestionType::SuggestionTypeInsight,
                    "health_check",
                    0.8,
                    1,
                ));
            }
        }
        
        Ok(suggestions)
    }

    pub async fn get_status(&self) -> AppResult<(String, HashMap<String, String>, Vec<String>)> {
        let status = self.status.read().await.clone();
        let resource_count = self.discovered_resources.read().await.len();
        
        let mut metrics = HashMap::new();
        metrics.insert("discovered_resources".to_string(), resource_count.to_string());
        metrics.insert("region".to_string(), self.config.region.clone());
        metrics.insert("last_discovery".to_string(), "2023-12-07T10:30:00Z".to_string());
        
        let capabilities = vec![
            "resource_discovery".to_string(),
            "cost_analysis".to_string(),
            "security_assessment".to_string(),
            "migration_planning".to_string(),
        ];
        
        Ok((status, metrics, capabilities))
    }
}
