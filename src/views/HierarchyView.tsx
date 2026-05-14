import React from 'react';
import { useApp } from '../lib/appContext';
import { useExam } from '../lib/examContext';
import { useAuth } from '../lib/authContext';
import { Icon } from '../components/Icon';
import { FileText, Clock, Edit3, Lock, ShoppingBag } from 'lucide-react';
import { getLessonId, cn } from '../lib/utils';

export default function HierarchyView() {
  const { subject, pushNav, systemKey, stage, grade, getEffectiveQuestions, getEffectiveLessonName, overrides, purchases } = useApp();
  const { startExam } = useExam();
  const { isAdmin } = useAuth();

  if (!subject || !systemKey || !stage || !grade) return null;

  return (
    <div className="space-y-4 pb-10">
      <div className="e-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${subject.bg} ${subject.color} flex items-center justify-center`}>
            <Icon name={subject.icon} size={24} />
          </div>
          <div>
            <div className="text-lg font-black">{subject.name}</div>
            <div className="text-[11px] text-slate-400 font-black">كل درس = اختبار بمؤقّت</div>
          </div>
        </div>
        <button 
          className="btn btn-primary text-sm px-4 py-3" 
          onClick={() => pushNav('store', 'المتجر')}
        >
          <FileText size={16} /> PDF
        </button>
      </div>

      {subject.units.map((term, tIdx) => (
        <div key={tIdx} className="e-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-slate-800">{term.name}</div>
              <div className="text-[11px] text-slate-400 font-black mt-1">{term.chapters.length} وحدات</div>
            </div>
            <span className="pill">{term.term === "t1" ? "T1" : "T2"}</span>
          </div>
          <div className="mt-4 space-y-4">
            {term.chapters.map((u, uIdx) => (
              <div key={uIdx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-black text-slate-800 text-sm">{u.title}</div>
                  <span className="pill">{u.lessons.length} اختبارات</span>
                </div>
                <div className="space-y-2">
                  {u.lessons.map((l, lIdx) => {
                    const lId = getLessonId(systemKey, stage.id, grade.id, subject.name, term.term, u.title, l.name);
                    const override = overrides[lId];
                    const effectiveQuestions = getEffectiveQuestions(lId, l.q);
                    const lName = getEffectiveLessonName(lId, l.name);
                    const lessonWithEffectiveQ = { ...l, name: lName, q: effectiveQuestions, examCount: effectiveQuestions.length };

                    const requiredProductId = override?.requiredProductId;
                    const isLocked = !isAdmin && requiredProductId && !purchases.has(requiredProductId);

                    return (
                      <div key={lIdx} className={cn(
                        "flex items-center justify-between rounded-2xl px-3 py-3 border transition-all",
                        isLocked ? "bg-slate-50 border-slate-100 opacity-80" : "bg-white border-slate-100"
                      )}>
                        <div className="min-w-0 pr-2">
                          <div className="text-[12px] font-black text-slate-700 truncate flex items-center gap-2">
                            {isLocked && <Lock size={12} className="text-slate-400" />}
                            {lName}
                            {isAdmin && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  pushNav('admin', 'الإدارة');
                                }} 
                                className="text-primary hover:scale-110 transition"
                              >
                                <Edit3 size={12} />
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] font-black text-slate-400 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            <span>{Math.floor(l.time / 60)} دقيقة • {lessonWithEffectiveQ.examCount} أسئلة</span>
                          </div>
                        </div>
                        {isLocked ? (
                          <button 
                            className="btn btn-ghost text-primary text-[10px] px-3 py-2 shrink-0 border-primary/20 flex items-center gap-1"
                            onClick={() => pushNav('store', 'المتجر')}
                          >
                            <ShoppingBag size={12} /> اشتري لفتح الاختبار
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary text-xs px-4 py-2 shrink-0" 
                            onClick={() => startExam(lessonWithEffectiveQ, subject.name, term.name, u.title)}
                          >
                            ابدأ
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
