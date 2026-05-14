import React from 'react';
import { useApp } from '../lib/appContext';
import { Atom, Feather, ChevronLeft } from 'lucide-react';

export default function StreamsView() {
  const { grade, setStream, pushNav } = useApp();

  if (!grade) return null;

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h2 className="text-2xl font-black text-slate-800">اختر التخصص</h2>
        <p className="text-sm text-slate-400 font-black mt-1">للحادي عشر والثاني عشر</p>
      </div>

      <div 
        onClick={() => {
          setStream('science');
          pushNav('subjects', 'القسم العلمي');
        }} 
        className="e-card p-6 border-l-8 border-l-sky-500 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
            <Atom size={28} />
          </div>
          <div>
            <h3 className="font-black text-lg">القسم العلمي</h3>
            <p className="text-xs text-gray-400 font-black">فيزياء • كيمياء • رياضيات ...</p>
          </div>
        </div>
        <ChevronLeft className="text-gray-300" size={20} />
      </div>

      <div 
        onClick={() => {
          setStream('arts');
          pushNav('subjects', 'القسم الأدبي');
        }} 
        className="e-card p-6 border-l-8 border-l-orange-500 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <Feather size={28} />
          </div>
          <div>
            <h3 className="font-black text-lg">القسم الأدبي</h3>
            <p className="text-xs text-gray-400 font-black">تاريخ • دستور • إحصاء ...</p>
          </div>
        </div>
        <ChevronLeft className="text-gray-300" size={20} />
      </div>
    </div>
  );
}
