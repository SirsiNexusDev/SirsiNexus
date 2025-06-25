use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoScalingConfig {
    pub id: String,
    pub name: String,
    pub resource_id: String,
    pub resource_type: ResourceType,
    pub min_capacity: i32,
    pub max_capacity: i32,
    pub desired_capacity: i32,
    pub cooldown_seconds: i32,
    pub metrics: Vec<ScalingMetric>,
    pub schedules: Vec<ScalingSchedule>,
    pub labels: HashMap<String, String>,
    pub annotations: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ResourceType {
    InstanceGroup,
    Function,
    Database,
    Cache,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingMetric {
    pub name: String,
    pub namespace: String,
    pub dimensions: HashMap<String, String>,
    pub statistic: MetricStatistic,
    pub comparison: ComparisonOperator,
    pub threshold: f64,
    pub period_seconds: i32,
    pub evaluation_periods: i32,
    pub datapoints_to_alarm: i32,
    pub scale_adjustment: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MetricStatistic {
    Average,
    Sum,
    Minimum,
    Maximum,
    SampleCount,
    Percentile(f64),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ComparisonOperator {
    GreaterThanThreshold,
    GreaterThanOrEqualToThreshold,
    LessThanThreshold,
    LessThanOrEqualToThreshold,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingSchedule {
    pub name: String,
    pub recurrence: String,
    pub min_capacity: Option<i32>,
    pub max_capacity: Option<i32>,
    pub desired_capacity: Option<i32>,
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingActivity {
    pub id: String,
    pub config_id: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub status: ScalingActivityStatus,
    pub status_message: Option<String>,
    pub cause: String,
    pub old_capacity: i32,
    pub new_capacity: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ScalingActivityStatus {
    InProgress,
    Successful,
    Failed,
    Cancelled,
}

impl AutoScalingConfig {
    pub fn new(id: String, name: String, resource_id: String, resource_type: ResourceType) -> Self {
        Self {
            id,
            name,
            resource_id,
            resource_type,
            min_capacity: 1,
            max_capacity: 1,
            desired_capacity: 1,
            cooldown_seconds: 300,
            metrics: Vec::new(),
            schedules: Vec::new(),
            labels: HashMap::new(),
            annotations: HashMap::new(),
        }
    }

    pub fn with_capacity(mut self, min: i32, max: i32, desired: i32) -> Self {
        self.min_capacity = min;
        self.max_capacity = max;
        self.desired_capacity = desired;
        self
    }

    pub fn add_metric(&mut self, metric: ScalingMetric) {
        self.metrics.push(metric);
    }

    pub fn add_schedule(&mut self, schedule: ScalingSchedule) {
        self.schedules.push(schedule);
    }

    pub fn is_valid(&self) -> bool {
        if self.min_capacity < 0 || self.max_capacity < self.min_capacity || self.desired_capacity < self.min_capacity || self.desired_capacity > self.max_capacity {
            return false;
        }

        if self.cooldown_seconds < 0 {
            return false;
        }

        for metric in &self.metrics {
            if metric.period_seconds <= 0 || metric.evaluation_periods <= 0 || metric.datapoints_to_alarm <= 0 {
                return false;
            }
            if metric.datapoints_to_alarm > metric.evaluation_periods {
                return false;
            }
        }

        true
    }
}

impl ScalingMetric {
    pub fn new(name: String, namespace: String) -> Self {
        Self {
            name,
            namespace,
            dimensions: HashMap::new(),
            statistic: MetricStatistic::Average,
            comparison: ComparisonOperator::GreaterThanThreshold,
            threshold: 0.0,
            period_seconds: 60,
            evaluation_periods: 1,
            datapoints_to_alarm: 1,
            scale_adjustment: 1,
        }
    }

    pub fn with_statistic(mut self, statistic: MetricStatistic) -> Self {
        self.statistic = statistic;
        self
    }

    pub fn with_comparison(mut self, comparison: ComparisonOperator, threshold: f64) -> Self {
        self.comparison = comparison;
        self.threshold = threshold;
        self
    }

    pub fn with_evaluation(mut self, period_seconds: i32, evaluation_periods: i32, datapoints_to_alarm: i32) -> Self {
        self.period_seconds = period_seconds;
        self.evaluation_periods = evaluation_periods;
        self.datapoints_to_alarm = datapoints_to_alarm;
        self
    }

    pub fn with_scale_adjustment(mut self, adjustment: i32) -> Self {
        self.scale_adjustment = adjustment;
        self
    }

    pub fn add_dimension(&mut self, key: String, value: String) {
        self.dimensions.insert(key, value);
    }
}

impl ScalingSchedule {
    pub fn new(name: String, recurrence: String) -> Self {
        Self {
            name,
            recurrence,
            min_capacity: None,
            max_capacity: None,
            desired_capacity: None,
            start_time: None,
            end_time: None,
        }
    }

    pub fn with_capacity(mut self, min: Option<i32>, max: Option<i32>, desired: Option<i32>) -> Self {
        self.min_capacity = min;
        self.max_capacity = max;
        self.desired_capacity = desired;
        self
    }

    pub fn with_time_window(mut self, start_time: DateTime<Utc>, end_time: DateTime<Utc>) -> Self {
        self.start_time = Some(start_time);
        self.end_time = Some(end_time);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auto_scaling_config() {
        let mut config = AutoScalingConfig::new(
            "asg-1".to_string(),
            "web-tier".to_string(),
            "group-1".to_string(),
            ResourceType::InstanceGroup,
        )
        .with_capacity(1, 10, 2);

        let metric = ScalingMetric::new(
            "CPUUtilization".to_string(),
            "AWS/EC2".to_string(),
        )
        .with_statistic(MetricStatistic::Average)
        .with_comparison(ComparisonOperator::GreaterThanThreshold, 70.0)
        .with_evaluation(60, 3, 2)
        .with_scale_adjustment(1);

        config.add_metric(metric);

        let schedule = ScalingSchedule::new(
            "business-hours".to_string(),
            "0 9 * * 1-5".to_string(),
        )
        .with_capacity(Some(2), Some(10), Some(4));

        config.add_schedule(schedule);

        assert!(config.is_valid());
        assert_eq!(config.metrics.len(), 1);
        assert_eq!(config.schedules.len(), 1);
    }

    #[test]
    fn test_invalid_auto_scaling_config() {
        let config = AutoScalingConfig::new(
            "asg-1".to_string(),
            "web-tier".to_string(),
            "group-1".to_string(),
            ResourceType::InstanceGroup,
        )
        .with_capacity(2, 1, 3); // Invalid: max < min

        assert!(!config.is_valid());
    }

    #[test]
    fn test_scaling_metric() {
        let mut metric = ScalingMetric::new(
            "MemoryUtilization".to_string(),
            "Custom/App".to_string(),
        );

        metric.add_dimension("AppName".to_string(), "web-server".to_string());
        metric.add_dimension("Environment".to_string(), "production".to_string());

        assert_eq!(metric.dimensions.len(), 2);
        assert_eq!(metric.period_seconds, 60);
        assert_eq!(metric.evaluation_periods, 1);
    }

    #[test]
    fn test_scaling_schedule() {
        let now = Utc::now();
        let schedule = ScalingSchedule::new(
            "weekend-scale-down".to_string(),
            "0 0 * * 6,0".to_string(),
        )
        .with_capacity(Some(1), Some(2), Some(1))
        .with_time_window(now, now + chrono::Duration::days(30));

        assert!(schedule.start_time.is_some());
        assert!(schedule.end_time.is_some());
        assert_eq!(schedule.min_capacity, Some(1));
        assert_eq!(schedule.max_capacity, Some(2));
    }
}
