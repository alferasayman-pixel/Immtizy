import React from 'react';
import { useApp } from '../lib/appContext';
import { ArrowRight, GraduationCap, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Icon } from './Icon';

export default function Header() {
  const { navStack, popNav, currentLabel, resetNav, pushNav } = useApp();
  const showBack = navStack.length > 1;

  return (
    <header className="glass-header px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {showBack && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={popNav}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition shadow-sm border border-slate-100"
              >
                <ArrowRight size={20} />
              </motion.button>
            )}
          </AnimatePresence>
          <div>
            <h1 onClick={resetNav} className="text-xl font-black text-slate-800 cursor-pointer">امتيازي الكويت</h1>
            <AnimatePresence>
              {showBack && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[11px] text-slate-500 font-black mt-1 flex items-center gap-1"
                >
                  <span className="cursor-pointer" onClick={resetNav}>الرئيسية</span>
                  <ChevronLeft size={8} />
                  <span className="text-primary truncate max-w-[150px]">{currentLabel}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => pushNav('store', 'المتجر')}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-sm"
          >
            <Icon name="ShoppingBag" size={20} />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#27ae60] to-[#2ecc71] flex items-center justify-center text-white shadow-lg shadow-green-200/50">
            <GraduationCap size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
