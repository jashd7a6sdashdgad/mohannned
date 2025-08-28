'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Loader2, Brain, Clock, CloudSun, BarChart3, BookOpen } from 'lucide-react';
import YouTubeCard from './YouTubeCard';
import FileUpload from './FileUpload';
import StudyStatistics from './StudyStatistics';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  city: string;
}

const courses = [
  'Mathematics',
  'Physics', 
  'Chemistry',
  'Biology',
  'English',
  'Arabic',
  'Islamic Studies',
  'History',
  'Geography',
  'General Studies'
];

// Generate unique user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

// Get or create user ID
const getUserId = () => {
  try {
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('jaifer_user_id');
      if (!userId) {
        userId = generateUserId();
        localStorage.setItem('jaifer_user_id', userId);
      }
      return userId;
    }
    return generateUserId(); // Fallback for SSR
  } catch (error) {
    console.error('Error getting user ID:', error);
    return generateUserId(); // Fallback on error
  }
};

export default function StudyAssistant() {
  const [userId] = useState(() => {
    try {
      return getUserId();
    } catch (error) {
      console.error('Error initializing user ID:', error);
      return generateUserId();
    }
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      return [
        {
          id: '1',
          type: 'assistant',
          content: '🌟 مرحباً بك في مساعد جعفر الذكي!\n\nأنا هنا لمساعدتك في رحلتك الدراسية للصف العاشر. يمكنني مساعدتك في:\n\n✨ شرح المفاهيم الصعبة\n📚 حل المسائل والواجبات\n🎯 التحضير للامتحانات\n🔗 العثور على مصادر تعليمية\n\n---\n\n🌟 Welcome to Jaifer AI Assistant!\n\nI\'m here to help you excel in Grade 10. I can assist you with:\n\n✨ Explaining complex concepts\n📚 Solving problems and assignments  \n🎯 Exam preparation\n🔗 Finding educational resources\n\nWhat would you like to explore today?',
          timestamp: new Date()
        }
      ];
    } catch (error) {
      console.error('Error initializing messages:', error);
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showStudyStats, setShowStudyStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Update Oman time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weather data based on user's location
  useEffect(() => {
    const fetchWeather = async (latitude?: number, longitude?: number, locationName?: string) => {
      try {
        let query = 'muscat'; // Default fallback
        
        if (latitude && longitude) {
          query = `${latitude},${longitude}`;
        } else if (locationName) {
          query = locationName;
        }

        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=9b9f2a541a83438898d03333250707&q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setWeather({
            temperature: Math.round(data.current?.temp_c || 28),
            condition: data.current?.condition?.text || 'Clear',
            humidity: data.current?.humidity || 65,
            city: data.location?.name || 'Unknown Location'
          });
        } else {
          // Fallback weather data
          setWeather({
            temperature: 28,
            condition: 'Clear',
            humidity: 65,
            city: 'Default Location'
          });
        }
      } catch {
        // Fallback weather data
        setWeather({
          temperature: 28,
          condition: 'Clear',
          humidity: 65,
          city: 'Default Location'
        });
      }
    };

    const getUserLocationAndFetchWeather = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
          },
          (error) => {
            console.warn('Geolocation error:', error.message);
            // Try to get location from IP or use default
            fetchWeather();
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // Cache for 5 minutes
          }
        );
      } else {
        console.warn('Geolocation not supported');
        fetchWeather();
      }
    };

    getUserLocationAndFetchWeather();
    // Refresh weather every 30 minutes
    const weatherTimer = setInterval(getUserLocationAndFetchWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, []);

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Enhanced AI intelligence with context awareness
  const getAIContext = () => {
    const omanTime = currentTime.toLocaleString('en-US', {
      timeZone: 'Asia/Muscat',
      hour12: true,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const weatherInfo = weather ? 
      `Weather in ${weather.city}: ${weather.temperature}°C, ${weather.condition}, Humidity: ${weather.humidity}%` :
      '';

    const recentMessages = messages && messages.length > 0 ? 
      messages.slice(-3).map(msg => 
        `${msg.type}: ${msg.content ? msg.content.slice(0, 100) : ''}...`
      ).join('\n') : '';

    return {
      currentTime: omanTime,
      weather: weatherInfo,
      selectedSubject: selectedCourse,
      recentContext: recentMessages,
      userLocation: 'Oman'
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue || !inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => prev ? [...prev, userMessage] : [userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Create assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const streamingMessage: Message = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => prev ? [...prev, streamingMessage] : [streamingMessage]);
    setIsTyping(false);

    try {
      const aiContext = getAIContext();
      // Enhanced request with AI context
      const response = await fetch('https://n8n.1000273.xyz/webhook/MohannedRAG', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          course: selectedCourse,
          userId: userId,
          timestamp: new Date().toISOString(),
          context: aiContext,
          location: 'Oman',
          intelligence_mode: 'enhanced'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response supports streaming
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      
      if (contentType && contentType.includes('text/event-stream')) {
        // Handle streaming response
        console.log('Streaming response detected');
        setIsStreaming(true);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    accumulatedContent += data.content;
                    
                    // Update the streaming message
                    setMessages(prev => prev ? prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    ) : []);
                  }
                  
                  if (data.done) {
                    break;
                  }
                } catch (parseError) {
                  console.error('Error parsing streaming data:', parseError);
                }
              }
            }
          }
        }
      } else {
        // Handle regular response
        console.log('Regular response detected');
        try {
          let content;
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response data:', data);
            content = data.response || data.message || data.text || data.output ||
                      (typeof data === 'string' ? data : 'عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.');
          } else {
            const textContent = await response.text();
            console.log('Response as text:', textContent);
            content = textContent || 'عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.';
          }
          setMessages(prev => prev ? prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: content }
              : msg
          ) : []);
        } catch (error) {
          console.error('Error handling response:', error);
          const errorContent = 'عذراً، حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.\n\nSorry, there was a connection error. Please check your internet connection and try again.';
          setMessages(prev => prev ? prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: errorContent }
              : msg
          ) : []);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorContent = 'عذراً، حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.\n\nSorry, there was a connection error. Please check your internet connection and try again.';
      
      setMessages(prev => prev ? prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: errorContent }
          : msg
      ) : []);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttach = () => {
    setShowFileUpload(true);
  };

  const handleShowStats = () => {
    setShowStudyStats(true);
  };

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
    // TODO: Process uploaded file and add to message
  };

  const renderMessageContent = (content: string) => {
    if (!content) return null;
    
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    const parts = content.split(youtubeRegex);
    
    const elements = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        if (parts[i]) {
          elements.push(
            <div key={i} className="whitespace-pre-wrap">
              {parts[i]}
            </div>
          );
        }
      } else {
        // YouTube video ID
        if (parts[i]) {
          elements.push(
            <YouTubeCard key={i} videoId={parts[i]} />
          );
        }
      }
    }
    
    return elements;
  };

  return (
    <div className="w-full max-w-sm mx-auto h-screen flex flex-col bg-gradient-to-br from-[#2a2a3d] via-[#323248] to-[#1f1f32] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_20px_25px_-5px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden backdrop-blur-xl border border-white/10 sm:max-w-md md:max-w-lg lg:max-w-sm transform hover:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.6),0_25px_35px_-5px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-[1.02]">
      {/* University Chat App Header */}
      <div className="bg-gradient-to-br from-[#3a3a4d] via-[#424254] to-[#353547] px-6 py-8 border-b border-gradient-to-r from-[#4a4a5d] to-[#5a5a6d] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] ring-2 ring-white/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: [
                "0_8px_32px_rgba(139,92,246,0.3)",
                "0_8px_32px_rgba(59,130,246,0.4)",
                "0_8px_32px_rgba(139,92,246,0.3)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="w-7 h-7 text-white drop-shadow-lg" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-sm font-semibold text-white drop-shadow-sm bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Jaifer AI Assistant</h1>
            <p className="text-xs text-white/90 drop-shadow-sm font-medium">Grade 10 Study Helper</p>
            <p className="text-xs text-white/60 mt-1 font-mono">ID: {userId ? userId.slice(-8) : 'unknown'}</p>
          </motion.div>
          
          {/* Enhanced Time and Weather Info */}
          <motion.div 
            className="flex flex-col items-center gap-4 mt-6 text-xs text-white/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* Study Statistics Button */}
            <motion.button
              onClick={handleShowStats}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full px-5 py-3 shadow-[0_4px_12px_rgba(168,85,247,0.2)] border border-purple-300/30 hover:shadow-[0_6px_16px_rgba(168,85,247,0.3)] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              <span className="font-medium text-sm text-white">Study Stats</span>
            </motion.button>
            <motion.div 
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/20 hover:bg-white/15"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-4 h-4 text-blue-300" />
              </motion.div>
              <span className="font-medium text-sm">{currentTime.toLocaleString('en-US', {
                timeZone: 'Asia/Muscat',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</span>
            </motion.div>
            {weather && (
              <motion.div 
                className="flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-full px-5 py-3 shadow-[0_4px_12px_rgba(251,146,60,0.2)] border border-orange-300/30 hover:shadow-[0_6px_16px_rgba(251,146,60,0.3)]"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  boxShadow: [
                    "0_4px_12px_rgba(251,146,60,0.2)",
                    "0_6px_16px_rgba(251,146,60,0.3)",
                    "0_4px_12px_rgba(251,146,60,0.2)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <CloudSun className="w-4 h-4 text-orange-300" />
                <span className="font-medium text-sm">{weather.temperature}°C {weather.city}</span>
              </motion.div>
            )}
            
            {/* Quick Stats Preview */}
            <motion.div 
              className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-full px-5 py-3 shadow-[0_4px_12px_rgba(16,185,129,0.2)] border border-emerald-300/30 hover:shadow-[0_6px_16px_rgba(16,185,129,0.3)] cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={handleShowStats}
              transition={{ duration: 0.2 }}
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span className="font-medium text-sm">View Progress</span>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="mt-8 w-full bg-gradient-to-r from-[#4a4a5d] to-[#525264] border border-white/20 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)] hover:bg-gradient-to-r hover:from-[#525264] hover:to-[#5a5a70]"
          whileFocus={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <option value="" className="text-white bg-[#4a4a5d]">✨ Select Subject</option>
          {courses.map(course => (
            <option key={course} value={course} className="text-white bg-[#4a4a5d]">📚 {course}</option>
          ))}
        </motion.select>
      </div>

      {/* Enhanced Chat Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-transparent via-black/5 to-transparent">
        <AnimatePresence mode="popLayout">
          {messages && messages.map((message) => (
            message && (
            <motion.div
              key={message.id}
              initial={{ 
                opacity: 0, 
                y: 20, 
                scale: 0.9,
                filter: "blur(4px)"
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                filter: "blur(0px)"
              }}
              exit={{ 
                opacity: 0, 
                y: -20, 
                scale: 0.9,
                filter: "blur(4px)"
              }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-slide-in mb-6`}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}
                layout
              >
                <motion.div
                  className={`rounded-2xl px-4 py-3 text-sm backdrop-blur-sm border transition-all duration-300 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-[#007AFF] via-[#0056CC] to-[#0040A0] text-white rounded-br-md shadow-[0_8px_32px_rgba(0,122,255,0.3),0_4px_16px_rgba(0,122,255,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] border-blue-300/20 hover:shadow-[0_12px_40px_rgba(0,122,255,0.4)]'
                      : 'bg-gradient-to-br from-[#3a3a4d] via-[#424254] to-[#353547] text-white border-white/20 rounded-bl-md shadow-[0_8px_32px_rgba(0,0,0,0.3),0_4px_16px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
                  }`}
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="leading-relaxed text-white">
                    {message.content && renderMessageContent(message.content)}
                    {isStreaming && (!message.content || message.content === '') && message.type === 'assistant' && (
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}
                    {isStreaming && message.content && message.type === 'assistant' && (
                      <span className="inline-block w-2 h-4 bg-white opacity-75 animate-pulse ml-1">|</span>
                    )}
                  </div>
                </motion.div>
                <motion.div 
                  className={`text-xs mt-2 text-white/50 px-1 font-mono ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </motion.div>
              </motion.div>
            </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex justify-start mb-6"
          >
            <motion.div 
              className="flex flex-col items-start max-w-[85%]"
              animate={{ x: [0, -2, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div 
                className="bg-gradient-to-br from-[#3a3a4d] via-[#424254] to-[#353547] border border-white/20 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.3),0_4px_16px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm"
                animate={{ 
                  boxShadow: [
                    "0_8px_32px_rgba(0,0,0,0.3)",
                    "0_12px_40px_rgba(139,92,246,0.2)",
                    "0_8px_32px_rgba(0,0,0,0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div 
                  className="loading-dots flex gap-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.span 
                    className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  ></motion.span>
                  <motion.span 
                    className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  ></motion.span>
                  <motion.span 
                    className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  ></motion.span>
                </motion.div>
              </motion.div>
              <motion.div 
                className="text-xs text-white/60 mt-2 px-1 font-medium"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🤖 AI is thinking...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area - Smart Chat Interface */}
      <motion.div 
        className="bg-gradient-to-br from-[#3a3a4d] via-[#424254] to-[#353547] border-t border-white/20 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_-4px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <div className="flex gap-3 items-end">
          <motion.button
            onClick={handleFileAttach}
            className="p-2.5 text-white/70 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)] border border-white/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paperclip className="w-4 h-4" />
          </motion.button>
          
          <div className="flex-1 relative">
            <motion.textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="💭 Type your message..."
              className="w-full bg-gradient-to-r from-[#4a4a5d] to-[#525264] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 resize-none text-sm min-h-[48px] max-h-[120px] shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
              rows={1}
              disabled={isLoading}
              whileFocus={{ scale: 1.02 }}
              animate={{ 
                boxShadow: inputValue.trim() ? 
                  "0_6px_16px_rgba(59,130,246,0.2)" : 
                  "0_4px_12px_rgba(0,0,0,0.3)"
              }}
            />
            {inputValue.trim() && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              />
            )}
          </div>
          
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-[#5865f2] to-[#4752c4] text-white rounded-xl hover:from-[#4752c4] hover:to-[#3642a8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_6px_20px_rgba(88,101,242,0.3)] hover:shadow-[0_8px_25px_rgba(88,101,242,0.4)] disabled:shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-blue-300/20"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: inputValue.trim() ? 
                "0_8px_25px_rgba(88,101,242,0.4)" : 
                "0_6px_20px_rgba(88,101,242,0.3)"
            }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ x: inputValue.trim() ? [0, 2, 0] : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Send className="w-5 h-5" />
              </motion.div>
            )}
          </motion.button>
        </div>
        
        <motion.div 
          className="text-xs text-white/50 mt-2 text-center font-medium"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨ Press Shift+Enter for new line • AI-powered responses
        </motion.div>
      </motion.div>
      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileSelect={handleFileSelect}
      />
      
      {/* Study Statistics Modal */}
      <StudyStatistics
        isOpen={showStudyStats}
        onClose={() => setShowStudyStats(false)}
        selectedCourse={selectedCourse}
      />
    </div>
  );
}