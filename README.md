# Sirsi Nexus

**Sirsi Nexus** is a comprehensive, agent-embedded migration & infrastructure platform designed to automate heterogeneous cloud migrations and infrastructure management. Powered by the Sirsi AI Hypervisor, every feature is backed by specialized sub-agents for deep domain expertise, context awareness, and continuous assistance.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
   1. [Cloud IDE Setup](#cloud-ide-setup)
   2. [Clone Repository](#clone-repository)
   3. [Install Dependencies](#install-dependencies)
4. [Repository Structure](#repository-structure)
5. [Workflow](#workflow)
   1. [Branching Strategy](#branching-strategy)
   2. [Codex Scaffolding](#codex-scaffolding)
   3. [Running Services Locally](#running-services-locally)
6. [CI/CD](#cicd)
7. [Contributing](#contributing)
8. [License](#license)

## Overview

Sirsi Nexus combines a polyglot microservices architecture (Rust, Go, Python, TypeScript) with a Model Context Protocol (MCP) service suite, all orchestrated by the Sirsi AI Hypervisor. Key components include:

- **Sub-Agents**: Domain-specific services (DiscoveryAgent, AssessmentAgent, etc.)
- **MCP Service**: Unified context and messaging API
- **CockroachDB**: Distributed SQL database for sessions, agent events, and knowledge graph data
- **UI**: Next.js + React frontend with Tailwind and shadcn/ui
- **CLI**: Tauri + Rust-based command-line interface

## 🎯 **Current Status: v0.3.1 - Enhanced Error Handling System**

### ✅ **Agent Framework Foundation (100% Complete)**
- **Core Engine**: Rust-based AI Hypervisor with gRPC services
- **Multi-Cloud Support**: AWS (real), Azure (mock), GCP (mock) connectors
- **Context Management**: Redis-backed session and agent storage
- **Resource Discovery**: Cloud resource scanning with timing metrics
- **Cost Estimation**: AI-powered migration cost analysis
- **Migration Recommendations**: Intelligent optimization suggestions
- **Integration Testing**: 11/11 tests passing (100% success rate)

### ✅ **Comprehensive Error Handling & Resolution System (NEW)**
- **Robust Error Handling**: End-to-end error management across all migration steps
- **Retry Mechanisms**: Intelligent retry logic for transient failures
- **Bypass Options**: Controlled bypass for non-critical errors with warnings
- **Fallback Configurations**: Automatic fallback to working defaults
- **Educational Workflows**: Users learn error resolution best practices
- **Demo Reliability**: No dead-end scenarios - every error has resolution paths
- **Visual Error Indicators**: Clear UI feedback with actionable guidance
- **Production-Ready Patterns**: Enterprise-grade error handling implementations

### ✅ **Enhanced Demo Capabilities (NEW)**
- **Dynamic Resource Generation**: Business-specific infrastructure based on entity & journey
- **Multi-Scenario Support**: TVfone (Media), Kulturio (Healthcare), UniEdu (Education)
- **Journey-Specific Flows**: Migration, Optimization, Scale-Up demo scenarios
- **Comprehensive Discovery**: Compute, network, storage, security, users, applications
- **Interactive Error Handling**: Live demonstration of error resolution workflows
- **Real-World Simulation**: Authentic failure scenarios with guided recovery

### 🔧 **Next Phase: Real Cloud SDK Integration**
- Replace Azure mock with real Azure SDK
- Replace GCP mock with real Google Cloud SDK
- Enhanced authentication mechanisms
- Extended resource type support

## Prerequisites

- GitHub account
- Access to GitHub Codespaces or Gitpod (recommended) or local VS Code with GitHub Copilot
- Git installed (for local development)

## Getting Started

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

**UI (Node.js)**:
```bash
cd ui
npm install
npm run dev
```

## Repository Structure

```
sirsi-nexus/
├── core-engine/               # Rust: AI Hypervisor & MCP Server
├── mcp/                       # MCP Protocol & SDK Clients
├── connectors/                # Go: Cloud Connectors (AWS, Azure, GCP, vSphere)
├── planner/                   # Python: AI Orchestration & Pipelines
├── ui/                        # Next.js + React Frontend with Error Handling
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
    └── PHASE_2_COMPLETION.md  # Phase 2 completion report
```

## Workflow

### Branching Strategy

- **main**: Production-ready code
- **feature/**: Individual feature branches (e.g., `feature/core-engine`)
- **hotfix/**: Urgent fixes

### Running Services Locally

```bash
# Core Engine
cd core-engine && cargo run -- --help

# Connectors (AWS)
cd connectors/aws && go run main.go --help

# Planner
cd planner && python planner.py --help

# UI
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

