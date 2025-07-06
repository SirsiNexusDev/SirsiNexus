'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Code,
  FileText,
  Download,
  Copy,
  Play,
  Save,
  FolderOpen,
  Settings,
  Layers,
  Cloud,
  Server,
  Database,
  Shield,
  Network,
  Zap,
  GitBranch,
  Upload,
  Terminal,
  Monitor,
  Cpu,
  HardDrive,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAppSelector } from '@/store';

interface InfrastructureTemplate {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'database' | 'compute' | 'storage' | 'networking' | 'security' | 'monitoring' | 'cicd';
  provider: 'aws' | 'azure' | 'gcp' | 'multi' | 'kubernetes';
  formats: ('terraform' | 'bicep' | 'cloudformation' | 'pulumi' | 'ansible' | 'yaml')[];
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedCost: string;
  deploymentTime: string;
  tags: string[];
  content: {
    [key in 'terraform' | 'bicep' | 'cloudformation' | 'pulumi' | 'ansible' | 'yaml']?: string;
  };
  dependencies?: string[];
  variables?: { [key: string]: any };
}

interface GenerationRequest {
  id: string;
  query: string;
  timestamp: Date;
  status: 'pending' | 'generating' | 'completed' | 'error';
  result?: {
    templates: InfrastructureTemplate[];
    explanation: string;
    recommendations: string[];
  };
}

