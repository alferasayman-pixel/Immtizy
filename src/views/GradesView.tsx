import React from 'react';
import { useApp } from '../lib/appContext';

export default function GradesView() {
  const { stage, setGrade, setStream, pushNav } = useApp();

  if (!stage) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <h2 className="col-span-2 text-2xl font-black mb-2 px-2">اختر الصف</h2>
      {stage.grades.map(g => (
        <div 
          key={g.id}
          onClick={() => {
            setGrade(g);
            setStream(null);
            if (g.type === 'split') {
              pushNav('streams', g.name);
            } else {
              pushNav('subjects', g.name);
            }
          }}
          className="e-card p-6 flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-xl font-black text-slate-700 mb-3">
            {g.id}
          </div>
          <h3 className="font-black text-sm text-slate-800">{g.name}</h3>
        </div>
      ))}
    </div>
  );
}
