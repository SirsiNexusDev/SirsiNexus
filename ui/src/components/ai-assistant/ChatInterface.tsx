'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, X, Minimize2, Maximize2, HelpCircle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feature?: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  currentFeature?: string;
  context?: any;
}

export default function ChatInterface({ isOpen, onClose, currentFeature, context }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI assistant for SirsiNexus. I have complete awareness of all platform features and can help you with ${currentFeature || 'any aspect of the system'}. How can I assist you today?`,
      timestamp: new Date(),
      feature: currentFeature
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response based on feature awareness
    const responses = {
      'ai-orchestration': [
        "I can help you configure AI orchestration workflows. Would you like guidance on setting up decision engines, monitoring workflows, or understanding the 88% accuracy metrics?",
        "For AI orchestration, I recommend starting with 'balanced' optimization mode. The system uses fuzzy logic and MCDM algorithms for decision-making. What specific aspect interests you?",
        "The AI orchestration engine supports autonomous workflow execution. I can walk you through creating your first orchestration or explain the multi-criteria decision making process."
      ],
      'analytics': [
        "The analytics dashboard uses TensorFlow, pandas, and Prophet for real-time insights. Are you interested in forecasting, anomaly detection, or performance metrics?",
        "Our analytics platform achieves 88% forecast accuracy with multiple ML models. I can help you configure data sources, set up alerts, or interpret the metrics.",
        "The analytics system processes data from CockroachDB, Redis, Prometheus, and agent telemetry. What specific analytics insights are you looking for?"
      ],
      'migration': [
        "The migration wizard guides you through cloud migrations with AI-powered planning. I can help with discovery, assessment, planning, or execution phases.",
        "Migration success rate is 97% with an average downtime of 2.3 minutes. Would you like help setting up a migration plan or understanding the process?",
        "The migration system supports AWS, Azure, and GCP. I can assist with infrastructure discovery, dependency analysis, or migration strategy."
      ],
      'default': [
        "I have complete awareness of all SirsiNexus features including AI Orchestration, Analytics, Migration, Optimization, Security, and Agent Management. What would you like to explore?",
        "As your AI assistant, I can provide detailed guidance on any platform feature, help troubleshoot issues, or explain technical concepts. How can I help you today?",
        "I'm connected to the Feature Registry and have real-time platform status. I can help with configurations, documentation, tutorials, or best practices for any feature."
      ]
    };

    const featureKey = currentFeature || 'default';
    const possibleResponses = responses[featureKey as keyof typeof responses] || responses.default;
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      feature: currentFeature
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await getAIResponse(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        feature: currentFeature
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again or check the documentation for immediate help.",
        timestamp: new Date(),
        feature: currentFeature
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              {currentFeature && (
                <p className="text-xs opacity-90">Helping with {currentFeature}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-6 h-6 hover:bg-white hover:bg-opacity-20 rounded flex items-center justify-center transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 hover:bg-white hover:bg-opacity-20 rounded flex items-center justify-center transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 h-80">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.type === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-purple-500" />
                        <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={() => setInputValue("How do I get started?")}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => setInputValue("Show me the documentation")}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Docs
                </button>
                <button 
                  onClick={() => setInputValue("What are the system requirements?")}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Requirements
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about SirsiNexus..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
