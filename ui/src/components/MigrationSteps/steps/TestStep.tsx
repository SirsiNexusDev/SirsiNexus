import React, { useState } from 'react';
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
