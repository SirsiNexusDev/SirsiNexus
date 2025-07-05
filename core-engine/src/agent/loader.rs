//! # Agent Module Loader
//!
//! Dynamic module loading system for SirsiNexus agents using WebAssembly (WASM)
//! for secure, sandboxed execution of agent code with hot-reloading capabilities.

use crate::error::{AppError, AppResult};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, error, info, warn};
use wasmtime::{Engine, Instance, Linker, Module, Store, TypedFunc};
use serde::{Deserialize, Serialize};

/// Agent module metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentModuleInfo {
    /// Module identifier
    pub module_id: String,
    
    /// Agent type this module implements
    pub agent_type: String,
    
    /// Module version
    pub version: String,
    
    /// Module description
    pub description: String,
    
    /// Author information
    pub author: String,
    
    /// Supported capabilities
    pub capabilities: Vec<String>,
    
    /// Required permissions
    pub permissions: Vec<String>,
    
    /// Module configuration schema
    pub config_schema: serde_json::Value,
    
    /// Module file path
    pub file_path: PathBuf,
    
    /// Module hash (for integrity checking)
    pub hash: String,
    
    /// Load timestamp
    pub loaded_at: chrono::DateTime<chrono::Utc>,
    
    /// Whether module is active
    pub active: bool,
}

/// WASM module instance wrapper
pub struct WasmAgentModule {
    /// Module information
    pub info: AgentModuleInfo,
    
    /// WASM module
    pub module: Module,
    
    /// Module instance
    pub instance: Instance,
    
    /// WASM store
    pub store: Store<AgentModuleContext>,
    
    /// Exported functions
    pub functions: HashMap<String, Box<dyn std::any::Any + Send + Sync>>,
}

/// Agent module execution context
#[derive(Debug, Clone)]
pub struct AgentModuleContext {
    /// Module ID
    pub module_id: String,
    
    /// Session ID
    pub session_id: String,
    
    /// Allocated memory in bytes
    pub memory_limit: usize,
    
    /// CPU time limit in milliseconds
    pub cpu_time_limit: u64,
    
    /// Start time for tracking execution time
    pub start_time: std::time::Instant,
    
    /// Allowed network hosts
    pub allowed_hosts: Vec<String>,
    
    /// Environment variables
    pub env_vars: HashMap<String, String>,
}

impl AgentModuleContext {
    pub fn new(module_id: String, session_id: String) -> Self {
        Self {
            module_id,
            session_id,
            memory_limit: 64 * 1024 * 1024, // 64MB default
            cpu_time_limit: 30_000, // 30 seconds default
            start_time: std::time::Instant::now(),
            allowed_hosts: vec![],
            env_vars: HashMap::new(),
        }
    }
    
    /// Check if execution has exceeded time limit
    pub fn check_time_limit(&self) -> Result<(), AppError> {
        let elapsed = self.start_time.elapsed().as_millis() as u64;
        if elapsed > self.cpu_time_limit {
            return Err(AppError::Internal(format!(
                "Module {} execution time limit exceeded: {}ms > {}ms",
                self.module_id, elapsed, self.cpu_time_limit
            )));
        }
        Ok(())
    }
}

/// Dynamic agent module loader
pub struct AgentModuleLoader {
    /// WASM engine
    engine: Engine,
    
    /// Loaded modules registry
    modules: Arc<RwLock<HashMap<String, WasmAgentModule>>>,
    
    /// Module search paths
    module_paths: Vec<PathBuf>,
    
    /// Module loader configuration
    config: LoaderConfig,
}

/// Loader configuration
#[derive(Debug, Clone)]
pub struct LoaderConfig {
    /// Maximum modules that can be loaded
    pub max_modules: usize,
    
    /// Default memory limit per module (bytes)
    pub default_memory_limit: usize,
    
    /// Default CPU time limit per module (milliseconds)
    pub default_cpu_time_limit: u64,
    
    /// Enable module hot-reloading
    pub enable_hot_reload: bool,
    
    /// Module file watch interval (seconds)
    pub watch_interval_seconds: u64,
    
