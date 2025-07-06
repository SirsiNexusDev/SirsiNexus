'use client';

import React from 'react';
import { Monitor, ArrowLeft, Cpu, Network, TrafficCone, AlertTriangle, CheckCircle } from 'lucide-react';

export default function HypervisorDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/hypervisor" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Hypervisor Control Panel
          </a>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Hypervisor Documentation</h1>
              <p className="text-gray-600">Guide to virtual machine management and optimization</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
          h2 className="text-xl font-bold text-gray-900 mb-4"Documentation Navigation/h2
          div className="grid grid-cols-1 md:grid-cols-4 gap-4"
            a href="/hypervisor/docs" className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200"
              Monitor className="h-4 w-4 text-blue-500" /
              span className="font-medium text-blue-900"Documentation/span
            /a
            a href="/hypervisor/tutorial" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100"
              span className="font-medium"Tutorial/span
            /a
            a href="/hypervisor/faq" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100"
              span className="font-medium"FAQ/span
            /a
            a href="/hypervisor/ai-guide" className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100"
              span className="font-medium"AI Guide/span
            /a
          /div
        /div

        {/* Overview */}
        div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8"
          h2 className="text-2xl font-bold text-gray-900 mb-6"Hypervisor Systems Overview/h2
          
          div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            div className="text-center"
              div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
                Cpu className="h-8 w-8 text-blue-600" /
              /div
              h3 className="text-lg font-bold text-gray-900 mb-2"Virtualization/h3
              p className="text-gray-600 text-sm"Hardware-level virtualization for efficient resource usage/p
            /div
            div className="text-center"
              div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
                Network className="h-8 w-8 text-blue-600" /
              /div
              h3 className="text-lg font-bold text-gray-900 mb-2"Network Management/h3
              p className="text-gray-600 text-sm"Advanced virtual networking capabilities/p
            /div
            div className="text-center"
              div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4"
                TrafficCone className="h-8 w-8 text-blue-600" /
              /div
              h3 className="text-lg font-bold text-gray-900 mb-2"Performance Tuning/h3
              p className="text-gray-600 text-sm"Optimized for high-performance workloads/p
            /div
          /div

          p className="text-gray-700 leading-relaxed"
            SirsiNexus hypervisor technology enables robust virtualization and efficient resource 
            allocation. It supports VM creation, management, and scaling with support for diverse workload 
            requirements.
          /p
        /div

        {/* Core Features */}
        div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8"
          h2 className="text-2xl font-bold text-gray-900 mb-6"Core Hypervisor Features/h2
          
          div className="space-y-6"
            div className="border-l-4 border-blue-500 pl-6"
              h3 className="text-xl font-bold text-gray-900 mb-3"Virtual Machine Management/h3
              div className="space-y-3"
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Dynamic Resource Allocation/h4
                    p className="text-gray-600 text-sm"CPU, memory, and I/O assignment on-demand/p
                  /div
                /div
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Snapshot and Cloning/h4
                    p className="text-gray-600 text-sm"Quick backups and deployment of VM states/p
                  /div
                /div
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Live Migration/h4
                    p className="text-gray-600 text-sm"Seamless transitioning of VMs across hosts/p
                  /div
                /div
              /div
            /div

            div className="border-l-4 border-green-500 pl-6"
              h3 className="text-xl font-bold text-gray-900 mb-3"Network Configuration/h3
              div className="space-y-3"
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Virtual Switches/h4
                    p className="text-gray-600 text-sm"Customizable virtual networking topologies/p
                  /div
                /div
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Network Isolation/h4
                    p className="text-gray-600 text-sm"VLAN and VXLAN support for secure networking/p
                  /div
                /div
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Bandwidth Management/h4
                    p className="text-gray-600 text-sm"Traffic shaping and QoS policies/p
                  /div
                /div
              /div
            /div

            div className="border-l-4 border-yellow-500 pl-6"
              h3 className="text-xl font-bold text-gray-900 mb-3"Resource Monitoring/h3
              div className="space-y-3"
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Performance Metrics/h4
                    p className="text-gray-600 text-sm"Detailed VM and host performance statistics/p
                  /div
                /div
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Alerting/h4
                    p className="text-gray-600 text-sm"Threshold-based alerts for proactive management/p
                  /div
                /div
                div className="flex items-start gap-3"
                  CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /
                  div
                    h4 className="font-semibold text-gray-900"Capacity Planning/h4
                    p className="text-gray-600 text-sm"Forecasting and usage trend analysis/p
                  /div
                /div
              /div
            /div
          /div
        /div

        {/* Configuration */}
        div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
          h2 className="text-2xl font-bold text-gray-900 mb-6"Hypervisor Configuration/h2
          
          div className="bg-gray-50 rounded-lg p-6 mb-6"
            h3 className="text-lg font-bold text-gray-900 mb-4"Basic Setup/h3
            pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto"
{`# Hypervisor Configuration
VM_PROVISIONING=enabled
NETWORK_ISOLATION=enabled
LIVE_MIGRATION=enabled

# Resource Allocation Settings
CPU_ALLOCATION_POLICY=dynamic
MEMORY_OVERCOMMIT=ratio:1.5
DISK_THROTTLING=enabled

# Monitoring
PERFORMANCE_MONITORING=enabled
ALERT_THRESHOLD=80
CAPACITY_PLANNING=enabled`}
            /pre
          /div

          div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            div className="flex items-center gap-2 mb-2"
              AlertTriangle className="h-5 w-5 text-yellow-600" /
              span className="font-semibold text-yellow-900"Best Practices/span
            /div
            ul className="text-sm text-yellow-800 space-y-1"
              li• Regular backups of all VMs are recommended/li
              li• Monitor resource usage and optimize allocations/li
              li• Use network isolation for sensitive workloads/li
              li• Continuous monitoring for performance bottlenecks/li
            /ul
          /div
        /div
      /div
    /div
  );
}
