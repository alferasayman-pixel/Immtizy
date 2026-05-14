import React from 'react';
import { useExam } from '../lib/examContext';
import { useApp } from '../lib/appContext';
import { X, Clock, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTime, cn } from '../lib/utils';

export default function ExamOverlay() {
  const { exam, closeExam, chooseAnswer, nextQuestion, restartExam } = useExam();
  const { addExamResult } = useApp();

  if (!exam) return null;

  const q = exam.lesson.q[exam.idx];
  const isLastQuestion = exam.idx === exam.lesson.q.length - 1;

  const handleFinish = () => {
    const total = exam.lesson.q.length;
    const pct = Math.round((exam.score / total) * 100);
    
    addExamResult({
      date: new Date().toISOString(),
      subject: exam.subject,
      lesson: exam.lesson.name,
      unit: exam.unit,
      score: exam.score,
      total,
      pct,
      timeout: exam.timeLeft <= 0,
      timeSpent: exam.maxTime - exam.timeLeft
    });

    closeExam();
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-5 py-4 flex items-center justify-between shadow-lg">
        <button onClick={closeExam} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="text-sm font-black truncate max-w-[150px]">{exam.lesson.name}</div>
          <div className="text-[11px] text-white/70 font-black">{exam.subject}</div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
          <Clock size={16} />
          <span className="font-black font-mono">{formatTime(exam.timeLeft)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
        <div className="e-card p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-black">السؤال</div>
            <div className="text-sm font-black text-slate-800">{exam.idx + 1}/{exam.lesson.q.length}</div>
          </div>
          <div className="text-lg font-black text-slate-800 mt-3 leading-relaxed">{q.q}</div>
        </div>

        <div className="space-y-3">
          {q.a.map((txt, i) => {
            const isSelected = exam.selected === i;
            const isCorrect = q.c === i;
            const showCorrect = exam.answered && isCorrect;
            const showWrong = exam.answered && isSelected && !isCorrect;

            return (
              <button
                key={i}
                disabled={exam.answered}
                onClick={() => chooseAnswer(i)}
                className={cn(
                  "e-card p-4 w-full text-right font-black transition-all border-2",
                  !exam.answered && "hover:border-slate-200 border-transparent",
                  showCorrect && "bg-green-50 border-green-500 text-green-700",
                  showWrong && "bg-red-50 border-red-500 text-red-700",
                  exam.answered && !showCorrect && !showWrong && "opacity-50 border-transparent"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{txt}</span>
                  <Circle size={16} className={cn(!exam.answered && "text-slate-300", showCorrect && "text-green-500", showWrong && "text-red-500")} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 border-t border-slate-100 bg-white shadow-up">
        <button 
          disabled={!exam.answered}
          onClick={isLastQuestion ? handleFinish : nextQuestion}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {isLastQuestion ? "إنهاء الاختبار" : "السؤال التالي"}
        </button>
        <button className="btn btn-ghost w-full mt-2" onClick={restartExam}>إعادة الاختبار</button>
      </div>
    </div>
  );
}
