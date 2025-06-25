# Sirsi Nexus Changelog

All notable changes to the Sirsi Nexus project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-25

### Added

#### CockroachDB Integration Complete
- ✅ **Database Migration**
  - Complete migration from PostgreSQL to CockroachDB
  - CockroachDB-compatible migrations with gen_random_uuid()
  - Updated SQL queries for CockroachDB syntax
  - Runtime SQLx queries to avoid compile-time dependency
  - Proper handling of CockroachDB timestamp types
  - String-based status enums with CHECK constraints

#### Development Infrastructure
- ✅ **Database Setup**
  - Docker Compose with CockroachDB, Redis, and Jaeger
  - Automated database setup script (./scripts/setup-db.sh)
  - Development and test configuration files
  - CockroachDB Admin UI integration (localhost:8081)

#### Testing Infrastructure
- ✅ **CockroachDB Tests**
  - Integration tests for database connectivity
  - End-to-end user model testing
  - UUID generation verification
  - Table schema validation
  - Type compatibility testing

#### Documentation
- ✅ **Database Documentation**
  - Comprehensive DATABASE_SETUP.md guide
  - CockroachDB vs PostgreSQL comparison
  - Manual and automated setup instructions
  - Troubleshooting guide
  - Production deployment considerations

### Fixed

#### Database Compatibility
- ✅ **CockroachDB Type Issues**
  - Fixed timestamp type compatibility (TIMESTAMPTZ vs TIMESTAMP)
  - Resolved integer type differences (INT8 vs INT4)
  - Updated datetime handling to use chrono::NaiveDateTime
  - Fixed column type mappings for all models

#### Code Quality
- ✅ **Compilation Warnings**
  - Cleaned up unused imports throughout codebase
  - Fixed unused variables and dead code warnings
  - Added underscore prefixes for intentionally unused parameters
  - Improved code organization and comments

#### Build System
- ✅ **Workspace Configuration**
  - Updated resolver to version 2 for edition 2021 compatibility
  - Fixed SQLx dependencies for CockroachDB
  - Resolved compilation errors in all modules
  - Added proper feature flags for database tests

### Changed

#### Database Backend
- 🔄 **BREAKING**: PostgreSQL → CockroachDB
  - Connection strings updated to CockroachDB format
  - Default port changed from 5432 to 26257
  - SSL mode defaults changed for development
  - Admin UI moved to port 8081 to avoid conflicts

#### Data Models
- 🔄 **Timestamp Handling**
  - Models now use chrono::NaiveDateTime for compatibility
  - Updated all API responses to match new types
  - Fixed serialization for frontend integration

### Removed

- ❌ **PostgreSQL Dependencies**
  - Removed old PostgreSQL Docker Compose files
  - Cleaned up PostgreSQL-specific configurations
  - Removed PostgreSQL extensions and syntax

## [1.0.0] - 2025-06-25

### Added

#### Core Infrastructure
- ✅ **Unified Comprehensive Development Blueprint (CDB)**
  - Consolidated all CDB versions into single source of truth
  - Comprehensive phase-by-phase roadmap
  - Current development status tracking
  - Technology stack documentation
- ✅ **Core Engine Foundation (Rust)**
  - Axum web framework setup with modular routing
  - CockroachDB database integration with SQLx
  - Authentication system with Argon2 password hashing
  - JWT-based token management
  - Type-safe error handling with thiserror
  - User and project models with CRUD operations
- ✅ **Workspace Configuration**
  - Cargo workspace setup for monorepo structure
  - Dependency management and version coordination
  - Build system optimization

#### Frontend Foundation
- ✅ **UI/UX Infrastructure**
  - Next.js + React application structure
  - Tailwind CSS design system
  - Responsive layout with sidebar navigation
  - Authentication modal components
  - Project management interface
  - Task list components
  - Basic AgentChat integration
- ✅ **Component Library**
  - Reusable UI components
  - Form validation with React Hook Form + Zod
  - Chart integration for analytics
  - Modal and dialog systems

#### Development Infrastructure
- ✅ **Version Control & Documentation**
  - Git repository setup with proper .gitignore
  - Comprehensive documentation structure
  - README and project documentation
  - API documentation framework

