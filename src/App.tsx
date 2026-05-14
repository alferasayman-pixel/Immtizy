import React from 'react';
import { AppProvider, useApp } from './lib/appContext';
import { ExamProvider } from './lib/examContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeView from './views/HomeView';
import StagesView from './views/StagesView';
import GradesView from './views/GradesView';
import StreamsView from './views/StreamsView';
import SubjectsView from './views/SubjectsView';
import HierarchyView from './views/HierarchyView';
import StoreView from './views/StoreView';
import CartView from './views/CartView';
import DashboardView from './views/DashboardView';
import AdminView from './views/AdminView';
import ExamOverlay from './components/ExamOverlay';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChartLine, Settings } from 'lucide-react';

function AppContent() {
  const { navStack, pushNav } = useApp();
  const currentView = navStack[navStack.length - 1];

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'stages': return <StagesView />;
      case 'grades': return <GradesView />;
      case 'streams': return <StreamsView />;
      case 'subjects': return <SubjectsView />;
      case 'hierarchy': return <HierarchyView />;
      case 'store': return <StoreView />;
      case 'cart': return <CartView />;
      case 'dashboard': return <DashboardView />;
      case 'admin': return <AdminView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      <Header />
      
      <main className="p-5 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Buttons from Prototype */}
      <div className="fixed right-5 bottom-[110px] z-30 flex flex-col gap-3">
        <button 
          onClick={() => pushNav('dashboard', 'لوحة المتابعة')}
          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-xl"
        >
          <ChartLine size={20} />
        </button>
        <button 
          onClick={() => pushNav('admin', 'الإدارة')}
          className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-xl"
        >
          <Settings size={20} />
        </button>
      </div>

      <ExamOverlay />
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ExamProvider>
        <AppContent />
      </ExamProvider>
    </AppProvider>
  );
}
