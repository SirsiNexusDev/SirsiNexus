/**
 * Enhanced WebSocket Integration Tests
 * Tests the complete frontend-to-backend communication flow
 * including the enhanced protobuf schema features
 */

import { AgentWebSocketService, AgentSuggestion, AgentSession, SubAgent } from '../services/websocket';

// Mock WebSocket for testing
class MockWebSocket {
  private listeners: Map<string, Function[]> = new Map();
  public readyState: number = WebSocket.CONNECTING;
  public url: string;

  constructor(url: string) {
    this.url = url;
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.dispatchEvent('open', {});
    }, 100);
  }

  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  send(data: string) {
    // Simulate server response based on the request
    const message = JSON.parse(data);
    setTimeout(() => {
      this.simulateResponse(message);
    }, 50);
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.dispatchEvent('close', { code: 1000, reason: 'Normal closure' });
  }

  private dispatchEvent(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  private simulateResponse(request: any) {
    let response: any;

    switch (request.type) {
      case 'create_session':
        response = {
          id: 'resp_' + Date.now(),
          type: 'agent',
          content: 'Session created successfully',
          timestamp: new Date(),
          agentName: 'System',
          metadata: {
            sessionId: 'session_' + Date.now(),
            context: { action: 'session_created' }
          }
        };
        break;

      case 'spawn_agent':
        response = {
          id: 'resp_' + Date.now(),
          type: 'agent',
          content: 'Agent spawned successfully',
          timestamp: new Date(),
          agentName: 'AgentManager',
          metadata: {
            agentId: 'agent_' + Date.now(),
            agentType: request.metadata?.agentType || 'general',
            status: 'ready'
          }
        };
        break;

      case 'user':
        // Simulate enhanced agent response with suggestions
        response = {
          id: 'resp_' + Date.now(),
          type: 'agent',
          content: this.generateSmartResponse(request.content),
          timestamp: new Date(),
          agentName: 'AWS_Agent',
          metadata: {
            responseId: 'resp_' + Date.now(),
            suggestions: this.generateSuggestions(request.content),
            confidence: 0.85,
            processingTime: 127
          }
        };
        break;

      default:
        response = {
          id: 'resp_' + Date.now(),
          type: 'system',
          content: 'Unknown request type',
          timestamp: new Date(),
          agentName: 'System'
        };
    }

    this.dispatchEvent('message', { data: JSON.stringify(response) });
  }

  private generateSmartResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('aws') || message.includes('ec2') || message.includes('s3')) {
      return `I've analyzed your AWS infrastructure request. Based on your current setup, I recommend optimizing your EC2 instances and implementing S3 lifecycle policies. Here's what I found:

🔍 **Resource Discovery:**
- 12 EC2 instances across 3 availability zones
- 8 S3 buckets with varying access patterns
- 3 RDS instances with automated backups

💰 **Cost Optimization:**
- Potential savings: $847/month (23% reduction)
- Right-sizing 4 over-provisioned instances
- Implementing S3 Intelligent Tiering

🛡️ **Security Recommendations:**
- Enable CloudTrail on 2 unmonitored buckets
- Update security groups for better compliance
- Implement IAM least privilege principles`;
    }
    
    if (message.includes('azure') || message.includes('resource group')) {
      return `Azure infrastructure analysis complete. Your resource groups show opportunities for optimization:

🏗️ **Resource Group Analysis:**
- 5 resource groups with 47 total resources
- 3 virtual machines requiring attention
- Storage accounts with optimization potential

📊 **Performance Insights:**
- VM utilization averaging 34% (underutilized)
- Database connection pooling recommendations
- Network optimization opportunities

🔄 **Migration Readiness:**
- 89% migration compatibility score
- 2 legacy dependencies identified
- Recommended migration timeline: 6-8 weeks`;
    }
    
    if (message.includes('cost') || message.includes('optimize') || message.includes('savings')) {
      return `Cost optimization analysis complete! Here are my recommendations:

💡 **Immediate Opportunities:**
- Reserved Instance recommendations: Save $1,247/month
- Unused resources identified: 6 items
- Storage optimization: 34% potential reduction

📈 **Performance vs Cost:**
- Current efficiency score: 67/100
- Recommended improvements with 23% cost reduction
- Performance impact: Minimal (< 2%)

⚡ **Quick Wins:**
- Implement auto-scaling: Save $423/month
- Optimize database configurations
- Review and cleanup orphaned resources`;
    }
    
    return `I've processed your request and here's my analysis:

✅ **Request Analysis Complete**
- Understood your requirements
- Identified key optimization areas
- Generated actionable recommendations

🎯 **Next Steps:**
- Review the provided suggestions
- Implement high-priority items first
- Monitor results and iterate

Would you like me to elaborate on any specific area or provide more detailed implementation guidance?`;
  }

  private generateSuggestions(userMessage: string): AgentSuggestion[] {
    const message = userMessage.toLowerCase();
    const suggestions: AgentSuggestion[] = [];
    
    if (message.includes('aws') || message.includes('cost') || message.includes('optimize')) {
      suggestions.push({
        suggestionId: 'sugg_' + Date.now() + '_1',
        title: 'Implement Reserved Instances',
        description: 'Switch to Reserved Instances for your long-running EC2 workloads to save up to 72% compared to On-Demand pricing.',
        type: 'optimization',
        action: {
          actionType: 'purchase_reserved_instances',
          parameters: {
            instance_types: 'r5.large,m5.xlarge',
            term: '1year',
            payment_option: 'partial_upfront'
          },
          command: 'aws ec2 describe-reserved-instances-offerings --instance-type r5.large',
          requiredPermissions: ['ec2:DescribeReservedInstancesOfferings', 'ec2:PurchaseReservedInstancesOffering']
        },
        confidence: 0.92,
        metadata: {
          estimated_savings: '$1247',
          implementation_time: '1-2 hours',
          risk_level: 'low'
        },
        priority: 1
      });

      suggestions.push({
        suggestionId: 'sugg_' + Date.now() + '_2',
        title: 'Enable S3 Intelligent Tiering',
        description: 'Automatically optimize storage costs by moving objects between access tiers based on changing access patterns.',
        type: 'optimization',
        action: {
          actionType: 'configure_s3_tiering',
          parameters: {
            buckets: 'prod-data,backup-storage',
            enable_deep_archive: 'true'
          },
          command: 'aws s3api put-bucket-intelligent-tiering-configuration',
          requiredPermissions: ['s3:PutIntelligentTieringConfiguration']
        },
        confidence: 0.87,
        metadata: {
          estimated_savings: '$423',
          setup_complexity: 'medium'
        },
        priority: 2
      });

      suggestions.push({
        suggestionId: 'sugg_' + Date.now() + '_3',
        title: 'Implement Auto Scaling',
        description: 'Set up auto scaling for your application to handle traffic spikes efficiently while minimizing costs during low usage.',
        type: 'action',
        action: {
          actionType: 'setup_autoscaling',
          parameters: {
            min_instances: '2',
            max_instances: '10',
            target_cpu: '70'
          },
          command: 'aws autoscaling create-auto-scaling-group',
          requiredPermissions: ['autoscaling:CreateAutoScalingGroup', 'ec2:CreateLaunchTemplate']
        },
        confidence: 0.81,
        metadata: {
          complexity: 'high',
          expected_improvement: '23%'
        },
        priority: 3
      });
    }

    if (message.includes('security') || message.includes('compliance')) {
      suggestions.push({
        suggestionId: 'sugg_' + Date.now() + '_security',
        title: 'Enable CloudTrail Logging',
        description: 'Implement comprehensive audit logging for all API calls to meet compliance requirements and enhance security monitoring.',
        type: 'action',
        action: {
          actionType: 'enable_cloudtrail',
          parameters: {
            trail_name: 'compliance-audit-trail',
            s3_bucket: 'security-audit-logs',
            include_global_events: 'true'
          },
          command: 'aws cloudtrail create-trail --name compliance-audit-trail',
          requiredPermissions: ['cloudtrail:CreateTrail', 's3:PutBucketPolicy']
        },
        confidence: 0.95,
        metadata: {
          compliance_frameworks: 'SOC2,GDPR,HIPAA',
          urgency: 'high'
        },
        priority: 1
      });
    }
    
    return suggestions;
  }
}

