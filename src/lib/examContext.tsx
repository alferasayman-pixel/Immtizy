import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Lesson, Question } from '../types';

interface ExamState {
  lesson: Lesson;
  timeLeft: number;
  maxTime: number;
  idx: number;
  score: number;
  answered: boolean;
  selected: number | null;
  subject: string;
  term: string;
  unit: string;
}

interface ExamContextType {
  exam: ExamState | null;
  startExam: (lesson: Lesson, subject: string, term: string, unit: string) => void;
  closeExam: () => void;
  chooseAnswer: (choice: number) => void;
  nextQuestion: () => void;
  restartExam: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [exam, setExam] = useState<ExamState | null>(null);
  const timerRef = useRef<number | null>(null);

  const startExam = useCallback((lesson: Lesson, subject: string, term: string, unit: string) => {
    setExam({
      lesson,
      timeLeft: lesson.time,
      maxTime: lesson.time,
      idx: 0,
      score: 0,
      answered: false,
      selected: null,
      subject,
      term,
      unit
    });

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setExam(prev => {
        if (!prev || prev.timeLeft <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, []);

  const closeExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExam(null);
  }, []);

  const chooseAnswer = useCallback((choice: number) => {
    setExam(prev => {
      if (!prev || prev.answered) return prev;
      const correct = prev.lesson.q[prev.idx].c;
      return {
        ...prev,
        answered: true,
        selected: choice,
        score: choice === correct ? prev.score + 1 : prev.score
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setExam(prev => {
      if (!prev || !prev.answered) return prev;
      if (prev.idx < prev.lesson.q.length - 1) {
        return {
          ...prev,
          idx: prev.idx + 1,
          answered: false,
          selected: null
        };
      }
      // End of exam logic handled by component or by setting a finished flag
      return prev;
    });
  }, []);

  const restartExam = useCallback(() => {
    if (!exam) return;
    startExam(exam.lesson, exam.subject, exam.term, exam.unit);
  }, [exam, startExam]);

  return (
    <ExamContext.Provider value={{ exam, startExam, closeExam, chooseAnswer, nextQuestion, restartExam }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within ExamProvider');
  return context;
}
