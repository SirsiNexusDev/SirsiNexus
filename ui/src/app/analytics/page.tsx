'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ProjectAnalytics } from '@/components/Analytics/ProjectAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Database,
  Shield,
  Zap,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  Activity,
} from 'lucide-react';

const performanceMetrics = [
  { name: 'Migration Speed', value: '2.4 TB/hr', change: '+15%', trend: 'up' },
  { name: 'Success Rate', value: '99.2%', change: '+0.8%', trend: 'up' },
  { name: 'Downtime Avg', value: '4.2 min', change: '-12%', trend: 'down' },
  { name: 'Cost per GB', value: '$0.03', change: '-8%', trend: 'down' },
];

const securityMetrics = [
  { name: 'Security Scans', value: '1,247', status: 'passed', severity: 'low' },
  { name: 'Vulnerabilities', value: '3', status: 'medium', severity: 'medium' },
  { name: 'Compliance Score', value: '98.5%', status: 'excellent', severity: 'low' },
  { name: 'Encrypted Data', value: '100%', status: 'excellent', severity: 'low' },
];

const resourceUtilization = [
  { resource: 'CPU Usage', current: '68%', max: '85%', trend: 'stable' },
  { resource: 'Memory Usage', current: '72%', max: '90%', trend: 'increasing' },
  { resource: 'Network I/O', current: '1.2 GB/s', max: '2.5 GB/s', trend: 'stable' },
  { resource: 'Storage Used', current: '45.7 TB', max: '100 TB', trend: 'increasing' },
];

const teamProductivity = [
  { member: 'Sarah Chen', completed: 34, active: 8, efficiency: '94%' },
  { member: 'Marcus Johnson', completed: 28, active: 12, efficiency: '89%' },
  { member: 'Elena Rodriguez', completed: 31, active: 6, efficiency: '92%' },
  { member: 'David Kim', completed: 25, active: 9, efficiency: '87%' },
  { member: 'Alex Thompson', completed: 38, active: 4, efficiency: '96%' },
];

const complianceReports = [
  { standard: 'SOC 2 Type II', status: 'Compliant', lastAudit: '2024-06-15', nextReview: '2024-12-15' },
  { standard: 'ISO 27001', status: 'Compliant', lastAudit: '2024-05-20', nextReview: '2025-05-20' },
  { standard: 'GDPR', status: 'Compliant', lastAudit: '2024-06-01', nextReview: '2024-12-01' },
  { standard: 'HIPAA', status: 'In Progress', lastAudit: '2024-04-10', nextReview: '2024-07-10' },
  { standard: 'PCI DSS', status: 'Compliant', lastAudit: '2024-06-25', nextReview: '2024-09-25' },
];

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedProject, setSelectedProject] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting analytics in ${format} format`);
    // Simulate export functionality
  };

  return (
    <div>
      <Breadcrumb />
      
      {/* Header with controls */}
      <div className="card-action-premium mb-6 border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
        <div className="card-action-glow"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient group-hover:text-emerald-600 transition-colors">
                Analytics & Reports
              </h1>
              <p className="text-xl text-slate-800 font-medium group-hover:text-slate-700 transition-colors">
                Comprehensive insights and metrics for your migration projects
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32 border-emerald-300 bg-white/90">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-40 border-emerald-300 bg-white/90">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="1">E-commerce Migration</SelectItem>
                  <SelectItem value="2">Database Modernization</SelectItem>
                  <SelectItem value="3">SAP ERP Migration</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-emerald-300 bg-white/90 hover:bg-emerald-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="border-emerald-300 bg-white/90 hover:bg-emerald-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6 relative">
        <div className="card-action-premium border-2 border-emerald-500/30 relative overflow-visible mb-6 sticky top-0 z-50">
          <div className="card-action-glow"></div>
          <div className="relative z-10">
            <TabsList className="glass-strong grid w-full grid-cols-6 p-1 rounded-xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="overview" className="space-y-6 relative z-0">
          <ProjectAnalytics />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Total Projects</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">24</div>
                  <p className="text-sm text-slate-700 font-medium">+2 from last month</p>
                </CardContent>
              </div>
            </Card>
            
            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Data Migrated</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">847 TB</div>
                  <p className="text-sm text-slate-700 font-medium">+12% from last month</p>
                </CardContent>
              </div>
            </Card>
            
            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium group-hover:text-emerald-600 transition-colors">Cost Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2.8M</div>
                  <p className="text-xs text-muted-foreground">+18% from last quarter</p>
                </CardContent>
              </div>
            </Card>
            
            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium group-hover:text-emerald-600 transition-colors">Success Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">99.2%</div>
                  <p className="text-xs text-muted-foreground">+0.8% improvement</p>
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6 relative z-0">
          <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <CardHeader>
                <CardTitle className="group-hover:text-emerald-600 transition-colors">Performance Metrics</CardTitle>
                <CardDescription className="group-hover:text-slate-700 transition-colors">
                  Key performance indicators for migration operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Dashboard</CardTitle>
              <CardDescription>
                Security metrics and vulnerability assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-2xl font-bold mt-1">{metric.value}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      metric.severity === 'low' ? 'bg-green-100 text-green-800' :
                      metric.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>
                Current usage and capacity planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resourceUtilization.map((resource, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{resource.resource}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        resource.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                        resource.trend === 'increasing' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {resource.trend}
                      </span>
                    </div>
                    <div className="text-lg font-semibold">{resource.current}</div>
                    <div className="text-sm text-gray-500">Max: {resource.max}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Productivity</CardTitle>
              <CardDescription>
                Individual and team performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamProductivity.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {member.member.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.member}</div>
                        <div className="text-sm text-gray-500">
                          {member.completed} completed, {member.active} active
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{member.efficiency}</div>
                      <div className="text-sm text-gray-500">Efficiency</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>
                Regulatory compliance and audit information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{report.standard}</div>
                      <div className="text-sm text-gray-500">
                        Last audit: {report.lastAudit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'Compliant' ? 'bg-green-100 text-green-800' :
                        report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Next: {report.nextReview}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
