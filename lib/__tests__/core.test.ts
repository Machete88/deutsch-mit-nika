import { describe, it, expect } from 'vitest';
import { vocabularyData, vocabularyDataExtra, learningSets, getWordsByUserLevel, getWordsByCEFR } from '../vocabulary-data';
import { examQuestions, getExamQuestionsByLevel } from '../vocabulary-data-extended';

describe('Vocabulary Data', () => {
  it('vocabularyData hat Woerter', () => {
    expect(vocabularyData.length).toBeGreaterThan(50);
  });

  it('vocabularyDataExtra hat Woerter', () => {
    expect(vocabularyDataExtra.length).toBeGreaterThan(30);
  });

  it('learningSets sind vorhanden', () => {
    expect(learningSets.length).toBeGreaterThan(5);
  });

  it('getWordsByUserLevel beginner gibt beginner-Woerter zurueck', () => {
    const words = getWordsByUserLevel('beginner');
    expect(words.length).toBeGreaterThan(0);
    expect(words.every(w => w.minUserLevel === 'beginner')).toBe(true);
  });

  it('getWordsByCEFR A1 gibt nur A1-Woerter zurueck', () => {
    const words = getWordsByCEFR('A1');
    expect(words.length).toBeGreaterThan(0);
    expect(words.every(w => w.cefrLevel === 'A1')).toBe(true);
  });

  it('alle Woerter haben erforderliche Felder', () => {
    const allWords = [...vocabularyData, ...vocabularyDataExtra];
    allWords.forEach(w => {
      expect(w.id).toBeTruthy();
      expect(w.german).toBeTruthy();
      expect(w.russian).toBeTruthy();
      expect(w.cefrLevel).toBeTruthy();
    });
  });
});

describe('Exam Questions', () => {
  it('Exam-Fragen sind vorhanden', () => {
    expect(examQuestions.length).toBeGreaterThan(10);
  });

  it('getExamQuestionsByLevel A1 gibt A1-Fragen zurueck', () => {
    const questions = getExamQuestionsByLevel('A1');
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every(q => q.cefrLevel === 'A1')).toBe(true);
  });

  it('alle Exam-Fragen haben correctAnswer', () => {
    examQuestions.forEach(q => {
      expect(q.correctAnswer).toBeTruthy();
      if (q.options) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