    /// Require signed modules
    pub require_signed_modules: bool,
    
    /// Allowed module permissions
    pub allowed_permissions: Vec<String>,
}

impl Default for LoaderConfig {
    fn default() -> Self {
        Self {
            max_modules: 50,
            default_memory_limit: 64 * 1024 * 1024, // 64MB
            default_cpu_time_limit: 30_000, // 30 seconds
            enable_hot_reload: true,
            watch_interval_seconds: 5,
            require_signed_modules: false,
            allowed_permissions: vec![
                "network.http".to_string(),
                "filesystem.read".to_string(),
                "env.read".to_string(),
            ],
        }
    }
}

impl AgentModuleLoader {
    /// Create a new agent module loader
    pub fn new(config: Option<LoaderConfig>) -> AppResult<Self> {
        let engine = Engine::default();
        
        let loader = Self {
            engine,
            modules: Arc::new(RwLock::new(HashMap::new())),
            module_paths: vec![
                PathBuf::from("./modules"),
                PathBuf::from("./agents"),
                PathBuf::from("/opt/sirsi/modules"),
            ],
            config: config.unwrap_or_default(),
        };
        
        info!("Agent module loader initialized");
        Ok(loader)
    }
    
    /// Start the module loader (scan for modules, start hot-reload)
    pub async fn start(&self) -> AppResult<()> {
        info!("🔧 Starting Agent Module Loader");
        
        // Scan for modules in module paths
        self.scan_and_load_modules().await?;
        
        // Start hot-reload monitoring if enabled
        if self.config.enable_hot_reload {
            self.start_hot_reload_monitoring().await?;
        }
        
        info!("✅ Agent Module Loader started successfully");
        Ok(())
    }
    
    /// Load a WASM module from file
    pub async fn load_module(&self, file_path: &Path) -> AppResult<String> {
        info!("📦 Loading agent module from: {}", file_path.display());
        
        // Check if we've reached module limit
        {
            let modules = self.modules.read().await;
            if modules.len() >= self.config.max_modules {
                return Err(AppError::ResourceLimit(format!(
                    "Maximum number of modules ({}) reached", 
                    self.config.max_modules
                )));
            }
        }
        
        // Read module file
        let module_bytes = tokio::fs::read(file_path).await
            .map_err(|e| AppError::Internal(format!("Failed to read module file: {}", e)))?;
        
        // Calculate module hash
        let hash = format!("{:x}", md5::compute(&module_bytes));
        
        // Read module metadata (from accompanying .json file)
        let metadata_path = file_path.with_extension("json");
        let module_info = if metadata_path.exists() {
            let metadata_content = tokio::fs::read_to_string(&metadata_path).await
                .map_err(|e| AppError::Internal(format!("Failed to read module metadata: {}", e)))?;
            
            let mut info: AgentModuleInfo = serde_json::from_str(&metadata_content)
                .map_err(|e| AppError::Internal(format!("Failed to parse module metadata: {}", e)))?;
            
            info.file_path = file_path.to_path_buf();
            info.hash = hash;
            info.loaded_at = chrono::Utc::now();
            info.active = true;
            
            info
        } else {
            // Generate default metadata
            let module_id = file_path.file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("unknown")
                .to_string();
            
            AgentModuleInfo {
                module_id: module_id.clone(),
                agent_type: module_id.clone(),
                version: "1.0.0".to_string(),
                description: "Auto-loaded WASM module".to_string(),
                author: "Unknown".to_string(),
                capabilities: vec![],
                permissions: vec![],
                config_schema: serde_json::json!({}),
                file_path: file_path.to_path_buf(),
                hash,
                loaded_at: chrono::Utc::now(),
                active: true,
            }
        };
        
        // Validate module permissions
        self.validate_module_permissions(&module_info)?;
        
        // Create WASM module
        let module = Module::from_binary(&self.engine, &module_bytes)
            .map_err(|e| AppError::Internal(format!("Failed to create WASM module: {}", e)))?;
        
        // Create module context
        let context = AgentModuleContext::new(
            module_info.module_id.clone(),
            "system".to_string(),
        );
        
        // Create WASM store
        let mut store = Store::new(&self.engine, context);
        
        // Create linker and add host functions
        let mut linker = Linker::new(&self.engine);
        self.add_host_functions(&mut linker)?;
        
        // Instantiate the module
        let instance = linker.instantiate(&mut store, &module)
            .map_err(|e| AppError::Internal(format!("Failed to instantiate WASM module: {}", e)))?;
        
        // Extract exported functions
        let mut functions = HashMap::new();
        self.extract_exported_functions(&instance, &mut store, &mut functions)?;
        
        // Create module wrapper
        let wasm_module = WasmAgentModule {
            info: module_info.clone(),
            module,
            instance,
            store,
            functions,
        };
        
        // Store module
        let module_id = module_info.module_id.clone();
        {
            let mut modules = self.modules.write().await;
            modules.insert(module_id.clone(), wasm_module);
        }
        
        info!("✅ Successfully loaded agent module: {} ({})", module_info.module_id, module_info.agent_type);
        Ok(module_id)
    }
    
