import React from 'react';
import { useApp } from '../lib/appContext';
import { School, Languages, Shapes } from 'lucide-react';

export default function HomeView() {
  const { setSystemKey, pushNav } = useApp();

  const handleSelectSystem = (key: string) => {
    setSystemKey(key);
    pushNav('stages', 'المراحل');
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black backdrop-blur-sm border border-white/10">بدون تسجيل دخول • متجر + باقات • قوالب امتحانات بمؤقت</span>
          <h2 className="text-3xl font-black mt-4 mb-2">ابدأ الآن</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            كل درس له قالب امتحان بمؤقت. المتجر يدعم ملف أو باقة مادة كاملة للفصل.
          </p>
        </div>
        <Shapes className="absolute -left-6 -bottom-10 w-40 h-40 opacity-5 rotate-12" />
      </div>

      <div onClick={() => handleSelectSystem('public')} className="e-card p-6 flex items-center gap-5 cursor-pointer hover:border-blue-200">
        <div className="w-16 h-16 rounded-[1.2rem] bg-blue-50 flex items-center justify-center text-blue-600">
          <School size={32} />
        </div>
        <div>
          <h3 className="font-black text-xl mb-1">التعليم العام</h3>
          <p className="text-xs text-slate-400 font-black">ابتدائي - متوسط - ثانوي</p>
        </div>
      </div>

      <div onClick={() => handleSelectSystem('private')} className="e-card p-6 flex items-center gap-5 cursor-pointer hover:border-purple-200">
        <div className="w-16 h-16 rounded-[1.2rem] bg-purple-50 flex items-center justify-center text-purple-600">
          <Languages size={32} />
        </div>
        <div>
          <h3 className="font-black text-xl mb-1">التعليم الخاص</h3>
          <p className="text-xs text-slate-400 font-black">ثنائي اللغة / مدارس خاصة</p>
        </div>
      </div>

      <div className="e-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-black text-slate-800">متجر المذكرات والملخصات</div>
            <div className="text-[11px] text-slate-400 font-black mt-1">شراء ملف أو باقة مادة كاملة (PDF)</div>
          </div>
          <button className="btn btn-primary px-4 py-3 text-sm" onClick={() => pushNav('store', 'المتجر')}>فتح المتجر</button>
        </div>
      </div>
    </div>
  );
}
