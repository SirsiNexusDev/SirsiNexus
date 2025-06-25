import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Loader, Code, FileCode } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Editor from '@monaco-editor/react';

interface TestResult {
  name: string;
  status: 'success' | 'failure' | 'warning' | 'running';
  message: string;
  details?: string;
}

interface TestStepProps {
  onComplete: () => void;
  requirements?: {
    targetSpecs: {
      cpu: string;
      memory: string;
      storage: string;
    };
  };
}

const sampleTerraform = `# Azure Migration Infrastructure
provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "migration" {
  name     = "migration-resources"
  location = "westus2"
  tags = {
    Environment = "Production"
    Project     = "Database Migration"
  }
}

# Virtual Network
resource "azurerm_virtual_network" "migration" {
  name                = "migration-network"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.migration.location
  resource_group_name = azurerm_resource_group.migration.name

  subnet {
    name           = "default"
    address_prefix = "10.0.1.0/24"
  }
}

# Database Server
resource "azurerm_postgresql_server" "migration" {
  name                = "migration-db-server"
  location            = azurerm_resource_group.migration.location
  resource_group_name = azurerm_resource_group.migration.name

  sku_name = "GP_Gen5_4"

  storage_mb                   = 5120
  backup_retention_days       = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled          = true

  administrator_login          = "psqladmin"
  administrator_login_password = "H@Sh1CoR3!"
  version                    = "11"
  ssl_enforcement_enabled     = true
}`;

const sampleDiagram = `graph TD
    A[Source DB] -->|Backup| B(Staging)
    B --> C{Validation}
    C -->|Pass| D[Target DB]
    C -->|Fail| E[Rollback]
    D --> F[DNS Switch]
    F --> G[Monitoring]`;

