import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, UserWordState, LearningSet, LastResult } from './types';
import { vocabularyData, vocabularyDataExtra, learningSets, getWordsByUserLevel } from './vocabulary-data';
import { useSettings } from './settings-context';

interface VocabularyContextType {
  words: Word[];
  learningSets: LearningSet[];
  userWordStates: Map<string, UserWordState>;
  currentSet: LearningSet | null;
  setCurrentSet: (set: LearningSet | null) => Promise<void>;
  recordWordResult: (wordId: string, result: LastResult) => Promise<void>;
  getWordsForReview: () => Word[];
  getNewWords: (count: number) => Word[];
  getWordsByCategory: (category: string) => Word[];
  isLoading: boolean;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [words, setWords] = useState<Word[]>([]);
  const [userWordStates, setUserWordStates] = useState<Map<string, UserWordState>>(new Map());
  const [currentSet, setCurrentSetState] = useState<LearningSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const allWords = [...vocabularyData, ...vocabularyDataExtra];
        const filteredWords = allWords.filter(w => {
          if (settings.userLevel === 'beginner') return w.minUserLevel === 'beginner';
          if (settings.userLevel === 'intermediate') return w.minUserLevel === 'beginner' || w.minUserLevel === 'intermediate';
          return true;
        });
        setWords(filteredWords);
        const stored = await AsyncStorage.getItem('user_word_states');
        if (stored) {
          const parsed = JSON.parse(stored) as Array<[string, UserWordState]>;
          setUserWordStates(new Map(parsed));
        }
        const storedSet = await AsyncStorage.getItem('current_learning_set');
        if (storedSet) {
          const set = learningSets.find(s => s.id === storedSet);
          setCurrentSetState(set || null);
        }
      } catch (error) {
        console.warn('Error loading vocabulary:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVocabulary();
  }, [settings.userLevel]);

  const setCurrentSet = async (set: LearningSet | null) => {
    setCurrentSetState(set);
    if (set) {
      await AsyncStorage.setItem('current_learning_set', set.id);
    } else {
      await AsyncStorage.removeItem('current_learning_set');
    }
  };

  const recordWordResult = async (wordId: string, result: LastResult) => {
    const now = Date.now();
    const existing = userWordStates.get(wordId);
    let newState: UserWordState;

    if (!existing) {
      newState = {
        wordId,
        nextReview: now + (result === 'easy' ? 86400000 : result === 'normal' ? 43200000 : 0),
        intervalDays: result === 'easy' ? 1 : result === 'normal' ? 0.5 : 0,
        easeFactor: result === 'easy' ? 2.5 : result === 'normal' ? 2.3 : 2.0,
        repetitions: result === 'easy' ? 1 : 0,
        lapses: result === 'hard' ? 1 : 0,
        lastResult: result,
        lastReviewDate: now,
        createdAt: now,
      };
    } else {
      let ef = existing.easeFactor;
      let interval = existing.intervalDays;
      let reps = existing.repetitions;
      let lapses = existing.lapses;

      if (result === 'hard') {
        ef = Math.max(1.3, ef - 0.2);
        interval = 0;
        lapses += 1;
        reps = 0;
      } else if (result === 'normal') {
        ef = Math.max(1.3, ef - 0.05);
        interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(interval * ef);
        reps += 1;
      } else {
        ef = Math.min(3.0, ef + 0.1);
        interval = reps === 0 ? 1 : reps === 1 ? 4 : Math.round(interval * ef);
        reps += 1;
      }

      newState = {
        ...existing,
        nextReview: now + interval * 86400000,
        intervalDays: interval,
        easeFactor: ef,
        repetitions: reps,
        lapses,
        lastResult: result,
        lastReviewDate: now,
      };
    }

    const newStates = new Map(userWordStates);
    newStates.set(wordId, newState);
    setUserWordStates(newStates);
    await AsyncStorage.setItem('user_word_states', JSON.stringify(Array.from(newStates.entries())));
  };

  const getWordsForReview = (): Word[] => {
    const now = Date.now();
    return words.filter(w => {
      const state = userWordStates.get(w.id);
      return state && state.nextReview <= now;
    });
  };

  const getNewWords = (count: number): Word[] => {
    return words.filter(w => !userWordStates.has(w.id)).slice(0, count);
  };

  const getWordsByCategory = (category: string): Word[] => {
    return words.filter(w => w.category === category);
  };

  return (
    <VocabularyContext.Provider value={{
      words,
      learningSets,
      userWordStates,
      currentSet,
      setCurrentSet,
      recordWordResult,
      getWordsForReview,
      getNewWords,
      getWordsByCategory,
      isLoading,
    }}>
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (!context) throw new Error('useVocabulary must be used within VocabularyProvider');
  return context;
}
