import React, { useMemo } from 'react';
import { useApp } from '../lib/appContext';
import { X, FileText, Box, Trash2, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CartView() {
  const { cart, removeFromCart, clearCart, products, addPurchase, popNav } = useApp();

  const enrichedItems = useMemo(() => {
    return cart.map(item => {
      if (item.type === 'file') {
        const p = products.find(x => x.id === item.id);
        return {
          ...item,
          title: p?.title || "ملف",
          subtitle: p ? `${p.subject} • ${p.term === "t1" ? "ف1" : "ف2"}` : ""
        };
      }
      return {
        ...item,
        title: "باقة مادة",
        subtitle: `${(item.items || []).length} ملفات`
      };
    });
  }, [cart, products]);

  const total = enrichedItems.reduce((a, b) => a + b.price, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    cart.forEach(item => {
      addPurchase(item.id);
      if (item.type === 'bundle' && item.items) {
        item.items.forEach(fid => addPurchase(fid));
      }
    });
    clearCart();
    popNav();
    alert("تمت عملية الشراء بنجاح! (نموذج تجريبي)");
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between mb-3 px-2">
        <div>
          <div className="text-lg font-black text-slate-800">سلة المشتريات</div>
          <div className="text-[11px] text-slate-400 font-black">{enrichedItems.length} عناصر</div>
        </div>
      </div>

      <div className="space-y-2">
        {enrichedItems.length === 0 ? (
          <div className="text-center text-slate-400 font-black py-12">السلة فارغة.</div>
        ) : (
          enrichedItems.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center", item.type === 'bundle' ? "text-slate-900" : "text-primary")}>
                  {item.type === 'bundle' ? <Box size={20} /> : <FileText size={20} />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-800 line-clamp-2">{item.title}</div>
                  <div className="text-[10px] text-slate-400 font-black mt-0.5">{item.subtitle}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-[11px] font-black text-slate-800">{item.price.toFixed(3)} د.ك</div>
                <button 
                  onClick={() => removeFromCart(item.type, item.id)}
                  className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {enrichedItems.length > 0 && (
        <div className="e-card p-5 mt-6 border-t-4 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-black text-slate-800">الإجمالي</div>
            <div className="text-xl font-black text-primary">{total.toFixed(3)} د.ك</div>
          </div>
          <button 
            onClick={handleCheckout}
            className="btn btn-primary w-full py-4 text-base"
          >
            <CreditCard size={18} /> شراء الآن
          </button>
          <button 
            onClick={clearCart}
            className="btn btn-ghost w-full mt-3 text-slate-500"
          >
            تفريغ السلة
          </button>
        </div>
      )}
    </div>
  );
}
