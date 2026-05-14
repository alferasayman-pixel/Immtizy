import React from 'react';
import { useApp } from '../lib/appContext';
import { Home, ShoppingBag, Box, UserCog } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navigation() {
  const { navStack, resetNav, pushNav } = useApp();
  const currentView = navStack[navStack.length - 1];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-filter backdrop-blur-lg border-t border-slate-100 py-2 flex justify-around items-center z-40 pb-7">
      <button 
        onClick={resetNav}
        className={cn(
          "flex flex-col items-center gap-1.5 p-2 rounded-xl transition",
          currentView === 'home' ? "text-primary" : "text-gray-400 hover:text-slate-600"
        )}
      >
        <Home size={20} />
        <span className="text-[10px] font-black">الرئيسية</span>
      </button>

      <button 
        onClick={() => pushNav('store', 'المتجر')}
        className={cn(
          "flex flex-col items-center gap-1.5 p-2 rounded-xl transition",
          currentView === 'store' ? "text-primary" : "text-gray-400 hover:text-slate-600"
        )}
      >
        <ShoppingBag size={20} />
        <span className="text-[10px] font-black">المتجر</span>
      </button>

      <div className="relative -top-6">
        <button 
          onClick={() => pushNav('store', 'المتجر')}
          className="w-16 h-16 bg-slate-800 rounded-[1.2rem] rotate-45 flex items-center justify-center shadow-xl shadow-slate-300 border-[6px] border-[#f8fafc] group transition active:scale-95"
        >
          <Box size={24} className="text-white -rotate-45 group-hover:scale-110 transition" />
        </button>
      </div>

      <button 
        className={cn(
          "flex flex-col items-center gap-1.5 p-2 rounded-xl transition",
          currentView === 'dashboard' ? "text-primary" : "text-gray-400 hover:text-slate-600"
        )}
        onClick={() => pushNav('dashboard', 'حسابي')}
      >
        <UserCog size={20} />
        <span className="text-[10px] font-black">حسابي</span>
      </button>
    </nav>
  );
}