export const TestStep: React.FC<TestStepProps> = ({ onComplete, requirements }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedView, setSelectedView] = useState('terraform');

  const tests: TestResult[] = [
    {
      name: 'Network Connectivity',
      status: 'success',
      message: 'Connection established to target environment',
      details: 'Latency: 45ms, Bandwidth: 1.2Gbps',
    },
    {
      name: 'Authentication',
      status: 'success',
      message: 'Successfully authenticated with provided credentials',
    },
    {
      name: 'Resource Access',
      status: 'warning',
      message: 'Limited permissions detected',
      details: 'Missing role: CloudMigrationAdmin',
    },
    {
      name: 'Storage Capacity',
      status: 'success',
      message: 'Sufficient storage available',
      details: `Available: 2.5TB, Required: ${requirements?.targetSpecs.storage || '1.8TB'}`,
    },
    {
      name: 'Backup Verification',
      status: 'failure',
      message: 'Backup configuration incomplete',
      details: 'Missing backup retention policy',
    },
  ];

  const statusIcons = {
    success: CheckCircle,
    failure: XCircle,
    warning: AlertTriangle,
    running: Loader,
  };

  const statusColors = {
    success: 'text-green-500',
    failure: 'text-red-500',
    warning: 'text-yellow-500',
    running: 'text-blue-500',
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const test of tests) {
      setResults((prev) => [...prev, { ...test, status: 'running' }]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResults((prev) => 
        prev.map((t) => (t.name === test.name ? test : t))
      );
    }

    setIsRunning(false);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const Icon = statusIcons[status];
    return (
      <div className={`flex items-center ${statusColors[status]}`}>
        <Icon className={`h-5 w-5 ${status === 'running' ? 'animate-spin' : ''}`} />
        <span className="ml-2 capitalize">{status}</span>
      </div>
    );
  };

  const canProceed = results.length > 0 && !isRunning && 
    !results.some((r) => r.status === 'failure');

  return (
    <div className="space-y-6">
      {/* Infrastructure Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Infrastructure as Code</CardTitle>
          <CardDescription>
            Review the generated infrastructure code and migration flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="terraform" value={selectedView} onValueChange={setSelectedView}>
            <TabsList>
              <TabsTrigger value="terraform">
                <FileCode className="mr-2 h-4 w-4" />
                Terraform
              </TabsTrigger>
              <TabsTrigger value="diagram">
                <Code className="mr-2 h-4 w-4" />
                Flow Diagram
              </TabsTrigger>
            </TabsList>
            <TabsContent value="terraform">
              <div className="rounded-lg border">
                <Editor
                  height="300px"
                  defaultLanguage="hcl"
                  value={sampleTerraform}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="diagram">
              <div className="rounded-lg border bg-white p-4">
                <pre className="mermaid">{sampleDiagram}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Configuration Tests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuration Tests</CardTitle>
              <CardDescription>Validate infrastructure and requirements</CardDescription>
            </div>
            <Button
              onClick={runTests}
              disabled={isRunning}
              variant={isRunning ? 'outline' : 'default'}
            >
              {isRunning ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{result.name}</h4>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <p className="mt-1 text-xs text-gray-500">{result.details}</p>
                    )}
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      {results.length > 0 && !isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(
                results.reduce((acc, curr) => {
                  acc[curr.status] = (acc[curr.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-lg border p-4"
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm capitalize text-gray-600">{status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          onClick={onComplete}
          disabled={!canProceed}
          variant={canProceed ? 'default' : 'outline'}
        >
          Continue to Build
        </Button>
      </div>
    </div>
  );
};
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'failure' | 'warning' | 'running';
  message: string;
  details?: string;
}

interface TestStepProps {
  onComplete: () => void;
}

export const TestStep: React.FC<TestStepProps> = ({ onComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const tests: TestResult[] = [
    {
      name: 'Network Connectivity',
      status: 'success',
      message: 'Connection established to target environment',
      details: 'Latency: 45ms, Bandwidth: 1.2Gbps',
    },
    {
      name: 'Authentication',
      status: 'success',
      message: 'Successfully authenticated with provided credentials',
    },
    {
      name: 'Resource Access',
      status: 'warning',
      message: 'Limited permissions detected',
      details: 'Missing role: CloudMigrationAdmin',
    },
    {
      name: 'Storage Capacity',
      status: 'success',
      message: 'Sufficient storage available',
      details: 'Available: 2.5TB, Required: 1.8TB',
    },
    {
      name: 'Backup Verification',
      status: 'failure',
      message: 'Backup configuration incomplete',
      details: 'Missing backup retention policy',
    },
  ];

  const statusIcons = {
    success: CheckCircle,
    failure: XCircle,
    warning: AlertTriangle,
    running: Loader,
  };

  const statusColors = {
    success: 'text-green-500',
    failure: 'text-red-500',
    warning: 'text-yellow-500',
    running: 'text-blue-500',
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const test of tests) {
      // Simulate test execution
      setResults((prev) => [...prev, { ...test, status: 'running' }]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResults((prev) => 
        prev.map((t) => (t.name === test.name ? test : t))
      );
    }

    setIsRunning(false);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const Icon = statusIcons[status];
    return (
      <div className={`flex items-center ${statusColors[status]}`}>
        <Icon className={`h-5 w-5 ${status === 'running' ? 'animate-spin' : ''}`} />
        <span className="ml-2 capitalize">{status}</span>
      </div>
    );
  };

  const canProceed = results.length > 0 && !isRunning && 
    !results.some((r) => r.status === 'failure');

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">Configuration Tests</h3>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{result.name}</h4>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  {result.details && (
                    <p className="mt-1 text-xs text-gray-500">{result.details}</p>
                  )}
                </div>
                {getStatusBadge(result.status)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {results.length > 0 && !isRunning && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-medium">Test Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(
              results.reduce((acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([status, count]) => (
              <div
                key={status}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm capitalize text-gray-600">{status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className="rounded-md bg-sirsi-500 px-4 py-2 text-white hover:bg-sirsi-600 disabled:opacity-50"
        >
          Continue to Build
        </button>
      </div>
    </div>
  );
};
