import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Zap, Activity, BarChart3, Settings, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export const metadata: Metadata = {
  title: 'Scaling Documentation - SirsiNexus',
  description: 'Comprehensive documentation for SirsiNexus intelligent auto-scaling and capacity management',
};

export default function ScalingDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/scaling" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Scaling
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Scaling Documentation
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Intelligent auto-scaling and capacity management for optimal performance and cost efficiency
            </p>
          </div>

          {/* Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Scaling Overview
              </CardTitle>
              <CardDescription>
                Understanding intelligent auto-scaling in SirsiNexus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Auto-Scaling Types</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <Activity className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-600 mb-2">Horizontal Scaling</h4>
                    <p className="text-sm text-muted-foreground">
                      Add or remove instances based on demand to handle increased load
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <BarChart3 className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-600 mb-2">Vertical Scaling</h4>
                    <p className="text-sm text-muted-foreground">
                      Increase or decrease compute resources (CPU, memory) of existing instances
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <Cloud className="h-6 w-6 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-purple-600 mb-2">Predictive Scaling</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered scaling based on historical patterns and forecasted demand
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>AI-Driven Scaling:</strong> Machine learning algorithms predict scaling needs</li>
                  <li>• <strong>Multi-Metric Scaling:</strong> Scale based on CPU, memory, network, custom metrics</li>
                  <li>• <strong>Cost-Aware Scaling:</strong> Balance performance and cost optimization</li>
                  <li>• <strong>Zero-Downtime Scaling:</strong> Seamless scaling without service interruption</li>
                  <li>• <strong>Multi-Cloud Support:</strong> Scale across AWS, Azure, GCP, and on-premises</li>
                  <li>• <strong>Custom Policies:</strong> Define scaling rules for specific workloads</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Scaling Algorithms */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Scaling Algorithms
              </CardTitle>
              <CardDescription>
                Different approaches to intelligent scaling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Scaling Strategies</h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-semibold text-blue-600">Reactive Scaling</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Traditional threshold-based scaling that responds to current metrics
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Scale out when CPU > 70% for 5 minutes</li>
                        <li>• Scale in when CPU < 30% for 10 minutes</li>
                        <li>• Simple to understand and configure</li>
                        <li>• May lag behind sudden demand spikes</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-semibold text-green-600">Predictive Scaling</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        AI-powered scaling that anticipates demand based on patterns
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Analyzes historical usage patterns</li>
                        <li>• Considers seasonal trends and business events</li>
                        <li>• Pre-scales before demand increases</li>
                        <li>• Reduces cold start latency</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-semibold text-purple-600">Adaptive Scaling</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Combines reactive and predictive approaches with continuous learning
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Learns from scaling decisions and outcomes</li>
                        <li>• Adjusts thresholds based on application behavior</li>
                        <li>• Optimizes for both performance and cost</li>
                        <li>• Handles irregular workload patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Scaling Configuration
              </CardTitle>
              <CardDescription>
                How to configure auto-scaling policies and rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Basic Scaling Policy</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "name": "web-tier-scaling",
  "target": {
    "type": "application",
    "name": "web-servers"
  },
  "scaling_policy": {
    "type": "reactive",
    "min_instances": 2,
    "max_instances": 20,
    "desired_capacity": 5,
    "scale_out": {
      "metric": "cpu_utilization",
      "threshold": 70,
      "duration": "5m",
      "adjustment": "+2"
    },
    "scale_in": {
      "metric": "cpu_utilization", 
      "threshold": 30,
      "duration": "10m",
      "adjustment": "-1"
    }
  }
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">AI-Powered Predictive Scaling</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "name": "ai-predictive-scaling",
  "target": {
    "type": "kubernetes_deployment",
    "namespace": "production",
    "name": "api-service"
  },
  "scaling_policy": {
    "type": "predictive",
    "min_instances": 3,
    "max_instances": 50,
    "prediction": {
      "algorithm": "lstm_ensemble",
      "forecast_horizon": "2h",
      "confidence_threshold": 0.8,
      "features": [
        "historical_cpu",
        "historical_memory",
        "request_rate",
        "response_time",
        "business_events"
      ]
    },
    "fallback": {
      "type": "reactive",
      "cpu_threshold": 80,
      "memory_threshold": 85
    }
  }
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Multi-Metric Scaling</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "name": "multi-metric-scaling",
  "target": {
    "type": "serverless_function",
    "name": "data-processor"
  },
  "scaling_policy": {
    "type": "composite",
    "metrics": [
      {
        "name": "cpu_utilization",
        "weight": 0.4,
        "target": 60
      },
      {
        "name": "memory_utilization",
        "weight": 0.3,
        "target": 70
      },
      {
        "name": "queue_depth",
        "weight": 0.3,
        "target": 100
      }
    ],
    "scale_out_threshold": 75,
    "scale_in_threshold": 40,
    "cooldown": {
      "scale_out": "3m",
      "scale_in": "10m"
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics & Monitoring */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Metrics & Monitoring</CardTitle>
              <CardDescription>
                Key metrics for scaling decisions and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Standard Metrics</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-semibold text-blue-600">Resource Metrics</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• CPU utilization (average, peak, P95)</li>
                          <li>• Memory utilization and pressure</li>
                          <li>• Network I/O and bandwidth</li>
                          <li>• Disk I/O and storage utilization</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-semibold text-green-600">Application Metrics</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• Request rate and throughput</li>
                          <li>• Response time (latency)</li>
                          <li>• Error rate and success rate</li>
                          <li>• Queue depth and processing time</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-semibold text-purple-600">Business Metrics</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• Active user sessions</li>
                          <li>• Transaction volume</li>
                          <li>• Revenue-generating requests</li>
                          <li>• Custom business KPIs</li>
                        </ul>
                      </div>

                      <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-semibold text-orange-600">Cost Metrics</h5>
                        <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                          <li>• Cost per request</li>
                          <li>• Resource cost efficiency</li>
                          <li>• Scaling cost impact</li>
                          <li>• ROI of scaling decisions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Scaling Events Dashboard</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Recent Scaling Events</span>
                        <Badge variant="outline">Live</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground font-mono">
                        <div>2025-01-06 13:45:23 - Scale OUT: web-servers 5→8 (CPU: 75%)</div>
                        <div>2025-01-06 13:40:15 - Prediction: Scale OUT in 10min (ML confidence: 0.87)</div>
                        <div>2025-01-06 13:35:10 - Scale IN: api-service 12→10 (CPU: 25%)</div>
                        <div>2025-01-06 13:30:05 - Policy Updated: max_instances 15→20</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Reference */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>
                Scaling management API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/scaling/policies</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/scaling/policies</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">PUT /api/scaling/policies/{id}</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/scaling/events</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">POST /api/scaling/manual</code>
                  </Badge>
                  <Badge variant="outline" className="justify-start p-3">
                    <code className="text-xs">GET /api/scaling/metrics</code>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Guidelines for effective auto-scaling implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-700">Scaling Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>✓ Set appropriate cooldown periods</li>
                      <li>✓ Use multiple metrics for scaling decisions</li>
                      <li>✓ Test scaling policies in non-production first</li>
                      <li>✓ Monitor scaling events and adjust thresholds</li>
                      <li>✓ Implement circuit breakers for extreme scaling</li>
                      <li>✓ Consider cost implications of scaling decisions</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-700">Performance Optimization</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>✓ Pre-warm instances to reduce cold start time</li>
                      <li>✓ Use health checks to ensure instance readiness</li>
                      <li>✓ Implement graceful shutdown procedures</li>
                      <li>✓ Use predictive scaling for known patterns</li>
                      <li>✓ Balance scale-out speed with stability</li>
                      <li>✓ Monitor application startup times</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Related Resources</CardTitle>
              <CardDescription>
                Additional documentation and learning materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Documentation</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/scaling/tutorial" className="hover:text-foreground">Scaling Tutorial</Link></li>
                    <li>• <Link href="/scaling/faq" className="hover:text-foreground">Frequently Asked Questions</Link></li>
                    <li>• <Link href="/scaling/ai-guide" className="hover:text-foreground">AI Scaling Guide</Link></li>
                    <li>• <Link href="/optimization/docs" className="hover:text-foreground">Performance Optimization</Link></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Related Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <Link href="/optimization" className="hover:text-foreground">Resource Optimization</Link></li>
                    <li>• <Link href="/observability" className="hover:text-foreground">Monitoring & Alerting</Link></li>
                    <li>• <Link href="/analytics" className="hover:text-foreground">Performance Analytics</Link></li>
                    <li>• <Link href="/ai-orchestration" className="hover:text-foreground">AI Orchestration</Link></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AIAssistantButton feature="scaling" />
      </div>
    </div>
  );
}
