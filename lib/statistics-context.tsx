import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStats, SessionLog } from './types';

interface StatisticsContextType {
  stats: UserStats;
  sessionLogs: SessionLog[];
  recordSession: (log: Omit<SessionLog, 'id'>) => Promise<void>;
  updateStreak: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_STATS: UserStats = {
  totalWordsLearned: 0,
  totalWordsReviewed: 0,
  totalSpeakingSessions: 0,
  currentStreak: 0,
  averageReviewAccuracy: 0,
};

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export function StatisticsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const storedStats = await AsyncStorage.getItem('user_stats');
        if (storedStats) setStats(JSON.parse(storedStats));
        const storedLogs = await AsyncStorage.getItem('session_logs');
        if (storedLogs) setSessionLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.warn('Error loading statistics:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const recordSession = async (log: Omit<SessionLog, 'id'>) => {
    const newLog: SessionLog = { ...log, id: Date.now().toString() };
    const newLogs = [...sessionLogs, newLog].slice(-100);
    setSessionLogs(newLogs);
    await AsyncStorage.setItem('session_logs', JSON.stringify(newLogs));

    const newStats = { ...stats };
    if (log.type === 'learn') newStats.totalWordsLearned += log.wordsSeen;
    if (log.type === 'review') {
      newStats.totalWordsReviewed += log.wordsSeen;
      if (log.successRate !== undefined) {
        newStats.averageReviewAccuracy = (newStats.averageReviewAccuracy + log.successRate) / 2;
      }
    }
    if (log.type === 'speak') newStats.totalSpeakingSessions += 1;
    setStats(newStats);
    await AsyncStorage.setItem('user_stats', JSON.stringify(newStats));
  };

  const updateStreak = async () => {
    const today = new Date().toDateString();
    const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = stats.currentStreak;
    if (lastActivity === today) return;
    if (lastActivity === yesterday) {
      newStreak += 1;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }

    const newStats = { ...stats, currentStreak: newStreak, lastActivityDate: Date.now() };
    setStats(newStats);
    await AsyncStorage.setItem('user_stats', JSON.stringify(newStats));
  };

  return (
    <StatisticsContext.Provider value={{ stats, sessionLogs, recordSession, updateStreak, isLoading }}>
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (!context) throw new Error('useStatistics must be used within StatisticsProvider');
  return context;
}