    /// Unload a module
    pub async fn unload_module(&self, module_id: &str) -> AppResult<()> {
        let mut modules = self.modules.write().await;
        if let Some(_module) = modules.remove(module_id) {
            info!("🗑️  Unloaded agent module: {}", module_id);
            Ok(())
        } else {
            Err(AppError::NotFound(format!("Module {} not found", module_id)))
        }
    }
    
    /// Get module information
    pub async fn get_module_info(&self, module_id: &str) -> AppResult<AgentModuleInfo> {
        let modules = self.modules.read().await;
        modules.get(module_id)
            .map(|m| m.info.clone())
            .ok_or_else(|| AppError::NotFound(format!("Module {} not found", module_id)))
    }
    
    /// List all loaded modules
    pub async fn list_modules(&self) -> Vec<AgentModuleInfo> {
        let modules = self.modules.read().await;
        modules.values().map(|m| m.info.clone()).collect()
    }
    
    /// Execute a function in a loaded module
    pub async fn execute_function(
        &self,
        module_id: &str,
        function_name: &str,
        args: Vec<i32>,
        session_id: &str,
    ) -> AppResult<i32> {
        let modules = self.modules.read().await;
        let module = modules.get(module_id)
            .ok_or_else(|| AppError::NotFound(format!("Module {} not found", module_id)))?;
        
        // TODO: This is a simplified example. In practice, you'd need to handle
        // different function signatures, memory management, and context isolation.
        
        // For now, return a mock result
        info!("📞 Executing function '{}' in module '{}' for session '{}'", 
              function_name, module_id, session_id);
        
        // In a real implementation, you would:
        // 1. Get the typed function from the module
        // 2. Set up the execution context
        // 3. Call the function with proper arguments
        // 4. Handle the result and any errors
        
        Ok(42) // Mock return value
    }
    
    /// Check if a module supports a specific agent type
    pub async fn supports_agent_type(&self, agent_type: &str) -> Vec<String> {
        let modules = self.modules.read().await;
        modules.values()
            .filter(|m| m.info.agent_type == agent_type)
            .map(|m| m.info.module_id.clone())
            .collect()
    }
    
    /// Get module statistics
    pub async fn get_statistics(&self) -> HashMap<String, serde_json::Value> {
        let modules = self.modules.read().await;
        let total_modules = modules.len();
        let active_modules = modules.values().filter(|m| m.info.active).count();
        
        let mut agent_types = HashMap::new();
        for module in modules.values() {
            *agent_types.entry(module.info.agent_type.clone()).or_insert(0) += 1;
        }
        
        let mut stats = HashMap::new();
        stats.insert("total_modules".to_string(), serde_json::json!(total_modules));
        stats.insert("active_modules".to_string(), serde_json::json!(active_modules));
        stats.insert("agent_types".to_string(), serde_json::json!(agent_types));
        stats.insert("max_modules".to_string(), serde_json::json!(self.config.max_modules));
        
        stats
    }
    
