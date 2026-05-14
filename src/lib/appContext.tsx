import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, EducationSystem, ExamHistoryItem, Product, Stage, Grade, Subject } from '../types';
import { safeLoad, safeSave } from './utils';
import { CART_KEY, PURCHASES_KEY, PRO_SCORE_KEY, STORE_KEY } from './constants';
import { curriculumData } from '../data/curriculum';

interface AppContextType {
  navStack: string[];
  pushNav: (viewId: string, currentLabel?: string) => void;
  popNav: () => void;
  resetNav: () => void;
  currentLabel: string;
  
  systemKey: string | null;
  setSystemKey: (key: string) => void;
  system: EducationSystem | null;
  
  stage: Stage | null;
  setStage: (stage: Stage) => void;
  
  grade: Grade | null;
  setGrade: (grade: Grade) => void;
  
  stream: string | null;
  setStream: (stream: string | null) => void;
  
  subject: Subject | null;
  setSubject: (subject: Subject) => void;

  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (type: string, id: string) => void;
  clearCart: () => void;
  purchases: Set<string>;
  addPurchase: (id: string) => void;
  
  examHistory: ExamHistoryItem[];
  addExamResult: (result: ExamHistoryItem) => void;
  
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [navStack, setNavStack] = useState<string[]>(['home']);
  const [currentLabel, setCurrentLabel] = useState<string>('الرئيسية');
  
  const [systemKey, setSystemKeyState] = useState<string | null>(null);
  const [system, setSystem] = useState<EducationSystem | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [stream, setStream] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => safeLoad(CART_KEY, []));
  const [purchases, setPurchases] = useState<Set<string>>(() => new Set(safeLoad(PURCHASES_KEY, [])));
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>(() => safeLoad(PRO_SCORE_KEY, []));
  const [products, setProducts] = useState<Product[]>(() => safeLoad(STORE_KEY, []));

  useEffect(() => {
    safeSave(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    safeSave(PURCHASES_KEY, Array.from(purchases));
  }, [purchases]);

  useEffect(() => {
    safeSave(PRO_SCORE_KEY, examHistory);
  }, [examHistory]);

  useEffect(() => {
    safeSave(STORE_KEY, products);
  }, [products]);

  const pushNav = (viewId: string, label?: string) => {
    setNavStack(prev => [...prev, viewId]);
    if (label) setCurrentLabel(label);
  };

  const popNav = () => {
    if (navStack.length <= 1) return;
    setNavStack(prev => prev.slice(0, -1));
  };

  const resetNav = () => {
    setNavStack(['home']);
    setCurrentLabel('الرئيسية');
    setSystemKeyState(null);
    setSystem(null);
    setStage(null);
    setGrade(null);
    setStream(null);
    setSubject(null);
  };

  const setSystemKey = (key: string) => {
    setSystemKeyState(key);
    setSystem(curriculumData[key]);
  };

  const addToCart = (item: CartItem) => {
    if (purchases.has(item.id)) return;
    if (cart.some(x => x.id === item.id)) return;
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (type: string, id: string) => {
    setCart(prev => prev.filter(x => !(x.type === type && x.id === id)));
  };

  const clearCart = () => setCart([]);

  const addPurchase = (id: string) => {
    setPurchases(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const addExamResult = (result: ExamHistoryItem) => {
    setExamHistory(prev => [result, ...prev].slice(0, 100));
  };

  return (
    <AppContext.Provider value={{
      navStack, pushNav, popNav, resetNav, currentLabel,
      systemKey, setSystemKey, system,
      stage, setStage,
      grade, setGrade,
      stream, setStream,
      subject, setSubject,
      cart, addToCart, removeFromCart, clearCart,
      purchases, addPurchase,
      examHistory, addExamResult,
      products, setProducts
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
