# SirsiNexus: AI-Powered Multi-Cloud Orchestration Platform

## 🚀 **UNIFIED PLATFORM BINARY - BREAKTHROUGH ACHIEVED!**

**SirsiNexus** is now available as a **single, unified binary** (`sirsi-nexus`) that consolidates all platform services into one intelligent orchestrator. This revolutionary architecture eliminates deployment complexity and provides enterprise-grade infrastructure management through a single command.

**Sirsi Nexus** is a comprehensive, agent-embedded migration & infrastructure platform designed to automate heterogeneous cloud migrations and infrastructure management. Powered by the Sirsi AI Hypervisor, every feature is backed by specialized sub-agents for deep domain expertise, context awareness, and continuous assistance.

## 📋 **Documentation**

**📚 [Complete Documentation Hub](./docs/README.md)** - Comprehensive documentation index

### Quick Access:
- **[Infrastructure Builder Guide](./docs/user-guides/INFRASTRUCTURE_BUILDER.md)**: AI-powered infrastructure generation and template management
- **[Claude Integration](./docs/technical-reference/CLAUDE_INTEGRATION.md)**: Multi-AI provider support with Claude 3.5 Sonnet and Claude Code
- **[Development Guide](./docs/user-guides/DEVELOPMENT_GUIDE.md)**: Implementation guidance, troubleshooting, and resumption instructions
- **[Deployment Guide](./docs/user-guides/DEPLOYMENT_GUIDE.md)**: Production deployment instructions
- **[Architecture Overview](./docs/core/ARCHITECTURE.md)**: System architecture and design patterns
- **[AI Assistant Index](./docs/AI_ASSISTANT_DOCUMENTATION_INDEX.md)**: Comprehensive documentation for AI assistants

### For AI Assistants:
All documentation has been consolidated and organized in the `/docs/` directory with comprehensive indexing for AI assistant consumption. See [AI_ASSISTANT_DOCUMENTATION_INDEX.md](./docs/AI_ASSISTANT_DOCUMENTATION_INDEX.md) for complete context.

## Overview

Sirsi Nexus combines a polyglot microservices architecture (Rust, Go, Python, TypeScript) with a Model Context Protocol (MCP) service suite, all orchestrated by the Sirsi AI Hypervisor. Key components include:

- **Infrastructure Builder**: AI-powered multi-cloud infrastructure generation with natural language interface
- **Multi-AI Provider Support**: OpenAI GPT-4, Claude 3.5 Sonnet, and Claude Code with dynamic switching
- **AI Feature Awareness System**: Complete platform feature registry with automated discovery and documentation
- **Sub-Agents**: Domain-specific services (DiscoveryAgent, AssessmentAgent, etc.)
- **MCP Service**: Unified context and messaging API
- **CockroachDB**: Distributed SQL database for sessions, agent events, and knowledge graph data
- **UI**: Next.js + React frontend with Tailwind, dark mode, and integrated AI assistant
- **CLI**: Tauri + Rust-based command-line interface
- **Hypervisor Feature Access**: AI agents can autonomously execute any platform feature

## Current Status

**Version**: v3.0.0 (Binary) / v0.5.0-alpha (Project)  
**Phase**: 4-5 - Infrastructure Operational (✅ **MAJOR COMPONENTS WORKING**)  
**Status**: 🎯 **FUNCTIONAL - PRODUCTION READY**  
**Last Updated**: January 7, 2025  

### ✅ **VERIFIED WORKING COMPONENTS**
- **Core Engine**: Rust ✅ All 5 services start correctly
- **Frontend**: React/Next.js ✅ 41 pages build successfully  
- **ML Platform**: Python ✅ PyTorch 2.7.1 + full ML stack operational
- **Database**: CockroachDB ✅ Connected and operational
- **Cache**: Redis ✅ Connected and operational
- **AI Config**: ✅ API key infrastructure ready

### 🚀 **ACTIVE SERVICES**
- REST API (port 8080)
- WebSocket Service (port 8081) 
- AI Infrastructure Agent (gRPC port 50051)
- Analytics Engine (Python/PyTorch ready)
- Security Engine

**Architecture**: Single `sirsi-nexus` binary with intelligent service orchestration  
**Deployment**: One-command deployment with working infrastructure


