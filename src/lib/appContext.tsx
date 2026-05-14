import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, EducationSystem, ExamHistoryItem, Product, Stage, Grade, Subject, LessonOverride, Question } from '../types';
import { safeLoad, safeSave } from './utils';
import { CART_KEY, PURCHASES_KEY, PRO_SCORE_KEY, STORE_KEY } from './constants';
import { curriculumData } from '../data/curriculum';
import { useAuth } from './authContext';
import { db, auth as firebaseAuth } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
  getDocs,
  setDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
      emailVerified: firebaseAuth.currentUser?.emailVerified,
      isAnonymous: firebaseAuth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  syncProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  overrides: Record<string, LessonOverride>;
  saveLessonOverride: (override: LessonOverride) => Promise<void>;
  getEffectiveQuestions: (lessonId: string, fallback: Question[]) => Question[];
  getEffectiveLessonName: (lessonId: string, fallback: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
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
  const [products, setProductsState] = useState<Product[]>(() => safeLoad(STORE_KEY, []));
  const [overrides, setOverrides] = useState<Record<string, LessonOverride>>({});

  // Sync Products from Firestore
  const syncProducts = useCallback(async () => {
    const path = 'products';
    try {
      const snap = await getDocs(collection(db, path));
      const firestoreProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      if (firestoreProducts.length > 0) {
        setProductsState(firestoreProducts);
        safeSave(STORE_KEY, firestoreProducts);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }, []);

  useEffect(() => {
    syncProducts();
  }, [syncProducts]);

  // Sync Overrides
  useEffect(() => {
    const path = 'curriculum';
    const unsub = onSnapshot(collection(db, path), (snap) => {
      const newOverrides: Record<string, LessonOverride> = {};
      snap.forEach(doc => {
        newOverrides[doc.id] = { id: doc.id, ...doc.data() } as LessonOverride;
      });
      setOverrides(newOverrides);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
    return () => unsub();
  }, []);

  // Firestore Sync Listeners for User Data
  useEffect(() => {
    if (!user) {
      setPurchases(new Set(safeLoad(PURCHASES_KEY, [])));
      setExamHistory(safeLoad(PRO_SCORE_KEY, []));
      return;
    }

    const purchasePath = `users/${user.uid}/purchases`;
    const unsubPurchases = onSnapshot(collection(db, purchasePath), (snap) => {
      const ids = new Set<string>();
      snap.forEach(doc => ids.add(doc.data().productId));
      setPurchases(ids);
      safeSave(PURCHASES_KEY, Array.from(ids));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, purchasePath);
    });

    const historyPath = `users/${user.uid}/examHistory`;
    const qHistory = query(collection(db, historyPath), orderBy('createdAt', 'desc'));
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const history = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      setExamHistory(history);
      safeSave(PRO_SCORE_KEY, history);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, historyPath);
    });

    return () => {
      unsubPurchases();
      unsubHistory();
    };
  }, [user]);

  useEffect(() => {
    safeSave(CART_KEY, cart);
  }, [cart]);

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

  const addPurchase = async (productId: string) => {
    if (!user) {
      setPurchases(prev => {
        const next = new Set(prev);
        next.add(productId);
        safeSave(PURCHASES_KEY, Array.from(next));
        return next;
      });
      return;
    }

    const path = `users/${user.uid}/purchases`;
    try {
      await setDoc(doc(db, path, productId), {
        productId,
        purchasedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addExamResult = async (result: ExamHistoryItem) => {
    if (!user) {
      setExamHistory(prev => {
        const next = [result, ...prev].slice(0, 100);
        safeSave(PRO_SCORE_KEY, next);
        return next;
      });
      return;
    }

    const path = `users/${user.uid}/examHistory`;
    try {
      await addDoc(collection(db, path), {
        ...result,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const setProducts = async (newProducts: Product[]) => {
    setProductsState(newProducts);
    safeSave(STORE_KEY, newProducts);
    
    if (user?.email === 'alferasayman@gmail.com') {
      const path = 'products';
      try {
        for (const p of newProducts) {
          await setDoc(doc(db, path, p.id), p);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    if (user?.email !== 'alferasayman@gmail.com') return;
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProductsState(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const saveLessonOverride = async (override: LessonOverride) => {
    if (user?.email !== 'alferasayman@gmail.com') return;
    const path = `curriculum/${override.id}`;
    try {
      await setDoc(doc(db, 'curriculum', override.id), {
        ...override,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const getEffectiveQuestions = useCallback((lessonId: string, fallback: Question[]) => {
    return overrides[lessonId]?.questions || fallback;
  }, [overrides]);

  const getEffectiveLessonName = useCallback((lessonId: string, fallback: string) => {
    return overrides[lessonId]?.lessonName || fallback;
  }, [overrides]);

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
      products, setProducts, syncProducts, deleteProduct,
      overrides, saveLessonOverride, getEffectiveQuestions, getEffectiveLessonName
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
