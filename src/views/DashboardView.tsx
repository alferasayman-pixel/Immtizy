import React, { useMemo } from 'react';
import { useApp } from '../lib/appContext';
import { useAuth } from '../lib/authContext';
import { ChartLine, History, Award, LogOut, User as UserIcon, Download, Library } from 'lucide-react';
import { cn, triggerDownload } from '../lib/utils';

export default function DashboardView() {
  const { examHistory, purchases, products } = useApp();
  const { user, logout, signInWithGoogle } = useAuth();

  const stats = {
    total: examHistory.length,
    avg: examHistory.length ? Math.round(examHistory.reduce((a, b) => a + b.pct, 0) / examHistory.length) : 0,
    best: examHistory.length ? Math.max(...examHistory.map(x => x.pct)) : 0
  };

  const ownedFiles = useMemo(() => {
    return products.filter(p => p.type === 'file' && (purchases.has(p.id) || Array.from(purchases).some(pid => {
      const bundle = products.find(prod => prod.id === pid && prod.type === 'bundle');
      return bundle?.items?.includes(p.id);
    })));
  }, [products, purchases]);

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-4">
        <h2 className="text-2xl font-black text-slate-800">لوحة المتابعة</h2>
        <p className="text-sm text-slate-400 font-black">إحصاءات تقدمك</p>
      </div>

      {user ? (
        <div className="e-card p-6 flex items-center justify-between gap-4 bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <UserIcon size={32} />
                </div>
              )}
            </div>
            <div>
              <div className="font-black text-lg text-slate-800">{user.displayName || 'مستخدم'}</div>
              <div className="text-[11px] text-slate-400 font-black">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 hover:bg-red-100 transition"
            title="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <div className="e-card p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <UserIcon size={32} />
          </div>
          <div>
            <h3 className="font-black text-slate-800">سجل دخولك لحفظ بياناتك</h3>
            <p className="text-xs text-slate-400 font-black mt-1">سيتم حفظ نتائج الامتحانات والمشتريات في حسابك للوصول إليها من أي جهاز.</p>
          </div>
          <button onClick={signInWithGoogle} className="btn btn-primary w-full shadow-lg">
            تسجيل الدخول بجوجل
          </button>
        </div>
      )}

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
          <div className="text-sm font-black text-slate-800">مكتبتي (PDF)</div>
          <Library className="text-slate-400" size={18} />
        </div>
        
        <div className="space-y-3">
          {ownedFiles.length === 0 ? (
            <div className="text-center text-slate-400 py-6 text-sm">ليس لديك ملفات مشتراة بعد.</div>
          ) : (
            ownedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex-1 min-w-0 ml-3">
                  <div className="font-black text-xs text-slate-800 truncate">{file.title}</div>
                  <div className="text-[10px] text-slate-400 font-black truncate">{file.subject} • {file.term === 't1' ? 'ف1' : 'ف2'}</div>
                </div>
                <button 
                  onClick={() => triggerDownload(file.pdfUrl!, file.title)}
                  className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition"
                  title="تحميل"
                >
                  <Download size={16} />
                </button>
              </div>
            ))
          )}
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
