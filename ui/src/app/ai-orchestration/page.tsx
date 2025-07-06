'use client';

import React from 'react';
import { Brain, Cpu, Settings, Play, FileText, HelpCircle } from 'lucide-react';

export default function AIOrchestrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Orchestration Engine</h1>
              <p className="text-gray-600">Intelligent workflow automation and decision making</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
              Beta
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm border border-purple-200">
              Phase 3
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200">
              AI-Aware
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="/ai-orchestration/docs" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Documentation</span>
          </a>
          <a href="/ai-orchestration/tutorial" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Play className="h-5 w-5 text-green-500" />
            <span className="font-medium">Tutorial</span>
          </a>
          <a href="/ai-orchestration/faq" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <HelpCircle className="h-5 w-5 text-purple-500" />
            <span className="font-medium">FAQ</span>
          </a>
          <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="font-medium">AI Guide</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Orchestration Dashboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Orchestration Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-gray-600">Active Workflows</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">88%</div>
                  <div className="text-gray-600">AI Accuracy</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-gray-600">Autonomous Operation</div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
                  Start New Orchestration
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors">
                  View Orchestration History
                </button>
              </div>
            </div>

            {/* Decision Engine */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Criteria Decision Engine</h3>
              <p className="text-gray-600 mb-4">
                Advanced decision-making with fuzzy logic and multi-criteria analysis for optimal resource allocation and workflow optimization.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900">Decision Algorithms</div>
                  <div className="text-sm text-gray-600 mt-1">7 active algorithms</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900">Optimization Level</div>
                  <div className="text-sm text-gray-600 mt-1">AI-Optimized</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Hypervisor</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Agent Framework</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ML Platform</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Resource Requirements */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resource Requirements</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Min CPU:</span>
                  <span className="font-medium">8 cores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Memory:</span>
                  <span className="font-medium">16 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage:</span>
                  <span className="font-medium">200 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium">10 Gbps</span>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Integrations</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">TensorFlow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">PyTorch</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Kubernetes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Docker</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  CheckCircle,
  Clock,
  Zap,
  Shield,
  BarChart3,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Play,
  Pause,
  Target,
  Cpu,
  Database,
  Network,
  DollarSign
} from 'lucide-react';

interface AIMetrics {
  decision_accuracy: number;
  response_time: number;
  safety_score: number;
  autonomous_operations: number;
  ml_models_active: number;
  anomaly_detection_rate: number;
  cost_predictions_accuracy: number;
  forecasting_accuracy: number;
}

interface AnomalyAlert {
  id: string;
  timestamp: string;
  type: 'performance' | 'security' | 'cost' | 'infrastructure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  confidence: number;
  source: string;
}

