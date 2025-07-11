import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simulate agent metrics data
    const agentMetrics = {
      summary: {
        totalAgents: 8,
        activeAgents: 6,
        idleAgents: 2,
        failedAgents: 0,
        avgResponseTime: '245ms',
        totalRequests: 1247,
        successRate: 98.5
      },
      agents: [
        {
          id: 'agent-discovery',
          name: 'Discovery Agent',
          type: 'infrastructure_discovery',
          status: 'active',
          cpuUsage: 23,
          memoryUsage: 156,
          requestsHandled: 342,
          avgResponseTime: '180ms',
          lastActivity: new Date(Date.now() - 120000).toISOString(),
          uptime: '99.9%'
        },
        {
          id: 'agent-analysis',
          name: 'Analysis Agent',
          type: 'cost_analysis',
          status: 'active',
          cpuUsage: 45,
          memoryUsage: 234,
          requestsHandled: 189,
          avgResponseTime: '320ms',
          lastActivity: new Date(Date.now() - 60000).toISOString(),
          uptime: '99.7%'
        },
        {
          id: 'agent-security',
          name: 'Security Agent',
          type: 'security_validation',
          status: 'active',
          cpuUsage: 18,
          memoryUsage: 98,
          requestsHandled: 267,
          avgResponseTime: '150ms',
          lastActivity: new Date(Date.now() - 180000).toISOString(),
          uptime: '100%'
        },
        {
          id: 'agent-migration',
          name: 'Migration Agent',
          type: 'migration_orchestration',
          status: 'active',
          cpuUsage: 52,
          memoryUsage: 312,
          requestsHandled: 89,
          avgResponseTime: '450ms',
          lastActivity: new Date(Date.now() - 30000).toISOString(),
          uptime: '99.2%'
        },
        {
          id: 'agent-monitoring',
          name: 'Monitoring Agent',
          type: 'system_monitoring',
          status: 'active',
          cpuUsage: 12,
          memoryUsage: 87,
          requestsHandled: 523,
          avgResponseTime: '90ms',
          lastActivity: new Date(Date.now() - 15000).toISOString(),
          uptime: '100%'
        },
        {
          id: 'agent-optimization',
          name: 'Optimization Agent',
          type: 'resource_optimization',
          status: 'active',
          cpuUsage: 38,
          memoryUsage: 201,
          requestsHandled: 156,
          avgResponseTime: '280ms',
          lastActivity: new Date(Date.now() - 240000).toISOString(),
          uptime: '98.8%'
        },
        {
          id: 'agent-backup',
          name: 'Backup Agent',
          type: 'data_backup',
          status: 'idle',
          cpuUsage: 2,
          memoryUsage: 45,
          requestsHandled: 23,
          avgResponseTime: '120ms',
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          uptime: '99.5%'
        },
        {
          id: 'agent-compliance',
          name: 'Compliance Agent',
          type: 'compliance_checking',
          status: 'idle',
          cpuUsage: 5,
          memoryUsage: 67,
          requestsHandled: 78,
          avgResponseTime: '200ms',
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          uptime: '99.1%'
        }
      ],
      performance: {
        requestsPerMinute: 45,
        errorRate: 1.5,
        throughput: '2.3 MB/s',
        queueSize: 12,
        processingLatency: '245ms'
      },
      health: {
        overallStatus: 'healthy',
        lastHealthCheck: new Date().toISOString(),
        healthScore: 96,
        issues: [
          {
            severity: 'warning',
            message: 'High CPU usage on Migration Agent',
            timestamp: new Date(Date.now() - 600000).toISOString()
          }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: agentMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Agents metrics API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agent metrics',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
