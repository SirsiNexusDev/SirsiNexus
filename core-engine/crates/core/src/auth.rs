use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentUser {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub role: String,
}

// Mock implementation for now - replace with JWT extraction
impl CurrentUser {
    pub fn mock_user() -> Self {
        Self {
            id: Uuid::new_v4(),
            email: "demo@sirsinexus.com".to_string(),
            name: "Demo User".to_string(),
            role: "user".to_string(),
        }
    }
}
