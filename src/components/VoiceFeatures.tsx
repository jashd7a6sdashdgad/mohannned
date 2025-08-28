'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2, Pause } from 'lucide-react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface VoiceFeaturesProps {
  onVoiceInput: (text: string) => void;
  onToggleListening: (isListening: boolean) => void;
  isListening: boolean;
  isProcessing: boolean;
  currentMessage?: string;
  autoSpeak: boolean;
  onToggleAutoSpeak: (enabled: boolean) => void;
}

export default function VoiceFeatures({ 
  onVoiceInput, 
  onToggleListening, 
  isListening, 
  isProcessing,
  currentMessage,
  autoSpeak,
  onToggleAutoSpeak
}: VoiceFeaturesProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      // Check for Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechSynth = window.speechSynthesis;
      
      if (SpeechRecognition && speechSynth) {
        setIsSupported(true);
        setSpeechSynthesis(speechSynth);
        
        // Initialize Speech Recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Can be made configurable
        
        recognition.onstart = () => {
          onToggleListening(true);
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          onVoiceInput(transcript);
          onToggleListening(false);
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          onToggleListening(false);
        };
        
        recognition.onend = () => {
          onToggleListening(false);
        };
        
        setRecognition(recognition);
        recognitionRef.current = recognition;
      }
    };

    checkSupport();
  }, [onVoiceInput, onToggleListening]);

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthesis || !text) return;

    // Stop any current speech
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeaking = () => {
    if (currentMessage) {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        speakText(currentMessage);
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <p className="text-white/60 text-sm">
          Voice features are not supported in your browser.
          <br />
          Please use Chrome, Edge, or Safari for voice functionality.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Voice Input Button */}
      <motion.button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        whileHover={{ scale: isListening ? 1.05 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
          boxShadow: isListening 
            ? "0 0 20px rgba(239, 68, 68, 0.5)" 
            : "0 4px 12px rgba(59, 130, 246, 0.3)"
        }}
        transition={{
          scale: { duration: 0.5, repeat: isListening ? Infinity : 0 },
          boxShadow: { duration: 0.3 }
        }}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5" />
            <span className="text-sm font-medium">Stop</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span className="text-sm font-medium">Voice</span>
          </>
        )}
      </motion.button>

      {/* Auto-Speak Toggle */}
      <motion.button
        onClick={() => onToggleAutoSpeak(!autoSpeak)}
        className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
          autoSpeak
            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg'
            : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
      >
        <Volume2 className={`w-5 h-5 ${autoSpeak ? 'text-white' : 'text-white/70'}`} />
        <span className="text-sm font-medium">{autoSpeak ? 'Auto' : 'Auto'}</span>
      </motion.button>

      {/* Voice Output Button */}
      {currentMessage && (
        <motion.button
          onClick={toggleSpeaking}
          className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            isSpeaking
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: isSpeaking ? [1, 1.05, 1] : 1,
            boxShadow: isSpeaking 
              ? "0 0 20px rgba(34, 197, 94, 0.5)" 
              : "0 4px 12px rgba(34, 197, 94, 0.3)"
          }}
          transition={{
            scale: { duration: 0.8, repeat: isSpeaking ? Infinity : 0 },
            boxShadow: { duration: 0.3 }
          }}
        >
          {isSpeaking ? (
            <>
              <Pause className="w-5 h-5" />
              <span className="text-sm font-medium">Stop</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span className="text-sm font-medium">Listen</span>
            </>
          )}
        </motion.button>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-white/60"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Processing...</span>
        </motion.div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-red-400"
        >
          <div className="flex gap-1">
            <motion.div
              className="w-2 h-2 bg-red-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-red-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-red-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span className="text-xs font-medium">Listening...</span>
        </motion.div>
      )}
    </div>
  );
}