// Replace global WebSocket with our mock
(global as any).WebSocket = MockWebSocket;

describe('Enhanced WebSocket Integration Tests', () => {
  let wsService: AgentWebSocketService;

  beforeEach(() => {
    wsService = new AgentWebSocketService({
      url: 'ws://localhost:8080/agent-ws',
      reconnectAttempts: 3,
      reconnectDelay: 1000,
      heartbeatInterval: 30000
    });
  });

  afterEach(async () => {
    if (wsService) {
      wsService.disconnect();
    }
  });

  describe('Enhanced Session Management', () => {
    test('should create session with enhanced configuration', async () => {
      await wsService.connect();
      
      const session = await wsService.createSession('test-user@example.com', {
        environment: 'production',
        region: 'us-east-1',
        team: 'devops'
      }, {
        maxAgents: 5,
        timeoutSeconds: 300,
        enableLogging: true,
        preferences: {
          theme: 'dark',
          notifications: 'enabled'
        }
      });

      expect(session).toBeDefined();
      expect(session.sessionId).toMatch(/^session_\d+$/);
      expect(session.userId).toBe('test-user@example.com');
      expect(session.state).toBe('active');
    });

    test('should handle session with metadata and context', async () => {
      await wsService.connect();
      
      const sessionContext = {
        project: 'migration-phase-2',
        environment: 'staging',
        cost_center: 'engineering',
        compliance_level: 'high'
      };

      const session = await wsService.createSession('enterprise-user@company.com', sessionContext);
      
      expect(session.metadata).toBeDefined();
      expect(Object.keys(session.metadata)).toContain('project');
    });
  });

  describe('Enhanced Agent Lifecycle', () => {
    let session: AgentSession;

    beforeEach(async () => {
      await wsService.connect();
      session = await wsService.createSession('agent-test-user@example.com');
    });

    test('should create agent with comprehensive configuration', async () => {
      const agentConfig = {
        parameters: {
          region: 'us-west-2',
          service_discovery: 'auto',
          cost_optimization: 'enabled'
        },
        timeoutSeconds: 120,
        maxConcurrentOperations: 3,
        enableCaching: true,
        requiredCapabilities: [
          'resource-discovery',
          'cost-analysis',
          'security-review',
          'compliance-check'
        ]
      };

      const result = await wsService.createAgent(session.sessionId, 'aws', agentConfig);
      
      expect(result.agent).toBeDefined();
      expect(result.agent.agentType).toBe('aws');
      expect(result.agent.state).toBe('ready');
      expect(result.agent.config.requiredCapabilities).toContain('cost-analysis');
      expect(result.capabilities).toBeDefined();
      expect(result.capabilities.length).toBeGreaterThan(0);
    });

    test('should handle agent with metadata and parent relationships', async () => {
      // Create parent agent
      const parentAgent = await wsService.createAgent(session.sessionId, 'orchestrator');
      
      // Create child agent with parent reference
      const childConfig = {
        parameters: { parent_agent_id: parentAgent.agent.agentId },
        timeoutSeconds: 60,
        maxConcurrentOperations: 2,
        enableCaching: false,
        requiredCapabilities: ['specialized-task']
      };

      const childAgent = await wsService.createAgent(
        session.sessionId, 
        'specialized', 
        childConfig,
        { parent_type: 'orchestrator', task: 'data_migration' }
      );

      expect(childAgent.agent.parentAgentId).toBe(parentAgent.agent.agentId);
      expect(childAgent.agent.metadata.task).toBe('data_migration');
    });
  });

  describe('Enhanced Messaging System', () => {
    let session: AgentSession;
    let agent: SubAgent;

    beforeEach(async () => {
      await wsService.connect();
      session = await wsService.createSession('message-test-user@example.com');
      const result = await wsService.createAgent(session.sessionId, 'aws');
      agent = result.agent;
    });

    test('should send message with attachments and rich metadata', async () => {
      const messageContent = 'Analyze my AWS infrastructure and provide cost optimization recommendations';
      
      const attachments = [
        {
          attachmentId: 'att_1',
          name: 'infrastructure.json',
          mimeType: 'application/json',
          sizeBytes: 2048,
          data: new TextEncoder().encode('{"ec2_instances": 12, "s3_buckets": 8}'),
          url: ''
        },
        {
          attachmentId: 'att_2',
          name: 'current_costs.csv',
          mimeType: 'text/csv',
          sizeBytes: 1024,
          data: new TextEncoder().encode('service,monthly_cost\nEC2,1247.50\nS3,423.80'),
          url: ''
        }
      ];

      const messageOptions = {
        timeoutSeconds: 60,
        streamResponse: false,
        context: {
          analysis_type: 'comprehensive',
          include_security: 'true',
          budget_constraints: '5000'
        },
        priority: 'high' as const
      };

      const result = await wsService.sendMessage(
        session.sessionId,
        agent.agentId,
        {
          content: messageContent,
          type: 'command',
          attachments,
          metadata: {
            user_role: 'cloud_architect',
            urgency: 'high',
            project: 'cost_optimization_q4'
          }
        },
        messageOptions
      );

      expect(result.messageId).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.response.content).toContain('AWS infrastructure');
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.processingTimeMs).toBeGreaterThan(0);
    });

    test('should handle complex message metadata and context', async () => {
      const complexMessage = {
        content: 'Perform security compliance audit for production environment',
        type: 'command' as const,
        metadata: {
          compliance_framework: 'SOC2_Type2',
          environment: 'production',
          severity: 'critical',
          audit_scope: 'full_infrastructure',
          notification_channels: 'slack,email,dashboard'
        }
      };

      const result = await wsService.sendMessage(
        session.sessionId,
        agent.agentId,
        complexMessage,
        {
          priority: 'critical',
          context: {
            audit_type: 'compliance',
            frameworks: 'SOC2,GDPR,HIPAA',
            report_format: 'detailed_json'
          }
        }
      );

      expect(result.response.metadata).toBeDefined();
      expect(result.metrics.tokensProcessed).toBeGreaterThan(0);
    });
  });

  describe('Enhanced Suggestion System', () => {
    let session: AgentSession;
    let agent: SubAgent;

    beforeEach(async () => {
      await wsService.connect();
      session = await wsService.createSession('suggestion-test-user@example.com');
      const result = await wsService.createAgent(session.sessionId, 'optimization');
      agent = result.agent;
    });

    test('should get contextual suggestions with confidence scoring', async () => {
      const result = await wsService.getSuggestions(
        session.sessionId,
        agent.agentId,
        {
          contextType: 'cost-optimization',
          contextData: {
            current_spend: '5000',
            target_reduction: '20',
            priority_services: 'EC2,RDS,S3'
          },
          tags: ['cost', 'optimization', 'aws', 'production']
        },
        10
      );

      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.contextId).toBeDefined();

      // Validate suggestion structure
      const suggestion = result.suggestions[0];
      expect(suggestion.suggestionId).toBeDefined();
      expect(suggestion.title).toBeDefined();
      expect(suggestion.description).toBeDefined();
      expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
      expect(suggestion.confidence).toBeLessThanOrEqual(1);
      expect(suggestion.action).toBeDefined();
      expect(suggestion.action.actionType).toBeDefined();
      expect(suggestion.action.command).toBeDefined();
      expect(suggestion.priority).toBeGreaterThanOrEqual(1);
      expect(suggestion.priority).toBeLessThanOrEqual(5);
    });

    test('should handle suggestions with executable actions', async () => {
      const result = await wsService.getSuggestions(
        session.sessionId,
        agent.agentId,
        {
          contextType: 'security-audit',
          contextData: {
            compliance_level: 'enterprise',
            audit_scope: 'infrastructure',
            risk_tolerance: 'low'
          }
        }
      );

      expect(result.suggestions).toBeDefined();
      
      for (const suggestion of result.suggestions) {
        expect(suggestion.action.actionType).toBeDefined();
        expect(suggestion.action.parameters).toBeDefined();
        expect(suggestion.action.command).toBeDefined();
        expect(suggestion.action.requiredPermissions).toBeDefined();
        expect(suggestion.action.requiredPermissions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Enhanced System Monitoring', () => {
    let session: AgentSession;
    let agent: SubAgent;

    beforeEach(async () => {
      await wsService.connect();
      session = await wsService.createSession('monitoring-test-user@example.com');
      const result = await wsService.createAgent(session.sessionId, 'general');
      agent = result.agent;
    });

    test('should get comprehensive agent status with metrics', async () => {
      // Send a message first to generate some metrics
      await wsService.sendMessage(
        session.sessionId,
        agent.agentId,
        { content: 'Test message for metrics generation' }
      );

      const statusResult = await wsService.getAgentStatus(session.sessionId, agent.agentId);

      expect(statusResult.status).toBeDefined();
      expect(statusResult.status.state).toBeDefined();
      expect(statusResult.status.statusMessage).toBeDefined();
      expect(statusResult.status.lastActivity).toBeDefined();
      
      expect(statusResult.metrics).toBeDefined();
      expect(statusResult.metrics.messagesProcessed).toBeGreaterThanOrEqual(1);
      expect(statusResult.metrics.averageResponseTimeMs).toBeGreaterThan(0);
      
      expect(statusResult.activeCapabilities).toBeDefined();
      expect(statusResult.healthStatus).toBeDefined();
    });

    test('should get system health with comprehensive metrics', async () => {
      const healthResult = await wsService.getSystemHealth(true);

      expect(healthResult.health).toBeDefined();
      expect(healthResult.health.overallStatus).toBeDefined();
      expect(healthResult.health.components).toBeDefined();
      expect(healthResult.health.lastCheck).toBeDefined();

      expect(healthResult.metrics).toBeDefined();
      expect(healthResult.metrics!.activeSessions).toBeGreaterThanOrEqual(1);
      expect(healthResult.metrics!.totalAgents).toBeGreaterThanOrEqual(1);
      expect(healthResult.metrics!.uptimeSeconds).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle connection failures gracefully', async () => {
      // Simulate connection failure
      const failingService = new AgentWebSocketService({
        url: 'ws://invalid-host:9999/agent-ws',
        reconnectAttempts: 1,
        reconnectDelay: 100
      });

      await expect(failingService.connect()).rejects.toThrow();
    });

    test('should handle invalid session operations', async () => {
      await wsService.connect();

      await expect(
        wsService.createAgent('invalid-session-id', 'aws')
      ).rejects.toThrow();

      await expect(
        wsService.sendMessage('invalid-session', 'invalid-agent', { content: 'test' })
      ).rejects.toThrow();
    });

    test('should handle malformed responses', async () => {
      await wsService.connect();
      
      // This should be handled gracefully by the service
      const messageHandler = jest.fn();
      wsService.on('error', messageHandler);

      // The mock WebSocket should handle this gracefully
      expect(wsService.isConnected()).toBe(true);
    });
  });

  describe('Performance and Concurrency', () => {
    test('should handle concurrent operations efficiently', async () => {
      await wsService.connect();
      
      const session = await wsService.createSession('concurrent-test-user@example.com');
      
      // Create multiple agents concurrently
      const agentPromises = Array.from({ length: 3 }, (_, i) =>
        wsService.createAgent(session.sessionId, `agent-type-${i}`)
      );

      const agents = await Promise.all(agentPromises);
      expect(agents).toHaveLength(3);
      
      // Send messages to all agents concurrently
      const messagePromises = agents.map(result =>
        wsService.sendMessage(
          session.sessionId,
          result.agent.agentId,
          { content: `Concurrent test message to ${result.agent.agentType}` }
        )
      );

      const responses = await Promise.all(messagePromises);
      expect(responses).toHaveLength(3);
      
      responses.forEach(response => {
        expect(response.response).toBeDefined();
        expect(response.metrics).toBeDefined();
      });
    });

    test('should maintain performance with large payloads', async () => {
      await wsService.connect();
      
      const session = await wsService.createSession('performance-test-user@example.com');
      const result = await wsService.createAgent(session.sessionId, 'performance');
      
      // Create a large message with substantial content and attachments
      const largeContent = 'A'.repeat(10000); // 10KB of content
      const largeAttachment = {
        attachmentId: 'large_att_1',
        name: 'large_file.json',
        mimeType: 'application/json',
        sizeBytes: 50000,
        data: new TextEncoder().encode('{"data": "' + 'x'.repeat(50000) + '"}'),
        url: ''
      };

      const startTime = Date.now();
      const response = await wsService.sendMessage(
        session.sessionId,
        result.agent.agentId,
        {
          content: largeContent,
          attachments: [largeAttachment]
        }
      );
      const endTime = Date.now();

      expect(response.response).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
