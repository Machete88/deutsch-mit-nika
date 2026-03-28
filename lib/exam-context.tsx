import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CEFRLevel, ExamSession, ExamResult, UserCertificate, ExamAnswerDetail } from './types-extended';
import { getExamQuestionsByLevel } from './vocabulary-data-extended';

interface ExamContextType {
  currentSession: ExamSession | null;
  examResults: ExamResult[];
  certificates: UserCertificate[];
  startExam: (level: CEFRLevel) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  completeExam: () => Promise<ExamResult | null>;
  getResultsByLevel: (level: CEFRLevel) => ExamResult[];
  isLoading: boolean;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const EXAM_DURATION: Record<CEFRLevel, number> = { A1: 8 * 60, A2: 10 * 60, B1: 12 * 60, B2: 14 * 60 };

function getRecommendation(level: CEFRLevel, score: number): string {
  if (score >= 90) return `Отличный результат на уровне ${level}! Можно переходить к следующему уровню.`;
  if (score >= 70) return `Хороший результат на уровне ${level}. Повтори ошибки и закрепи грамматику.`;
  return `Продолжай тренировать словарный запас уровня ${level}. Попробуй снова после 1–2 занятий.`;
}

export function ExamProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(null);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const storedResults = await AsyncStorage.getItem('exam_results');
        if (storedResults) setExamResults(JSON.parse(storedResults));
        const storedCerts = await AsyncStorage.getItem('user_certificates');
        if (storedCerts) setCertificates(JSON.parse(storedCerts));
      } catch (e) {
        console.warn('Error loading exam data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const startExam = async (level: CEFRLevel) => {
    const questions = [...getExamQuestionsByLevel(level)].sort(() => Math.random() - 0.5);
    const durationSeconds = EXAM_DURATION[level];
    setCurrentSession({
      id: `exam-${Date.now()}`,
      cefrLevel: level,
      startedAt: Date.now(),
      questions,
      answers: new Map(),
      durationSeconds,
      expiresAt: Date.now() + durationSeconds * 1000,
    });
  };

  const submitAnswer = async (questionId: string, answer: string) => {
    if (!currentSession) return;
    setCurrentSession({
      ...currentSession,
      answers: new Map(currentSession.answers).set(questionId, answer),
    });
  };

  const completeExam = async (): Promise<ExamResult | null> => {
    if (!currentSession) return null;
    let correctCount = 0;
    const totalQuestions = currentSession.questions.length;
    const answerDetails: ExamAnswerDetail[] = currentSession.questions.map(q => {
      const userAnswer = currentSession.answers.get(q.id) ?? '';
      const correct = userAnswer === q.correctAnswer;
      if (correct) correctCount++;
      return { questionId: q.id, prompt: q.russian, expectedAnswer: q.correctAnswer, userAnswer, correct, explanation: q.explanation };
    });
    const score = Math.round((correctCount / Math.max(totalQuestions, 1)) * 100);
    const passed = score >= 70;
    const certNumber = `CERT-${currentSession.cefrLevel}-${Date.now()}`;
    const result: ExamResult = {
      id: `result-${Date.now()}`,
      cefrLevel: currentSession.cefrLevel,
      score,
      passed,
      totalQuestions,
      correctAnswers: correctCount,
      completedAt: Date.now(),
      certificateNumber: passed ? certNumber : undefined,
      durationSeconds: Math.round((Date.now() - currentSession.startedAt) / 1000),
      recommendation: getRecommendation(currentSession.cefrLevel, score),
      answerDetails,
    };
    const newResults = [...examResults, result];
    setExamResults(newResults);
    await AsyncStorage.setItem('exam_results', JSON.stringify(newResults));
    if (passed) {
      const cert: UserCertificate = { id: `cert-${Date.now()}`, cefrLevel: currentSession.cefrLevel, issuedAt: Date.now(), score, certificateNumber: certNumber };
      const newCerts = [...certificates, cert];
      setCertificates(newCerts);
      await AsyncStorage.setItem('user_certificates', JSON.stringify(newCerts));
    }
    setCurrentSession(null);
    return result;
  };

  const getResultsByLevel = (level: CEFRLevel) => examResults.filter(r => r.cefrLevel === level);

  return (
    <ExamContext.Provider value={{ currentSession, examResults, certificates, startExam, submitAnswer, completeExam, getResultsByLevel, isLoading }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within ExamProvider');
  return context;
}
