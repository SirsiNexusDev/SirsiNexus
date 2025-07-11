import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simulate dashboard data
    const dashboardData = {
      overview: {
        totalProjects: 12,
        activeProjects: 8,
        completedProjects: 4,
        totalUsers: 156,
        systemHealth: 'healthy',
        uptime: '99.8%'
      },
      recentActivity: [
        {
          id: 'act-001',
          type: 'migration',
          title: 'Migration workflow completed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
        },
        {
          id: 'act-002',
          type: 'optimization',
          title: 'Cost optimization analysis running',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'in_progress'
        },
        {
          id: 'act-003',
          type: 'security',
          title: 'Security scan completed',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          status: 'completed'
        }
      ],
      metrics: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        networkThroughput: '125 MB/s',
        activeConnections: 234
      },
      alerts: [
        {
          id: 'alert-001',
          level: 'warning',
          message: 'High memory usage detected on server-02',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'alert-002',
          level: 'info',
          message: 'Scheduled maintenance completed successfully',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
