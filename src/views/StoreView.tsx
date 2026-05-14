import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/appContext';
import { ShoppingCart, FileText, Box, Search, Eye, Download, CartPlus } from 'lucide-react';
import { cn, formatTime, hashString } from '../lib/utils';
import { curriculumData, streamsData } from '../data/curriculum';
import { Product } from '../types';

export default function StoreView() {
  const { 
    systemKey, stage, grade, stream, subject,
    products, setProducts, cart, addToCart, purchases, pushNav
  } = useApp();

  const [mode, setMode] = useState<"files" | "bundles">("files");
  const [filters, setFilters] = useState({
    system: systemKey || "public",
    stage: stage?.id || "prim",
    grade: grade?.id || 1,
    stream: stream || "",
    term: "any",
    kind: "any",
    search: ""
  });

  const systems = Object.keys(curriculumData);
  const stages = curriculumData[filters.system].stages;
  const stageData = stages.find(s => s.id === filters.stage) || stages[0];
  const grades = stageData.grades;
  
  const subjects = useMemo(() => {
    const g = grades.find(x => x.id === Number(filters.grade));
    if (!g) return [];
    if (g.type === 'split') {
      return (streamsData[Number(filters.grade)]?.[filters.stream || 'science'] || []).map(s => s.name);
    }
    return (g.subjects || []).map(s => s.name);
  }, [filters.system, filters.stage, filters.grade, filters.stream]);

  const [selectedSubject, setSelectedSubject] = useState(subject?.name || "");

  const filteredFiles = useMemo(() => {
    return products.filter(p => {
      if (p.type !== "file") return false;
      if (p.system !== filters.system) return false;
      if (p.stage !== filters.stage) return false;
      if (Number(p.grade) !== Number(filters.grade)) return false;
      if ((p.stream || "") !== (filters.stream || "")) return false;
      if (selectedSubject && p.subject !== selectedSubject) return false;
      if (filters.term !== "any" && p.term !== filters.term) return false;
      
      if (mode === "files") {
        if (filters.kind !== "any" && p.kind !== filters.kind) return false;
        if (filters.search && !(p.title.toLowerCase().includes(filters.search.toLowerCase()) || p.subject?.toLowerCase().includes(filters.search.toLowerCase()))) return false;
      }
      return true;
    });
  }, [products, filters, selectedSubject, mode]);

  const bundles = useMemo(() => {
    if (mode !== "bundles") return [];
    const termKeys = filters.term === "any" ? ["t1", "t2"] : [filters.term];
    
    return termKeys.map(t => {
      const filesForBundle = filteredFiles.filter(f => f.term === t);
      if (filesForBundle.length === 0) return null;
      
      const base = filesForBundle.reduce((a, b) => a + b.price, 0);
      const discount = 0.20;
      const price = Number((base * (1 - discount)).toFixed(3));
      const title = `باقة ${selectedSubject} • ${t === "t1" ? "الفصل الأول" : "الفصل الثاني"}`;
      const id = `bundle:${hashString(`${selectedSubject}|${t}|${filesForBundle.map(f => f.id).sort().join(",")}`)}`;
      
      return {
        id,
        type: "bundle",
        title,
        items: filesForBundle.map(f => f.id),
        price,
        subject: selectedSubject,
        term: t,
        basePrice: Number(base.toFixed(3)),
        discountPct: Math.round(discount * 100)
      };
    }).filter(Boolean) as any[];
  }, [filteredFiles, mode, selectedSubject, filters.term]);

  const handleSeed = () => {
    const now = Date.now();
    const demo: Product[] = [
      { id: String(now + 1), type: "file", system: "public", stage: "prim", grade: 1, stream: "", subject: "اللغة العربية", term: "t1", kind: "summary", title: "ملخص عربي - الفصل الأول (مثال)", price: 1.000, pdfUrl: "https://example.com/g1_ar_t1_summary.pdf" },
      { id: String(now + 2), type: "file", system: "public", stage: "prim", grade: 1, stream: "", subject: "اللغة العربية", term: "t1", kind: "notes", title: "مذكرة عربي - الفصل الأول (مثال)", price: 1.250, pdfUrl: "https://example.com/g1_ar_t1_notes.pdf" },
      { id: String(now + 3), type: "file", system: "public", stage: "prim", grade: 1, stream: "", subject: "اللغة العربية", term: "t1", kind: "solutions", title: "حلول كتاب عربي - الفصل الأول (مثال)", price: 1.500, pdfUrl: "https://example.com/g1_ar_t1_solutions.pdf" },
      { id: String(now + 4), type: "file", system: "public", stage: "sec", grade: 12, stream: "science", subject: "الفيزياء", term: "t2", kind: "summary", title: "ملخص فيزياء 12 علمي - ف2 (مثال)", price: 2.000, pdfUrl: "https://example.com/g12_phy_sci_t2_summary.pdf" },
      { id: String(now + 5), type: "file", system: "public", stage: "sec", grade: 12, stream: "science", subject: "الفيزياء", term: "t2", kind: "notes", title: "مذكرة فيزياء 12 علمي - ف2 (مثال)", price: 2.000, pdfUrl: "https://example.com/g12_phy_sci_t2_notes.pdf" },
      { id: String(now + 6), type: "file", system: "public", stage: "sec", grade: 12, stream: "science", subject: "الفيزياء", term: "t2", kind: "solutions", title: "حلول كتاب فيزياء 12 علمي - ف2 (مثال)", price: 2.250, pdfUrl: "https://example.com/g12_phy_sci_t2_solutions.pdf" },
      { id: String(now + 7), type: "file", system: "private", stage: "priv", grade: 10, stream: "", subject: "Math", term: "t1", kind: "summary", title: "ملخص Math Private - ف1 (مثال)", price: 1.900, pdfUrl: "https://example.com/private_math_t1.pdf" },
    ];
    setProducts([...products, ...demo]);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="e-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-slate-800">المتجر</div>
            <div className="text-[11px] text-slate-400 font-black mt-1">ملفات PDF + باقات مادة كاملة</div>
          </div>
          <button 
            onClick={() => pushNav('cart', 'سلة التسوق')}
            className="relative w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="e-card p-4">
        <div className="flex gap-2">
          <button className={cn("tab w-full flex items-center justify-center gap-2", mode === 'files' && "active")} onClick={() => setMode('files')}>
            <FileText size={14} /> ملفات
          </button>
          <button className={cn("tab w-full flex items-center justify-center gap-2", mode === 'bundles' && "active")} onClick={() => setMode('bundles')}>
            <Box size={14} /> باقات
          </button>
        </div>
        <div className="text-[10px] text-slate-400 font-black mt-3">
          الباقة = (مذكرات + ملخصات + حلول كتاب) للمادة/الفصل حسب توفر الملفات.
        </div>
      </div>

      <div className="e-card p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 block mb-1">النظام</label>
            <select className="input text-xs" value={filters.system} onChange={e => setFilters({...filters, system: e.target.value})}>
              <option value="public">التعليم العام</option>
              <option value="private">التعليم الخاص</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 block mb-1">المرحلة</label>
            <select className="input text-xs" value={filters.stage} onChange={e => setFilters({...filters, stage: e.target.value})}>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 block mb-1">الصف</label>
            <select className="input text-xs" value={filters.grade} onChange={e => setFilters({...filters, grade: Number(e.target.value)})}>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 block mb-1">التخصص</label>
            <select className="input text-xs" value={filters.stream} onChange={e => setFilters({...filters, stream: e.target.value})}>
              <option value="">بدون</option>
              <option value="science">علمي</option>
              <option value="arts">أدبي</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 block mb-1">المادة</label>
            <select className="input text-xs" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              <option value="">الكل</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 block mb-1">الفصل</label>
            <select className="input text-xs" value={filters.term} onChange={e => setFilters({...filters, term: e.target.value})}>
              <option value="any">الكل</option>
              <option value="t1">الفصل الأول</option>
              <option value="t2">الفصل الثاني</option>
            </select>
          </div>
        </div>

        {mode === 'files' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">النوع</label>
              <select className="input text-xs" value={filters.kind} onChange={e => setFilters({...filters, kind: e.target.value})}>
                <option value="any">الكل</option>
                <option value="notes">مذكرات</option>
                <option value="summary">ملخصات</option>
                <option value="solutions">حلول كتاب</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">بحث</label>
              <div className="relative">
                <input className="input !pr-8 text-xs" placeholder="ابحث..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="pill">{mode === 'files' ? filteredFiles.length : bundles.length} {mode === 'files' ? 'ملف' : 'باقة'}</span>
          <button className="btn btn-ghost text-[10px] h-8 py-0" onClick={handleSeed}>إضافة أمثلة PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {mode === 'files' ? (
          filteredFiles.map(p => {
            const owned = purchases.has(p.id);
            const tagClass = p.kind === "notes" ? "bg-emerald-50 text-emerald-700" : p.kind === "summary" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700";
            return (
              <div key={p.id} className="e-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("pill", tagClass)}>{p.kind === 'notes' ? 'مذكرات' : p.kind === 'summary' ? 'ملخصات' : 'حلول كتاب'}</span>
                      <span className="pill">{p.term === "t1" ? "الفصل الأول" : "الفصل الثاني"}</span>
                    </div>
                    <div className="text-sm font-black text-slate-800 line-clamp-2">{p.title}</div>
                    <div className="text-[11px] text-slate-400 font-black mt-1">{p.subject} • الصف {p.grade}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shrink-0">
                    <FileText size={20} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm font-black text-slate-900">{p.price.toFixed(3)} د.ك</div>
                  <div className="flex gap-2">
                    {owned ? (
                       <button className="btn btn-primary text-xs px-4" onClick={() => window.open(p.pdfUrl, '_blank')}>
                         <Download size={14} /> تحميل
                       </button>
                    ) : (
                      <button className="btn btn-primary text-xs px-4" onClick={() => addToCart({ id: p.id, type: 'file', price: p.price })}>
                        <ShoppingCart size={14} /> شراء
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          bundles.map(b => {
             const owned = purchases.has(b.id) || b.items.every(id => purchases.has(id));
             return (
               <div key={b.id} className="e-card p-5">
                 <div className="flex items-start justify-between gap-3">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="pill bg-slate-900 text-white border-slate-900">باقة</span>
                       <span className="pill">{b.term === "t1" ? "الفصل الأول" : "الفصل الثاني"}</span>
                       <span className="pill">{b.items.length} ملفات</span>
                     </div>
                     <div className="text-sm font-black text-slate-800 line-clamp-2">{b.title}</div>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shrink-0">
                     <Box size={20} />
                   </div>
                 </div>
                 <div className="flex items-center justify-between mt-4">
                   <div className="text-sm font-black text-slate-900">
                     <span>{b.price.toFixed(3)} د.ك</span>
                     <span className="text-[11px] text-slate-400 line-through ml-2">{b.basePrice.toFixed(3)}</span>
                   </div>
                   {owned ? (
                     <span className="pill bg-emerald-50 text-emerald-700">مشتراة ✅</span>
                   ) : (
                     <button className="btn btn-primary text-xs px-4" onClick={() => addToCart({ id: b.id, type: 'bundle', price: b.price, items: b.items })}>
                       <ShoppingCart size={14} /> شراء الباقة
                     </button>
                   )}
                 </div>
               </div>
             );
          })
        )}
      </div>
    </div>
  );
}
