'use client';

import React from 'react';
import { Shield, ArrowLeft, Lock, Key, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SecurityDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/security" className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Security Dashboard
          </a>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Security Documentation</h1>
              <p className="text-gray-600">Comprehensive security and compliance guide</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentation Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/security/docs" className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-200">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-900">Documentation</span>
            </a>
            <a href="/security/tutorial" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">Tutorial</span>
            </a>
            <a href="/security/faq" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">FAQ</span>
            </a>
            <a href="/security/ai-guide" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100">
              <span className="font-medium">AI Guide</span>
            </a>
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Compliance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Access Control</h3>
              <p className="text-gray-600 text-sm">Role-based access control with multi-factor authentication</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Encryption</h3>
              <p className="text-gray-600 text-sm">End-to-end encryption for data at rest and in transit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Monitoring</h3>
              <p className="text-gray-600 text-sm">Real-time security monitoring and threat detection</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">
            SirsiNexus implements enterprise-grade security measures to protect your infrastructure, 
            data, and operations. Our comprehensive security framework includes advanced threat detection, 
            compliance monitoring, and automated response capabilities.
          </p>
        </div>

        {/* Core Features */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Security Features</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Identity & Access Management</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Factor Authentication</h4>
                    <p className="text-gray-600 text-sm">TOTP, SMS, and hardware key support for enhanced security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Role-Based Access Control</h4>
                    <p className="text-gray-600 text-sm">Granular permissions with least-privilege principles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Single Sign-On (SSO)</h4>
                    <p className="text-gray-600 text-sm">SAML and OAuth integration with enterprise identity providers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Protection</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Encryption at Rest</h4>
                    <p className="text-gray-600 text-sm">AES-256 encryption for all stored data and backups</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Encryption in Transit</h4>
                    <p className="text-gray-600 text-sm">TLS 1.3 for all network communications</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Key Management</h4>
                    <p className="text-gray-600 text-sm">Hardware Security Module (HSM) integration</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-yellow-500 pl-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Threat Detection</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Behavioral Analytics</h4>
                    <p className="text-gray-600 text-sm">Machine learning-based anomaly detection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-time Monitoring</h4>
                    <p className="text-gray-600 text-sm">24/7 security event monitoring and alerting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Incident Response</h4>
                    <p className="text-gray-600 text-sm">Automated response workflows and escalation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance Standards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <h3 className="font-bold text-blue-900 mb-2">SOC 2 Type II</h3>
              <p className="text-sm text-blue-700">Security, availability, and confidentiality</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <h3 className="font-bold text-green-900 mb-2">ISO 27001</h3>
              <p className="text-sm text-green-700">Information security management</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <h3 className="font-bold text-purple-900 mb-2">GDPR</h3>
              <p className="text-sm text-purple-700">Data protection and privacy</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <h3 className="font-bold text-orange-900 mb-2">HIPAA</h3>
              <p className="text-sm text-orange-700">Healthcare data protection</p>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">
            SirsiNexus maintains compliance with major security standards and regulations, 
            providing you with the confidence that your data and operations meet strict 
            regulatory requirements across different industries and geographies.
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Configuration</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Security Setup</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`# Security Configuration
SECURITY_ENABLED=true
MFA_REQUIRED=true
SESSION_TIMEOUT=3600
PASSWORD_POLICY=strict

# Encryption Settings
ENCRYPTION_ALGORITHM=AES-256-GCM
TLS_VERSION=1.3
KEY_ROTATION_DAYS=90

# Monitoring
SECURITY_LOGGING=verbose
THREAT_DETECTION=enabled
INCIDENT_RESPONSE=automated`}
            </pre>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-900">Security Best Practices</span>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Regularly update security policies and review access permissions</li>
              <li>• Enable audit logging for all security-related events</li>
              <li>• Conduct periodic security assessments and penetration testing</li>
              <li>• Train staff on security awareness and incident response procedures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