### Fixed

#### Critical Compilation Issues
- ✅ **Argon2 API Compatibility**
  - Updated to modern Argon2 password hashing API
  - Fixed password verification implementation
  - Proper salt generation with OsRng
- ✅ **DateTime Type Consistency**
  - Resolved chrono vs time crate conflicts
  - Updated models to use time::PrimitiveDateTime
  - Fixed database query type mismatches
- ✅ **Type System Issues**
  - Added missing AppError and AppResult type aliases
  - Fixed project module visibility
  - Added Clone trait to ProjectStatus enum
  - Resolved User::create method signature
- ✅ **Workspace Conflicts**
  - Removed duplicate workspace definitions
  - Fixed cargo workspace configuration
  - Resolved dependency conflicts

#### API & Database
- ✅ **Authentication System**
  - Fixed user registration flow
  - Corrected password hashing and verification
  - Improved JWT token generation
- ✅ **Database Models**
  - Fixed user and project model implementations
  - Corrected CRUD operation signatures
  - Proper datetime handling in queries
- ✅ **Request Handling**
  - Fixed FromRequestParts trait implementations
  - Corrected middleware authentication
  - Improved error response handling

### Security
- ✅ **Password Security**
  - Modern Argon2 implementation with proper salting
  - Secure random salt generation
  - Password verification best practices
- ✅ **Authentication**
  - JWT-based token system
  - Proper session management
  - Request authorization middleware

### Performance
- ✅ **Database Optimization**
  - Type-safe SQLx queries
  - Efficient connection pooling
  - Optimized query structures
- ✅ **API Performance**
  - Async/await throughout
  - Efficient request handling
  - Proper error propagation

### Database Migration
- ✅ **CockroachDB Integration**
  - Migrated from PostgreSQL to CockroachDB
  - Updated connection strings and configurations
  - Adapted SQLx queries for CockroachDB compatibility
  - Updated default ports and SSL configuration
  - Modified test database URLs
  - Updated CI/CD pipeline for CockroachDB

### Dependencies
- ✅ **Core Dependencies**
  - axum 0.6.20 (web framework)
  - sqlx 0.8 (database integration)
  - tokio 1.35 (async runtime)
  - argon2 0.5 (password hashing)
  - jsonwebtoken 9.2 (JWT tokens)
  - time 0.3 (datetime handling)
  - uuid 1.7 (unique identifiers)
  - serde 1.0 (serialization)

### Documentation
- ✅ **Comprehensive Blueprint**
  - Single unified CDB document
  - Phase-by-phase development roadmap
  - Architecture documentation
  - Technology stack overview
- ✅ **Development Status**
  - Current progress tracking
  - Component completion status
  - Issue resolution documentation
- ✅ **API Documentation**
  - Model definitions
  - Endpoint specifications
  - Authentication flows

## [0.1.0] - 2025-06-24

### Added
- Initial project scaffolding
- Basic Rust core engine structure
- Frontend application skeleton
- Database schema design
- Authentication foundation

---

## Upcoming Releases

### [1.1.0] - Planned
- ⏳ **Agent System Framework**
  - AgentService gRPC implementation
  - Sub-agent manager
  - Redis context store
- ⏳ **Enhanced Frontend**
  - Complete migration wizard
  - Advanced task management
  - Real-time agent integration
- ⏳ **Cloud Connectors**
  - AWS agent implementation
  - Azure agent implementation
  - Resource discovery system

### [2.0.0] - Planned
- ⏳ **Full AI Integration**
  - Complete agent ecosystem
  - ML-based assessment
  - Automated planning
- ⏳ **Multi-cloud Support**
  - All provider integrations
  - Cross-cloud migrations
  - Resource optimization
- ⏳ **Enterprise Features**
  - Advanced security
  - Compliance automation
  - Multi-tenant support

---

**Note**: This changelog documents the entire Sirsi Nexus project. For component-specific changes, see:
- `core-engine/CHANGELOG.md` - Core engine changes
- `ui/CHANGELOG.md` - Frontend changes (when created)
- `connectors/CHANGELOG.md` - Connector changes (when created)
