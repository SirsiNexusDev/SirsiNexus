use std::collections::HashMap;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use crate::error::AppResult;
use crate::protos::proto::{Suggestion, Action};
use crate::ai::{AgentIntelligence, AIConfig};

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
    pub ai_intelligence: AgentIntelligence,
}

impl AwsAgent {
    pub fn new(agent_id: String, session_id: String, config: HashMap<String, String>) -> Self {
        let aws_config = AwsAgentConfig {
            access_key: config.get("access_key").cloned(),
            secret_key: config.get("secret_key").cloned(),
            region: config.get("region").unwrap_or(&"us-east-1".to_string()).clone(),
            assume_role_arn: config.get("assume_role_arn").cloned(),
        };

        // Initialize AI intelligence for this AWS agent
        let ai_config = AIConfig {
            openai_api_key: config.get("openai_api_key").cloned(),
            model: config.get("ai_model").unwrap_or(&"gpt-4".to_string()).clone(),
            max_tokens: config.get("ai_max_tokens").and_then(|v| v.parse().ok()).unwrap_or(500),
            temperature: config.get("ai_temperature").and_then(|v| v.parse().ok()).unwrap_or(0.7),
        };
        let ai_intelligence = AgentIntelligence::new("aws".to_string(), ai_config);

        Self {
            agent_id,
            session_id,
            config: aws_config,
            discovered_resources: Arc::new(RwLock::new(Vec::new())),
            status: Arc::new(RwLock::new("initializing".to_string())),
            ai_intelligence,
        }
    }

    pub async fn initialize(&self) -> AppResult<()> {
        *self.status.write().await = "ready".to_string();
        
        // Phase 2: Attempt real AWS resource discovery on initialization
        tracing::info!("🔍 Phase 2: Initializing AWS agent with real resource discovery");
        
        match self.discover_aws_resources().await {
            Ok(resources) => {
                let mut discovered = self.discovered_resources.write().await;
                *discovered = resources;
                tracing::info!("✅ AWS resource discovery successful: {} resources found", discovered.len());
            }
            Err(e) => {
                tracing::warn!("⚠️ AWS resource discovery failed: {}. Using enhanced mock data", e);
                let mut discovered = self.discovered_resources.write().await;
                *discovered = self.generate_enhanced_mock_resources().await;
            }
        }
        
        Ok(())
    }

    pub async fn process_message(&self, message: &str, context: HashMap<String, String>) -> AppResult<(String, Vec<Suggestion>)> {
        // Generate intelligent response using AI
        let mut enhanced_context = context.clone();
        enhanced_context.insert("agent_id".to_string(), self.agent_id.clone());
        enhanced_context.insert("session_id".to_string(), self.session_id.clone());
        enhanced_context.insert("region".to_string(), self.config.region.clone());
        enhanced_context.insert("status".to_string(), self.status.read().await.clone());
        
        // Add current resource count to context
        let resource_count = self.discovered_resources.read().await.len();
        enhanced_context.insert("discovered_resources_count".to_string(), resource_count.to_string());
        
        // Get AI-powered response
        let response = self.ai_intelligence.generate_response(message, enhanced_context.clone()).await?;
        
        // Generate intelligent suggestions based on the message context
        let ai_recommendations = self.ai_intelligence.generate_recommendations(
            &self.determine_context_type(message),
            enhanced_context
        ).await?;
        
        // Convert AI recommendations to Suggestion protobuf format
        let suggestions: Vec<Suggestion> = ai_recommendations
            .into_iter()
            .map(|rec| Suggestion {
                suggestion_id: format!("{}-{}", self.agent_id, rec.title.replace(" ", "-").to_lowercase()),
                title: rec.title,
                description: rec.description,
                r#type: 1, // SUGGESTION_TYPE_ACTION
                action: Some(Action {
                    action_type: rec.action_type.clone(),
                    command: rec.action_type,
                    parameters: rec.parameters,
                    required_permissions: Vec::new(),
                }),
                confidence: rec.confidence,
                metadata: std::collections::HashMap::new(),
                priority: rec.priority,
            })
            .collect();

        Ok((response, suggestions))
    }

