'use client';

import React from 'react';
import { Shield, Lock, FileText, HelpCircle, Play, Brain, Key, Users, AlertTriangle } from 'lucide-react';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Security & Compliance Center</h1>
              <p className="text-gray-600">Comprehensive security management and compliance tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm border border-green-200">
              Stable
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm border border-emerald-200">
              Phase 1
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
              AI-Aware
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="/security/docs" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <FileText className="h-5 w-5 text-red-500" />
            <span className="font-medium">Documentation</span>
          </a>
          <a href="/security/tutorial" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Play className="h-5 w-5 text-green-500" />
            <span className="font-medium">Tutorial</span>
          </a>
          <a href="/security/faq" className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <HelpCircle className="h-5 w-5 text-red-500" />
            <span className="font-medium">FAQ</span>
          </a>
          <button className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
            <Brain className="h-5 w-5" />
            <span className="font-medium">AI Guide</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Security Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-gray-600">Security Score</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-gray-600">Active Policies</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                  <div className="text-gray-600">Alerts</div>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors">
                  Run Security Scan
                </button>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors">
                  View Security Reports
                </button>
              </div>
            </div>

            {/* Credential Management */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Key className="h-5 w-5 text-red-500" />
                Credential Management
              </h3>
              <p className="text-gray-600 mb-4">
                Secure credential storage, rotation, and access management with encryption and audit trails.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900">Stored Credentials</div>
                  <div className="text-sm text-gray-600 mt-1">24 credentials managed</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900">Rotation Status</div>
                  <div className="text-sm text-gray-600 mt-1">All up to date</div>
                </div>
              </div>
            </div>

            {/* Compliance Tracking */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Compliance Tracking
              </h3>
              <p className="text-gray-600 mb-4">
                Monitor compliance with industry standards including SOC 2, GDPR, HIPAA, and custom policies.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">SOC 2 Type II</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Compliant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">GDPR</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Compliant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium">HIPAA</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Review Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Security Services</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Identity & Access</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Encryption</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Audit Logging</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Recording
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Threat Detection</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                    Monitoring
                  </span>
                </div>
              </div>
            </div>

            {/* Security Policies */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Active Policies</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Password Policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">MFA Enforcement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Data Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Access Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Vulnerability Scanning</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <div className="font-medium">Security scan completed</div>
                    <div className="text-gray-500">2 minutes ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  <div>
                    <div className="font-medium">New policy applied</div>
                    <div className="text-gray-500">1 hour ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                  <div>
                    <div className="font-medium">Credential rotation</div>
                    <div className="text-gray-500">4 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Assistant */}
      <AIAssistantButton currentFeature="Security & Compliance" />
    </div>
  );
}
