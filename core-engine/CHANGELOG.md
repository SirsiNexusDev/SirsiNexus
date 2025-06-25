# Changelog

All notable changes to the SirsiNexus Core Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-06-25

### Added
- Initial project setup with Rust and Cargo
- Basic API structure using Axum framework
- Authentication system implementation
  - User registration with Argon2 password hashing
  - JWT-based login system
  - Password verification using Argon2
- Project management API
  - CRUD operations for projects
  - Project status tracking
  - Owner-based access control
- Resource management API
  - CRUD operations for resources
  - Resource ownership validation
  - Access control middleware
- Database integration
  - PostgreSQL connection setup
  - SQLx for type-safe queries
  - Basic migration system
- Telemetry and observability
  - OpenTelemetry integration
  - Request tracing middleware
  - Basic metrics collection

### Fixed
- Routing imports in api/mod.rs
- Argon2 password hashing implementation
- Debug handler attributes for all API endpoints
- Authentication handler error handling
- Project and resource authorization checks
- OpenTelemetry configuration and imports
- Database connection pooling and timeouts
- Database migration system
- Project status enum handling in SQLx

### Security
- Implemented secure password hashing with Argon2
- Added JWT-based authentication
- Implemented proper authorization checks for all endpoints
- Added request validation middleware