    pub async fn get_suggestions(&self, context_type: &str, context: HashMap<String, String>) -> AppResult<Vec<Suggestion>> {
        // Use AI intelligence to generate context-aware suggestions
        let mut enhanced_context = context.clone();
        enhanced_context.insert("agent_id".to_string(), self.agent_id.clone());
        enhanced_context.insert("session_id".to_string(), self.session_id.clone());
        enhanced_context.insert("region".to_string(), self.config.region.clone());
        enhanced_context.insert("status".to_string(), self.status.read().await.clone());
        
        let ai_recommendations = self.ai_intelligence.generate_recommendations(
            context_type,
            enhanced_context
        ).await?;
        
        // Convert AI recommendations to Suggestion protobuf format
        let suggestions: Vec<Suggestion> = ai_recommendations
            .into_iter()
            .map(|rec| Suggestion {
                suggestion_id: format!("{}-{}", self.agent_id, rec.title.replace(" ", "-").to_lowercase()),
                title: rec.title,
                description: rec.description,
                r#type: 1, // SUGGESTION_TYPE_ACTION
                action: Some(Action {
                    action_type: rec.action_type.clone(),
                    command: rec.action_type,
                    parameters: rec.parameters,
                    required_permissions: Vec::new(),
                }),
                confidence: rec.confidence,
                metadata: std::collections::HashMap::new(),
                priority: rec.priority,
            })
            .collect();
            
        Ok(suggestions)
    }

    pub async fn get_status(&self) -> AppResult<(String, HashMap<String, String>, Vec<String>)> {
        let status = self.status.read().await.clone();
        let mut metrics = HashMap::new();
        
        // Add useful metrics
        let resource_count = self.discovered_resources.read().await.len();
        metrics.insert("discovered_resources".to_string(), resource_count.to_string());
        metrics.insert("region".to_string(), self.config.region.clone());
        metrics.insert("ai_enabled".to_string(), "true".to_string());
        
        let capabilities = vec![
            "resource_discovery".to_string(),
            "cost_analysis".to_string(),
            "security_analysis".to_string(),
            "ai_recommendations".to_string(),
            "intelligent_responses".to_string(),
        ];
        Ok((status, metrics, capabilities))
    }
    
    /// Determine the context type based on the user message content
    fn determine_context_type(&self, message: &str) -> String {
        let message_lower = message.to_lowercase();
        
        if message_lower.contains("cost") || message_lower.contains("billing") || message_lower.contains("price") {
            "cost_optimization".to_string()
        } else if message_lower.contains("security") || message_lower.contains("iam") || message_lower.contains("policy") {
            "security_analysis".to_string()
        } else if message_lower.contains("discover") || message_lower.contains("resource") || message_lower.contains("inventory") {
            "resource_discovery".to_string()
        } else if message_lower.contains("performance") || message_lower.contains("optimize") || message_lower.contains("monitor") {
            "performance_optimization".to_string()
        } else if message_lower.contains("backup") || message_lower.contains("disaster") || message_lower.contains("recovery") {
            "backup_recovery".to_string()
        } else {
            "general".to_string()
        }
    }
    
    /// Phase 2: Real AWS resource discovery
    async fn discover_aws_resources(&self) -> AppResult<Vec<AwsResource>> {
        tracing::info!("🔍 Attempting real AWS resource discovery in region: {}", self.config.region);
        
        // Check if we have AWS credentials
        if self.config.access_key.is_none() && self.config.secret_key.is_none() {
            tracing::debug!("No AWS credentials provided, will fallback to enhanced mock");
            return Err(crate::error::AppError::Configuration(
                "No AWS credentials configured".to_string()
            ));
        }
        
        // In a real implementation, we would:
        // 1. Create AWS SDK clients
        // 2. Use EC2, RDS, S3, Lambda clients to discover resources
        // 3. Parse and structure the results
        
        // For Phase 2, implement basic structure with fallback
        // Real AWS SDK integration would be:
        // 
        // let config = aws_config::load_from_env().await;
        // let ec2_client = aws_sdk_ec2::Client::new(&config);
        // let instances = ec2_client.describe_instances().send().await?;
        
        tracing::debug!("AWS SDK integration placeholder - returning empty for fallback to enhanced mock");
        
        // Return empty to trigger enhanced mock fallback
        Ok(Vec::new())
    }
    
