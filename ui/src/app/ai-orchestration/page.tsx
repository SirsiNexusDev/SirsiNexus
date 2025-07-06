'use client';

import React from 'react';
import { Brain, Cpu, Settings, Play, FileText, HelpCircle } from 'lucide-react';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

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
      
      {/* AI Assistant */}
      <AIAssistantButton currentFeature="AI Orchestration" />
    </div>
  );
}
