import React from 'react';
import { useApp } from '../lib/appContext';
import { Icon } from '../components/Icon';
import { cn } from '../lib/utils';
import { streamsData } from '../data/curriculum';

export default function SubjectsView() {
  const { systemKey, stage, grade, stream, setSubject, pushNav } = useApp();

  if (!grade) return null;

  let subjects = grade.subjects || [];
  if (grade.type === 'split' && stream) {
    subjects = streamsData[grade.id as number]?.[stream] || [];
  }

  const streamTitle = stream === 'science' ? ' (علمي)' : stream === 'arts' ? ' (أدبي)' : '';

  return (
    <div className="grid grid-cols-2 gap-4 pb-10">
      <h2 className="col-span-2 text-xl font-black mb-2 px-2 flex items-center justify-between">
        <span>مواد {grade.name} {streamTitle}</span>
        <button 
          className="pill" 
          onClick={() => pushNav('store', 'المتجر')}
        >
          متجر PDF
        </button>
      </h2>
      {subjects.map((sub, idx) => (
        <div 
          key={idx}
          onClick={() => {
            setSubject(sub);
            pushNav('hierarchy', sub.name);
          }}
          className="e-card p-5 flex flex-col items-center text-center cursor-pointer"
        >
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-3", sub.bg, sub.color)}>
            <Icon name={sub.icon} size={28} />
          </div>
          <h3 className="font-black text-xs text-slate-800">{sub.name}</h3>
          <span className="text-[10px] text-slate-400 font-black mt-1">قوالب امتحانات لكل درس</span>
        </div>
      ))}
    </div>
  );
}
