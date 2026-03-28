import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word } from './types';

interface WordReview {
  wordId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: number;
  lastReviewDate: number;
}

interface ReviewSession {
  id: string;
  words: Word[];
  currentIndex: number;
  answers: Map<string, boolean>;
  startedAt: number;
}

interface SpacedRepetitionContextType {
  reviews: Map<string, WordReview>;
  currentSession: ReviewSession | null;
  getDueWords: (words: Word[]) => Word[];
  startReviewSession: (words: Word[]) => Promise<void>;
  recordReview: (wordId: string, correct: boolean) => Promise<void>;
  advanceSession: () => void;
  completeSession: () => Promise<{ correct: number; total: number }>;
  isLoading: boolean;
}

const SpacedRepetitionContext = createContext<SpacedRepetitionContextType | undefined>(undefined);

function calculateNextReview(current: WordReview, correct: boolean): WordReview {
  if (correct) {
    const reps = current.repetitions + 1;
    let interval = current.interval;
    let ef = current.easeFactor;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * ef);
    ef = Math.max(1.3, ef + 0.1);
    return { ...current, repetitions: reps, interval, easeFactor: ef, nextReviewDate: Date.now() + interval * 86400000, lastReviewDate: Date.now() };
  } else {
    return { ...current, repetitions: 0, interval: 1, easeFactor: Math.max(1.3, current.easeFactor - 0.2), nextReviewDate: Date.now() + 86400000, lastReviewDate: Date.now() };
  }
}

export function SpacedRepetitionProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Map<string, WordReview>>(new Map());
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('spaced_repetition_reviews');
        if (stored) {
          const parsed = JSON.parse(stored);
          setReviews(new Map(Object.entries(parsed) as [string, WordReview][]));
        }
      } catch (e) {
        console.warn('Error loading reviews:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getDueWords = (words: Word[]): Word[] => {
    const now = Date.now();
    return words.filter(w => {
      const r = reviews.get(w.id);
      return !r || r.nextReviewDate <= now;
    });
  };

  const startReviewSession = async (words: Word[]) => {
    const due = getDueWords(words);
    if (due.length === 0) return;
    setCurrentSession({
      id: `session-${Date.now()}`,
      words: due.sort(() => Math.random() - 0.5),
      currentIndex: 0,
      answers: new Map(),
      startedAt: Date.now(),
    });
  };

  const recordReview = async (wordId: string, correct: boolean) => {
    if (!currentSession) return;
    const updated = { ...currentSession, answers: new Map(currentSession.answers).set(wordId, correct) };
    setCurrentSession(updated);
    const current = reviews.get(wordId) || { wordId, interval: 0, easeFactor: 2.5, repetitions: 0, nextReviewDate: Date.now(), lastReviewDate: 0 };
    const newReview = calculateNextReview(current, correct);
    const newReviews = new Map(reviews);
    newReviews.set(wordId, newReview);
    setReviews(newReviews);
    await AsyncStorage.setItem('spaced_repetition_reviews', JSON.stringify(Object.fromEntries(newReviews)));
  };

  const advanceSession = () => {
    if (!currentSession) return;
    setCurrentSession({ ...currentSession, currentIndex: currentSession.currentIndex + 1 });
  };

  const completeSession = async (): Promise<{ correct: number; total: number }> => {
    if (!currentSession) return { correct: 0, total: 0 };
    let correctCount = 0;
    for (const [, correct] of currentSession.answers) {
      if (correct) correctCount++;
    }
    setCurrentSession(null);
    return { correct: correctCount, total: currentSession.answers.size };
  };

  return (
    <SpacedRepetitionContext.Provider value={{ reviews, currentSession, getDueWords, startReviewSession, recordReview, advanceSession, completeSession, isLoading }}>
      {children}
    </SpacedRepetitionContext.Provider>
  );
}

export function useSpacedRepetition() {
  const context = useContext(SpacedRepetitionContext);
  if (!context) throw new Error('useSpacedRepetition must be used within SpacedRepetitionProvider');
  return context;
}
