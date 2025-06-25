use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FleetConfig {
    pub id: String,
    pub name: String,
    pub instance_groups: Vec<InstanceGroup>,
    pub network_config: NetworkConfig,
    pub labels: HashMap<String, String>,
    pub annotations: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub vpc_id: Option<String>,
    pub subnet_ids: Vec<String>,
    pub security_groups: Vec<String>,
    pub enable_public_ip: bool,
    pub dns_zones: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstanceGroup {
    pub id: String,
    pub name: String,
    pub instance_type: String,
    pub min_size: i32,
    pub max_size: i32,
    pub desired_size: i32,
    pub labels: HashMap<String, String>,
    pub annotations: HashMap<String, String>,
    pub startup_script: Option<String>,
    pub storage_config: StorageConfig,
    pub scaling_config: Option<ScalingConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
    pub root_volume_size: i32,
    pub data_volumes: Vec<VolumeConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VolumeConfig {
    pub size: i32,
    pub volume_type: VolumeType,
    pub iops: Option<i32>,
    pub throughput: Option<i32>,
    pub mount_path: String,
    pub file_system: FileSystem,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum VolumeType {
    Gp2,
    Gp3,
    Io1,
    Io2,
    St1,
    Sc1,
    Standard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FileSystem {
    Ext4,
    Xfs,
    Ntfs,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingConfig {
    pub metrics: Vec<ScalingMetric>,
    pub cooldown_seconds: i32,
    pub scale_in_protection: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingMetric {
    pub name: String,
    pub target_value: f64,
    pub scale_out_threshold: f64,
    pub scale_in_threshold: f64,
    pub evaluation_periods: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Instance {
    pub instance_id: String,
    pub group_id: String,
    pub fleet_id: String,
    pub instance_type: String,
    pub private_ip: String,
    pub public_ip: Option<String>,
    pub state: InstanceState,
    pub launch_time: chrono::DateTime<chrono::Utc>,
    pub labels: HashMap<String, String>,
    pub metrics: Option<InstanceMetrics>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum InstanceState {
    Pending,
    Running,
    Stopping,
    Stopped,
    ShuttingDown,
    Terminated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstanceMetrics {
    pub cpu_utilization: f64,
    pub memory_utilization: f64,
    pub network_in_bytes: i64,
    pub network_out_bytes: i64,
    pub disk_read_ops: i64,
    pub disk_write_ops: i64,
    pub disk_read_bytes: i64,
    pub disk_write_bytes: i64,
}

impl FleetConfig {
    pub fn new(id: String, name: String) -> Self {
        Self {
            id,
            name,
            instance_groups: Vec::new(),
            network_config: NetworkConfig {
                vpc_id: None,
                subnet_ids: Vec::new(),
                security_groups: Vec::new(),
                enable_public_ip: false,
                dns_zones: Vec::new(),
            },
            labels: HashMap::new(),
            annotations: HashMap::new(),
        }
    }

    pub fn add_instance_group(&mut self, group: InstanceGroup) {
        self.instance_groups.push(group);
    }

    pub fn remove_instance_group(&mut self, group_id: &str) -> Option<InstanceGroup> {
        if let Some(pos) = self.instance_groups.iter().position(|g| g.id == group_id) {
            Some(self.instance_groups.remove(pos))
        } else {
            None
        }
    }

    pub fn get_instance_group(&self, group_id: &str) -> Option<&InstanceGroup> {
        self.instance_groups.iter().find(|g| g.id == group_id)
    }

    pub fn get_instance_group_mut(&mut self, group_id: &str) -> Option<&mut InstanceGroup> {
        self.instance_groups.iter_mut().find(|g| g.id == group_id)
    }
}

impl InstanceGroup {
    pub fn new(id: String, name: String, instance_type: String) -> Self {
        Self {
            id,
            name,
            instance_type,
            min_size: 1,
            max_size: 1,
            desired_size: 1,
            labels: HashMap::new(),
            annotations: HashMap::new(),
            startup_script: None,
            storage_config: StorageConfig {
                root_volume_size: 50,
                data_volumes: Vec::new(),
            },
            scaling_config: None,
        }
    }

    pub fn with_scaling(mut self, min: i32, max: i32, desired: i32) -> Self {
        self.min_size = min;
        self.max_size = max;
        self.desired_size = desired;
        self
    }

    pub fn with_storage(mut self, root_size: i32, data_volumes: Vec<VolumeConfig>) -> Self {
        self.storage_config = StorageConfig {
            root_volume_size: root_size,
            data_volumes,
        };
        self
    }

    pub fn with_startup_script(mut self, script: String) -> Self {
        self.startup_script = Some(script);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fleet_config() {
        let mut fleet = FleetConfig::new(
            "fleet-1".to_string(),
            "test-fleet".to_string(),
        );

        let group = InstanceGroup::new(
            "group-1".to_string(),
            "test-group".to_string(),
            "t3.micro".to_string(),
        )
        .with_scaling(1, 5, 2)
        .with_storage(
            100,
            vec![VolumeConfig {
                size: 500,
                volume_type: VolumeType::Gp3,
                iops: Some(3000),
                throughput: Some(125),
                mount_path: "/data".to_string(),
                file_system: FileSystem::Xfs,
            }],
        );

        fleet.add_instance_group(group);
        assert_eq!(fleet.instance_groups.len(), 1);

        let group = fleet.get_instance_group("group-1").unwrap();
        assert_eq!(group.min_size, 1);
        assert_eq!(group.max_size, 5);
        assert_eq!(group.desired_size, 2);
        assert_eq!(group.storage_config.root_volume_size, 100);
        assert_eq!(group.storage_config.data_volumes.len(), 1);

        let removed = fleet.remove_instance_group("group-1").unwrap();
        assert_eq!(removed.name, "test-group");
        assert_eq!(fleet.instance_groups.len(), 0);
    }

    #[test]
    fn test_instance_group() {
        let group = InstanceGroup::new(
            "group-1".to_string(),
            "test-group".to_string(),
            "t3.micro".to_string(),
        )
        .with_scaling(2, 10, 4)
        .with_startup_script("#!/bin/bash\necho 'Hello World'".to_string());

        assert_eq!(group.min_size, 2);
        assert_eq!(group.max_size, 10);
        assert_eq!(group.desired_size, 4);
        assert!(group.startup_script.is_some());
        assert_eq!(group.storage_config.root_volume_size, 50);
        assert_eq!(group.storage_config.data_volumes.len(), 0);
    }
}
