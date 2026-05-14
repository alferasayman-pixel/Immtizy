import React, { useState } from 'react';
import { useApp } from '../lib/appContext';
import { Plus, Download, Upload, Trash2, Moon, Sun } from 'lucide-react';
import { Product } from '../types';

export default function AdminView() {
  const { products, setProducts, examHistory, addExamResult } = useApp();
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    system: 'public',
    term: 't1',
    kind: 'notes',
    price: 0
  });

  const handleAddProduct = () => {
    if (!newProduct.title || !newProduct.subject || !newProduct.grade) {
      alert("يرجى إكمال البيانات الأساسية");
      return;
    }

    const product: Product = {
      ...newProduct as Product,
      id: 'file_' + Date.now(),
      type: 'file',
      stream: newProduct.stream || '',
      pdfUrl: newProduct.pdfUrl || 'about:blank'
    };

    setProducts([product, ...products]);
    alert("تمت إضافة الملف بنجاح");
  };

  const handleExport = () => {
    const data = {
      products,
      examHistory,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emtiazy-backup-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-4">
        <h2 className="text-2xl font-black text-slate-800">إدارة المحتوى</h2>
        <p className="text-sm text-slate-400 font-black">إضافة ملفات وإدارة البيانات</p>
      </div>

      <div className="e-card p-5 space-y-4">
        <div className="text-sm font-black text-slate-800 border-b pb-2">إضافة ملف PDF جديد</div>
        
        <div className="grid grid-cols-2 gap-3">
          <select 
            className="input text-xs" 
            value={newProduct.system} 
            onChange={e => setNewProduct({...newProduct, system: e.target.value})}
          >
            <option value="public">التعليم العام</option>
            <option value="private">التعليم الخاص</option>
          </select>
          <input 
            className="input text-xs" 
            type="number" 
            placeholder="الصف" 
            value={newProduct.grade || ''} 
            onChange={e => setNewProduct({...newProduct, grade: Number(e.target.value)})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input 
            className="input text-xs" 
            placeholder="المادة" 
            value={newProduct.subject || ''} 
            onChange={e => setNewProduct({...newProduct, subject: e.target.value})}
          />
          <select 
            className="input text-xs" 
            value={newProduct.term} 
            onChange={e => setNewProduct({...newProduct, term: e.target.value as any})}
          >
            <option value="t1">الفصل الأول</option>
            <option value="t2">الفصل الثاني</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select 
            className="input text-xs" 
            value={newProduct.kind} 
            onChange={e => setNewProduct({...newProduct, kind: e.target.value as any})}
          >
            <option value="notes">مذكرات</option>
            <option value="summary">ملخصات</option>
            <option value="solutions">حلول كتاب</option>
          </select>
          <input 
            className="input text-xs" 
            type="number" 
            step="0.001" 
            placeholder="السعر د.ك" 
            value={newProduct.price || ''} 
            onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
          />
        </div>

        <input 
          className="input text-xs" 
          placeholder="عنوان الملف" 
          value={newProduct.title || ''} 
          onChange={e => setNewProduct({...newProduct, title: e.target.value})}
        />
        <input 
          className="input text-xs" 
          placeholder="رابط PDF" 
          value={newProduct.pdfUrl || ''} 
          onChange={e => setNewProduct({...newProduct, pdfUrl: e.target.value})}
        />

        <button className="btn btn-primary w-full" onClick={handleAddProduct}>
          <Plus size={18} /> إضافة الملف
        </button>
      </div>

      <div className="e-card p-5 space-y-4">
        <div className="text-sm font-black text-slate-800 border-b pb-2">أدوات إضافية</div>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-ghost text-xs" onClick={handleExport}>
            <Download size={16} /> تصدير
          </button>
          <button className="btn btn-ghost text-xs cursor-not-allowed opacity-50">
            <Upload size={16} /> استيراد
          </button>
        </div>
        <button 
          className="btn btn-danger w-full text-xs"
          onClick={() => {
             if(confirm("هل أنت متأكد من مسح جميع المنتجات؟")) setProducts([]);
          }}
        >
          <Trash2 size={16} /> مسح جميع المنتجات
        </button>
      </div>
    </div>
  );
}
