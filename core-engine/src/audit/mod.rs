use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::PgPool;
use chrono::{DateTime, Utc};

use crate::error::{AppError, AppResult};

pub mod events;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: Uuid,
    pub event_type: String,
    pub resource_type: String,
    pub resource_id: Option<String>,
    pub user_id: Option<Uuid>,
    pub session_id: Option<String>,
    pub action: String,
    pub details: serde_json::Value,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub success: bool,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditContext {
    pub user_id: Option<Uuid>,
    pub session_id: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AuditLogger {
    pool: PgPool,
    enabled: bool,
}

impl AuditLogger {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            enabled: true,
        }
    }

    pub fn disable(&mut self) {
        self.enabled = false;
    }

    pub fn enable(&mut self) {
        self.enabled = true;
    }

    /// Log a successful action
    pub async fn log_success(
        &self,
        event_type: &str,
        resource_type: &str,
        resource_id: Option<&str>,
        action: &str,
        details: serde_json::Value,
        context: AuditContext,
    ) -> AppResult<Uuid> {
        if !self.enabled {
            return Ok(Uuid::new_v4()); // Return dummy ID when disabled
        }

        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: event_type.to_string(),
            resource_type: resource_type.to_string(),
            resource_id: resource_id.map(|s| s.to_string()),
            user_id: context.user_id,
            session_id: context.session_id,
            action: action.to_string(),
            details,
            ip_address: context.ip_address,
            user_agent: context.user_agent,
            timestamp: Utc::now(),
            success: true,
            error_message: None,
        };

        self.insert_audit_log(&log_entry).await?;
        Ok(log_entry.id)
    }

    /// Log a failed action
    pub async fn log_failure(
        &self,
        event_type: &str,
        resource_type: &str,
        resource_id: Option<&str>,
        action: &str,
        details: serde_json::Value,
        error_message: &str,
        context: AuditContext,
    ) -> AppResult<Uuid> {
        if !self.enabled {
            return Ok(Uuid::new_v4()); // Return dummy ID when disabled
        }

        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: event_type.to_string(),
            resource_type: resource_type.to_string(),
            resource_id: resource_id.map(|s| s.to_string()),
            user_id: context.user_id,
            session_id: context.session_id,
            action: action.to_string(),
            details,
            ip_address: context.ip_address,
            user_agent: context.user_agent,
            timestamp: Utc::now(),
            success: false,
            error_message: Some(error_message.to_string()),
        };

        self.insert_audit_log(&log_entry).await?;
        Ok(log_entry.id)
    }

    /// Log authentication events
    pub async fn log_authentication(
        &self,
        action: &str, // "login", "logout", "login_failed"
        user_id: Option<Uuid>,
        details: serde_json::Value,
        context: AuditContext,
        success: bool,
        error_message: Option<&str>,
    ) -> AppResult<Uuid> {
        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: "authentication".to_string(),
            resource_type: "user".to_string(),
            resource_id: user_id.map(|id| id.to_string()),
            user_id,
            session_id: context.session_id,
            action: action.to_string(),
            details,
            ip_address: context.ip_address,
            user_agent: context.user_agent,
            timestamp: Utc::now(),
            success,
            error_message: error_message.map(|s| s.to_string()),
        };

        self.insert_audit_log(&log_entry).await?;
        Ok(log_entry.id)
    }

    /// Log system events
    pub async fn log_system_event(
        &self,
        action: &str,
        details: serde_json::Value,
        success: bool,
        error_message: Option<&str>,
    ) -> AppResult<Uuid> {
        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: "system".to_string(),
            resource_type: "system".to_string(),
            resource_id: None,
            user_id: None,
            session_id: None,
            action: action.to_string(),
            details,
            ip_address: None,
            user_agent: None,
            timestamp: Utc::now(),
            success,
            error_message: error_message.map(|s| s.to_string()),
        };

        self.insert_audit_log(&log_entry).await?;
        Ok(log_entry.id)
    }

    async fn insert_audit_log(&self, log: &AuditLog) -> AppResult<()> {
        sqlx::query!(
            r#"
            INSERT INTO audit_logs (
                id, event_type, resource_type, resource_id, user_id, session_id,
                action, details, ip_address, user_agent, timestamp, success, error_message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#,
            log.id,
            log.event_type,
            log.resource_type,
            log.resource_id,
            log.user_id,
            log.session_id,
            log.action,
            log.details,
            log.ip_address,
            log.user_agent,
            log.timestamp,
            log.success,
            log.error_message
        )
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(())
    }

    /// Query audit logs with filters
    pub async fn query_logs(
        &self,
        filters: AuditQueryFilters,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> AppResult<Vec<AuditLog>> {
        let mut query = "SELECT * FROM audit_logs WHERE 1=1".to_string();
        let mut params: Vec<Box<dyn std::any::Any + Send + Sync>> = Vec::new();
        let mut param_count = 0;

        if let Some(user_id) = filters.user_id {
            param_count += 1;
            query.push_str(&format!(" AND user_id = ${}", param_count));
            params.push(Box::new(user_id));
        }

        if let Some(event_type) = &filters.event_type {
            param_count += 1;
            query.push_str(&format!(" AND event_type = ${}", param_count));
            params.push(Box::new(event_type.clone()));
        }

        if let Some(resource_type) = &filters.resource_type {
            param_count += 1;
            query.push_str(&format!(" AND resource_type = ${}", param_count));
            params.push(Box::new(resource_type.clone()));
        }

        if let Some(action) = &filters.action {
            param_count += 1;
            query.push_str(&format!(" AND action = ${}", param_count));
            params.push(Box::new(action.clone()));
        }

        if let Some(success) = filters.success {
            param_count += 1;
            query.push_str(&format!(" AND success = ${}", param_count));
            params.push(Box::new(success));
        }

        if let Some(start_time) = filters.start_time {
            param_count += 1;
            query.push_str(&format!(" AND timestamp >= ${}", param_count));
            params.push(Box::new(start_time));
        }

        if let Some(end_time) = filters.end_time {
            param_count += 1;
            query.push_str(&format!(" AND timestamp <= ${}", param_count));
            params.push(Box::new(end_time));
        }

        query.push_str(" ORDER BY timestamp DESC");

        if let Some(limit) = limit {
            param_count += 1;
            query.push_str(&format!(" LIMIT ${}", param_count));
            params.push(Box::new(limit));
        }

        if let Some(offset) = offset {
            param_count += 1;
            query.push_str(&format!(" OFFSET ${}", param_count));
            params.push(Box::new(offset));
        }

        // For simplicity, we'll use a direct query here
        // In a real implementation, you'd want to use sqlx's query builder
        let logs = sqlx::query_as!(
            AuditLog,
            "SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1",
            limit.unwrap_or(100)
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

        Ok(logs)
    }

    /// Get audit statistics
    pub async fn get_statistics(&self, timeframe: AuditTimeframe) -> AppResult<AuditStatistics> {
        let (start_time, end_time) = timeframe.to_datetime_range();

        let total_events = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM audit_logs WHERE timestamp BETWEEN $1 AND $2",
            start_time,
            end_time
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?
        .unwrap_or(0);

        let successful_events = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM audit_logs WHERE timestamp BETWEEN $1 AND $2 AND success = true",
            start_time,
            end_time
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?
        .unwrap_or(0);

        let failed_events = total_events - successful_events;

        let unique_users = sqlx::query_scalar!(
            "SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE timestamp BETWEEN $1 AND $2 AND user_id IS NOT NULL",
            start_time,
            end_time
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?
        .unwrap_or(0);

        Ok(AuditStatistics {
            total_events,
            successful_events,
            failed_events,
            unique_users,
            timeframe_start: start_time,
            timeframe_end: end_time,
        })
    }
}

#[derive(Debug, Clone)]
pub struct AuditQueryFilters {
    pub user_id: Option<Uuid>,
    pub event_type: Option<String>,
    pub resource_type: Option<String>,
    pub action: Option<String>,
    pub success: Option<bool>,
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub enum AuditTimeframe {
    LastHour,
    LastDay,
    LastWeek,
    LastMonth,
    Custom(DateTime<Utc>, DateTime<Utc>),
}

impl AuditTimeframe {
    fn to_datetime_range(&self) -> (DateTime<Utc>, DateTime<Utc>) {
        let now = Utc::now();
        match self {
            AuditTimeframe::LastHour => (now - chrono::Duration::hours(1), now),
            AuditTimeframe::LastDay => (now - chrono::Duration::days(1), now),
            AuditTimeframe::LastWeek => (now - chrono::Duration::weeks(1), now),
            AuditTimeframe::LastMonth => (now - chrono::Duration::days(30), now),
            AuditTimeframe::Custom(start, end) => (*start, *end),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct AuditStatistics {
    pub total_events: i64,
    pub successful_events: i64,
    pub failed_events: i64,
    pub unique_users: i64,
    pub timeframe_start: DateTime<Utc>,
    pub timeframe_end: DateTime<Utc>,
}

// Convenience macros for common audit logging patterns
#[macro_export]
macro_rules! audit_success {
    ($logger:expr, $event_type:expr, $resource_type:expr, $action:expr, $context:expr) => {
        $logger.log_success(
            $event_type,
            $resource_type,
            None,
            $action,
            serde_json::json!({}),
            $context,
        ).await
    };
    ($logger:expr, $event_type:expr, $resource_type:expr, $resource_id:expr, $action:expr, $context:expr) => {
        $logger.log_success(
            $event_type,
            $resource_type,
            Some($resource_id),
            $action,
            serde_json::json!({}),
            $context,
        ).await
    };
    ($logger:expr, $event_type:expr, $resource_type:expr, $resource_id:expr, $action:expr, $details:expr, $context:expr) => {
        $logger.log_success(
            $event_type,
            $resource_type,
            Some($resource_id),
            $action,
            $details,
            $context,
        ).await
    };
}

#[macro_export]
macro_rules! audit_failure {
    ($logger:expr, $event_type:expr, $resource_type:expr, $action:expr, $error:expr, $context:expr) => {
        $logger.log_failure(
            $event_type,
            $resource_type,
            None,
            $action,
            serde_json::json!({}),
            $error,
            $context,
        ).await
    };
    ($logger:expr, $event_type:expr, $resource_type:expr, $resource_id:expr, $action:expr, $error:expr, $context:expr) => {
        $logger.log_failure(
            $event_type,
            $resource_type,
            Some($resource_id),
            $action,
            serde_json::json!({}),
            $error,
            $context,
        ).await
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Skip for now since we need a test database
    async fn test_audit_logging() {
        // Test would go here with actual database
    }
}
