/**
 * WebSocket Service for Real-time Agent Communication
 * Handles connection to the Rust gRPC backend via WebSocket proxy
 */

export interface AgentMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'error';
  content: string;
  timestamp: Date;
  agentName?: string;
  metadata?: {
    sessionId?: string;
    agentId?: string;
    context?: any;
  };
}

export interface AgentSession {
  sessionId: string;
  userId: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
  availableAgents: string[];
}

export interface SubAgent {
  agentId: string;
  agentType: 'aws' | 'azure' | 'gcp' | 'vsphere' | 'migration' | 'security' | 'reporting' | 'scripting' | 'tutorial' | 'general';
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'stopped';
  createdAt: Date;
  capabilities: string[];
  metrics: Record<string, string>;
}

export interface AgentSuggestion {
  id: string;
  title: string;
  description: string;
  actionType: 'action' | 'optimization' | 'security' | 'code' | 'tutorial' | 'troubleshooting';
  action: string;
  parameters: Record<string, string>;
  confidence: number;
}

export interface AgentRequest {
  action: 'start_session' | 'spawn_agent' | 'send_message' | 'get_suggestions' | 'get_status' | 'stop_session';
  sessionId?: string;
  agentId?: string;
  data?: any;
}

export interface AgentResponse {
  action: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

export class AgentWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<string, ((message: AgentMessage) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8080/agent-ws',
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 3000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected to agent backend');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { type: 'system', content: 'Connected to agent backend' } as AgentMessage);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: AgentMessage = JSON.parse(event.data);
          message.timestamp = new Date(message.timestamp);
          this.emit('message', message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.emit('error', {
            type: 'error',
            content: 'Failed to parse message from backend',
            timestamp: new Date(),
          } as AgentMessage);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        
        if (event.code !== 1000 && this.reconnectAttempts < this.config.reconnectAttempts) {
          this.scheduleReconnect();
        } else {
          this.emit('disconnection', { 
            type: 'system', 
            content: 'Disconnected from agent backend',
            timestamp: new Date(),
          } as AgentMessage);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', {
          type: 'error',
          content: 'Connection error to agent backend',
          timestamp: new Date(),
        } as AgentMessage);
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to create WebSocket connection:', error);
      throw error;
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.listeners.clear();
  }

  sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, queuing message for retry...');
      // In production, implement message queuing with retry logic
      this.emit('error', {
        type: 'error',
        content: 'Not connected to agent backend. Please try again.',
        timestamp: new Date(),
      } as AgentMessage);
      return;
    }

    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
    };

    try {
      this.ws.send(JSON.stringify(fullMessage));
    } catch (error) {
      console.error('Failed to send message:', error);
      this.emit('error', {
        type: 'error',
        content: 'Failed to send message to backend',
        timestamp: new Date(),
      } as AgentMessage);
    }
  }

  on(event: string, callback: (message: AgentMessage) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (message: AgentMessage) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, message: AgentMessage): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(message));
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    console.log(`📡 Attempting to reconnect (${this.reconnectAttempts}/${this.config.reconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection attempt failed:', error);
      });
    }, this.config.reconnectDelay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Agent Service gRPC Methods

  async startAgentSession(userId: string, context: Record<string, string> = {}): Promise<AgentSession> {
    return this.sendAgentRequest({
      action: 'start_session',
      data: { userId, context }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to start agent session');
      }
      return response.data as AgentSession;
    });
  }

  async spawnSubAgent(
    sessionId: string, 
    agentType: SubAgent['agentType'], 
    config: Record<string, string> = {}
  ): Promise<SubAgent> {
    return this.sendAgentRequest({
      action: 'spawn_agent',
      sessionId,
      data: { agentType, config }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to spawn sub-agent');
      }
      return response.data as SubAgent;
    });
  }

  async sendAgentMessage(
    sessionId: string,
    agentId: string,
    message: string,
    context: Record<string, string> = {}
  ): Promise<{ responseId: string; response: string; suggestions: AgentSuggestion[] }> {
    return this.sendAgentRequest({
      action: 'send_message',
      sessionId,
      agentId,
      data: { message, context }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message to agent');
      }
      return response.data;
    });
  }

  async getAgentSuggestions(
    sessionId: string,
    agentId: string,
    suggestionType: AgentSuggestion['actionType'],
    context: Record<string, string> = {}
  ): Promise<AgentSuggestion[]> {
    return this.sendAgentRequest({
      action: 'get_suggestions',
      sessionId,
      agentId,
      data: { suggestionType, context }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to get agent suggestions');
      }
      return response.data as AgentSuggestion[];
    });
  }

  async getAgentStatus(sessionId: string, agentId: string): Promise<SubAgent> {
    return this.sendAgentRequest({
      action: 'get_status',
      sessionId,
      agentId
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to get agent status');
      }
      return response.data as SubAgent;
    });
  }

  async stopAgentSession(sessionId: string): Promise<void> {
    return this.sendAgentRequest({
      action: 'stop_session',
      sessionId
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to stop agent session');
      }
    });
  }

  private async sendAgentRequest(request: AgentRequest): Promise<AgentResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket not connected to agent backend'));
        return;
      }

      const requestId = this.generateMessageId();
      const requestWithId = { ...request, requestId };

      // Set up one-time listener for response
      const responseHandler = (message: AgentMessage) => {
        if (message.metadata?.requestId === requestId) {
          this.off('agent_response', responseHandler);
          try {
            const response = JSON.parse(message.content) as AgentResponse;
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format from agent backend'));
          }
        }
      };

      this.on('agent_response', responseHandler);

      // Send request
      try {
        this.ws!.send(JSON.stringify(requestWithId));
      } catch (error) {
        this.off('agent_response', responseHandler);
        reject(new Error('Failed to send request to agent backend'));
      }

      // Set timeout for request
      setTimeout(() => {
        this.off('agent_response', responseHandler);
        reject(new Error('Request timeout'));
      }, 30000); // 30 second timeout
    });
  }
}

// Singleton instance for application-wide use
export const agentWebSocket = new AgentWebSocketService();

// React hook for using WebSocket in components
export const useAgentWebSocket = () => {
  return agentWebSocket;
};
