import { EducationSystem, Grade, Question, Subject, Term, Unit } from '../types';

const DEFAULT_EXAM_QUESTIONS = 10;
const DEFAULT_EXAM_OPTIONS = ["أ", "ب", "ج", "د"];

export function buildExamTemplate(lessonName: string, qCount = DEFAULT_EXAM_QUESTIONS): Question[] {
  return Array.from({ length: qCount }, (_, i) => ({
    q: `(${i + 1}) سؤال قالب: ${lessonName}`,
    a: DEFAULT_EXAM_OPTIONS.map((t, idx) => `اختيار ${t}`),
    c: 0
  }));
}

function makeLessonTemplate(i: number) {
  const name = `اختبار الدرس ${i}`;
  return {
    name,
    time: 20 * 60,
    examCount: DEFAULT_EXAM_QUESTIONS,
    q: buildExamTemplate(name, DEFAULT_EXAM_QUESTIONS)
  };
}

function makeUnitTemplate(i: number, lessonsPerUnit: number): Unit {
  return { title: `الوحدة ${i}`, lessons: Array.from({ length: lessonsPerUnit }, (_, k) => makeLessonTemplate(k + 1)) };
}

function makeTermTemplate(termKey: "t1" | "t2", unitsCount: number, lessonsPerUnit: number): Term {
  const name = termKey === "t1" ? "الفصل الدراسي الأول" : "الفصل الدراسي الثاني";
  return {
    term: termKey,
    name,
    chapters: Array.from({ length: unitsCount }, (_, i) => makeUnitTemplate(i + 1, lessonsPerUnit))
  };
}

export function scaffoldFor(gradeId: number): Term[] {
  if (gradeId <= 5) return [makeTermTemplate("t1", 3, 4), makeTermTemplate("t2", 3, 4)];
  if (gradeId <= 9) return [makeTermTemplate("t1", 4, 4), makeTermTemplate("t2", 4, 4)];
  return [makeTermTemplate("t1", 5, 4), makeTermTemplate("t2", 5, 4)];
}

