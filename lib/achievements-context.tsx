import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from './types';

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-word', title: 'Первое слово', description: 'Выучи своё первое слово', icon: '🌱', isUnlocked: false },
  { id: 'ten-words', title: '10 слов', description: 'Выучи 10 слов', icon: '📚', isUnlocked: false },
  { id: 'fifty-words', title: '50 слов', description: 'Выучи 50 слов', icon: '🎓', isUnlocked: false },
  { id: 'first-review', title: 'Первое повторение', description: 'Повтори слова первый раз', icon: '🔄', isUnlocked: false },
  { id: 'streak-3', title: '3 дня подряд', description: 'Учись 3 дня подряд', icon: '🔥', isUnlocked: false },
  { id: 'streak-7', title: 'Неделя', description: 'Учись 7 дней подряд', icon: '⭐', isUnlocked: false },
  { id: 'streak-30', title: 'Месяц', description: 'Учись 30 дней подряд', icon: '🏆', isUnlocked: false },
  { id: 'first-exam', title: 'Первый экзамен', description: 'Пройди первый тест', icon: '📝', isUnlocked: false },
  { id: 'pass-a1', title: 'A1 сдан', description: 'Успешно сдай тест A1', icon: '🎯', isUnlocked: false },
  { id: 'pass-b2', title: 'B2 сдан', description: 'Успешно сдай тест B2', icon: '🌟', isUnlocked: false },
  { id: 'speak-first', title: 'Первая речь', description: 'Попрактикуй произношение', icon: '🗣️', isUnlocked: false },
];

interface AchievementsContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => Promise<void>;
  checkAchievements: (params: {
    wordsLearned?: number;
    streak?: number;
    reviewsDone?: number;
    examsDone?: number;
    examPassed?: boolean;
    examLevel?: string;
    speakingSessions?: number;
  }) => Promise<void>;
  isLoading: boolean;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('achievements');
        if (stored) {
          const unlockedIds: string[] = JSON.parse(stored);
          setAchievements(ACHIEVEMENTS.map(a => ({
            ...a,
            isUnlocked: unlockedIds.includes(a.id),
            unlockedAt: unlockedIds.includes(a.id) ? Date.now() : undefined,
          })));
        }
      } catch (e) {
        console.warn('Error loading achievements:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const unlockAchievement = async (id: string) => {
    setAchievements(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, isUnlocked: true, unlockedAt: Date.now() } : a
      );
      const unlockedIds = updated.filter(a => a.isUnlocked).map(a => a.id);
      AsyncStorage.setItem('achievements', JSON.stringify(unlockedIds)).catch(() => {});
      return updated;
    });
  };

  const checkAchievements = async (params: {
    wordsLearned?: number;
    streak?: number;
    reviewsDone?: number;
    examsDone?: number;
    examPassed?: boolean;
    examLevel?: string;
    speakingSessions?: number;
  }) => {
    const { wordsLearned = 0, streak = 0, reviewsDone = 0, examsDone = 0, examPassed = false, examLevel = '', speakingSessions = 0 } = params;
    const toUnlock: string[] = [];

    if (wordsLearned >= 1) toUnlock.push('first-word');
    if (wordsLearned >= 10) toUnlock.push('ten-words');
    if (wordsLearned >= 50) toUnlock.push('fifty-words');
    if (streak >= 3) toUnlock.push('streak-3');
    if (streak >= 7) toUnlock.push('streak-7');
    if (streak >= 30) toUnlock.push('streak-30');
    if (reviewsDone >= 1) toUnlock.push('first-review');
    if (examsDone >= 1) toUnlock.push('first-exam');
    if (examPassed && examLevel === 'A1') toUnlock.push('pass-a1');
    if (examPassed && examLevel === 'B2') toUnlock.push('pass-b2');
    if (speakingSessions >= 1) toUnlock.push('speak-first');

    for (const id of toUnlock) {
      const achievement = achievements.find(a => a.id === id);
      if (achievement && !achievement.isUnlocked) {
        await unlockAchievement(id);
      }
    }
  };

  return (
    <AchievementsContext.Provider value={{ achievements, unlockAchievement, checkAchievements, isLoading }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) throw new Error('useAchievements must be used within AchievementsProvider');
  return context;
}
