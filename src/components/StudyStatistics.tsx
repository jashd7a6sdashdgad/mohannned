'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Clock, Calendar, BarChart3, Target, TrendingUp, BookOpen } from 'lucide-react';

interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  subject?: string;
}

interface StudyStats {
  totalTime: number;
  todayTime: number;
  weekTime: number;
  totalSessions: number;
  averageSessionTime: number;
  currentSession?: StudySession;
}

interface StudyStatisticsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: string;
}

export default function StudyStatistics({ isOpen, onClose, selectedCourse }: StudyStatisticsProps) {
  const [stats, setStats] = useState<StudyStats>({
    totalTime: 0,
    todayTime: 0,
    weekTime: 0,
    totalSessions: 0,
    averageSessionTime: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load study data from localStorage
  useEffect(() => {
    const loadStudyData = () => {
      try {
        const savedSessions = localStorage.getItem('jaifer_study_sessions');
        const savedStats = localStorage.getItem('jaifer_study_stats');
        
        if (savedSessions && savedStats) {
          const sessions: StudySession[] = JSON.parse(savedSessions);
          const studyStats: StudyStats = JSON.parse(savedStats);
          
          // Check if there's an active session
          const activeSession = sessions.find(s => !s.endTime);
          if (activeSession) {
            setIsSessionActive(true);
            setSessionStartTime(new Date(activeSession.startTime));
            setStats(prev => ({ ...prev, currentSession: activeSession }));
          } else {
            setStats(studyStats);
          }
        }
      } catch (error) {
        console.error('Error loading study data:', error);
      }
    };

    loadStudyData();
  }, []);

  // Update elapsed time for active session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, sessionStartTime]);

  // Calculate statistics
  const calculateStats = (sessions: StudySession[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const todaySessions = sessions.filter(s => new Date(s.startTime) >= today);
    const weekSessions = sessions.filter(s => new Date(s.startTime) >= weekAgo);
    
    const todayTime = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    const weekTime = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalSessions = sessions.length;
    const averageSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;

    return {
      totalTime,
      todayTime,
      weekTime,
      totalSessions,
      averageSessionTime
    };
  };

  const startSession = () => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      duration: 0,
      subject: selectedCourse
    };

    setIsSessionActive(true);
    setSessionStartTime(new Date());
    setElapsedTime(0);

    // Save to localStorage
    try {
      const savedSessions = localStorage.getItem('jaifer_study_sessions');
      const sessions: StudySession[] = savedSessions ? JSON.parse(savedSessions) : [];
      sessions.push(newSession);
      localStorage.setItem('jaifer_study_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const stopSession = () => {
    if (!sessionStartTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000);

    try {
      const savedSessions = localStorage.getItem('jaifer_study_sessions');
      const sessions: StudySession[] = savedSessions ? JSON.parse(savedSessions) : [];
      
      // Update the active session
      const updatedSessions = sessions.map(s => 
        !s.endTime ? { ...s, endTime, duration } : s
      );
      
      localStorage.setItem('jaifer_study_sessions', JSON.stringify(updatedSessions));
      
      // Update stats
      const newStats = calculateStats(updatedSessions);
      setStats(newStats);
      localStorage.setItem('jaifer_study_stats', JSON.stringify(newStats));
      
    } catch (error) {
      console.error('Error stopping session:', error);
    }

    setIsSessionActive(false);
    setSessionStartTime(null);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimeShort = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  const resetStats = () => {
    if (confirm('Are you sure you want to reset all study statistics? This cannot be undone.')) {
      localStorage.removeItem('jaifer_study_sessions');
      localStorage.removeItem('jaifer_study_stats');
      setStats({
        totalTime: 0,
        todayTime: 0,
        weekTime: 0,
        totalSessions: 0,
        averageSessionTime: 0
      });
      setIsSessionActive(false);
      setSessionStartTime(null);
      setElapsedTime(0);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-[#2a2a3d] via-[#323248] to-[#1f1f32] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Study Statistics</h3>
                    <p className="text-sm text-white/60">Track your learning progress</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {/* Active Session */}
                {isSessionActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-300/30 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Active Session</h4>
                        <p className="text-green-300 text-sm">{selectedCourse || 'General Study'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mono text-green-300">
                          {formatTime(elapsedTime)}
                        </div>
                        <p className="text-green-200/60 text-xs">Elapsed Time</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={stopSession}
                      className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Pause className="w-4 h-4" />
                      Stop Session
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-300/30 rounded-xl p-4"
                  >
                    <div className="text-center">
                      <h4 className="text-white font-medium mb-2">No Active Session</h4>
                      <p className="text-blue-300/60 text-sm mb-4">Start studying to track your progress</p>
                      <motion.button
                        onClick={startSession}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-4 h-4" />
                        Start Session
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
                  >
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatTimeShort(stats.totalTime)}</div>
                    <p className="text-white/60 text-xs">Total Time</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
                  >
                    <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatTimeShort(stats.todayTime)}</div>
                    <p className="text-white/60 text-xs">Today</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
                  >
                    <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatTimeShort(stats.weekTime)}</div>
                    <p className="text-white/60 text-xs">This Week</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center"
                  >
                    <BookOpen className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
                    <p className="text-white/60 text-xs">Sessions</p>
                  </motion.div>
                </div>

                {/* Average Session Time */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Average Session</h4>
                      <p className="text-white/60 text-sm">Your typical study session length</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {formatTimeShort(stats.averageSessionTime)}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Reset Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <button
                    onClick={resetStats}
                    className="text-red-400 hover:text-red-300 text-sm underline transition-colors duration-300"
                  >
                    Reset All Statistics
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
