import React from 'react';
import { useApp } from '../lib/appContext';
import { ChartLine, History, Award, CheckCircle2 } from 'lucide-react';

import { cn } from '../lib/utils';

export default function DashboardView() {
  const { examHistory } = useApp();

  const stats = {
    total: examHistory.length,
    avg: examHistory.length ? Math.round(examHistory.reduce((a, b) => a + b.pct, 0) / examHistory.length) : 0,
    best: examHistory.length ? Math.max(...examHistory.map(x => x.pct)) : 0
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-4">
        <h2 className="text-2xl font-black text-slate-800">لوحة المتابعة</h2>
        <p className="text-sm text-slate-400 font-black">إحصاءات تقدمك المحلي</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="e-card p-5 border-b-4 border-primary">
          <ChartLine className="text-primary mb-2" size={24} />
          <div className="text-2xl font-black">{stats.total}</div>
          <div className="text-[10px] text-slate-400 font-black">اختبارات مكتملة</div>
        </div>
        <div className="e-card p-5 border-b-4 border-blue-500">
          <Award className="text-blue-500 mb-2" size={24} />
          <div className="text-2xl font-black">{stats.avg}%</div>
          <div className="text-[10px] text-slate-400 font-black">متوسط الأداء</div>
        </div>
      </div>

      <div className="e-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-black text-slate-800">آخر النتائج</div>
          <History className="text-slate-400" size={18} />
        </div>
        
        <div className="space-y-3">
          {examHistory.length === 0 ? (
            <div className="text-center text-slate-400 py-6 text-sm">ليس لديك سجل اختبارات بعد.</div>
          ) : (
            examHistory.map((item, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-black text-sm text-slate-800">{item.lesson}</div>
                  <div className={cn("text-sm font-black", item.pct >= 70 ? "text-primary" : "text-amber-600")}>
                    {item.pct}%
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-black flex items-center gap-2">
                  <span>{item.subject}</span>
                  <span>•</span>
                  <span>{new Date(item.date).toLocaleDateString('ar-KW')}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", item.pct >= 70 ? "bg-primary" : "bg-amber-500")}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