interface ForecastData {
  metric: string;
  current_value: number;
  predicted_value: number;
  confidence_interval: [number, number];
  time_horizon: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export default function AIOrchestrationPage() {
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>({
    decision_accuracy: 88.2,
    response_time: 0.34,
    safety_score: 100,
    autonomous_operations: 85.7,
    ml_models_active: 7,
    anomaly_detection_rate: 94.1,
    cost_predictions_accuracy: 91.3,
    forecasting_accuracy: 89.7
  });

  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([
    {
      id: '1',
      timestamp: '2025-07-06T01:45:00Z',
      type: 'performance',
      severity: 'medium',
      message: 'CPU usage spike detected in AWS EC2 instances',
      confidence: 92.3,
      source: 'Isolation Forest'
    },
    {
      id: '2',
      timestamp: '2025-07-06T01:32:00Z',
      type: 'cost',
      severity: 'high',
      message: 'Unexpected storage cost increase predicted',
      confidence: 87.8,
      source: 'LSTM Cost Predictor'
    },
    {
      id: '3',
      timestamp: '2025-07-06T01:15:00Z',
      type: 'security',
      severity: 'low',
      message: 'Unusual network traffic pattern identified',
      confidence: 76.4,
      source: 'One-Class SVM'
    }
  ]);

  const [forecasts, setForecasts] = useState<ForecastData[]>([
    {
      metric: 'Monthly Cost',
      current_value: 12847.50,
      predicted_value: 14230.80,
      confidence_interval: [13850.20, 14611.40],
      time_horizon: '30 days',
      trend: 'increasing'
    },
    {
      metric: 'CPU Utilization',
      current_value: 68.3,
      predicted_value: 72.1,
      confidence_interval: [69.8, 74.4],
      time_horizon: '7 days',
      trend: 'increasing'
    },
    {
      metric: 'Network I/O',
      current_value: 1.2,
      predicted_value: 1.1,
      confidence_interval: [1.0, 1.2],
      time_horizon: '7 days',
      trend: 'stable'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiSystemStatus, setAiSystemStatus] = useState('operational');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Call the actual Phase 3 analytics platform
      const response = await aiAnalyticsService.getOverview(selectedTimeRange);
      
      if (response.success) {
        setAiMetrics(response.data.metrics);
        console.log('AI metrics refreshed successfully:', response.data);
      } else {
        console.error('Failed to refresh metrics:', response.error);
      }
    } catch (error) {
      console.error('Failed to refresh AI metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunAnalytics = async (type: string) => {
    console.log(`Running ${type} analytics...`);
    try {
      switch (type) {
        case 'anomaly':
          const anomalyResponse = await aiAnalyticsService.runAnomalyDetection();
          if (anomalyResponse.success) {
            setAnomalyAlerts(anomalyResponse.data.alerts);
            console.log('Anomaly detection completed:', anomalyResponse.data);
          }
          break;
          
        case 'cost':
          const costResponse = await aiAnalyticsService.predictCosts();
          if (costResponse.success) {
            console.log('Cost prediction completed:', costResponse.data);
          }
          break;
          
        case 'forecast':
          const forecastResponse = await aiAnalyticsService.generateForecasts();
          if (forecastResponse.success) {
            setForecasts(forecastResponse.data.forecasts);
            console.log('Forecasting completed:', forecastResponse.data);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to run ${type} analytics:`, error);
    }
  };


  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <div className="h-4 w-4 bg-blue-500 rounded-full" />;
    }
  };

  return (
    <div>
      <Breadcrumb />
      
      {/* Header */}
      <div className="card-action-premium mb-6 border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
        <div className="card-action-glow"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient group-hover:text-emerald-600 transition-colors">
                AI Orchestration Dashboard
              </h1>
              <p className="text-xl text-slate-800 font-medium group-hover:text-slate-700 transition-colors">
                Phase 3 Advanced Analytics & Intelligence Platform
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32 border-emerald-300 bg-white/90">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-emerald-300 bg-white/90 hover:bg-emerald-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm" className="border-emerald-300 bg-white/90 hover:bg-emerald-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
          <div className="card-action-glow"></div>
          <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-emerald-600 transition-colors">
                AI Decision Accuracy
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{aiMetrics.decision_accuracy}%</div>
              <p className="text-xs text-slate-700 font-medium">Target: >85%</p>
              <Progress value={aiMetrics.decision_accuracy} className="mt-2" />
            </CardContent>
          </div>
        </Card>

        <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
          <div className="card-action-glow"></div>
          <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-emerald-600 transition-colors">
                Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{aiMetrics.response_time}s</div>
              <p className="text-xs text-slate-700 font-medium">Target: <1s</p>
              <Badge variant="outline" className="mt-2 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Optimal
              </Badge>
            </CardContent>
          </div>
        </Card>

        <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
          <div className="card-action-glow"></div>
          <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-emerald-600 transition-colors">
                Safety Score
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{aiMetrics.safety_score}%</div>
              <p className="text-xs text-slate-700 font-medium">Constraint validation</p>
              <Badge variant="outline" className="mt-2 bg-green-100 text-green-800 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            </CardContent>
          </div>
        </Card>

        <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
          <div className="card-action-glow"></div>
          <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-emerald-600 transition-colors">
                ML Models Active
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{aiMetrics.ml_models_active}</div>
              <p className="text-xs text-slate-700 font-medium">Ensemble algorithms</p>
              <div className="flex gap-1 mt-2">
                <Badge variant="outline" className="text-xs">Prophet</Badge>
                <Badge variant="outline" className="text-xs">LSTM</Badge>
                <Badge variant="outline" className="text-xs">RF</Badge>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="card-action-premium border-2 border-emerald-500/30 relative overflow-visible mb-6 sticky top-0 z-50">
          <div className="card-action-glow"></div>
          <div className="relative z-10">
            <TabsList className="glass-strong grid w-full grid-cols-5 p-1 rounded-xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
              <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
              <TabsTrigger value="orchestration">AI Orchestration</TabsTrigger>
              <TabsTrigger value="models">ML Models</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader>
                  <CardTitle className="group-hover:text-emerald-600 transition-colors">
                    Anomaly Detection
                  </CardTitle>
                  <CardDescription className="group-hover:text-slate-700 transition-colors">
                    Real-time anomaly monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{aiMetrics.anomaly_detection_rate}%</div>
                  <p className="text-sm text-slate-700 font-medium">Detection accuracy</p>
                  <Button 
                    size="sm" 
                    className="mt-4"
                    onClick={() => handleRunAnalytics('anomaly')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Detection
                  </Button>
                </CardContent>
              </div>
            </Card>

            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader>
                  <CardTitle className="group-hover:text-emerald-600 transition-colors">
                    Cost Predictions
                  </CardTitle>
                  <CardDescription className="group-hover:text-slate-700 transition-colors">
                    ML-driven cost forecasting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{aiMetrics.cost_predictions_accuracy}%</div>
                  <p className="text-sm text-slate-700 font-medium">Prediction accuracy</p>
                  <Button 
                    size="sm" 
                    className="mt-4"
                    onClick={() => handleRunAnalytics('cost')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Forecast
                  </Button>
                </CardContent>
              </div>
            </Card>

            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader>
                  <CardTitle className="group-hover:text-emerald-600 transition-colors">
                    Autonomous Operations
                  </CardTitle>
                  <CardDescription className="group-hover:text-slate-700 transition-colors">
                    Automated decision making
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{aiMetrics.autonomous_operations}%</div>
                  <p className="text-sm text-slate-700 font-medium">Automation level</p>
                  <Progress value={aiMetrics.autonomous_operations} className="mt-4" />
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <CardHeader>
                <CardTitle className="group-hover:text-emerald-600 transition-colors">
                  Real-time Anomaly Alerts
                </CardTitle>
                <CardDescription className="group-hover:text-slate-700 transition-colors">
                  Multi-algorithm anomaly detection results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {anomalyAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <Badge variant="outline" className="text-xs">{alert.type}</Badge>
                            <Badge variant="outline" className="text-xs">{alert.source}</Badge>
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm opacity-80 mt-1">
                            {new Date(alert.timestamp).toLocaleString()} • Confidence: {alert.confidence}%
                          </p>
                        </div>
                        <Badge variant="outline" className={getAlertSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <CardHeader>
                <CardTitle className="group-hover:text-emerald-600 transition-colors">
                  Predictive Forecasts
                </CardTitle>
                <CardDescription className="group-hover:text-slate-700 transition-colors">
                  Ensemble forecasting with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {forecasts.map((forecast, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{forecast.metric}</h4>
                          {getTrendIcon(forecast.trend)}
                        </div>
                        <Badge variant="outline" className="text-xs">{forecast.time_horizon}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Current</p>
                          <p className="text-lg font-bold">
                            {forecast.metric.includes('Cost') ? '$' : ''}{forecast.current_value.toLocaleString()}
                            {forecast.metric.includes('CPU') ? '%' : ''}
                            {forecast.metric.includes('Network') ? ' GB/s' : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Predicted</p>
                          <p className="text-lg font-bold">
                            {forecast.metric.includes('Cost') ? '$' : ''}{forecast.predicted_value.toLocaleString()}
                            {forecast.metric.includes('CPU') ? '%' : ''}
                            {forecast.metric.includes('Network') ? ' GB/s' : ''}
                          </p>
                          <p className="text-xs text-slate-500">
                            Range: {forecast.metric.includes('Cost') ? '$' : ''}{forecast.confidence_interval[0].toLocaleString()} - 
                            {forecast.metric.includes('Cost') ? '$' : ''}{forecast.confidence_interval[1].toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader>
                  <CardTitle className="group-hover:text-emerald-600 transition-colors">
                    Decision Engine Status
                  </CardTitle>
                  <CardDescription className="group-hover:text-slate-700 transition-colors">
                    Multi-criteria decision making
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>MCDM Algorithm</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fuzzy Logic</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Safety Constraints</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">100% Validated</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Knowledge Graph</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">Learning</Badge>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
              <div className="card-action-glow"></div>
              <div className="relative z-10">
                <CardHeader>
                  <CardTitle className="group-hover:text-emerald-600 transition-colors">
                    Agent Coordination
                  </CardTitle>
                  <CardDescription className="group-hover:text-slate-700 transition-colors">
                    Multi-agent orchestration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Active Agents</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Task Queue</span>
                      <span className="font-bold">8 pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Performance Score</span>
                      <span className="font-bold">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Learning Loop</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card className="card-action-premium border-2 border-emerald-500/30 hover:border-emerald-500/60 group relative overflow-hidden">
            <div className="card-action-glow"></div>
            <div className="relative z-10">
              <CardHeader>
                <CardTitle className="group-hover:text-emerald-600 transition-colors">
                  ML Model Performance
                </CardTitle>
                <CardDescription className="group-hover:text-slate-700 transition-colors">
                  Individual model metrics and ensemble performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Isolation Forest', accuracy: 88.2, status: 'active', type: 'Anomaly Detection' },
                    { name: 'LSTM Autoencoder', accuracy: 91.7, status: 'active', type: 'Time Series' },
                    { name: 'Prophet', accuracy: 89.3, status: 'active', type: 'Forecasting' },
                    { name: 'ARIMA', accuracy: 85.1, status: 'active', type: 'Forecasting' },
                    { name: 'Gaussian Process', accuracy: 87.9, status: 'active', type: 'Forecasting' },
                    { name: 'One-Class SVM', accuracy: 82.4, status: 'active', type: 'Anomaly Detection' },
                    { name: 'Ensemble', accuracy: 92.8, status: 'active', type: 'Combined' }
                  ].map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{model.name}</h4>
                        <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                          {model.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{model.type}</p>
                      <div className="text-lg font-bold">{model.accuracy}%</div>
                      <Progress value={model.accuracy} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