    /// Scan for modules in configured paths
    async fn scan_and_load_modules(&self) -> AppResult<()> {
        for path in &self.module_paths {
            if !path.exists() {
                debug!("Module path does not exist: {}", path.display());
                continue;
            }
            
            info!("🔍 Scanning for modules in: {}", path.display());
            
            let mut entries = tokio::fs::read_dir(path).await
                .map_err(|e| AppError::Internal(format!("Failed to read module directory: {}", e)))?;
            
            while let Some(entry) = entries.next_entry().await
                .map_err(|e| AppError::Internal(format!("Failed to read directory entry: {}", e)))? {
                
                let path = entry.path();
                if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("wasm") {
                    if let Err(e) = self.load_module(&path).await {
                        warn!("Failed to load module {}: {}", path.display(), e);
                    }
                }
            }
        }
        
        Ok(())
    }
    
    /// Start hot-reload monitoring
    async fn start_hot_reload_monitoring(&self) -> AppResult<()> {
        let config = self.config.clone();
        let loader = Arc::clone(&self.modules);
        
        tokio::spawn(async move {
            info!("🔄 Starting module hot-reload monitoring");
            let mut interval = tokio::time::interval(
                tokio::time::Duration::from_secs(config.watch_interval_seconds)
            );
            
            loop {
                interval.tick().await;
                // Module hot-reload logic would go here
                // For now, just log that we're monitoring
                debug!("Checking for module updates...");
            }
        });
        
        Ok(())
    }
    
    /// Validate module permissions
    fn validate_module_permissions(&self, module_info: &AgentModuleInfo) -> AppResult<()> {
        for permission in &module_info.permissions {
            if !self.config.allowed_permissions.contains(permission) {
                return Err(AppError::Forbidden(format!(
                    "Module {} requests forbidden permission: {}", 
                    module_info.module_id, permission
                )));
            }
        }
        Ok(())
    }
    
    /// Add host functions to the WASM linker
    fn add_host_functions(&self, linker: &mut Linker<AgentModuleContext>) -> AppResult<()> {
        // Add logging function
        linker.func_wrap("env", "log", |_caller: wasmtime::Caller<'_, AgentModuleContext>, ptr: i32, len: i32| {
            // In a real implementation, you'd read the string from WASM memory
            debug!("WASM module log: ptr={}, len={}", ptr, len);
        }).map_err(|e| AppError::Internal(format!("Failed to add log function: {}", e)))?;
        
        // Add time function
        linker.func_wrap("env", "get_time", |_caller: wasmtime::Caller<'_, AgentModuleContext>| -> i64 {
            chrono::Utc::now().timestamp_millis()
        }).map_err(|e| AppError::Internal(format!("Failed to add time function: {}", e)))?;
        
        // Add HTTP request function (placeholder)
        linker.func_wrap("env", "http_request", |_caller: wasmtime::Caller<'_, AgentModuleContext>, _url_ptr: i32, _url_len: i32| -> i32 {
            // In a real implementation, this would make an HTTP request
            // and return the response data
            0 // Success
        }).map_err(|e| AppError::Internal(format!("Failed to add HTTP function: {}", e)))?;
        
        Ok(())
    }
    
    /// Extract exported functions from WASM instance
    fn extract_exported_functions(
        &self,
        instance: &Instance,
        store: &mut Store<AgentModuleContext>,
        functions: &mut HashMap<String, Box<dyn std::any::Any + Send + Sync>>,
    ) -> AppResult<()> {
        // Look for standard agent functions
        let standard_functions = vec![
            "init",
            "execute",
            "cleanup",
            "get_capabilities",
            "handle_message",
        ];
        
        for func_name in standard_functions {
            if let Some(func) = instance.get_func(&mut *store, func_name) {
                // Try to get as a simple i32 -> i32 function for now
                if let Ok(typed_func) = func.typed::<i32, i32>(&mut *store) {
                    functions.insert(func_name.to_string(), Box::new(typed_func));
                    debug!("Exported function found: {}", func_name);
                }
            }
        }
        
        Ok(())
    }
}
