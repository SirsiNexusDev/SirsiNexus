//! # Hypervisor Module
//!
//! The Hypervisor module provides the core orchestration layer for the SirsiNexus
//! AI agent system. It coordinates agent lifecycle, manages resource allocation,
//! and ensures proper inter-agent communication.

pub mod coordinator;
pub mod scheduler;

pub use coordinator::HypervisorCoordinator;
pub use scheduler::TaskScheduler;
