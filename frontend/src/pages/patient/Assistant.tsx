import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, ArrowRight } from 'lucide-react';
import { chatbotAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

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

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/patient/book-appointment?doctorId=${doctorId}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CuraBot Assistant</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/patient/appointments')}
        >
          View My Appointments
        </Button>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary-100 text-primary-900'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start mb-1">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                      message.sender === 'user' ? 'bg-primary-200' : 'bg-gray-200'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-primary-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {message.sender === 'user' ? 'You' : 'CuraBot'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {/* Recommended doctors section */}
            {showDoctors && recommendedDoctors.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-lg p-4 bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recommended Doctors</h3>
                  <div className="space-y-4">
                    {recommendedDoctors.map((doctor) => (
                      <div key={doctor.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">{doctor.name}</h4>
                            <p className="text-sm text-primary-600">{doctor.speciality}</p>
                            <p className="text-xs text-gray-500">{doctor.qualification}</p>
                            <p className="text-sm text-gray-700 mt-2">{doctor.reasoning}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleBookAppointment(doctor.id)}
                            className="flex items-center"
                          >
                            Book <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-gray-600" />
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-600">CuraBot is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms or health concerns..."
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading || showDoctors}
              />
            </div>
            <Button
              className="ml-2 flex-shrink-0"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || showDoctors}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          {showDoctors && (
            <p className="text-sm text-gray-500 mt-2">
              Chat session completed. Please select a doctor to book an appointment or start a new chat.
            </p>
          )}
          {showDoctors && (
            <Button
              variant="outline"
              className="mt-2"
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
          )}
        </div>
      </div>
    </div>
  );
}
