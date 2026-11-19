import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { safeGetJson, safeSetJson } from '../utils/storage';

// ============================================================================
// 1. GPA, CGPA & MARKS-TO-GRADE CALCULATOR
// ============================================================================
interface CourseRow {
  id: string;
  name: string;
  credits: number;
  gradePoint: number;
}

export const GpaCalculatorTool: React.FC = () => {
  const { addCalcHistory, notify } = useHub();
  const [tab, setTab] = useState<'gpa' | 'marks'>('gpa');
  const [scale, setScale] = useState<4 | 5 | 10>(4);
  const [courses, setCourses] = useState<CourseRow[]>([
    { id: '1', name: 'Mathematics', credits: 3, gradePoint: 3.7 },
    { id: '2', name: 'Computer Science', credits: 4, gradePoint: 4.0 },
    { id: '3', name: 'Physics', credits: 3, gradePoint: 3.3 },
  ]);
  const [prevCgpa, setPrevCgpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

  const [obtained, setObtained] = useState('438');
  const [totalMarks, setTotalMarks] = useState('500');

  const gpaStats = useMemo(() => {
    const valid = courses.filter((c) => c.credits > 0 && c.gradePoint >= 0);
    const totalCred = valid.reduce((s, c) => s + c.credits, 0);
    const totalPts = valid.reduce((s, c) => s + c.credits * Math.min(scale, c.gradePoint), 0);
    const semGpa = totalCred ? totalPts / totalCred : 0;

    const pC = Number(prevCredits) || 0;
    const pG = Number(prevCgpa) || 0;
    const cumCred = totalCred + pC;
    const cumGpa = cumCred ? (totalPts + pC * Math.min(scale, pG)) / cumCred : semGpa;

    return { totalCred, semGpa, cumGpa, hasPrev: pC > 0 && pG > 0 };
  }, [courses, scale, prevCgpa, prevCredits]);

  const marksPct = useMemo(() => {
    const o = Number(obtained);
    const t = Number(totalMarks);
    if (!Number.isFinite(o) || !Number.isFinite(t) || t <= 0) return null;
    const pct = (o / t) * 100;
    const grade =
      pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
    return { pct, grade };
  }, [obtained, totalMarks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button type="button" onClick={() => setTab('gpa')} className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${tab === 'gpa' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            GPA & CGPA
          </button>
          <button type="button" onClick={() => setTab('marks')} className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${tab === 'marks' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            Marks & Percentage-to-Grade
          </button>
        </div>

        {tab === 'gpa' && (
          <select value={scale} onChange={(e) => setScale(Number(e.target.value) as 4 | 5 | 10)} className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value={4}>4.0 Scale (US / Intl)</option>
            <option value={5}>5.0 Scale (SSC / HSC)</option>
            <option value={10}>10.0 Scale (University CGPA)</option>
          </select>
        )}
      </div>

      {tab === 'gpa' ? (
        <div className="space-y-4">
          <div className="space-y-2.5">
            {courses.map((c, idx) => (
              <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) =>
                    setCourses((prev) => prev.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r)))
                  }
                  placeholder="Course name"
                  className="col-span-5 px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={c.credits}
                  onChange={(e) =>
                    setCourses((prev) => prev.map((r, i) => (i === idx ? { ...r, credits: Number(e.target.value) } : r)))
                  }
                  placeholder="Credits"
                  className="col-span-3 px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
                <input
                  type="number"
                  min={0}
                  max={scale}
                  step={0.1}
                  value={c.gradePoint}
                  onChange={(e) =>
                    setCourses((prev) => prev.map((r, i) => (i === idx ? { ...r, gradePoint: Number(e.target.value) } : r)))
                  }
                  placeholder={`GP (/${scale})`}
                  className="col-span-3 px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setCourses((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label="Remove course"
                  className="col-span-1 flex justify-center text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCourses((prev) => [...prev, { id: String(Date.now()), name: `Course ${prev.length + 1}`, credits: 3, gradePoint: scale === 10 ? 8.5 : 3.5 }])}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Previous CGPA (optional)</label>
              <input type="number" step="0.01" min={0} max={scale} value={prevCgpa} onChange={(e) => setPrevCgpa(e.target.value)} placeholder="e.g. 3.65" className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Previous Credits Earned</label>
              <input type="number" min={0} value={prevCredits} onChange={(e) => setPrevCredits(e.target.value)} placeholder="e.g. 45" className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="text-xs text-slate-600 dark:text-slate-400">Semester GPA</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-blue-700 dark:text-blue-300">
                {gpaStats.semGpa.toFixed(2)} / {scale}.0
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">Cumulative CGPA</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold">
                {gpaStats.cumGpa.toFixed(2)} / {scale}.0
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">Term Credits</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold">{gpaStats.totalCred}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              addCalcHistory('GPA Calculator', `${courses.length} courses (${scale}.0 scale)`, `GPA ${gpaStats.semGpa.toFixed(2)}`);
              notify('GPA saved to local calculation history');
            }}
            className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            Save to History
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Marks Obtained</label>
              <input type="number" value={obtained} onChange={(e) => setObtained(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Maximum Marks</label>
              <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
          </div>
          {marksPct && (
            <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Percentage</div>
                <div className="font-mono tabular-nums text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {marksPct.pct.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600 dark:text-slate-400">Standard Grade</div>
                <div className="font-display text-3xl font-bold text-slate-900 dark:text-white">{marksPct.grade}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. TYPING SPEED TEST
// ============================================================================
const TYPING_PASSAGES = [
  'Clear thinking and steady practice make everyday digital work faster and calmer. Good tools stay out of your way so you can focus on solving real problems with precision and confidence.',
  'Modern web browsers can resize photographs, combine PDF documents, verify JSON structures, and compute cryptographic hashes directly on your own computer without uploading private files.',
  'Consistent habits compound quietly over weeks and months. Measuring typing accuracy before speed builds muscle memory that reduces backspacing and improves long-form writing flow.',
];

export const TypingSpeedTestTool: React.FC = () => {
  const [duration, setDuration] = useState(60);
  const [passageIdx, setPassageIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(60);
  const [finished, setFinished] = useState(false);

  const passage = TYPING_PASSAGES[passageIdx];

  useEffect(() => {
    if (!startedAt || finished) return;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left === 0) setFinished(true);
    }, 250);
    return () => window.clearInterval(timer);
  }, [startedAt, duration, finished]);

  const reset = (nextDuration = duration, nextIdx = passageIdx) => {
    setDuration(nextDuration);
    setPassageIdx(nextIdx);
    setTyped('');
    setStartedAt(null);
    setRemaining(nextDuration);
    setFinished(false);
  };

  let correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === passage[i]) correctChars++;
  }
  const elapsedMin = startedAt ? Math.max(0.05, (duration - remaining) / 60) : 0;
  const wpm = startedAt ? Math.round(correctChars / 5 / elapsedMin) : 0;
  const accuracy = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[30, 60, 120].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => reset(sec, passageIdx)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border cursor-pointer ${
                duration === sec ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              {sec}s
            </button>
          ))}
          <button
            type="button"
            onClick={() => reset(duration, (passageIdx + 1) % TYPING_PASSAGES.length)}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
          >
            Next Passage
          </button>
        </div>

        <div className="flex items-center gap-5 font-mono tabular-nums text-sm">
          <span>Time: <strong>{remaining}s</strong></span>
          <span>WPM: <strong className="text-blue-600 dark:text-blue-400">{wpm}</strong></span>
          <span>Accuracy: <strong>{accuracy}%</strong></span>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm sm:text-base leading-relaxed select-none">
        {passage.split('').map((ch, idx) => {
          let cls = 'text-slate-400 dark:text-slate-500';
          if (idx < typed.length) {
            cls = typed[idx] === ch ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 bg-red-100 dark:bg-red-950/60';
          } else if (idx === typed.length) {
            cls = 'text-slate-900 dark:text-white underline decoration-blue-600 decoration-2';
          }
          return (
            <span key={idx} className={cls}>
              {ch}
            </span>
          );
        })}
      </div>

      <textarea
        rows={4}
        disabled={finished}
        value={typed}
        onChange={(e) => {
          if (!startedAt) setStartedAt(Date.now());
          const val = e.target.value;
          setTyped(val);
          if (val.length >= passage.length) setFinished(true);
        }}
        placeholder="Start typing the passage above — timer starts on your first keystroke..."
        className="w-full p-4 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl disabled:opacity-60"
      />

      <div className="flex items-center justify-between">
        {finished ? (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Test complete — {wpm} WPM at {accuracy}% accuracy ({typed.length - correctChars} errors).
          </p>
        ) : (
          <span className="text-xs text-slate-500">Type steadily for accurate net WPM measurement.</span>
        )}
        <button type="button" onClick={() => reset()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 3. EXAM COUNTDOWN & STUDY TIME PLANNER
// ============================================================================
interface ExamItem {
  id: string;
  title: string;
  date: string;
}

export const ExamCountdownTool: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>(() =>
    safeGetJson<ExamItem[]>('exams_v1', [
      { id: '1', title: 'Final Mathematics Exam', date: new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10) },
    ])
  );
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [chapters, setChapters] = useState(14);
  const [hoursPerChapter, setHoursPerChapter] = useState(2.5);
  const [daysLeft, setDaysLeft] = useState(21);

  const saveExams = (next: ExamItem[]) => {
    setExams(next);
    safeSetJson('exams_v1', next);
  };

  const addExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    saveExams([...exams, { id: String(Date.now()), title: title.trim(), date }]);
    setTitle('');
    setDate('');
  };

  const totalHours = chapters * hoursPerChapter;
  const dailyHours = daysLeft > 0 ? totalHours / daysLeft : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="font-display text-base font-semibold">Exam Countdowns</h3>
        <form onSubmit={addExam} className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exam title (e.g. Physics Midterm)" className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <button type="submit" className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg whitespace-nowrap cursor-pointer">
            Add
          </button>
        </form>

        <div className="space-y-2.5">
          {exams.map((ex) => {
            const diffDays = Math.ceil((new Date(`${ex.date}T09:00:00`).getTime() - Date.now()) / 86_400_000);
            return (
              <div key={ex.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{ex.title}</div>
                  <div className="text-xs font-mono text-slate-500">{ex.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono tabular-nums text-sm font-bold ${diffDays <= 7 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {diffDays > 0 ? `${diffDays} days left` : diffDays === 0 ? 'Today' : `${Math.abs(diffDays)}d ago`}
                  </span>
                  <button type="button" onClick={() => saveExams(exams.filter((x) => x.id !== ex.id))} aria-label="Remove exam" className="text-slate-400 hover:text-red-600 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-base font-semibold">Study Time Planner</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Chapters</label>
            <input type="number" min={1} value={chapters} onChange={(e) => setChapters(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Hrs / Chapter</label>
            <input type="number" step="0.5" min={0.5} value={hoursPerChapter} onChange={(e) => setHoursPerChapter(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Days Left</label>
            <input type="number" min={1} value={daysLeft} onChange={(e) => setDaysLeft(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
        </div>
        <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-1">
          <div className="text-xs text-slate-600 dark:text-slate-400">Recommended Daily Study Time</div>
          <div className="font-mono tabular-nums text-3xl font-bold text-blue-700 dark:text-blue-300">
            {dailyHours.toFixed(1)} hrs / day
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Total syllabus workload: {totalHours.toFixed(1)} hours (~{Math.ceil((dailyHours * 60) / 25)} Pomodoro sessions/day)
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. INTERACTIVE PRACTICE QUIZ GENERATOR
// ============================================================================
interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  subject: 'Math' | 'Science' | 'Web Dev';
}

const QUIZ_BANK: QuizQuestion[] = [
  { subject: 'Math', q: 'What is 15% of 240?', options: ['32', '36', '38', '42'], answer: 1 },
  { subject: 'Math', q: 'If 3x + 7 = 22, what is the value of x?', options: ['3', '4', '5', '6'], answer: 2 },
  { subject: 'Math', q: 'What is the interior angle sum of a hexagon?', options: ['540°', '720°', '900°', '360°'], answer: 1 },
  { subject: 'Science', q: 'Which planet has the most prominent ring system?', options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'], answer: 2 },
  { subject: 'Science', q: 'What is the chemical symbol for Potassium?', options: ['P', 'Pt', 'Po', 'K'], answer: 3 },
  { subject: 'Science', q: 'At standard pressure, water boils at what temperature in Kelvin?', options: ['273.15 K', '373.15 K', '310.15 K', '473.15 K'], answer: 1 },
  { subject: 'Web Dev', q: 'Which HTTP status code indicates a resource was not found?', options: ['200', '301', '403', '404'], answer: 3 },
  { subject: 'Web Dev', q: 'Which browser API generates cryptographically strong random values?', options: ['Math.random()', 'crypto.getRandomValues()', 'Date.now()', 'JSON.parse()'], answer: 1 },
  { subject: 'Web Dev', q: 'In CSS, which property prevents orphan words on wrapped headings?', options: ['text-wrap: balance', 'overflow: hidden', 'display: table', 'float: none'], answer: 0 },
];

export const QuizGeneratorTool: React.FC = () => {
  const [subject, setSubject] = useState<'All' | 'Math' | 'Science' | 'Web Dev'>('All');
  const [deck, setDeck] = useState<QuizQuestion[]>(() => QUIZ_BANK.slice(0, 5));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const startQuiz = (sub = subject) => {
    const pool = sub === 'All' ? [...QUIZ_BANK] : QUIZ_BANK.filter((q) => q.subject === sub);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setSubject(sub);
    setDeck(pool.slice(0, 5));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  const current = deck[index];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Math', 'Science', 'Web Dev'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => startQuiz(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                subject === s ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          Score: {score} / {deck.length}
        </span>
      </div>

      {done ? (
        <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3 text-center">
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Quiz Finished: {score} / {deck.length} ({Math.round((score / Math.max(1, deck.length)) * 100)}%)
          </div>
          <button type="button" onClick={() => startQuiz(subject)} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            Generate New Random Quiz
          </button>
        </div>
      ) : current ? (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-mono">
            Question {index + 1} of {deck.length} · {current.subject}
          </div>
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{current.q}</h3>
          <div className="space-y-2">
            {current.options.map((opt, i) => {
              const picked = selected !== null;
              let cls = 'border-slate-200 dark:border-slate-800 hover:border-blue-500';
              if (picked) {
                if (i === current.answer) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                else if (i === selected) cls = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={picked}
                  onClick={() => {
                    setSelected(i);
                    if (i === current.answer) setScore((s) => s + 1);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm rounded-xl border transition-colors cursor-pointer ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <button
              type="button"
              onClick={() => {
                if (index + 1 >= deck.length) setDone(true);
                else {
                  setIndex((i) => i + 1);
                  setSelected(null);
                }
              }}
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              {index + 1 >= deck.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
