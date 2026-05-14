import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../lib/appContext';
import { 
  ShoppingCart, 
  FileText, 
  Box, 
  Search, 
  Eye, 
  Download, 
  Check, 
  ChevronDown, 
  X, 
  Star 
} from 'lucide-react';
import { cn, formatTime, hashString, triggerDownload } from '../lib/utils';
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
    kind: "any"
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(subject ? [subject.name] : []);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const systems = Object.keys(curriculumData);
  const stages = curriculumData[filters.system].stages;
  const stageData = stages.find(s => s.id === filters.stage) || stages[0];
  const grades = stageData.grades;
  
  const subjectsList = useMemo(() => {
    const g = grades.find(x => x.id === Number(filters.grade));
    if (!g) return [];
    if (g.type === 'split') {
      return (streamsData[Number(filters.grade)]?.[filters.stream || 'science'] || []).map(s => s.name);
    }
    return (g.subjects || []).map(s => s.name);
  }, [filters.system, filters.stage, filters.grade, filters.stream]);

  // Handle clicks outside search for suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    const matches = new Set<string>();
    
    products.forEach(p => {
      if (p.title.toLowerCase().includes(query)) matches.add(p.title);
      if (p.subject?.toLowerCase().includes(query)) matches.add(p.subject);
    });
    
    return Array.from(matches).slice(0, 5);
  }, [searchQuery, products]);

  const filteredFiles = useMemo(() => {
    return products.filter(p => {
      if (p.type !== "file") return false;
      if (p.system !== filters.system) return false;
      if (p.stage !== filters.stage) return false;
      if (Number(p.grade) !== Number(filters.grade)) return false;
      if ((p.stream || "") !== (filters.stream || "")) return false;
      
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(p.subject)) return false;
      if (selectedTerms.length > 0 && !selectedTerms.includes(p.term)) return false;
      
      if (mode === "files") {
        if (filters.kind !== "any" && p.kind !== filters.kind) return false;
        if (searchQuery && !(p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.subject?.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      }
      return true;
    });
  }, [products, filters, selectedSubjects, selectedTerms, searchQuery, mode]);

  const bundles = useMemo(() => {
    if (mode !== "bundles") return [];
    const termKeys = selectedTerms.length > 0 ? selectedTerms : ["t1", "t2"];
    
    const results: any[] = [];
    const activeSubjects = selectedSubjects.length > 0 ? selectedSubjects : (subjectsList.length > 0 ? subjectsList : []);

    activeSubjects.forEach(subj => {
      termKeys.forEach(t => {
        const filesForBundle = products.filter(f => 
          f.type === "file" && 
          f.subject === subj && 
          f.term === t &&
          f.system === filters.system &&
          f.stage === filters.stage &&
          Number(f.grade) === Number(filters.grade) &&
          (f.stream || "") === (filters.stream || "")
        );
        
        if (filesForBundle.length === 0) return;
        
        const base = filesForBundle.reduce((a, b) => a + b.price, 0);
        const discount = 0.20;
        const price = Number((base * (1 - discount)).toFixed(3));
        const title = `باقة ${subj} • ${t === "t1" ? "الفصل الأول" : "الفصل الثاني"}`;
        const id = `bundle:${hashString(`${subj}|${t}|${filesForBundle.map(f => f.id).sort().join(",")}`)}`;
        
        results.push({
          id,
          type: "bundle",
          title,
          items: filesForBundle.map(f => f.id),
          price,
          subject: subj,
          term: t,
          basePrice: Number(base.toFixed(3)),
          discountPct: Math.round(discount * 100)
        });
      });
    });
    
    return results;
  }, [products, mode, selectedSubjects, selectedTerms, subjectsList, filters]);

  const handleDownload = async (url: string, filename: string) => {
    await triggerDownload(url, filename);
  };

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

  const MultiSelect = ({ label, options, selected, onToggle, placeholder }: { label: string, options: string[], selected: string[], onToggle: (id: string) => void, placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="space-y-1 relative" ref={dropdownRef}>
        <label className="text-[10px] font-black text-slate-400 block mr-2">{label}</label>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="input flex items-center justify-between gap-2 px-3 min-h-[44px] h-auto py-2 text-right w-full"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-slate-400 text-xs font-black">{placeholder}</span>
            ) : (
              selected.map(s => (
                <span key={s} className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
                  {s === 't1' ? "الفصل الأول" : s === 't2' ? "الفصل الثاني" : s}
                </span>
              ))
            )}
          </div>
          <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                selected.length === options.length ? onToggle("CLEAR_ALL") : onToggle("SELECT_ALL");
              }}
              className="w-full text-right px-4 py-2 hover:bg-slate-50 transition border-b border-slate-50 flex items-center justify-between"
            >
              <span className="text-xs font-black text-primary text-right w-full">
                {selected.length === options.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
              </span>
            </button>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className="w-full text-right px-4 py-2.5 hover:bg-slate-50 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                    selected.includes(opt) ? "bg-primary border-primary" : "border-slate-200"
                  )}>
                    {selected.includes(opt) && <Check size={10} className="text-white" />}
                  </div>
                  <span className={cn("text-xs font-black", selected.includes(opt) ? "text-primary" : "text-slate-600")}>
                    {opt === 't1' ? "الفصل الأول" : opt === 't2' ? "الفصل الثاني" : opt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleSubject = (subj: string) => {
    if (subj === "SELECT_ALL") setSelectedSubjects(subjectsList);
    else if (subj === "CLEAR_ALL") setSelectedSubjects([]);
    else {
      setSelectedSubjects(prev => 
        prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
      );
    }
  };

  const toggleTerm = (term: string) => {
    const termsArr = ["t1", "t2"];
    if (term === "SELECT_ALL") setSelectedTerms(termsArr);
    else if (term === "CLEAR_ALL") setSelectedTerms([]);
    else {
      setSelectedTerms(prev => 
        prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
      );
    }
  };

  return (
    <div className="space-y-6 pb-32 pt-2">
      {/* Search Header */}
      <div className="px-1" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input 
            type="text"
            className="w-full bg-white rounded-[24px] border-2 border-slate-100 py-4 pr-12 pl-4 text-sm font-black shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
            placeholder="ابحث عن مذكرات، ملخصات، أو مواد..."
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300 hover:text-slate-500"
            >
              <X size={18} />
            </button>
          )}

          {/* Auto Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 font-black text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1 flex items-center gap-2">
                <Star size={10} className="text-amber-400" /> اقتراحات البحث
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-right px-4 py-3 hover:bg-slate-50 transition border-r-4 border-transparent hover:border-primary flex items-center justify-between"
                >
                  <span className="text-xs font-black text-slate-700">{s}</span>
                  <Search size={12} className="text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Controls */}
      <div className="px-1 sticky top-2 z-40">
        <div className="e-card p-1.5 shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-md flex gap-1">
          <button 
            className={cn(
              "flex-1 py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2",
              mode === 'files' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-400 hover:bg-slate-50"
            )} 
            onClick={() => setMode('files')}
          >
            <FileText size={16} /> ملفات PDF
          </button>
          <button 
            className={cn(
              "flex-1 py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2",
              mode === 'bundles' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-400 hover:bg-slate-50"
            )} 
            onClick={() => setMode('bundles')}
          >
            <Box size={16} /> باقات المادة
          </button>
        </div>
      </div>

      <div className="e-card p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-slate-800 text-sm">تصفية النتائج</h3>
          <button 
            onClick={() => pushNav('cart', 'سلة التسوق')}
            className="relative w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition"
          >
            <ShoppingCart size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 block mr-2">النظام</label>
            <select className="input text-xs h-[44px]" value={filters.system} onChange={e => setFilters({...filters, system: e.target.value})}>
              <option value="public">التعليم العام</option>
              <option value="private">التعليم الخاص</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 block mr-2">المرحلة</label>
            <select className="input text-xs h-[44px]" value={filters.stage} onChange={e => setFilters({...filters, stage: e.target.value})}>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 block mr-2">الصف</label>
            <select className="input text-xs h-[44px]" value={filters.grade} onChange={e => setFilters({...filters, grade: Number(e.target.value)})}>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 block mr-2">التخصص</label>
            <select className="input text-xs h-[44px]" value={filters.stream} onChange={e => setFilters({...filters, stream: e.target.value})}>
              <option value="">بدون</option>
              <option value="science">علمي</option>
              <option value="arts">أدبي</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <MultiSelect 
            label="المواد المفضلة" 
            options={subjectsList} 
            selected={selectedSubjects} 
            onToggle={toggleSubject} 
            placeholder="اختر مادة أو أكثر..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MultiSelect 
            label="الفصول الدراسية" 
            options={["t1", "t2"]} 
            selected={selectedTerms} 
            onToggle={toggleTerm} 
            placeholder="الكل"
          />
          {mode === 'files' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 block mr-2">نوع الملف</label>
              <select className="input text-xs h-[44px]" value={filters.kind} onChange={e => setFilters({...filters, kind: e.target.value})}>
                <option value="any">جميع الأنواع</option>
                <option value="notes">مذكرات</option>
                <option value="summary">ملخصات</option>
                <option value="solutions">حلول كتاب</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <span className="pill bg-slate-100 text-slate-600 border-slate-200">
              {mode === 'files' ? filteredFiles.length : bundles.length} نتائج
            </span>
          </div>
          <button className="text-[10px] font-black text-primary hover:underline" onClick={handleSeed}>
            توليد بيانات تجريبية
          </button>
        </div>
      </div>

      {/* Grid Results */}
      <div className="grid grid-cols-1 gap-4 px-1">
        {mode === 'files' ? (
          filteredFiles.map(p => {
            const owned = purchases.has(p.id) || Array.from(purchases).some(pid => {
              const b = products.find(prod => prod.id === pid && prod.type === 'bundle');
              return b?.items?.includes(p.id);
            });
            const tagClass = p.kind === "notes" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : p.kind === "summary" ? "bg-sky-50 text-sky-700 border-sky-100" : "bg-amber-50 text-amber-700 border-amber-100";
            return (
              <div key={p.id} className="e-card p-6 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-2 transition-all hover:border-primary/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("pill border", tagClass)}>
                        {p.kind === 'notes' ? 'مذكرات' : p.kind === 'summary' ? 'ملخصات' : 'حلول كتاب'}
                      </span>
                      <span className="pill bg-slate-50 text-slate-500 border-slate-100">
                        {p.term === "t1" ? "الفصل الأول" : "الفصل الثاني"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-relaxed">{p.title}</h4>
                      <p className="text-[11px] text-slate-400 font-black mt-1 flex items-center gap-1.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        {p.subject} • الصف {p.grade}
                      </p>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-[20px] bg-slate-900 text-white flex items-center justify-center shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-black text-slate-400">السعر الحالي</div>
                    <div className="text-lg font-black text-slate-900">{p.price.toFixed(3)} <span className="text-[10px] mr-1 uppercase">KWD</span></div>
                  </div>
                  <div className="flex gap-2">
                    {owned ? (
                       <button className="btn btn-primary px-6 h-12 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1" onClick={() => handleDownload(p.pdfUrl, p.title)}>
                         <Download size={18} /> تحميل الملف
                       </button>
                    ) : (
                      <button className="btn btn-primary px-6 h-12 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1" onClick={() => addToCart({ id: p.id, type: 'file', price: p.price })}>
                        <ShoppingCart size={18} /> شراء الآن
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
               <div key={b.id} className="e-card p-6 relative group overflow-hidden animate-in fade-in slide-in-from-bottom-2 border-2 border-slate-900/5 transition-all hover:border-primary/30">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16"></div>
                 <div className="relative z-10">
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex-1 space-y-3">
                       <div className="flex flex-wrap items-center gap-2">
                         <span className="pill bg-slate-900 text-white border-slate-900 flex items-center gap-1.5 ring-4 ring-slate-900/10 shadow-lg">
                           <Star size={10} className="fill-white" /> عرض الباقة
                         </span>
                         <span className="pill bg-primary/5 text-primary border-primary/20">
                           {b.items.length} ملفات شاملة
                         </span>
                       </div>
                       <h4 className="text-sm font-black text-slate-800 leading-relaxed">{b.title}</h4>
                     </div>
                     <div className="w-14 h-14 rounded-[20px] bg-primary text-white flex items-center justify-center shadow-xl shrink-0 group-hover:rotate-6 transition-transform">
                       <Box size={24} />
                     </div>
                   </div>

                   <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                     <div className="space-y-0.5">
                        <div className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
                          وفر {b.discountPct}% اليوم
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl font-black text-slate-900">{b.price.toFixed(3)} <span className="text-[10px] mr-1 uppercase">KWD</span></div>
                          <div className="text-[12px] text-slate-400 line-through font-black">{b.basePrice.toFixed(3)}</div>
                        </div>
                     </div>
                     {owned ? (
                       <span className="btn bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default px-6 h-12 rounded-2xl flex items-center gap-2">
                         مشتراة ✅
                       </span>
                     ) : (
                       <button className="btn btn-primary px-6 h-12 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/30 transition-all hover:-translate-y-1" onClick={() => addToCart({ id: b.id, type: 'bundle', price: b.price, items: b.items })}>
                         <ShoppingCart size={18} /> تفعيل الباقة
                       </button>
                     )}
                   </div>
                 </div>
               </div>
             );
          })
        )}
      </div>

      {/* Empty State */}
      {((mode === 'files' && filteredFiles.length === 0) || (mode === 'bundles' && bundles.length === 0)) && (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
            <Search size={40} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">لا يوجد نتائج تطابق بحثك</h3>
          <p className="text-xs text-slate-400 font-black leading-relaxed max-w-[240px]">
            جرب تعديل خيارات التصفية أو البحث عن مادة أخرى في {mode === 'files' ? 'الملفات' : 'الباقات'}.
          </p>
        </div>
      )}
    </div>
  );
}