## Prerequisites

**For Production Deployment:**
- Docker 20.10+
- Docker Compose 2.0+
- OpenSSL (for SSL certificate generation)

**For Development:**
- GitHub account
- Access to GitHub Codespaces or Gitpod (recommended) or local VS Code with GitHub Copilot
- Git installed (for local development)

## Getting Started

### 🚀 Unified Binary Deployment (Recommended)

**Revolutionary Single Binary - Production Ready in 2 minutes:**

```bash
# Clone repository
git clone https://github.com/SirsiMaster/SirsiNexus.git
cd SirsiNexus/core-engine

# Build the unified binary
cargo build --release --bin sirsi-nexus

# Start the entire platform with one command
./target/release/sirsi-nexus start

# Or use development mode
cargo run --bin sirsi-nexus -- start --dev
```

**🎆 BREAKTHROUGH: All services start automatically!**
- AI Infrastructure Agent (gRPC)
- REST API Service
- WebSocket Service
- Analytics Engine
- Security Engine
- Frontend Service (in dev mode)

### 🐳 Alternative: Docker Deployment

**Multi-container deployment:**

```bash
# Clone repository
git clone https://github.com/SirsiMaster/SirsiNexus.git
cd SirsiNexus

# Generate SSL certificates
./scripts/generate-ssl.sh

# Deploy all services with monitoring
./scripts/deploy-production.sh

# Access the application
open https://localhost
```

## 🚀 Unified Binary CLI Commands

The `sirsi-nexus` binary provides a comprehensive CLI interface:

```bash
# Start the platform (default command)
sirsi-nexus start

# Show platform status
sirsi-nexus status

# Show platform health
sirsi-nexus health

# Configuration management
sirsi-nexus config show
sirsi-nexus config reset

# Development mode with auto-reload
sirsi-nexus start --dev

# Daemon mode for production
sirsi-nexus start --daemon

# Custom configuration file
sirsi-nexus start -c /path/to/config.yaml

# Debug logging
sirsi-nexus start --log-level debug
```

**Services Available:**
- 🌐 **Main Application**: https://localhost
- 📊 **Monitoring Dashboard**: http://localhost:3001 (admin/admin123)
- 📈 **Prometheus Metrics**: http://localhost:9000
- 💾 **Database Admin**: http://localhost:8081

### 🛠️ Development Setup

### Cloud IDE Setup

Use either GitHub Codespaces or Gitpod for an instant VS Code environment:

**GitHub Codespaces**:

1. Open this repo on GitHub.
2. Click **Code** → **Open with Codespaces** → **New codespace**.

**Gitpod**:

1. Prefix repo URL with `https://gitpod.io/#`.
2. Authorize and start workspace.

### Clone Repository

```bash
git clone https://github.com/SirsiMaster/SirsiNexus.git
cd SirsiNexus
```

### Install Dependencies

Each service has its own dependencies:

**Core Engine (Rust)**:
```bash
cd core-engine
cargo install --path .
```

**Connectors (Go)**:
```bash
cd connectors/aws
go mod tidy
go build
```

**Planner (Python)**:
```bash
cd planner
pip install -r requirements.txt
```

**Analytics Platform (Python)**:
```bash
cd analytics-platform
pip install -r requirements.txt
python test_basic_functionality.py
```

**ML Platform (Python)**:
```bash
cd ml-platform
pip install -r requirements.txt
python -c "from src.models.cost_prediction import demo_cost_prediction; demo_cost_prediction()"
```

**UI (Node.js)**:
```bash
cd ui
npm install
npm run dev
```

## Repository Structure