export const curriculumData: Record<string, EducationSystem> = {
  public: {
    stages: [
      {
        id: 'prim', name: 'المرحلة الابتدائية', icon: 'School',
        grades: [1, 2, 3, 4, 5].map(i => {
          const g: Grade = {
            id: i, name: `الصف ${i}`,
            subjects: [
              { name: 'اللغة العربية', icon: 'PenNib', color: 'text-emerald-600', bg: 'bg-emerald-50', units: [] },
              { name: 'اللغة الإنجليزية', icon: 'Type', color: 'text-red-500', bg: 'bg-red-50', units: [] },
              { name: 'الرياضيات', icon: 'Calculator', color: 'text-blue-600', bg: 'bg-blue-50', units: [] },
              { name: 'العلوم', icon: 'FlaskConical', color: 'text-purple-600', bg: 'bg-purple-50', units: [] },
              { name: 'التربية الإسلامية', icon: 'MoonStar', color: 'text-slate-600', bg: 'bg-slate-100', units: [] },
              { name: 'القرآن الكريم', icon: 'BookOpen', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
              { name: 'الحاسوب', icon: 'Laptop', color: 'text-cyan-700', bg: 'bg-cyan-50', units: [] },
              { name: 'الاجتماعيات', icon: 'Globe', color: 'text-orange-700', bg: 'bg-orange-50', units: [] },
            ]
          };

          if (i === 1) {
            // Apply specific G1 Islamic data if needed, but for now we'll just let the enrichment handle it unless we want to hardcode
          }
          return g;
        })
      },
      {
        id: 'mid', name: 'المرحلة المتوسطة', icon: 'Layers',
        grades: [6, 7, 8, 9].map(i => ({
          id: i, name: `الصف ${i}`,
          subjects: [
            { name: 'الرياضيات', icon: 'Calculator', color: 'text-blue-600', bg: 'bg-blue-50', units: [] },
            { name: 'العلوم', icon: 'Dna', color: 'text-purple-600', bg: 'bg-purple-50', units: [] },
            { name: 'اللغة العربية', icon: 'BookOpen', color: 'text-emerald-600', bg: 'bg-emerald-50', units: [] },
            { name: 'اللغة الإنجليزية', icon: 'Languages', color: 'text-red-500', bg: 'bg-red-50', units: [] },
            { name: 'الاجتماعيات', icon: 'Globe', color: 'text-orange-600', bg: 'bg-orange-50', units: [] },
            { name: 'التربية الإسلامية', icon: 'MoonStar', color: 'text-slate-600', bg: 'bg-slate-100', units: [] },
            { name: 'القرآن الكريم', icon: 'BookOpen', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
            { name: 'الحاسوب', icon: 'LaptopCode', color: 'text-cyan-600', bg: 'bg-cyan-50', units: [] }
          ]
        }))
      },
      {
        id: 'sec', name: 'المرحلة الثانوية', icon: 'GraduationCap',
        grades: [
          {
            id: 10, name: 'الصف العاشر', type: 'common', subjects: [
              { name: 'الفيزياء', icon: 'Atom', color: 'text-indigo-600', bg: 'bg-indigo-50', units: [] },
              { name: 'الكيمياء', icon: 'FlaskConical', color: 'text-pink-600', bg: 'bg-pink-50', units: [] },
              { name: 'الأحياء', icon: 'Microscope', color: 'text-green-600', bg: 'bg-green-50', units: [] },
              { name: 'الرياضيات', icon: 'Calculator', color: 'text-blue-600', bg: 'bg-blue-50', units: [] },
              { name: 'اللغة العربية', icon: 'Book', color: 'text-emerald-600', bg: 'bg-emerald-50', units: [] },
              { name: 'English', icon: 'Type', color: 'text-red-600', bg: 'bg-red-50', units: [] },
              { name: 'تاريخ الكويت', icon: 'Landmark', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
              { name: 'التربية الإسلامية', icon: 'MoonStar', color: 'text-slate-600', bg: 'bg-slate-100', units: [] },
              { name: 'القرآن الكريم', icon: 'BookOpen', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
              { name: 'المعلوماتية', icon: 'Monitor', color: 'text-gray-600', bg: 'bg-gray-100', units: [] }
            ]
          },
          { id: 11, name: 'الصف الحادي عشر', type: 'split' },
          { id: 12, name: 'الصف الثاني عشر', type: 'split' }
        ] as Grade[]
      }
    ]
  },
  private: {
    stages: [
      {
        id: 'priv', name: 'التعليم الخاص', icon: 'Languages',
        grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => ({
          id: i, name: `الصف ${i}`,
          subjects: [
            { name: 'مواد الهوية (عربي/دين/قرآن)', icon: 'BookOpen', color: 'text-emerald-700', bg: 'bg-emerald-50', units: [] },
            { name: 'English / Bilingual', icon: 'Languages', color: 'text-red-600', bg: 'bg-red-50', units: [] },
            { name: 'Math', icon: 'Calculator', color: 'text-blue-600', bg: 'bg-blue-50', units: [] },
            { name: 'Science', icon: 'FlaskConical', color: 'text-purple-600', bg: 'bg-purple-50', units: [] },
            { name: 'ICT', icon: 'LaptopCode', color: 'text-cyan-700', bg: 'bg-cyan-50', units: [] }
          ]
        }))
      }
    ]
  }
};

export const streamsData: Record<number, Record<string, Subject[]>> = {
  11: {
    science: [
      { name: 'الرياضيات', icon: 'Infinity', color: 'text-blue-600', bg: 'bg-blue-50', units: [] },
      { name: 'الفيزياء', icon: 'Atom', color: 'text-indigo-600', bg: 'bg-indigo-50', units: [] },
      { name: 'الكيمياء', icon: 'FlaskConical', color: 'text-pink-600', bg: 'bg-pink-50', units: [] },
      { name: 'الأحياء', icon: 'Bug', color: 'text-green-600', bg: 'bg-green-50', units: [] },
      { name: 'اللغة العربية', icon: 'Book', color: 'text-emerald-600', bg: 'bg-emerald-50', units: [] },
      { name: 'اللغة الإنجليزية', icon: 'Type', color: 'text-red-600', bg: 'bg-red-50', units: [] },
      { name: 'التربية الإسلامية', icon: 'MoonStar', color: 'text-slate-600', bg: 'bg-slate-100', units: [] },
      { name: 'القرآن الكريم', icon: 'BookOpen', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
    ],
    arts: [
      { name: 'التاريخ', icon: 'Scroll', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
      { name: 'الجغرافيا', icon: 'Globe2', color: 'text-teal-600', bg: 'bg-teal-50', units: [] },
      { name: 'علم النفس', icon: 'Brain', color: 'text-rose-600', bg: 'bg-rose-50', units: [] },
      { name: 'الإحصاء', icon: 'BarChart', color: 'text-blue-500', bg: 'bg-blue-50', units: [] },
      { name: 'اللغة العربية', icon: 'Book', color: 'text-emerald-600', bg: 'bg-emerald-50', units: [] },
      { name: 'اللغة الإنجليزية', icon: 'Type', color: 'text-red-600', bg: 'bg-red-50', units: [] },
      { name: 'الدستور', icon: 'Scale', color: 'text-slate-700', bg: 'bg-slate-200', units: [] },
      { name: 'القرآن الكريم', icon: 'BookOpen', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
    ]
  },
  12: {
    science: [
      { name: 'الفيزياء', icon: 'Zap', color: 'text-indigo-600', bg: 'bg-indigo-50', units: [] },
      { name: 'الكيمياء', icon: 'FlaskConical', color: 'text-pink-600', bg: 'bg-pink-50', units: [] },
      { name: 'الرياضيات', icon: 'Calculator', color: 'text-blue-600', bg: 'bg-blue-50', units: [] },
      { name: 'الأحياء', icon: 'Dna', color: 'text-green-600', bg: 'bg-green-50', units: [] },
      { name: 'اللغة العربية', icon: 'BookText', color: 'text-emerald-600', bg: 'bg-emerald-50', units: [] },
      { name: 'English', icon: 'Languages', color: 'text-red-600', bg: 'bg-red-50', units: [] },
      { name: 'القرآن الكريم', icon: 'BookOpen', color: 'text-amber-600', bg: 'bg-amber-50', units: [] },
      { name: 'الدستور', icon: 'Scale', color: 'text-slate-700', bg: 'bg-slate-200', units: [] }
    ],
    arts: [
      { name: 'قضايا البيئة', icon: 'Tree', color: 'text-green-700', bg: 'bg-green-50', units: [] },
      { name: 'تاريخ العالم الحديث', icon: 'Landmark', color: 'text-amber-700', bg: 'bg-amber-50', units: [] },
      { name: 'الإحصاء', icon: 'PieChart', color: 'text-blue-500', bg: 'bg-blue-50', units: [] },
      { name: 'الفرنسية', icon: 'TowerControl', color: 'text-purple-600', bg: 'bg-purple-50', units: [] },
      { name: 'اللغة العربية', icon: 'BookText', color: 'text-emerald-600', bg: 'bg-emerald-50', units: [] },
      { name: 'English', icon: 'Languages', color: 'text-red-600', bg: 'bg-red-50', units: [] },
      { name: 'الدستور', icon: 'Scale', color: 'text-slate-700', bg: 'bg-slate-200', units: [] },
      { name: 'القرآن الكريم', icon: 'BookOpen', color: 'text-amber-600', bg: 'bg-amber-50', units: [] },
    ]
  }
};

// Detailed enrichment for specific grades
const applyG1Details = () => {
  const grade1 = curriculumData.public.stages.find(s => s.id === "prim")?.grades.find(g => Number(g.id) === 1);
  if (!grade1 || !grade1.subjects) return;

  const islamic = grade1.subjects.find(s => s.name === "التربية الإسلامية");
  if (islamic) {
    islamic.units = [
      {
        term: "t1",
        name: "الفصل الدراسي الأول",
        chapters: [
          {
            title: "الوحدة الأولى",
            lessons: [
              { name: "ربنا الله تعالى", time: 20 * 60, examCount: 10, q: buildExamTemplate("ربنا الله تعالى") },
              { name: "توحيد الله تعالى", time: 20 * 60, examCount: 10, q: buildExamTemplate("توحيد الله تعالى") },
              { name: "أركان الإسلام", time: 20 * 60, examCount: 10, q: buildExamTemplate("أركان الإسلام") }
            ]
          }
        ]
      }
    ];
  }

  const english = grade1.subjects.find(s => s.name === "اللغة الإنجليزية");
  if (english) {
    english.units = [
      {
        term: "t1",
        name: "الفصل الدراسي الأول",
        chapters: [
          {
            title: "Unit 1: All About Myself",
            lessons: [
              { name: "Lesson 1: Phonics", time: 30 * 60, examCount: 6, q: buildExamTemplate("Phonics", 6) },
              { name: "Lesson 2: Vocabulary", time: 30 * 60, examCount: 6, q: buildExamTemplate("Vocabulary", 6) }
            ]
          }
        ]
      }
    ];
  }
};

applyG1Details();

// Initial enrichment
for (const sysKey of Object.keys(curriculumData)) {
  for (const stage of curriculumData[sysKey].stages) {
    for (const grade of stage.grades) {
      if (grade.type === "split") continue;
      for (const sub of (grade.subjects || [])) {
        if (!Array.isArray(sub.units) || sub.units.length === 0) sub.units = scaffoldFor(Number(grade.id));
      }
    }
  }
}
for (const gKey of Object.keys(streamsData)) {
  const gid = Number(gKey);
  for (const streamKey of Object.keys(streamsData[gid])) {
    for (const sub of streamsData[gid][streamKey]) {
      if (!Array.isArray(sub.units) || sub.units.length === 0) sub.units = scaffoldFor(gid);
    }
  }
}
