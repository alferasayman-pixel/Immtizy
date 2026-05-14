import React from 'react';
import { useApp } from '../lib/appContext';
import { Icon } from '../components/Icon';
import { ChevronLeft } from 'lucide-react';

export default function StagesView() {
  const { system, setStage, pushNav } = useApp();

  if (!system) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black mb-4 px-2">اختر المرحلة الدراسية</h2>
      {system.stages.map(stage => (
        <div 
          key={stage.id}
          onClick={() => {
            setStage(stage);
            pushNav('grades', stage.name);
          }}
          className="e-card p-6 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center">
              <Icon name={stage.icon} size={28} />
            </div>
            <div>
              <h3 className="font-black text-lg">{stage.name}</h3>
              <p className="text-xs text-slate-400 font-black">{stage.grades.length} صفوف</p>
            </div>
          </div>
          <ChevronLeft className="text-slate-300" size={20} />
        </div>
      ))}
    </div>
  );
}
