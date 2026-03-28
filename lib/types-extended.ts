export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type QuestionType = 'multiple-choice' | 'matching' | 'fill-blank' | 'listening';

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  cefrLevel: CEFRLevel;
  russian: string;
  german: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  category?: string;
  /** Nur für type='listening': Der deutsche Text der vorgelesen wird */
  audioText?: string;
}

export interface ExamAnswerDetail {
  questionId: string;
  prompt: string;
  expectedAnswer: string;
  userAnswer: string;
  correct: boolean;
  explanation?: string;
}

export interface ExamSession {
  id: string;
  cefrLevel: CEFRLevel;
  startedAt: number;
  endedAt?: number;
  questions: ExamQuestion[];
  answers: Map<string, string>;
  score?: number;
  passed?: boolean;
  durationSeconds?: number;
  expiresAt?: number;
}

export interface ExamResult {
  id: string;
  cefrLevel: CEFRLevel;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: number;
  certificateUrl?: string;
  certificateNumber?: string;
  durationSeconds?: number;
  recommendation?: string;
  answerDetails?: ExamAnswerDetail[];
}

export interface UserCertificate {
  id: string;
  cefrLevel: CEFRLevel;
  issuedAt: number;
  expiresAt?: number;
  score: number;
  certificateNumber: string;
}
