import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Paperclip, Mic, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function HealthAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial greeting message
  useEffect(() => {
    const initialMessage: Message = {
      id: 'initial',
      sender: 'assistant',
      content: `Hello ${user?.name || 'there'}! I'm your AI health assistant. How can I help you today?`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  }, [user?.name]);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // In a real application, this would be an API call to your backend
      // For now, we'll simulate a response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: generateResponse(inputValue),
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Simple response generator for demo purposes
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('headache')) {
      return "Headaches can be caused by various factors including stress, dehydration, lack of sleep, or eye strain. If you're experiencing a severe or persistent headache, it might be best to consult with a doctor. Would you like me to help you book an appointment?";
    } else if (lowerInput.includes('fever') || lowerInput.includes('temperature')) {
      return "A fever is often a sign that your body is fighting an infection. Make sure to rest, stay hydrated, and take over-the-counter fever reducers if needed. If your fever is high (above 103°F or 39.4°C) or lasts more than three days, please consult a doctor immediately.";
    } else if (lowerInput.includes('cough') || lowerInput.includes('cold') || lowerInput.includes('flu')) {
      return "For coughs, colds, and flu-like symptoms, rest and hydration are key. Over-the-counter medications can help manage symptoms. If you're experiencing severe symptoms or they persist for more than a week, it might be time to see a doctor.";
    } else if (lowerInput.includes('appointment') || lowerInput.includes('book') || lowerInput.includes('schedule')) {
      return "I'd be happy to help you book an appointment with one of our doctors. You can visit the Appointments section to see available slots, or I can guide you through the process. Would you like to book an appointment now?";
    } else if (lowerInput.includes('thank')) {
      return "You're welcome! I'm here to help with any health-related questions you might have. Is there anything else you'd like to know?";
    } else {
      return "I understand you're concerned about your health. While I can provide general information, for specific medical advice, it's best to consult with a healthcare professional. Would you like me to help you book an appointment with one of our doctors?";
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Health Assistant</h1>
      
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.sender === 'assistant' ? (
                      <Bot className="h-4 w-4 mr-1" />
                    ) : (
                      <User className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.sender === 'assistant' ? 'AI Assistant' : 'You'}
                    </span>
                    <span className="text-xs opacity-50 ml-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-1" />
                    <span className="text-xs opacity-75">AI Assistant</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Mic className="h-5 w-5" />
            </button>
            <div className="flex-1 mx-3">
              <textarea
                rows={1}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              rightIcon={<Send className="h-4 w-4" />}
            >
              Send
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This AI assistant provides general health information and is not a substitute for professional medical advice. 
            In case of emergency, please call emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
