import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader } from 'lucide-react';

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

    if (onSendMessage) {
      try {
        await onSendMessage(inputValue);
        // In real implementation, the agent's response would be handled via websocket/SSE
        const mockAgentResponse: Message = {
          id: Math.random().toString(),
          type: 'agent',
          content: 'This is a mock response. In production, this would be replaced with real agent responses.',
          timestamp: new Date(),
          agentName: 'Assistant',
        };
        setMessages((prev) => [...prev, mockAgentResponse]);
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-sirsi-500 text-white shadow-lg hover:bg-sirsi-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 h-[500px] w-[360px] rounded-lg bg-white shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-sirsi-900">Agent Chat</h3>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
