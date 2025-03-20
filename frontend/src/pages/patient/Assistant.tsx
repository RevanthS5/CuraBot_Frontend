import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Calendar, Paperclip, Mic, Loader, Heart } from 'lucide-react';
import { chatbotAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  qualification: string;
  reasoning: string;
}

export default function Assistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [showDoctors, setShowDoctors] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'bot',
          content: "Hi, I'm CuraBot! Please describe your symptoms or health concerns, and I'll help you find the right doctor.",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(user.id, input);
      
      // Check if the response contains doctor recommendations
      if (response.data.doctors && response.data.doctors.length > 0) {
        const botResponse: Message = {
          id: Date.now().toString(),
          sender: 'bot',
          content: response.data.message,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botResponse]);
        setRecommendedDoctors(response.data.doctors);
        setShowDoctors(true);
      } else {
        // Regular text response
        const botResponse: Message = {
          id: Date.now().toString(),
          sender: 'bot',
          content: response.data.response || response.data.message || "I'm sorry, I couldn't process your request.",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent"
        >
          AI Health Assistant
        </motion.h1>
        <motion.div
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/patient/appointments')}
            className="flex items-center gap-2 hover:shadow-md transition-all duration-300"
          >
            <Calendar className="h-4 w-4" />
            View My Appointments
          </Button>
        </motion.div>
      </div>

      {/* Chat container */}
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col overflow-hidden"
      >
        {/* Messages area */}
        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-start mb-2">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                        message.sender === 'user' ? 'bg-primary-400' : 'bg-primary-100'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${message.sender === 'user' ? 'text-white' : 'text-gray-900'}`}>
                          {message.sender === 'user' ? 'You' : 'CuraBot'}
                        </p>
                        <p className={`text-xs ${message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className={`whitespace-pre-wrap text-sm ${message.sender === 'user' ? 'text-white' : 'text-gray-700'}`}>
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Recommended doctors section */}
            <AnimatePresence>
              {showDoctors && recommendedDoctors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[90%] rounded-xl p-5 bg-white border border-gray-100 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="h-5 w-5 text-red-500 mr-2" />
                      Recommended Doctors
                    </h3>
                    <div className="space-y-4">
                      {recommendedDoctors.map((doctor, index) => (
                        <motion.div 
                          key={doctor.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-md font-semibold text-gray-900">{doctor.name}</h4>
                              <p className="text-sm font-medium text-primary-600">{doctor.speciality}</p>
                              <p className="text-xs text-gray-500">{doctor.qualification}</p>
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded-lg border-l-2 border-primary-300">
                                {doctor.reasoning}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => navigate('/patient/appointments/book')}
                              className="text-xs"
                            >
                              Book Appointment
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex items-center">
                      <Loader className="h-4 w-4 text-primary-600 animate-spin mr-2" />
                      <span className="text-sm text-gray-600">CuraBot is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms or health concerns..."
                className="w-full border border-gray-300 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none shadow-sm"
                rows={2}
                disabled={isLoading || showDoctors}
              />
              <div className="absolute bottom-3 left-3 flex space-x-2">
                <button className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isLoading || showDoctors}>
                  <Paperclip className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isLoading || showDoctors}>
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>
            <Button
              className="ml-3 flex-shrink-0 flex items-center justify-center h-[52px] w-[52px] rounded-full"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || showDoctors}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {showDoctors && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-primary-50 rounded-lg p-3 border border-primary-100"
            >
              <p className="text-sm text-gray-700 mb-2">
                Chat session completed with doctor recommendations. You can start a new chat for more help.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setShowDoctors(false);
                  setRecommendedDoctors([]);
                  setMessages([
                    {
                      id: Date.now().toString(),
                      sender: 'bot',
                      content: "Hi, I'm CuraBot! Please describe your symptoms or health concerns, and I'll help you find the right doctor.",
                      timestamp: new Date(),
                    },
                  ]);
                }}
              >
                Start New Chat
              </Button>
            </motion.div>
          )}
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            This AI assistant provides general health information and is not a substitute for professional medical advice.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
