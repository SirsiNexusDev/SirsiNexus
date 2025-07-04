'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Wifi, WifiOff } from 'lucide-react';
import { useAgentWebSocket, AgentMessage } from '@/services/websocket';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentName?: string;
}

interface AgentChatProps {
  contextualHints?: string[];
  onSendMessage?: (message: string) => Promise<void>;
}

export const AgentChat: React.FC<AgentChatProps> = ({ contextualHints = [], onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const wsService = useAgentWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket connection management
  useEffect(() => {
    if (isOpen) {
      // Attempt to connect when chat is opened
      wsService.connect().catch(error => {
        console.error('Failed to connect to agent backend:', error);
      });

      // Listen for WebSocket messages
      const handleMessage = (agentMessage: AgentMessage) => {
        const message: Message = {
          id: agentMessage.id,
          type: agentMessage.type === 'user' ? 'user' : 'agent',
          content: agentMessage.content,
          timestamp: agentMessage.timestamp,
          agentName: agentMessage.agentName,
        };
        setMessages(prev => [...prev, message]);
        setIsLoading(false);
      };

      const handleConnection = () => {
        setConnectionState('connected');
      };

      const handleDisconnection = () => {
        setConnectionState('disconnected');
      };

      const handleError = (errorMessage: AgentMessage) => {
        const message: Message = {
          id: errorMessage.id,
          type: 'agent',
          content: errorMessage.content,
          timestamp: errorMessage.timestamp,
          agentName: 'System',
        };
        setMessages(prev => [...prev, message]);
        setIsLoading(false);
      };

      wsService.on('message', handleMessage);
      wsService.on('connection', handleConnection);
      wsService.on('disconnection', handleDisconnection);
      wsService.on('error', handleError);

      // Update connection state
      const checkConnection = () => {
        setConnectionState(wsService.getConnectionState());
      };
      
      const connectionInterval = setInterval(checkConnection, 1000);

      return () => {
        wsService.off('message', handleMessage);
        wsService.off('connection', handleConnection);
        wsService.off('disconnection', handleDisconnection);
        wsService.off('error', handleError);
        clearInterval(connectionInterval);
      };
    }
  }, [isOpen, wsService]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Send message via WebSocket if connected, otherwise use fallback
    if (wsService.isConnected()) {
      wsService.sendMessage({
        type: 'user',
        content: inputValue,
        agentName: 'User',
        metadata: {
          sessionId: 'session_' + Date.now(),
          context: { source: 'chat' }
        }
      });
    } else {
      // Fallback: Try traditional onSendMessage or show connection error
      if (onSendMessage) {
        try {
          await onSendMessage(inputValue);
          // Show a message indicating we're using fallback mode
          setTimeout(() => {
            const fallbackResponse: Message = {
              id: Math.random().toString(),
              type: 'agent',
              content: 'Using fallback mode. For real-time responses, ensure the agent backend is running.',
              timestamp: new Date(),
              agentName: 'System',
            };
            setMessages((prev) => [...prev, fallbackResponse]);
            setIsLoading(false);
          }, 1000);
        } catch (error) {
          console.error('Failed to send message:', error);
          setIsLoading(false);
        }
      } else {
        // No backend connection available
        const errorResponse: Message = {
          id: Math.random().toString(),
          type: 'agent',
          content: 'Unable to connect to agent backend. Please check your connection.',
          timestamp: new Date(),
          agentName: 'System',
        };
        setMessages((prev) => [...prev, errorResponse]);
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-sirsi-500 text-white shadow-lg hover:bg-sirsi-600 hover:scale-110 active:scale-90 transition-all"
      >
        <MessageCircle />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 h-[500px] w-[360px] rounded-lg bg-white shadow-xl animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-sirsi-900">Agent Chat</h3>
                <div className="flex items-center space-x-1">
                  {connectionState === 'connected' ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600">Connected</span>
                    </>
                  ) : connectionState === 'connecting' ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin text-yellow-500" />
                      <span className="text-xs text-yellow-600">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-red-600">Offline</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[380px] overflow-y-auto p-4">
              {contextualHints.length > 0 && (
                <div className="mb-4 rounded-lg bg-sirsi-50 p-3 text-sm text-sirsi-700">
                  <strong>Suggestions:</strong>
                  <ul className="ml-4 list-disc">
                    {contextualHints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-sirsi-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.agentName && (
                      <div className="mb-1 text-xs font-semibold">{message.agentName}</div>
                    )}
                    {message.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-800">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-sirsi-500 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-sirsi-500 text-white disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
        </div>
      )}
    </>
  );
};
