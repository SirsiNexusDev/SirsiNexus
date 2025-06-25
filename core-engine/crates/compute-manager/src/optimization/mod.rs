use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OptimizationStrategy {
    ResizeInstance {
        instance_id: String,
        new_type: String,
    },
    AdjustAutoScaling {
        config: crate::autoscaling::AutoScalingConfig,
    },
    ConvertToSpot {
        instance_ids: Vec<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUtilization {
    pub resource_id: String,
    pub resource_type: ResourceType,
    pub timestamp: DateTime<Utc>,
    pub metrics: HashMap<String, f64>,
    pub cost: Cost,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cost {
    pub amount: f64,
    pub currency: String,
    pub period: Period,
    pub components: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Period {
    Hourly,
    Daily,
    Monthly,
    Total,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ResourceType {
    Instance,
    Function,
    Database,
    Storage,
    Network,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationAnalysis {
    pub resource_id: String,
    pub resource_type: ResourceType,
    pub current_utilization: ResourceUtilization,
    pub current_cost: Cost,
    pub recommendations: Vec<Recommendation>,
    pub potential_savings: Cost,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub strategy: OptimizationStrategy,
    pub impact: Impact,
    pub confidence: f64,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Impact {
    pub cost_savings: Cost,
    pub performance_impact: PerformanceImpact,
    pub reliability_impact: ReliabilityImpact,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PerformanceImpact {
    Positive,
    Neutral,
    Negative,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ReliabilityImpact {
    Improved,
    Unchanged,
    Reduced,
    Unknown,
}

impl OptimizationStrategy {
    pub fn description(&self) -> String {
        match self {
            OptimizationStrategy::ResizeInstance { instance_id, new_type } => {
                format!("Resize instance {} to type {}", instance_id, new_type)
            }
            OptimizationStrategy::AdjustAutoScaling { config } => {
                format!("Adjust auto-scaling configuration for {}", config.name)
            }
            OptimizationStrategy::ConvertToSpot { instance_ids } => {
                format!("Convert {} instances to spot pricing", instance_ids.len())
            }
        }
    }
}

impl ResourceUtilization {
    pub fn new(resource_id: String, resource_type: ResourceType) -> Self {
        Self {
            resource_id,
            resource_type,
            timestamp: Utc::now(),
            metrics: HashMap::new(),
            cost: Cost {
                amount: 0.0,
                currency: "USD".to_string(),
                period: Period::Hourly,
                components: HashMap::new(),
            },
        }
    }

    pub fn add_metric(&mut self, name: String, value: f64) {
        self.metrics.insert(name, value);
    }

    pub fn with_cost(mut self, amount: f64, currency: String, period: Period) -> Self {
        self.cost = Cost {
            amount,
            currency,
            period,
            components: HashMap::new(),
        };
        self
    }

    pub fn add_cost_component(&mut self, name: String, amount: f64) {
        self.cost.components.insert(name, amount);
    }
}

impl Recommendation {
    pub fn new(strategy: OptimizationStrategy, reason: String) -> Self {
        Self {
            strategy,
            impact: Impact {
                cost_savings: Cost {
                    amount: 0.0,
                    currency: "USD".to_string(),
                    period: Period::Monthly,
                    components: HashMap::new(),
                },
                performance_impact: PerformanceImpact::Unknown,
                reliability_impact: ReliabilityImpact::Unknown,
            },
            confidence: 0.0,
            reason,
        }
    }

    pub fn with_impact(mut self, savings: f64, performance: PerformanceImpact, reliability: ReliabilityImpact) -> Self {
        self.impact = Impact {
            cost_savings: Cost {
                amount: savings,
                currency: "USD".to_string(),
                period: Period::Monthly,
                components: HashMap::new(),
            },
            performance_impact: performance,
            reliability_impact: reliability,
        };
        self
    }

    pub fn with_confidence(mut self, confidence: f64) -> Self {
        self.confidence = confidence;
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resource_utilization() {
        let mut utilization = ResourceUtilization::new(
            "i-1234567890".to_string(),
            ResourceType::Instance,
        )
        .with_cost(10.5, "USD".to_string(), Period::Hourly);

        utilization.add_metric("cpu_utilization".to_string(), 65.5);
        utilization.add_metric("memory_utilization".to_string(), 45.2);
        utilization.add_cost_component("compute".to_string(), 8.0);
        utilization.add_cost_component("storage".to_string(), 2.5);

        assert_eq!(utilization.metrics.len(), 2);
        assert_eq!(utilization.cost.components.len(), 2);
        assert_eq!(utilization.cost.amount, 10.5);
    }

    #[test]
    fn test_optimization_strategy() {
        let strategy = OptimizationStrategy::ResizeInstance {
            instance_id: "i-1234567890".to_string(),
            new_type: "t3.medium".to_string(),
        };

        let description = strategy.description();
        assert!(description.contains("Resize instance"));
        assert!(description.contains("t3.medium"));
    }

    #[test]
    fn test_recommendation() {
        let strategy = OptimizationStrategy::ConvertToSpot {
            instance_ids: vec!["i-1234".to_string(), "i-5678".to_string()],
        };

        let recommendation = Recommendation::new(
            strategy,
            "Convert to spot instances for cost savings".to_string(),
        )
        .with_impact(
            100.0,
            PerformanceImpact::Neutral,
            ReliabilityImpact::Reduced,
        )
        .with_confidence(0.85);

        assert_eq!(recommendation.impact.cost_savings.amount, 100.0);
        assert_eq!(recommendation.confidence, 0.85);
        assert!(matches!(
            recommendation.impact.performance_impact,
            PerformanceImpact::Neutral
        ));
    }
}
