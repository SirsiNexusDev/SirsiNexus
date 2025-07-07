'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  TrendingUp,
  DollarSign,
  Activity,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
}

interface ChartData {
  name: string;
  value: number;
  change?: number;
}

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in real app, this would come from your backend
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Cost',
      value: '$2,847',
      change: '-12.3%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Active Resources',
      value: '127',
      change: '+5.2%',
      changeType: 'positive',
      icon: Server
    },
    {
      title: 'Performance Score',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Alerts',
      value: '3',
      change: '-15.0%',
      changeType: 'positive',
      icon: AlertTriangle
    }
  ]);

  const [costData, setCostData] = useState<ChartData[]>([
    { name: 'Compute', value: 1247, change: -8.2 },
    { name: 'Storage', value: 892, change: +3.1 },
    { name: 'Network', value: 456, change: -2.4 },
    { name: 'Database', value: 252, change: +12.1 }
  ]);

  const [performanceData, setPerformanceData] = useState<ChartData[]>([
    { name: 'Mon', value: 92.1 },
    { name: 'Tue', value: 94.3 },
    { name: 'Wed', value: 91.8 },
    { name: 'Thu', value: 95.2 },
    { name: 'Fri', value: 93.7 },
    { name: 'Sat', value: 96.1 },
    { name: 'Sun', value: 94.2 }
  ]);

  const [recentAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'High CPU Usage',
      resource: 'web-server-01',
      time: '2 hours ago',
      resolved: false
    },
    {
      id: 2,
      type: 'error',
      title: 'Database Connection Timeout',
      resource: 'db-cluster-prod',
      time: '4 hours ago',
      resolved: true
    },
    {
      id: 3,
      type: 'info',
      title: 'Auto-scaling Event',
      resource: 'api-gateway',
      time: '6 hours ago',
      resolved: true
    }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update with new mock data
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.title === 'Total Cost' ? `$${(Math.random() * 3000 + 2000).toFixed(0)}` :
             metric.title === 'Active Resources' ? `${Math.floor(Math.random() * 50 + 100)}` :
             metric.title === 'Performance Score' ? `${(Math.random() * 10 + 90).toFixed(1)}%` :
             `${Math.floor(Math.random() * 10)}`
    })));
    
    setRefreshing(false);
  };

  const exportReport = () => {
    // Mock export functionality
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      metrics,
      costData,
      performanceData,
      alerts: recentAlerts
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart className="h-8 w-8 text-emerald-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor your infrastructure performance, costs, and optimization opportunities
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={exportReport}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                      <div className="flex items-center mt-2">
                        <Badge 
                          variant={metric.changeType === 'positive' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {metric.change}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-2">vs last period</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full bg-emerald-${(index + 1) * 100}`}></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.value}</p>
                          <p className={`text-sm ${item.change && item.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.change && `${item.change > 0 ? '+' : ''}${item.change}%`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Performance Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-emerald-600 h-2 rounded-full" 
                              style={{ width: `${item.value}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-12">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Cost Analytics</h3>
                  <p className="text-gray-600 mb-4">
                    Detailed cost breakdown, forecasting, and optimization recommendations
                  </p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Performance Metrics</h3>
                  <p className="text-gray-600 mb-4">
                    CPU, memory, network, and custom application metrics
                  </p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Alerts & Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.type === 'error' ? 'bg-red-500' :
                          alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.resource} • {alert.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.resolved ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
