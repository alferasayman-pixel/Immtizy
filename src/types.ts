export interface Lesson {
  name: string;
  time: number;
  examCount: number;
  q: Question[];
  meta?: {
    week?: number;
    field?: string;
    note?: string;
    unit?: number;
    area?: string;
  };
}

export interface Question {
  q: string;
  a: string[];
  c: number;
}

export interface Unit {
  title: string;
  lessons: Lesson[];
}

export interface Term {
  term: "t1" | "t2";
  name: string;
  chapters: Unit[];
}

export interface Subject {
  name: string;
  icon: string;
  color: string;
  bg: string;
  units: Term[];
}

export interface Grade {
  id: number | string;
  name: string;
  type?: 'common' | 'split';
  subjects?: Subject[];
}

export interface Stage {
  id: string;
  name: string;
  icon: string;
  grades: Grade[];
}

export interface EducationSystem {
  stages: Stage[];
}

export interface Product {
  id: string;
  type: "file" | "bundle";
  system?: string;
  stage?: string;
  grade?: number;
  stream?: string;
  subject?: string;
  term?: string;
  kind?: "notes" | "summary" | "solutions";
  title: string;
  price: number;
  pdfUrl?: string;
  items?: string[]; // for bundles
}

export interface CartItem {
  id: string;
  type: "file" | "bundle";
  price: number;
  items?: string[];
}

export interface ExamHistoryItem {
  date: string;
  subject: string;
  lesson: string;
  unit: string;
  score: number;
  total: number;
  pct: number;
  timeout: boolean;
  timeSpent: number;
}
