'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Loader2, Brain, Clock, CloudSun, BarChart3, BookOpen, Mic, Sparkles } from 'lucide-react';
import YouTubeCard from './YouTubeCard';
import FileUpload from './FileUpload';
import StudyStatistics from './StudyStatistics';
import VoiceFeatures from './VoiceFeatures';

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
  'Arabic Language',
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Information Technology (ICT / Computer Studies)',
  'Social Studies (History, Geography, Civics)',
  'Islamic Education',
  'Life Skills / Career Guidance'
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
          content: '🌟 مرحباً بك في مساعد جعفر الذكي!\n\nأنا هنا لمساعدتك في رحلتك الدراسية للصف العاشر. يمكنني مساعدتك في:\n\n✨ شرح المفاهيم الصعبة\n📚 حل المسائل والواجبات\n🎯 التحضير للامتحانات\n🔗 العثور على مصادر تعليمية\n\n---\n\n🌟 Welcome to Jaifer AI Assistant!\n\nI\'m here to help you excel in Grade 10. I can assist you with:\n\n✨ Explaining complex concepts\n📚 Solving problems and assignments  \n🎯 Exam preparation\n🔗 Finding educational resources\n\n🎤 Voice Commands: Click the Voice button to speak your questions!\n✨ Smart Questions: Click the Sparkles button for intelligent follow-up questions!\n🧠 Cognitive Assessment: Take an IQ test to measure your intellectual abilities!\n\nWhat would you like to explore today?',
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
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isGeneratingSmartQuestion, setIsGeneratingSmartQuestion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate fallback response when API fails
  const generateFallbackResponse = (question: string, course: string) => {
    const fallbackResponses = {
      'Arabic Language': [
        'أهلاً! دعني أساعدك في اللغة العربية. هذا السؤال يتعلق بـ...',
        'مرحباً! سأقوم بشرح هذا المفهوم العربي لك...',
        'أهلاً وسهلاً! دعني أشرح لك هذا الموضوع في اللغة العربية...'
      ],
      'English Language': [
        'Hello! Let me help you with English. This question is about...',
        'Hi there! I\'ll explain this English concept to you...',
        'Welcome! Let me break down this English topic for you...'
      ],
      'Mathematics': [
        'Great question! Let me help you with this math concept...',
        'Excellent! This mathematical problem involves...',
        'Perfect! Let me walk you through this math solution...'
      ],
      'Physics': [
        'Interesting physics question! This concept involves...',
        'Great physics inquiry! Let me explain this principle...',
        'Excellent! This physics topic relates to...'
      ],
      'Chemistry': [
        'Fascinating chemistry question! This reaction involves...',
        'Great chemistry inquiry! Let me explain this concept...',
        'Excellent! This chemistry topic relates to...'
      ],
      'Biology': [
        'Interesting biology question! This biological process involves...',
        'Great biology inquiry! Let me explain this system...',
        'Excellent! This biology topic relates to...'
      ],
      'Information Technology (ICT / Computer Studies)': [
        'Great tech question! This programming concept involves...',
        'Excellent IT inquiry! Let me explain this technology...',
        'Perfect! This computer science topic relates to...'
      ],
      'Social Studies (History, Geography, Civics)': [
        'Great social studies question! This historical event involves...',
        'Excellent inquiry! Let me explain this geographical concept...',
        'Perfect! This civics topic relates to...'
      ],
      'Islamic Education': [
        'أهلاً! دعني أساعدك في التربية الإسلامية. هذا المفهوم يتعلق بـ...',
        'مرحباً! سأقوم بشرح هذا المبدأ الإسلامي لك...',
        'أهلاً وسهلاً! دعني أشرح لك هذا الموضوع في التربية الإسلامية...'
      ],
      'Life Skills / Career Guidance': [
        'Great life skills question! This topic involves...',
        'Excellent career inquiry! Let me explain this concept...',
        'Perfect! This life skill relates to...'
      ]
    };

    const courseResponses = fallbackResponses[course as keyof typeof fallbackResponses] || [
      'Great question! Let me help you with this topic...',
      'Excellent inquiry! Let me explain this concept...',
      'Perfect! This topic relates to...'
    ];

    const randomResponse = courseResponses[Math.floor(Math.random() * courseResponses.length)];
    return `${randomResponse}\n\nSince the AI service is temporarily unavailable, here are some helpful tips:\n\n1. **Break it down**: Try to understand the question step by step\n2. **Use examples**: Look for real-world examples related to your question\n3. **Practice**: Try similar problems or exercises\n4. **Ask for clarification**: If something is unclear, break it into smaller parts\n\nWould you like me to help you approach this question differently?`;
  };

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
    setIsProcessing(true);

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
                    
                    // Auto-speak AI response if enabled
                    if (autoSpeak && accumulatedContent) {
                      setTimeout(() => {
                        const utterance = new SpeechSynthesisUtterance(accumulatedContent);
                        utterance.rate = 0.9;
                        utterance.pitch = 1.0;
                        utterance.volume = 0.8;
                        window.speechSynthesis.speak(utterance);
                      }, 1000); // Small delay to ensure message is displayed first
                    }
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
          
          // Auto-speak AI response if enabled
          if (autoSpeak && content) {
            setTimeout(() => {
              const utterance = new SpeechSynthesisUtterance(content);
              utterance.rate = 0.9;
              utterance.pitch = 1.0;
              utterance.volume = 0.8;
              window.speechSynthesis.speak(utterance);
            }, 1000); // Small delay to ensure message is displayed first
          }
        } catch (error) {
          console.error('Error handling response:', error);
          const errorContent = 'عذراً، حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.\n\nSorry, there was a connection error. Please check your internet connection and try again.';
          setMessages(prev => prev ? prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: errorContent }
              : msg
          ) : []);
          
          // Auto-speak error message if enabled
          if (autoSpeak && errorContent) {
            setTimeout(() => {
              const utterance = new SpeechSynthesisUtterance(errorContent);
              utterance.rate = 0.9;
              utterance.pitch = 1.0;
              utterance.volume = 0.8;
              window.speechSynthesis.speak(utterance);
            }, 1000);
          }
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
      
      // Auto-speak error message if enabled
      if (autoSpeak && errorContent) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(errorContent);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          window.speechSynthesis.speak(utterance);
        }, 1000);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setIsProcessing(false);
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

  const handleVoiceInput = (text: string) => {
    setInputValue(text);
    // Automatically send the message after voice input
    setTimeout(() => {
      handleSendMessage();
    }, 500);
  };

  const handleToggleListening = (listening: boolean) => {
    setIsListening(listening);
  };

  const handleToggleAutoSpeak = (enabled: boolean) => {
    setAutoSpeak(enabled);
  };

  const generateSmartQuestion = async () => {
    if (!messages || messages.length === 0) {
      // If no conversation, generate a general study question
      const generalQuestions = [
        "What subject would you like to explore today?",
        "What's your main learning goal for this session?",
        "Which topic do you find most challenging?",
        "What would you like to practice or review?",
        "What concept would you like me to explain in detail?"
      ];
      const randomQuestion = generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
      setInputValue(randomQuestion);
      return;
    }

    setIsGeneratingSmartQuestion(true);
    
    try {
      // Analyze the conversation context
      const recentMessages = messages.slice(-5).map(msg => 
        `${msg.type}: ${msg.content ? msg.content.slice(0, 150) : ''}`
      ).join('\n');
      
      // Generate multiple smart question options based on conversation analysis
      const smartQuestionOptions = [
        // Learning progression questions
        "Based on what we discussed, what specific aspect would you like to dive deeper into?",
        "What's the next logical step in your learning journey with this topic?",
        "Which concept from our discussion would you like to practice first?",
        
        // Understanding and clarification questions
        "What's one thing from our discussion that you'd like me to clarify further?",
        "Which part of what we covered would benefit from a real-world example?",
        "What question do you think would help you understand this better?",
        
        // Application and practice questions
        "How would you apply what we discussed in a practical scenario?",
        "What type of practice would be most helpful for you right now?",
        "Which real-world application of this concept interests you most?",
        
        // Challenge and difficulty questions
        "What's the most challenging aspect of this topic for you?",
        "Which part of our discussion do you find most confusing?",
        "What would help you overcome any difficulties with this concept?",
        
        // Personal learning style questions
        "Based on your learning style, what type of explanation would be most helpful?",
        "How do you prefer to approach learning this type of material?",
        "What learning method works best for you with this subject?",
        
        // Connection and context questions
        "How does this topic connect to what you already know?",
        "What other subjects or concepts relate to what we're discussing?",
        "How would you explain this concept to someone else?",
        
        // Future learning questions
        "What would you like to learn next after mastering this topic?",
        "How do you plan to use this knowledge in the future?",
        "What skills would complement what we're learning here?"
      ];
      
      // Course-specific question options
      let courseSpecificOptions: string[] = [];
      if (selectedCourse && selectedCourse !== 'General') {
        if (selectedCourse === 'Arabic Language') {
          courseSpecificOptions = [
            'What Arabic grammar rule are you finding most challenging?',
            'Which Arabic text or story would you like to analyze?',
            'What Arabic writing skill do you want to improve?',
            'How can I help you with Arabic pronunciation?',
            'What Arabic vocabulary topic interests you most?'
          ];
        } else if (selectedCourse === 'English Language') {
          courseSpecificOptions = [
            'What English grammar concept do you need help with?',
            'Which English writing skill would you like to develop?',
            'What English reading comprehension strategy works best for you?',
            'How can I help you improve your English speaking?',
            'What English vocabulary area do you want to expand?'
          ];
        } else if (selectedCourse === 'Mathematics') {
          courseSpecificOptions = [
            'What mathematical concept are you currently studying?',
            'Which type of math problem gives you the most trouble?',
            'What mathematical skill would you like to practice?',
            'How do you approach solving complex equations?',
            'What real-world math application interests you?'
          ];
        } else if (selectedCourse === 'Physics') {
          courseSpecificOptions = [
            'What physics concept are you finding most challenging?',
            'Which physics experiment would you like to understand?',
            'What physics formula do you need help memorizing?',
            'How can I explain this physics principle better?',
            'What physics application in daily life interests you?'
          ];
        } else if (selectedCourse === 'Chemistry') {
          courseSpecificOptions = [
            'What chemical reaction are you studying?',
            'Which chemistry concept do you find most confusing?',
            'What lab experiment would you like to understand?',
            'How can I help you with chemical equations?',
            'What chemistry topic connects to your daily life?'
          ];
        } else if (selectedCourse === 'Biology') {
          courseSpecificOptions = [
            'What biological system are you learning about?',
            'Which biology concept do you need clarified?',
            'What biological process interests you most?',
            'How can I help you understand cell biology?',
            'What biology topic relates to your health?'
          ];
        } else if (selectedCourse === 'Information Technology (ICT / Computer Studies)') {
          courseSpecificOptions = [
            'What programming concept are you working on?',
            'Which software application do you want to master?',
            'What computer skill would you like to develop?',
            'How can I help you with coding problems?',
            'What technology topic interests you most?'
          ];
        } else if (selectedCourse === 'Social Studies (History, Geography, Civics)') {
          courseSpecificOptions = [
            'What historical event are you studying?',
            'Which geographical concept do you need help with?',
            'What civics topic interests you most?',
            'How can I help you understand Omani history?',
            'What social studies skill do you want to improve?'
          ];
        } else if (selectedCourse === 'Islamic Education') {
          courseSpecificOptions = [
            'What Islamic concept are you learning about?',
            'Which Islamic principle do you need clarified?',
            'What Islamic history topic interests you?',
            'How can I help you understand Islamic values?',
            'What Islamic practice would you like to learn more about?'
          ];
        } else if (selectedCourse === 'Life Skills / Career Guidance') {
          courseSpecificOptions = [
            'What life skill would you like to develop?',
            'Which career path interests you most?',
            'What personal development area do you want to focus on?',
            'How can I help you with decision-making skills?',
            'What future goal would you like to plan for?'
          ];
        } else {
          courseSpecificOptions = [
            `In ${selectedCourse}, what's the most fundamental concept you want to master?`,
            `For ${selectedCourse}, what practical skill would you like to develop?`,
            `What's the most challenging aspect of ${selectedCourse} for you?`,
            `In ${selectedCourse}, what real-world application interests you most?`,
            `What's one thing about ${selectedCourse} that you find confusing?`
          ];
        }
      }
      
      // Context-aware follow-up options
      let contextSpecificOptions: string[] = [];
      if (messages.length > 2) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.content) {
          const content = lastMessage.content.toLowerCase();
          
          if (content.includes('explain') || content.includes('what is') || content.includes('how')) {
            contextSpecificOptions = [
              "Great question! What specific example or scenario would help you understand this better?",
              "Excellent! What aspect of this would you like me to break down further?",
              "Perfect question! What's the most confusing part for you?",
              "Good thinking! What practical application would make this clearer?"
            ];
          } else if (content.includes('practice') || content.includes('exercise')) {
            contextSpecificOptions = [
              "Perfect! What type of practice would be most helpful for you right now?",
              "Great idea! What difficulty level would you like to start with?",
              "Excellent! What specific skill are you trying to develop?",
              "Good choice! What's your preferred way to practice this?"
            ];
          } else if (content.includes('difficult') || content.includes('hard') || content.includes('challenging')) {
            contextSpecificOptions = [
              "I understand this can be challenging. What's the specific part that's giving you trouble?",
              "Challenges are part of learning! What approach have you tried so far?",
              "Let's work through this together. What's the first step you're stuck on?",
              "Every challenge is an opportunity! What would make this easier for you?"
            ];
          } else if (content.includes('example') || content.includes('instance')) {
            contextSpecificOptions = [
              "Good thinking! How would you apply this concept in a different situation?",
              "Great example! What other scenarios could this apply to?",
              "Excellent! What makes this example work?",
              "Perfect! How would you modify this example for a different context?"
            ];
          }
        }
      }
      
      // Combine all question options and remove duplicates
      let allOptions = [...smartQuestionOptions];
      if (courseSpecificOptions.length > 0) {
        allOptions = [...allOptions, ...courseSpecificOptions];
      }
      if (contextSpecificOptions.length > 0) {
        allOptions = [...allOptions, ...contextSpecificOptions];
      }
      
      // Remove duplicates and shuffle
      const uniqueOptions = [...new Set(allOptions)];
      const shuffledOptions = uniqueOptions.sort(() => Math.random() - 0.5);
      
      // Select 3 different questions to present as options
      const selectedQuestions = shuffledOptions.slice(0, 3);
      
      // Format the questions as a numbered list
      const formattedQuestions = selectedQuestions.map((q, index) => `${index + 1}. ${q}`).join('\n\n');
      
      // Select one smart question to send directly
      const selectedQuestion = selectedQuestions[0];
      
      // Create and send the smart question directly
      const smartQuestionMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: selectedQuestion,
        timestamp: new Date()
      };

      // Add the smart question to messages
      setMessages(prev => prev ? [...prev, smartQuestionMessage] : [smartQuestionMessage]);
      
      // Set loading states
      setIsLoading(true);
      setIsTyping(true);
      setIsProcessing(true);

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
        console.log('Sending smart question:', selectedQuestion);
        console.log('AI Context:', aiContext);
        
        // Enhanced request with AI context
        const response = await fetch('https://n8n.1000273.xyz/webhook/MohannedRAG', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: selectedQuestion,
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
                  } catch (parseError) {
                    console.warn('Error parsing streaming data:', parseError);
                    // Try to extract plain text content if JSON parsing fails
                    const plainText = line.slice(6).trim();
                    if (plainText && plainText !== '[DONE]') {
                      accumulatedContent += plainText;
                      
                      // Update the streaming message
                      setMessages(prev => prev ? prev.map(msg => 
                        msg.id === assistantMessageId 
                          ? { ...msg, content: accumulatedContent }
                          : msg
                      ) : []);
                    }
                  }
                }
              }
            }
          }
          
          // Final update to the message
          setMessages(prev => prev ? prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: accumulatedContent }
              : msg
          ) : []);
          
          setIsStreaming(false);
        } else {
          // Handle regular response - try JSON first, then fallback to text
          let aiResponse = 'I apologize, but I couldn\'t process your request at the moment.';
          
          try {
            const data = await response.json();
            aiResponse = data.response || data.message || data.content || aiResponse;
          } catch (jsonError) {
            console.log('Response is not JSON, trying as text...');
            try {
              const textResponse = await response.text();
              aiResponse = textResponse || aiResponse;
            } catch (textError) {
              console.error('Error reading response as text:', textError);
            }
          }
          
          // If we still have the default error message, provide a helpful fallback response
          if (aiResponse === 'I apologize, but I couldn\'t process your request at the moment.') {
            aiResponse = generateFallbackResponse(selectedQuestion, selectedCourse);
          }
          
          // Update the streaming message with the final response
          setMessages(prev => prev ? prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: aiResponse }
              : msg
          ) : []);
        }
      } catch (error) {
        console.error('Error sending smart question:', error);
        
        // Generate a helpful fallback response instead of just an error message
        const fallbackResponse = generateFallbackResponse(selectedQuestion, selectedCourse);
        
        // Update the streaming message with the fallback response
        setMessages(prev => prev ? prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fallbackResponse }
            : msg
        ) : []);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
        setIsProcessing(false);
        setIsStreaming(false);
      }
      
    } catch (error) {
      console.error('Error generating smart question:', error);
      setInputValue("What would you like to learn about today?");
    } finally {
      setIsGeneratingSmartQuestion(false);
    }
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
    <div className="w-full max-w-2xl mx-auto h-screen flex flex-col bg-gradient-to-br from-[#2a2a3d] via-[#323248] to-[#1f1f32] rounded-3xl shadow-[0_35px_80px_-20px_rgba(0,0,0,0.6),0_25px_35px_-8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden backdrop-blur-xl border border-white/15 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl transform hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.7),0_35px_45px_-10px_rgba(0,0,0,0.4)] transition-all duration-700 hover:scale-[1.01]">
      {/* University Chat App Header */}
      <div className="bg-gradient-to-br from-[#3a3a4d] via-[#424254] to-[#353547] px-8 py-12 border-b border-gradient-to-r from-[#4a4a5d] to-[#5a5a6d] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <motion.div 
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-8 shadow-[0_12px_40px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] ring-2 ring-white/30"
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
            <Brain className="w-10 h-10 text-white drop-shadow-lg" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-white drop-shadow-sm bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">Jaifer AI Assistant</h1>
            <p className="text-lg text-white/90 drop-shadow-sm font-medium mb-1">Grade 10 Study Helper</p>
            <p className="text-sm text-white/60 font-mono">ID: {userId ? userId.slice(-8) : 'unknown'}</p>
          </motion.div>
          
          {/* Enhanced Time and Weather Info */}
          <motion.div 
            className="flex flex-col items-center gap-6 mt-8 text-sm text-white/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* Study Statistics Button */}
            <motion.button
              onClick={handleShowStats}
              className="flex items-center gap-3 text-white transition-all duration-300 bg-transparent border-none shadow-none"
              style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-5 h-5 text-purple-300" />
              <span className="font-semibold text-base">Study Stats</span>
            </motion.button>
            
            {/* Smart Question Button */}
            <motion.button
              onClick={generateSmartQuestion}
              disabled={isGeneratingSmartQuestion}
              className="flex items-center gap-3 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none shadow-none"
              style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Generate intelligent follow-up questions based on our conversation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {isGeneratingSmartQuestion ? (
                <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-300" />
              )}
              <span className="font-semibold text-base">Smart Question</span>
            </motion.button>
            <motion.div 
              className="flex items-center gap-3 text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-5 h-5 text-blue-300" />
              </motion.div>
              <span className="font-semibold text-base">{currentTime.toLocaleString('en-US', {
                timeZone: 'Asia/Muscat',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}</span>
            </motion.div>
            {weather && (
              <motion.div 
                className="flex items-center gap-3 text-white"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <CloudSun className="w-5 h-5 text-orange-300" />
                <span className="font-semibold text-base">{weather.temperature}°C {weather.city}</span>
              </motion.div>
            )}
            
            {/* Quick Stats Preview */}
            <motion.div 
              className="flex items-center gap-3 text-white cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={handleShowStats}
              transition={{ duration: 0.2 }}
            >
              <BookOpen className="w-5 h-5 text-emerald-300" />
              <span className="font-semibold text-base">View Progress</span>
            </motion.div>
            
            {/* Voice Features Indicator */}
            <motion.div 
              className="flex items-center gap-3 text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Mic className="w-5 h-5 text-pink-300" />
              <span className="font-semibold text-base">Voice Enabled</span>
            </motion.div>
            
            {/* IQ Test Link */}
            <motion.a
              href="https://iqtestfree.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-white cursor-pointer transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-5 h-5 text-indigo-300" />
              <span className="font-semibold text-base">Take IQ Test</span>
            </motion.a>
          </motion.div>
        </motion.div>
        
        <motion.select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="mt-10 w-full bg-gradient-to-r from-[#4a4a5d] to-[#525264] border border-white/20 rounded-2xl px-6 py-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.45)] hover:bg-gradient-to-r hover:from-[#525264] hover:to-[#5a5a70]"
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
        
        {/* IQ Test Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-white/70 leading-relaxed">
            🧠 <a 
              href="https://iqtestfree.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-300 hover:text-indigo-200 underline transition-colors duration-300 font-medium"
            >
              Take a free IQ test
            </a> to assess your cognitive abilities and track your intellectual growth alongside your study progress!
          </p>
        </motion.div>
      </div>

      {/* Enhanced Chat Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-transparent via-black/5 to-transparent">
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
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-slide-in mb-8`}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}
                layout
              >
                <motion.div
                  className={`text-sm transition-all duration-300 ${
                    message.type === 'user'
                      ? 'text-white rounded-3xl px-5 py-4 shadow-lg'
                      : 'text-white px-4 py-3'
                  }`}
                  style={message.type === 'user' ? { background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 100%)' } : {}}
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
                className="px-4 py-3 text-sm"
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
        className="bg-gradient-to-br from-[#3a3a4d] via-[#424254] to-[#353547] border-t border-white/20 px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_-4px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        {/* Voice Features */}
        <div className="mb-6">
          <VoiceFeatures
            onVoiceInput={handleVoiceInput}
            onToggleListening={handleToggleListening}
            isListening={isListening}
            isProcessing={isProcessing}
            currentMessage={messages.length > 0 ? messages[messages.length - 1]?.content : undefined}
            autoSpeak={autoSpeak}
            onToggleAutoSpeak={handleToggleAutoSpeak}
          />
        </div>
        
        <div className="flex gap-4 items-end">
          <motion.button
            onClick={handleFileAttach}
            className="p-3 text-white/70 hover:text-white transition-all duration-200"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={generateSmartQuestion}
            disabled={isGeneratingSmartQuestion}
            className="p-3 text-white/70 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            title="Generate intelligent follow-up questions based on our conversation"
          >
            {isGeneratingSmartQuestion ? (
              <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-300" />
            )}
          </motion.button>
          
          <div className="flex-1 relative">
            <motion.textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="💭 Type your message..."
              className="w-full bg-gradient-to-r from-[#4a4a5d] to-[#525264] border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 resize-none text-base min-h-[52px] max-h-[140px] shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.45)]"
              rows={1}
              disabled={isLoading}
              whileFocus={{ scale: 1.02 }}
              animate={{ 
                boxShadow: inputValue.trim() ? 
                  "0_8px_25px_rgba(59,130,246,0.25)" : 
                  "0_6px_20px_rgba(0,0,0,0.35)"
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
            className="p-4 bg-gradient-to-r from-[#5865f2] to-[#4752c4] text-white rounded-2xl hover:from-[#4752c4] hover:to-[#3642a8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_8px_25px_rgba(88,101,242,0.35)] hover:shadow-[0_10px_30px_rgba(88,101,242,0.45)] disabled:shadow-[0_6px_20px_rgba(0,0,0,0.25)] border border-blue-300/20"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: inputValue.trim() ? 
                "0_10px_30px_rgba(88,101,242,0.45)" : 
                "0_8px_25px_rgba(88,101,242,0.35)"
            }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ x: inputValue.trim() ? [0, 2, 0] : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Send className="w-6 h-6" />
              </motion.div>
            )}
          </motion.button>
        </div>
        
        <motion.div 
          className="text-sm text-white/60 mt-4 text-center font-medium"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨ Press Shift+Enter for new line • 🎤 Click Voice button to speak • ✨ Click Sparkles for smart questions • AI-powered responses
        </motion.div>
        
        {/* Voice Commands Help */}
        <motion.div 
          className="text-sm text-white/50 mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          💡 Voice Tips: Speak clearly • Use &ldquo;explain&rdquo; or &ldquo;help me with&rdquo; • Ask specific questions
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
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={handleToggleAutoSpeak}
      />
    </div>
  );
}