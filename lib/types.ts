/**
 * Typen-Definitionen für DEUTSCH LERNEN App
 */

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type LastResult = 'easy' | 'normal' | 'hard';
export type PartOfSpeech = 'verb' | 'noun' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun' | 'article' | 'phrase';
export type Gender = 'der' | 'die' | 'das' | null;
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type FontSizeLevel = 'small' | 'normal' | 'large';

export interface Example {
  de: string;
  ru: string;
}

export interface Word {
  id: string;
  russian: string;
  german: string;
  ipa: string;
  partOfSpeech: PartOfSpeech;
  gender: Gender;
  examples: Example[];
  category: string;
  difficulty: Difficulty;
  minUserLevel: UserLevel;
  cefrLevel?: CEFRLevel;
}

export interface LearningSet {
  id: string;
  name: string;
  description: string;
  category: string;
  wordCount: number;
  difficulty: Difficulty;
  minUserLevel: UserLevel;
  icon?: string;
}

export interface UserWordState {
  wordId: string;
  nextReview: number;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastResult: LastResult;
  lastReviewDate?: number;
  createdAt: number;
}

export interface SessionLog {
  id: string;
  type: 'learn' | 'review' | 'speak';
  startedAt: number;
  endedAt?: number;
  wordsSeen: number;
  successRate?: number;
  category?: string;
}

export interface UserStats {
  totalWordsLearned: number;
  totalWordsReviewed: number;
  totalSpeakingSessions: number;
  currentStreak: number;
  lastActivityDate?: number;
  averageReviewAccuracy: number;
}

export interface AppSettings {
  userLevel: UserLevel;
  fontSizeLevel: FontSizeLevel;
  isDarkMode: boolean;
  hasCompletedOnboarding: boolean;
  language: 'ru' | 'de';
  userName?: string;
  accessibilityMode: boolean;
  accessibilityHighContrast: boolean;
  accessibilityAutoTTS: boolean;
  accessibilityLargeTargets: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  isUnlocked: boolean;
}

export interface ExamQuestion {
  id: string;
  type: 'multiple-choice' | 'matching' | 'fill-blank' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  cefrLevel: CEFRLevel;
  section: 'reading' | 'listening' | 'writing' | 'speaking';
}

export interface ExamResult {
  id: string;
  cefrLevel: CEFRLevel;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: number;
  answers: Array<{ questionId: string; answer: string | number; correct: boolean }>;
}

export interface GrammarRule {
  id: string;
  title: string;
  explanation: string;
  examples: Example[];
  category: string;
  cefrLevel: CEFRLevel;
}

export interface SentenceBuilderExercise {
  id: string;
  words: string[];
  correctOrder: number[];
  translation: string;
  difficulty: Difficulty;
}