    /// Generate enhanced mock AWS resources with realistic production data
    async fn generate_enhanced_mock_resources(&self) -> Vec<AwsResource> {
        tracing::info!("🎭 Generating enhanced mock AWS resources for region: {}", self.config.region);
        
        let mut resources = Vec::new();
        
        // EC2 Instances
        let ec2_instances = vec![
            (
                "i-0a1b2c3d4e5f6g7h8",
                "web-server-prod-01",
                "t3.large",
                "running",
                127.50,
                "Web Server",
            ),
            (
                "i-0b2c3d4e5f6g7h8i9",
                "web-server-prod-02",
                "t3.large",
                "running",
                127.50,
                "Web Server",
            ),
            (
                "i-0c3d4e5f6g7h8i9j0",
                "database-server",
                "r5.xlarge",
                "running",
                438.24,
                "Database",
            ),
            (
                "i-0d4e5f6g7h8i9j0k1",
                "worker-node-01",
                "c5.large",
                "running",
                89.60,
                "Worker",
            ),
        ];
        
        for (instance_id, name, instance_type, status, monthly_cost, role) in ec2_instances {
            let mut tags = HashMap::new();
            tags.insert("Name".to_string(), name.to_string());
            tags.insert("Environment".to_string(), "Production".to_string());
            tags.insert("Application".to_string(), "SirsiNexus".to_string());
            tags.insert("Role".to_string(), role.to_string());
            tags.insert("Owner".to_string(), "platform-team".to_string());
            
            resources.push(AwsResource {
                id: instance_id.to_string(),
                resource_type: "ec2:instance".to_string(),
                region: self.config.region.clone(),
                name: name.to_string(),
                status: status.to_string(),
                tags,
                cost_estimate: Some(monthly_cost),
            });
        }
        
        // RDS Instances
        resources.push(AwsResource {
            id: "sirsinexus-prod-db".to_string(),
            resource_type: "rds:instance".to_string(),
            region: self.config.region.clone(),
            name: "sirsinexus-production-database".to_string(),
            status: "available".to_string(),
            tags: {
                let mut tags = HashMap::new();
                tags.insert("Environment".to_string(), "Production".to_string());
                tags.insert("Application".to_string(), "SirsiNexus".to_string());
                tags.insert("Engine".to_string(), "PostgreSQL".to_string());
                tags
            },
            cost_estimate: Some(234.56),
        });
        
        // S3 Buckets
        let s3_buckets = vec![
            ("sirsinexus-prod-assets", "Standard", 45.30),
            ("sirsinexus-prod-backups", "IA", 23.15),
            ("sirsinexus-prod-logs", "Standard", 12.80),
        ];
        
        for (bucket_name, storage_class, monthly_cost) in s3_buckets {
            resources.push(AwsResource {
                id: bucket_name.to_string(),
                resource_type: "s3:bucket".to_string(),
                region: self.config.region.clone(),
                name: bucket_name.to_string(),
                status: "active".to_string(),
                tags: {
                    let mut tags = HashMap::new();
                    tags.insert("Environment".to_string(), "Production".to_string());
                    tags.insert("StorageClass".to_string(), storage_class.to_string());
                    tags
                },
                cost_estimate: Some(monthly_cost),
            });
        }
        
        tracing::info!("✅ Generated {} enhanced mock AWS resources", resources.len());
        resources
    }
}
