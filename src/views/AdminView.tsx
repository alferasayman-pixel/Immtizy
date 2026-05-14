import React, { useState, useMemo } from 'react';
import { useApp } from '../lib/appContext';
import { useAuth } from '../lib/authContext';
import { 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Search, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  Save, 
  X,
  PlusCircle,
  Settings,
  Grid
} from 'lucide-react';
import { Product, LessonOverride, Question, Lesson } from '../types';
import { curriculumData } from '../data/curriculum';
import { cn, getLessonId } from '../lib/utils';

export default function AdminView() {
  const { 
    products, setProducts, deleteProduct, 
    overrides, saveLessonOverride, 
    systemKey: currentSystem, stage: currentStage, grade: currentGrade, subject: currentSubject 
  } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'files' | 'curriculum' | 'settings'>('files');
  
  // File Management State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    system: 'public',
    term: 't1',
    kind: 'notes',
    price: 0,
    type: 'file'
  });

  // Curriculum Management State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingQuestions, setEditingQuestions] = useState<Question[]>([]);
  const [editLessonName, setEditLessonName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.subject || !newProduct.grade) {
      alert("يرجى إكمال البيانات الأساسية");
      return;
    }

    const product: Product = {
      ...(newProduct as Product),
      id: 'file_' + Date.now(),
      type: 'file',
      stream: newProduct.stream || '',
      pdfUrl: newProduct.pdfUrl || 'about:blank'
    };

    await setProducts([product, ...products]);
    alert("تمت إضافة الملف بنجاح");
    setNewProduct({
      system: 'public',
      term: 't1',
      kind: 'notes',
      price: 0,
      type: 'file'
    });
  };

  const startEditLesson = (lesson: Lesson, id: string) => {
    setEditingLessonId(id);
    setEditLessonName(lesson.name);
    setEditingQuestions(overrides[id]?.questions || JSON.parse(JSON.stringify(lesson.q)));
    setSelectedProductId(overrides[id]?.requiredProductId || "");
    setActiveTab('curriculum');
  };

  const handleSaveLesson = async () => {
    if (!editingLessonId) return;
    const override: LessonOverride = {
      id: editingLessonId,
      lessonName: editLessonName,
      questions: editingQuestions,
      requiredProductId: selectedProductId || undefined
    };
    await saveLessonOverride(override);
    alert("تم حفظ الامتحان بنجاح");
    setEditingLessonId(null);
  };

  const addQuestion = () => {
    setEditingQuestions([...editingQuestions, { q: "سؤال جديد", a: ["صح", "خطأ", "غير ذلك", "لا أعرف"], c: 0 }]);
  };

  const removeQuestion = (idx: number) => {
    setEditingQuestions(editingQuestions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
    const next = [...editingQuestions];
    next[idx] = { ...next[idx], [field]: value };
    setEditingQuestions(next);
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const next = [...editingQuestions];
    const opts = [...next[qIdx].a];
    opts[oIdx] = val;
    next[qIdx] = { ...next[qIdx], a: opts };
    setEditingQuestions(next);
  };

  if (user?.email !== 'alferasayman@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <h3 className="font-black text-slate-800">عذراً، لا تمتلك الصلاحية</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="relative p-8 bg-primary rounded-[40px] text-white shadow-xl overflow-hidden mt-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-black mb-2">لوحة القائد</h2>
          <p className="text-white/80 font-black text-sm">أهلاً بك في فضاء التحكم بمحتوى امتيازي</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-slate-100 sticky top-2 z-40">
        <button 
          onClick={() => setActiveTab('files')}
          className={cn(
            "flex-1 py-3 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2",
            activeTab === 'files' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <FileText size={16} /> الملفات
        </button>
        <button 
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            "flex-1 py-3 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2",
            activeTab === 'curriculum' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <BookOpen size={16} /> الامتحانات
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "flex-1 py-3 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2",
            activeTab === 'settings' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          <Settings size={16} /> الإعدادات
        </button>
      </div>

      {/* Content */}
      <div className="px-1">
        {activeTab === 'files' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Add New Product */}
            <div className="e-card p-6 border-2 border-dashed border-slate-200 bg-slate-50/50">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <PlusCircle className="text-primary" size={20} /> إضافة ملف PDF أو ملخص
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black mr-2 text-slate-400">النظام الدراسي</label>
                    <select 
                      className="input text-xs" 
                      value={newProduct.system} 
                      onChange={e => setNewProduct({...newProduct, system: e.target.value})}
                    >
                      <option value="public">التعليم العام</option>
                      <option value="private">التعليم الخاص</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black mr-2 text-slate-400">الصف</label>
                    <input 
                      className="input text-xs" 
                      type="number" 
                      placeholder="رقم الصف (1-12)" 
                      value={newProduct.grade || ''} 
                      onChange={e => setNewProduct({...newProduct, grade: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black mr-2 text-slate-400">المادة</label>
                    <input 
                      className="input text-xs" 
                      placeholder="اسم المادة" 
                      value={newProduct.subject || ''} 
                      onChange={e => setNewProduct({...newProduct, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black mr-2 text-slate-400">الفصل</label>
                    <select 
                      className="input text-xs" 
                      value={newProduct.term} 
                      onChange={e => setNewProduct({...newProduct, term: e.target.value as any})}
                    >
                      <option value="t1">الفصل الأول</option>
                      <option value="t2">الفصل الثاني</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black mr-2 text-slate-400">النوع</label>
                    <select 
                      className="input text-xs" 
                      value={newProduct.kind} 
                      onChange={e => setNewProduct({...newProduct, kind: e.target.value as any})}
                    >
                      <option value="notes">مذكرات</option>
                      <option value="summary">ملخصات</option>
                      <option value="solutions">حلول كتاب</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black mr-2 text-slate-400">السعر (د.ك)</label>
                    <input 
                      className="input text-xs" 
                      type="number" 
                      step="0.001" 
                      placeholder="0.000" 
                      value={newProduct.price || ''} 
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black mr-2 text-slate-400">عنوان الملف</label>
                  <input 
                    className="input text-xs" 
                    placeholder="مثال: مذكرة مراجعة ليلة الامتحان" 
                    value={newProduct.title || ''} 
                    onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black mr-2 text-slate-400">رابط PDF</label>
                  <input 
                    className="input text-xs ltr" 
                    placeholder="https://..." 
                    value={newProduct.pdfUrl || ''} 
                    onChange={e => setNewProduct({...newProduct, pdfUrl: e.target.value})}
                  />
                </div>

                <button className="btn btn-primary w-full py-4 shadow-lg active:scale-95" onClick={handleAddProduct}>
                  نشر الملف الآن
                </button>
              </div>
            </div>

            {/* List Products */}
            <div className="space-y-3">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Grid className="text-slate-400" size={18} /> الملفات الحالية ({products.length})
              </h3>
              {products.map(p => (
                <div key={p.id} className="e-card p-4 flex items-center justify-between group">
                  <div className="min-w-0 pr-2">
                    <div className="font-black text-xs text-slate-800 truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400 font-black mt-1">
                      {p.subject} • الصف {p.grade} • {p.price.toFixed(3)} د.ك
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm("حذف هذا الملف نهائياً؟")) deleteProduct(p.id);
                    }}
                    className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {editingLessonId ? (
              /* Exam Editor */
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingLessonId(null)} className="p-2 bg-slate-100 rounded-xl">
                      <ChevronRight size={18} />
                    </button>
                    <div>
                      <h3 className="font-black text-slate-800">{editLessonName}</h3>
                      <p className="text-[10px] text-slate-400 font-black">تحرير الأسئلة والخيارات</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={handleSaveLesson} className="btn btn-primary px-4 py-2 text-xs flex items-center gap-1 shadow-lg">
                      <Save size={14} /> حفظ التغييرات
                    </button>
                  </div>
                </div>

                <div className="e-card p-4 bg-slate-50 border border-slate-100 mb-6">
                  <label className="text-[10px] font-black mr-2 text-slate-400">ربط بمنتج مطلوب للفتح (اختياري)</label>
                  <select 
                    className="input text-xs mt-1"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">لا يوجد منتج مطلوب (مفتوح للجميع)</option>
                    {products.filter(p => p.type === 'file').map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.subject} - الصف {p.grade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  {editingQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="e-card p-6 space-y-4 relative bg-white border-2 border-slate-50">
                      <div className="absolute left-4 top-4">
                        <button 
                          onClick={() => removeQuestion(qIdx)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">السؤال {qIdx + 1}</label>
                        <textarea 
                          className="input text-xs h-20 resize-none font-black leading-relaxed" 
                          value={q.q}
                          onChange={(e) => updateQuestion(qIdx, 'q', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {q.a.map((opt, oIdx) => (
                           <div key={oIdx} className="space-y-1">
                              <div className="flex items-center justify-between mb-1 px-1">
                                <label className="text-[9px] font-black text-slate-400">الخيار {["أ", "ب", "ج", "د"][oIdx]}</label>
                                <input 
                                  type="radio" 
                                  name={`correct-${qIdx}`} 
                                  checked={q.c === oIdx}
                                  onChange={() => updateQuestion(qIdx, 'c', oIdx)}
                                />
                              </div>
                              <input 
                                className={cn(
                                  "input text-[11px] p-3 text-center transition-all",
                                  q.c === oIdx ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 ring-2 ring-emerald-500/10" : "text-slate-600"
                                )}
                                value={opt}
                                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                              />
                           </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addQuestion}
                    className="w-full py-4 border-2 border-dashed border-primary/30 rounded-3xl text-primary font-black bg-primary/5 flex items-center justify-center gap-2 hover:bg-primary/10 transition"
                  >
                    <PlusCircle size={20} /> إضافة سؤال جديد
                  </button>
                </div>
              </div>
            ) : (
              /* Curriculum Browser */
              <div className="space-y-6">
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl">
                  <p className="text-xs text-amber-800 font-black leading-relaxed">
                    هنا يمكنك العثور على أي درس وتعديل امتحانه. اختر المسار الحالي (المادة والصف) ثم اضغط على الدرس لبدء التعديل.
                  </p>
                </div>
                
                {(!currentSubject || !currentSystem || !currentStage || !currentGrade) ? (
                  <div className="p-10 text-center space-y-4">
                    <Grid className="mx-auto text-slate-200" size={48} />
                    <p className="text-sm text-slate-400 font-black">يرجى الذهاب للمنهج أولاً واختيار مادة لظهور دروسها هنا</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 bg-white p-4 rounded-3xl border border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-sm">{currentSubject.name}</div>
                          <div className="text-[10px] text-slate-400 font-black">الصف {currentGrade.id} • {currentStage.name}</div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        {currentSubject.units.map((term, tIdx) => (
                           <div key={tIdx} className="space-y-3">
                              <div className="font-black text-[10px] text-slate-400 mr-2 uppercase">{term.name}</div>
                              {term.chapters.map((unit, uIdx) => (
                                <div key={uIdx} className="e-card p-4 space-y-2">
                                  <div className="font-black text-[12px] text-slate-900 border-b pb-2 mb-2">{unit.title}</div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {unit.lessons.map((lesson, lIdx) => {
                                      const lId = getLessonId(currentSystem, currentStage.id, currentGrade.id, currentSubject.name, term.term, unit.title, lesson.name);
                                      const isCustom = !!overrides[lId];
                                      return (
                                        <button 
                                          key={lIdx}
                                          onClick={() => startEditLesson(lesson, lId)}
                                          className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition text-right"
                                        >
                                          <div className="font-black text-[11px] text-slate-700">
                                            {lesson.name}
                                            {isCustom && <span className="mr-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">معدّل</span>}
                                          </div>
                                          <ChevronRight size={14} className="text-slate-300" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="e-card p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                  <Download size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">تصدير البيانات</h4>
                  <p className="text-[10px] text-slate-400 font-black">حفظ نسخة احتياطية من جميع المنتجات</p>
                </div>
              </div>
              <button 
                className="btn btn-ghost w-full py-4 border-2 border-slate-100 rounded-3xl text-sm"
                onClick={() => {
                  const data = { products, overrides, timestamp: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `emtiazy-backup-${Date.now()}.json`;
                  a.click();
                }}
              >
                تصدير إلى JSON
              </button>
            </div>

            <div className="e-card p-6 bg-red-50/30 border-red-100 border-2 border-dashed space-y-4">
              <div>
                <h4 className="font-black text-red-900 text-sm">منطقة الخطر</h4>
                <p className="text-[10px] text-red-400 font-black">هذه العمليات لا يمكن التراجع عنها</p>
              </div>
              <button 
                className="btn btn-danger w-full py-4 rounded-3xl text-xs opacity-50 pointer-events-none"
                onClick={() => {}}
              >
                مسح جميع البيانات (معطّل)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