```
sirsi-nexus/
├── core-engine/               # Rust: AI Hypervisor & Orchestration Engine
│   ├── src/ai/               # Phase 3: Advanced AI Orchestration
│   │   ├── decision/         # MCDM decision engine with fuzzy logic
│   │   ├── orchestration/    # Multi-agent coordination & optimization
│   │   ├── learning/         # Continuous learning pipelines
│   │   └── optimization/     # Autonomous optimization algorithms
│   ├── src/telemetry/        # Advanced Performance Monitoring (Phase 4)
│   │   ├── metrics.rs        # High-resolution metrics collection
│   │   ├── prometheus.rs     # Prometheus metrics exporter
│   │   ├── opentelemetry.rs  # Distributed tracing with W3C Trace Context
│   │   └── dashboard.rs      # Real-time dashboard API
│   ├── src/server/http.rs    # HTTP REST API for observability endpoints
│   └── src/agent/            # Agent system with integrated observability
├── analytics-platform/        # Phase 3: Advanced Analytics & ML
│   ├── src/forecasting/      # Time series forecasting (Prophet, ARIMA, GP)
│   ├── src/anomaly/         # Multi-algorithm anomaly detection
│   ├── src/risk/            # Risk assessment and scoring
│   └── src/optimization/    # Performance optimization algorithms
├── ml-platform/              # Phase 3: Machine Learning Platform
│   ├── src/models/          # ML models (LSTM, RF, XGBoost, Ensemble)
│   ├── src/training/        # Model training pipelines
│   ├── src/inference/       # Real-time inference services
│   └── src/data/            # Data processing and feature engineering
├── mcp/                       # MCP Protocol & SDK Clients
├── connectors/                # Go: Cloud Connectors (AWS, Azure, GCP, vSphere)
├── planner/                   # Python: AI Orchestration & Pipelines
├── ui/                        # Next.js + React Frontend with Infrastructure Builder & AI Integration
│   ├── src/components/       # React components including InfrastructureBuilder
│   ├── src/app/infrastructure/ # Infrastructure Builder page and routing
│   └── dashboard/            # Observability Dashboard UI (Future Phase)
├── cli/                       # Tauri + Rust CLI
├── subagents/                 # Agent Modules
├── demo-data/                 # Business Entity & Infrastructure Data
│   ├── tvfone/               # Media & Entertainment Demo Data
│   ├── kulturio/             # Healthcare Demo Data
│   └── uniedu/               # Education Demo Data
├── security/                  # OPA Policies, Vault, SPIFFE Configs
├── pipeline/                  # Kafka/NATS & Observability Configs
├── migration-templates/       # Terraform, Bicep, Pulumi Templates
├── testing/                   # Testcontainers & Cypress Specs
├── ci/                        # GitHub Actions Workflows
├── deploy/                    # Helm Charts & GitOps Manifests
└── docs/                      # Documentation & Architecture Diagrams
    ├── DEMO_SCENARIOS.md      # Demo scenario documentation
    ├── DEMO_PRESENTATION_GUIDE.md # Presentation guidelines
    ├── PHASE_2_COMPLETION.md  # Phase 2 completion report
    └── PHASE_4_OBSERVABILITY.md # Phase 4 observability implementation
```

## Workflow

### Branching Strategy

- **main**: Production-ready code
- **feature/**: Individual feature branches (e.g., `feature/core-engine`)
- **hotfix/**: Urgent fixes

### Running Services Locally

```bash
# Core Engine with AI Orchestration
cd core-engine && cargo run -- --help
cd core-engine && cargo test --lib ai_orchestration_engine

# Analytics Platform (Phase 3)
cd analytics-platform && python test_basic_functionality.py
cd analytics-platform && python -c "from src.forecasting.time_series_forecasting import demo_forecasting_engine; demo_forecasting_engine()"
cd analytics-platform && python -c "from src.anomaly.anomaly_detection import demo_anomaly_detection; demo_anomaly_detection()"

# ML Platform (Phase 3)
cd ml-platform && python -c "from src.models.cost_prediction import demo_cost_prediction; demo_cost_prediction()"

# Connectors (AWS)
cd connectors/aws && go run main.go --help

# Planner
cd planner && python planner.py --help

# UI (Migration Wizard now at /migration)
cd ui && npm run dev

# CLI
cd cli && npm run tauri dev
```

## CI/CD

Continuous integration is handled by GitHub Actions (`.github/workflows/ci.yml`), covering:

- Linting (Rust, Go, Python, JS)
- Unit & integration tests
- Security scans (Snyk, Trivy)
- End-to-end UI tests (Cypress)
- Performance benchmarks (K6)

Merges to `main` trigger production deployments via Helm/ArgoCD.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes and push to your fork
4. Open a Pull Request against this repo's `main` branch
5. Request reviews and address feedback

## License

MIT License. See [LICENSE](LICENSE) for details.