interface InfrastructureBuilderProps {
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const mockTemplates: InfrastructureTemplate[] = [
  {
    id: 'serverless-api',
    name: 'Serverless API Gateway',
    description: 'High-performance serverless API with authentication and auto-scaling',
    category: 'api',
    provider: 'aws',
    formats: ['terraform', 'cloudformation', 'pulumi'],
    complexity: 'intermediate',
    estimatedCost: '$50-200/month',
    deploymentTime: '15-30 minutes',
    tags: ['serverless', 'api-gateway', 'lambda', 'cognito', 'dynamodb'],
    content: {
      terraform: `# AWS Terraform configuration for serverless API
provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "api_name" {
  description = "Name of the API"
  type        = string
  default     = "my-serverless-api"
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = var.api_name
  description = "Serverless API with Lambda integration"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Lambda function
resource "aws_lambda_function" "api_handler" {
  filename         = "api_handler.zip"
  function_name    = "\${var.api_name}-handler"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  
  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.lambda_logs,
  ]
}

# DynamoDB Table
resource "aws_dynamodb_table" "main" {
  name           = "\${var.api_name}-data"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  tags = {
    Environment = "production"
    Generated   = "sirsi-nexus"
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "\${var.api_name}-users"
  
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  
  auto_verified_attributes = ["email"]
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "\${var.api_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/\${aws_lambda_function.api_handler.function_name}"
  retention_in_days = 14
}

# IAM policy attachment
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Output the API endpoint
output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_rest_api.main.execution_arn
}

output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}`,
      cloudformation: `AWSTemplateFormatVersion: '2010-09-09'
Description: 'Serverless API with Lambda, API Gateway, and DynamoDB'

Parameters:
  ApiName:
    Type: String
    Default: my-serverless-api
    Description: Name of the API

Resources:
  # API Gateway
  ApiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: !Ref ApiName
      Description: Serverless API with Lambda integration
      EndpointConfiguration:
        Types:
          - REGIONAL

  # Lambda Function
  LambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '\${ApiName}-handler'
      Runtime: nodejs18.x
      Handler: index.handler
      Role: !GetAtt LambdaRole.Arn
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            return {
              statusCode: 200,
              body: JSON.stringify({ message: 'Hello from Lambda!' })
            };
          };

  # DynamoDB Table
  DynamoDBTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '\${ApiName}-data'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true

  # Cognito User Pool
  UserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      UserPoolName: !Sub '\${ApiName}-users'
      AutoVerifiedAttributes:
        - email
      Policies:
        PasswordPolicy:
          MinimumLength: 8
          RequireLowercase: true
          RequireNumbers: true
          RequireSymbols: true
          RequireUppercase: true

  # IAM Role for Lambda
  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://\${ApiGateway}.execute-api.\${AWS::Region}.amazonaws.com/prod'
  
  UserPoolId:
    Description: Cognito User Pool ID
    Value: !Ref UserPool`
    },
    variables: {
      aws_region: 'us-east-1',
      api_name: 'my-serverless-api'
    }
  },
  {
    id: 'k8s-microservices',
    name: 'Kubernetes Microservices',
    description: 'Production-ready Kubernetes cluster with microservices architecture',
    category: 'compute',
    provider: 'kubernetes',
    formats: ['yaml', 'terraform', 'ansible'],
    complexity: 'advanced',
    estimatedCost: '$300-800/month',
    deploymentTime: '45-90 minutes',
    tags: ['kubernetes', 'microservices', 'ingress', 'monitoring', 'scaling'],
    content: {
      yaml: `# Kubernetes Microservices Deployment
apiVersion: v1
kind: Namespace
metadata:
  name: microservices
  labels:
    name: microservices
---
# API Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
  namespace: microservices
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      containers:
      - name: api
        image: nginx:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
---
# API Service
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: microservices
spec:
  selector:
    app: api-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
---
# Ingress Controller
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microservices-ingress
  namespace: microservices
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: api-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-service-hpa
  namespace: microservices
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80`
    }
  },
  {
    id: 'azure-webapp',
    name: 'Azure Web App with Database',
    description: 'Scalable Azure web application with SQL database and Application Insights',
    category: 'compute',
    provider: 'azure',
    formats: ['bicep', 'terraform', 'ansible'],
    complexity: 'intermediate',
    estimatedCost: '$100-300/month',
    deploymentTime: '20-40 minutes',
    tags: ['azure', 'webapp', 'sql', 'monitoring', 'scaling'],
    content: {
      bicep: `// Azure Web App with SQL Database
@description('The name of the web app')
param webAppName string = 'mywebapp\${uniqueString(resourceGroup().id)}'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The SKU of the app service plan')
param skuName string = 'B1'

@description('The runtime stack for the web app')
param linuxFxVersion string = 'DOTNETCORE|6.0'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '\${webAppName}-plan'
  location: location
  kind: 'linux'
  properties: {
    reserved: true
  }
  sku: {
    name: skuName
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: applicationInsights.properties.InstrumentationKey
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
      ]
    }
    httpsOnly: true
  }
}

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: '\${webAppName}-sql'
  location: location
  properties: {
    administratorLogin: 'sqladmin'
    administratorLoginPassword: 'P@ssw0rd123!'
    version: '12.0'
  }
}

// SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: '\${webAppName}-db'
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '\${webAppName}-insights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
}

// Outputs
output webAppUrl string = 'https://\${webApp.properties.defaultHostName}'
output sqlServerName string = sqlServer.name
output databaseName string = sqlDatabase.name`,
      terraform: `# Azure Web App with SQL Database
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-webapp"
}

variable "location" {
  description = "Location for all resources"
  type        = string
  default     = "East US"
}

variable "app_name" {
  description = "Name of the web app"
  type        = string
  default     = "mywebapp"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "\${var.app_name}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# Web App
resource "azurerm_linux_web_app" "main" {
  name                = "\${var.app_name}-\${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      dotnet_version = "6.0"
    }
    
    ftps_state = "Disabled"
    minimum_tls_version = "1.2"
  }

  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~3"
  }

  https_only = true
}

# Random string for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# SQL Server
resource "azurerm_mssql_server" "main" {
  name                         = "\${var.app_name}-sql-\${random_string.suffix.result}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = "P@ssw0rd123!"
}

# SQL Database
resource "azurerm_mssql_database" "main" {
  name           = "\${var.app_name}-db"
  server_id      = azurerm_mssql_server.main.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "LicenseIncluded"
  max_size_gb    = 2
  sku_name       = "Basic"
  zone_redundant = false
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "\${var.app_name}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
}

# Outputs
output "web_app_url" {
  description = "URL of the web app"
  value       = "https://\${azurerm_linux_web_app.main.default_hostname}"
}

output "sql_server_name" {
  description = "SQL Server name"
  value       = azurerm_mssql_server.main.name
}

output "database_name" {
  description = "Database name"
  value       = azurerm_mssql_database.main.name
}`
    },
    variables: {
      resource_group_name: 'rg-webapp',
      location: 'East US',
      app_name: 'mywebapp'
    }
  },
  {
    id: 'gcp-gke-cluster',
    name: 'Google Kubernetes Engine Cluster',
    description: 'Production-ready GKE cluster with node pools and monitoring',
    category: 'compute',
    provider: 'gcp',
    formats: ['terraform', 'yaml', 'ansible'],
    complexity: 'advanced',
    estimatedCost: '$200-600/month',
    deploymentTime: '30-60 minutes',
    tags: ['gcp', 'kubernetes', 'gke', 'monitoring', 'autoscaling'],
    content: {
      terraform: `# Google Kubernetes Engine Cluster
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
  default     = "my-gke-cluster"
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "\${var.cluster_name}-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "\${var.cluster_name}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.name

  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = "192.168.1.0/24"
  }

  secondary_ip_range {
    range_name    = "pod-ranges"
    ip_cidr_range = "192.168.64.0/22"
  }
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "pod-ranges"
    services_secondary_range_name = "services-range"
  }

  # Enable network policy
  network_policy {
    enabled = true
  }

  # Enable monitoring and logging
  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  # Enable autopilot features
  cluster_autoscaling {
    enabled = true
    resource_limits {
      resource_type = "cpu"
      minimum       = 1
      maximum       = 100
    }
    resource_limits {
      resource_type = "memory"
      minimum       = 1
      maximum       = 100
    }
  }
}

# Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "\${var.cluster_name}-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = 1

  autoscaling {
    min_node_count = 1
    max_node_count = 10
  }

  node_config {
    preemptible  = false
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.default.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      env = "production"
    }

    tags = ["gke-node", "\${var.cluster_name}-node"]
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}

# Service Account for nodes
resource "google_service_account" "default" {
  account_id   = "\${var.cluster_name}-sa"
  display_name = "\${var.cluster_name} Service Account"
}

# IAM binding for service account
resource "google_project_iam_member" "default" {
  project = var.project_id
  role    = "roles/container.nodeServiceAccount"
  member  = "serviceAccount:\${google_service_account.default.email}"
}

# Outputs
output "kubernetes_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "GKE Cluster Name"
}

output "kubernetes_cluster_host" {
  value       = google_container_cluster.primary.endpoint
  description = "GKE Cluster Host"
  sensitive   = true
}

output "region" {
  value       = var.region
  description = "GCloud Region"
}`
    },
    variables: {
      project_id: 'my-gcp-project',
      region: 'us-central1',
      cluster_name: 'my-gke-cluster'
    }
  },
  {
    id: 'multi-cloud-storage',
    name: 'Multi-Cloud Storage Solution',
    description: 'Unified storage solution across AWS S3, Azure Blob, and GCP Cloud Storage',
    category: 'storage',
    provider: 'multi',
    formats: ['terraform', 'ansible'],
    complexity: 'advanced',
    estimatedCost: '$20-100/month',
    deploymentTime: '25-45 minutes',
    tags: ['multi-cloud', 'storage', 's3', 'blob', 'cloud-storage'],
    content: {
      terraform: `# Multi-Cloud Storage Solution
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "multicloud-storage"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "azure_location" {
  description = "Azure location"
  type        = string
  default     = "East US"
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "gcp_project_id" {
  description = "GCP Project ID"
  type        = string
}

# Provider configurations
provider "aws" {
  region = var.aws_region
}

provider "azurerm" {
  features {}
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# AWS S3 Bucket
resource "aws_s3_bucket" "main" {
  bucket = "\${var.project_name}-aws-\${random_string.suffix.result}"
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Azure Storage Account
resource "azurerm_resource_group" "main" {
  name     = "\${var.project_name}-rg"
  location = var.azure_location
}

resource "azurerm_storage_account" "main" {
  name                     = "\${replace(var.project_name, "-", "")}\${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  
  blob_properties {
    versioning_enabled = true
  }
}

resource "azurerm_storage_container" "main" {
  name                  = "data"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# GCP Cloud Storage Bucket
resource "google_storage_bucket" "main" {
  name     = "\${var.project_name}-gcp-\${random_string.suffix.result}"
  location = var.gcp_region

  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = google_kms_crypto_key.bucket_key.id
  }
}

# GCP KMS for encryption
resource "google_kms_key_ring" "bucket_keyring" {
  name     = "\${var.project_name}-keyring"
  location = "global"
}

resource "google_kms_crypto_key" "bucket_key" {
  name     = "\${var.project_name}-key"
  key_ring = google_kms_key_ring.bucket_keyring.id
}

# Random string for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Outputs
output "aws_bucket_name" {
  description = "AWS S3 bucket name"
  value       = aws_s3_bucket.main.bucket
}

output "azure_storage_account" {
  description = "Azure storage account name"
  value       = azurerm_storage_account.main.name
}

output "gcp_bucket_name" {
  description = "GCP Cloud Storage bucket name"
  value       = google_storage_bucket.main.name
}`,
      ansible: `---
# Multi-Cloud Storage Playbook
- name: Deploy Multi-Cloud Storage Solution
  hosts: localhost
  gather_facts: false
  vars:
    project_name: "multicloud-storage"
    aws_region: "us-east-1"
    azure_location: "East US"
    gcp_region: "us-central1"
    random_suffix: "{{ ansible_date_time.epoch[-8:] }}"

  tasks:
    # AWS S3 Bucket
    - name: Create AWS S3 bucket
      amazon.aws.s3_bucket:
        name: "{{ project_name }}-aws-{{ random_suffix }}"
        region: "{{ aws_region }}"
        versioning: true
        encryption: "AES256"
        state: present
      register: aws_bucket

    # Azure Storage Account
    - name: Create Azure Resource Group
      azure.azcollection.azure_rm_resourcegroup:
        name: "{{ project_name }}-rg"
        location: "{{ azure_location }}"
        state: present

    - name: Create Azure Storage Account
      azure.azcollection.azure_rm_storageaccount:
        resource_group: "{{ project_name }}-rg"
        name: "{{ project_name | replace('-', '') }}{{ random_suffix }}"
        account_type: Standard_LRS
        location: "{{ azure_location }}"
        blob_cors:
          - allowed_origins:
              - "*"
            allowed_methods:
              - GET
              - POST
            allowed_headers:
              - "*"
            exposed_headers:
              - "*"
            max_age_in_seconds: 3600
        state: present
      register: azure_storage

    - name: Create Azure Blob Container
      azure.azcollection.azure_rm_storageblob:
        resource_group: "{{ project_name }}-rg"
        storage_account_name: "{{ azure_storage.state.name }}"
        container: data
        public_access: None
        state: present

    # GCP Cloud Storage
    - name: Create GCP Storage Bucket
      google.cloud.gcp_storage_bucket:
        name: "{{ project_name }}-gcp-{{ random_suffix }}"
        location: "{{ gcp_region }}"
        versioning:
          enabled: true
        encryption:
          default_kms_key_name: "projects/{{ gcp_project_id }}/locations/global/keyRings/{{ project_name }}-keyring/cryptoKeys/{{ project_name }}-key"
        state: present
      register: gcp_bucket

    # Output results
    - name: Display created resources
      debug:
        msg:
          - "AWS S3 Bucket: {{ aws_bucket.name }}"
          - "Azure Storage Account: {{ azure_storage.state.name }}"
          - "GCP Storage Bucket: {{ gcp_bucket.name }}"
          - "Multi-cloud storage solution deployed successfully!"`
    },
    variables: {
      project_name: 'multicloud-storage',
      aws_region: 'us-east-1',
      azure_location: 'East US',
      gcp_region: 'us-central1',
      gcp_project_id: 'my-gcp-project'
    }
  },
  {
    id: 'cicd-pipeline',
    name: 'CI/CD Pipeline with GitHub Actions',
    description: 'Complete CI/CD pipeline with testing, security scanning, and multi-environment deployment',
    category: 'cicd',
    provider: 'multi',
    formats: ['yaml', 'terraform'],
    complexity: 'advanced',
    estimatedCost: '$10-50/month',
    deploymentTime: '15-30 minutes',
    tags: ['cicd', 'github-actions', 'docker', 'kubernetes', 'security'],
    content: {
      yaml: `# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Code Quality and Security
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Security scan
        uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: 'security-scan-results.sarif'

  # Build and Push Docker Image
  build:
    needs: quality
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'latest'

      - name: Setup Helm
        uses: azure/setup-helm@v3
        with:
          version: 'latest'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name staging-cluster --region us-east-1

      - name: Deploy to staging
        run: |
          helm upgrade --install myapp ./helm-chart \
            --namespace staging \
            --create-namespace \
            --set image.repository=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }} \
            --set image.tag=${{ github.sha }} \
            --set environment=staging \
            --wait

      - name: Run smoke tests
        run: |
          kubectl wait --for=condition=ready pod -l app=myapp -n staging --timeout=300s
          npm run test:smoke -- --env staging

  # Deploy to Production
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3

      - name: Setup Helm
        uses: azure/setup-helm@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name production-cluster --region us-east-1

      - name: Deploy to production
        run: |
          helm upgrade --install myapp ./helm-chart \
            --namespace production \
            --create-namespace \
            --set image.repository=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }} \
            --set image.tag=${{ github.sha }} \
            --set environment=production \
            --set replicaCount=3 \
            --wait

      - name: Run health checks
        run: |
          kubectl wait --for=condition=ready pod -l app=myapp -n production --timeout=300s
          npm run test:health -- --env production

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()`
    }
  }
];

const categories = [
  { id: 'api', name: 'API & Gateway', icon: Network, count: 2 },
  { id: 'database', name: 'Databases', icon: Database, count: 1 },
  { id: 'compute', name: 'Compute', icon: Cpu, count: 3 },
  { id: 'storage', name: 'Storage', icon: HardDrive, count: 1 },
  { id: 'security', name: 'Security', icon: Shield, count: 0 },
  { id: 'monitoring', name: 'Monitoring', icon: Monitor, count: 0 },
  { id: 'cicd', name: 'CI/CD', icon: GitBranch, count: 1 },
];

const providers = [
  { id: 'aws', name: 'AWS', color: 'bg-orange-100 text-orange-700', count: 1 },
  { id: 'azure', name: 'Azure', color: 'bg-blue-100 text-blue-700', count: 1 },
  { id: 'gcp', name: 'GCP', color: 'bg-green-100 text-green-700', count: 1 },
  { id: 'kubernetes', name: 'Kubernetes', color: 'bg-purple-100 text-purple-700', count: 1 },
  { id: 'multi', name: 'Multi-Cloud', color: 'bg-gray-100 text-gray-700', count: 2 },
];

const formats = [
  { id: 'terraform', name: 'Terraform', icon: '🏗️' },
  { id: 'bicep', name: 'Bicep', icon: '💪' },
  { id: 'cloudformation', name: 'CloudFormation', icon: '☁️' },
  { id: 'pulumi', name: 'Pulumi', icon: '🔧' },
  { id: 'ansible', name: 'Ansible', icon: '⚙️' },
  { id: 'yaml', name: 'YAML/K8s', icon: '📝' },
];

export const InfrastructureBuilder: React.FC<InfrastructureBuilderProps> = ({ 
  isDarkMode = false,
  onThemeToggle 
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('terraform');
  const [selectedTemplate, setSelectedTemplate] = useState<InfrastructureTemplate | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationRequest[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVariablesPanel, setShowVariablesPanel] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    templates: true
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const handleGenerate = async () => {
    if (!query.trim()) return;

    const newRequest: GenerationRequest = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      status: 'pending'
    };

    setGenerationHistory(prev => [newRequest, ...prev]);
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const updatedRequest: GenerationRequest = {
        ...newRequest,
        status: 'completed',
        result: {
          templates: mockTemplates.slice(0, 2),
          explanation: `Generated infrastructure based on your request: "${query}". The solution includes serverless components for cost efficiency and auto-scaling capabilities.`,
          recommendations: [
            'Consider adding monitoring and alerting',
            'Implement proper security groups and IAM policies',
            'Add backup and disaster recovery strategies',
            'Enable cost optimization features'
          ]
        }
      };

      setGenerationHistory(prev => 
        prev.map(req => req.id === newRequest.id ? updatedRequest : req)
      );
      setIsGenerating(false);
    }, 3000);
  };

  const filteredTemplates = mockTemplates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const providerMatch = selectedProvider === 'all' || template.provider === selectedProvider;
    return categoryMatch && providerMatch;
  });

  const themeClasses = isDarkMode ? {
    bg: 'bg-slate-900',
    cardBg: 'bg-slate-800',
    border: 'border-slate-700',
    text: 'text-slate-100',
    textSecondary: 'text-slate-400',
    input: 'bg-slate-700 border-slate-600 text-slate-100',
    button: 'bg-purple-600 hover:bg-purple-700',
    accent: 'text-purple-400'
  } : {
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    input: 'bg-white border-gray-300 text-gray-900',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    accent: 'text-emerald-600'
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Header */}
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 ${isDarkMode ? 'bg-purple-600' : 'bg-emerald-600'} rounded-lg flex items-center justify-center`}>
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Infrastructure Builder</h1>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Natural language infrastructure generation and template management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className={`p-2 rounded-lg ${themeClasses.input} hover:opacity-80 transition-opacity`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            )}
            <button className={`px-4 py-2 ${themeClasses.button} text-white rounded-lg text-sm font-medium transition-colors`}>
              Save Project
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`w-80 ${themeClasses.cardBg} ${themeClasses.border} border-r flex flex-col`}>
          {/* Natural Language Input */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="mb-3">
              <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                <Sparkles className="inline h-4 w-4 mr-1" />
                Sirsi AI Assistant
              </label>
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your infrastructure needs in natural language..."
                className={`w-full p-3 rounded-lg ${themeClasses.input} text-sm resize-none min-h-[80px] max-h-[200px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={!query.trim() || isGenerating}
                className={`flex-1 px-4 py-2 ${themeClasses.button} text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {[
                'Serverless API with auth',
                'Kubernetes cluster',
                'CI/CD pipeline',
                'Database with backup',
                'Multi-region setup'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className={`px-3 py-1 text-xs rounded-full ${themeClasses.input} hover:opacity-80 transition-opacity`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, templates: !prev.templates }))}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className={`text-sm font-medium ${themeClasses.text}`}>Template Categories</h3>
              {expandedSections.templates ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.templates && (
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? `${themeClasses.button} text-white`
                      : `${themeClasses.textSecondary} hover:${themeClasses.text}`
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? `${themeClasses.button} text-white`
                          : `${themeClasses.textSecondary} hover:${themeClasses.text}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.name}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedCategory === category.id
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {category.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Providers */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className={`text-sm font-medium ${themeClasses.text} mb-3`}>Cloud Providers</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedProvider('all')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedProvider === 'all'
                    ? `${themeClasses.button} text-white`
                    : `${themeClasses.input} hover:opacity-80`
                }`}
              >
                All
              </button>
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedProvider === provider.id
                      ? `${themeClasses.button} text-white`
                      : provider.color
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          {/* Template Library */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className={`text-sm font-medium ${themeClasses.text} mb-3`}>
              Templates ({filteredTemplates.length})
            </h3>
            <div className="space-y-2">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg ${themeClasses.input} hover:opacity-80 transition-opacity`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-medium ${themeClasses.text} text-sm`}>{template.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      providers.find(p => p.id === template.provider)?.color || 'bg-gray-100 text-gray-600'
                    }`}>
                      {providers.find(p => p.id === template.provider)?.name}
                    </span>
                  </div>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-2`}>
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${
                      template.complexity === 'basic' ? 'bg-green-100 text-green-700' :
                      template.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {template.complexity}
                    </span>
                    <span className={themeClasses.textSecondary}>{template.estimatedCost}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedTemplate ? (
            <>
              {/* Template Header */}
              <div className={`${themeClasses.cardBg} ${themeClasses.border} border-b px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-lg font-semibold ${themeClasses.text}`}>{selectedTemplate.name}</h2>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>{selectedTemplate.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowVariablesPanel(!showVariablesPanel)}
                      className={`p-2 rounded-lg ${themeClasses.input} hover:opacity-80 transition-opacity`}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className={`p-2 rounded-lg ${themeClasses.input} hover:opacity-80 transition-opacity`}>
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className={`p-2 rounded-lg ${themeClasses.input} hover:opacity-80 transition-opacity`}>
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className={`p-2 rounded-lg ${themeClasses.input} hover:opacity-80 transition-opacity`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Format Tabs */}
              <div className={`${themeClasses.cardBg} ${themeClasses.border} border-b px-6 py-2`}>
                <div className="flex gap-1">
                  {selectedTemplate.formats.map((format) => {
                    const formatInfo = formats.find(f => f.id === format);
                    return (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          selectedFormat === format
                            ? `${themeClasses.button} text-white`
                            : `${themeClasses.textSecondary} hover:${themeClasses.text}`
                        }`}
                      >
                        <span className="mr-2">{formatInfo?.icon}</span>
                        {formatInfo?.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Content */}
              <div className="flex-1 flex">
                <div className="flex-1 p-6">
                  <pre className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4 text-sm font-mono overflow-auto h-full`}>
                    <code className={themeClasses.text}>
                      {selectedTemplate.content[selectedFormat as keyof typeof selectedTemplate.content] || 
                       'No content available for this format'}
                    </code>
                  </pre>
                </div>

                {/* Variables Panel */}
                {showVariablesPanel && selectedTemplate.variables && (
                  <div className={`w-80 ${themeClasses.cardBg} ${themeClasses.border} border-l p-4`}>
                    <h3 className={`text-sm font-medium ${themeClasses.text} mb-4`}>Variables</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedTemplate.variables).map(([key, value]) => (
                        <div key={key}>
                          <label className={`block text-xs font-medium ${themeClasses.text} mb-1`}>
                            {key}
                          </label>
                          <input
                            type="text"
                            defaultValue={value}
                            className={`w-full p-2 text-xs rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Default View */
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                {/* Generation History */}
                {generationHistory.length > 0 && (
                  <div className="mb-8">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Recent Generations</h3>
                    <div className="space-y-4">
                      {generationHistory.slice(0, 3).map((request) => (
                        <div
                          key={request.id}
                          className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className={`text-sm ${themeClasses.text} mb-1`}>"{request.query}"</p>
                              <p className={`text-xs ${themeClasses.textSecondary}`}>
                                {request.timestamp.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.status === 'completed' && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {request.status === 'generating' && (
                                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                              )}
                              {request.status === 'error' && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              {request.status === 'pending' && (
                                <Clock className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                          
                          {request.result && (
                            <div className="space-y-3">
                              <p className={`text-sm ${themeClasses.textSecondary}`}>
                                {request.result.explanation}
                              </p>
                              
                              {request.result.templates.length > 0 && (
                                <div>
                                  <p className={`text-xs font-medium ${themeClasses.text} mb-2`}>Generated Templates:</p>
                                  <div className="flex gap-2">
                                    {request.result.templates.map((template) => (
                                      <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`px-3 py-1 text-xs rounded-full ${themeClasses.button} text-white hover:opacity-80 transition-opacity`}
                                      >
                                        {template.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Welcome Content */}
                <div className="text-center py-12">
                  <div className={`w-16 h-16 ${isDarkMode ? 'bg-purple-600' : 'bg-emerald-600'} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className={`text-2xl font-semibold ${themeClasses.text} mb-4`}>
                    Infrastructure Builder
                  </h2>
                  <p className={`text-lg ${themeClasses.textSecondary} mb-8 max-w-2xl mx-auto`}>
                    Describe your infrastructure needs in natural language, and our AI will generate 
                    production-ready templates in your preferred format.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 text-center`}>
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-purple-100' : 'bg-emerald-100'} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                        <Terminal className={`h-6 w-6 ${isDarkMode ? 'text-purple-600' : 'text-emerald-600'}`} />
                      </div>
                      <h3 className={`font-semibold ${themeClasses.text} mb-2`}>Natural Language</h3>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        Describe what you need in plain English
                      </p>
                    </div>
                    
                    <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 text-center`}>
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-purple-100' : 'bg-emerald-100'} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                        <Code className={`h-6 w-6 ${isDarkMode ? 'text-purple-600' : 'text-emerald-600'}`} />
                      </div>
                      <h3 className={`font-semibold ${themeClasses.text} mb-2`}>Multiple Formats</h3>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        Terraform, Bicep, CloudFormation, and more
                      </p>
                    </div>
                    
                    <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 text-center`}>
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-purple-100' : 'bg-emerald-100'} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                        <Cloud className={`h-6 w-6 ${isDarkMode ? 'text-purple-600' : 'text-emerald-600'}`} />
                      </div>
                      <h3 className={`font-semibold ${themeClasses.text} mb-2`}>Production Ready</h3>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        Best practices and security built-in
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
