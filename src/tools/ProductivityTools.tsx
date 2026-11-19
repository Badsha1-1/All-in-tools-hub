import React, { useEffect, useState } from 'react';
import { Copy, Download, Plus, Printer, Trash2 } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard, downloadText } from '../utils/download';
import { safeGetJson, safeSetJson } from '../utils/storage';

// ============================================================================
// 1. RESUME & COVER LETTER BUILDER (LIVE A4 PREVIEW + PRINT / PDF)
// ============================================================================
interface ResumeDraft {
  fullName: string;
  role: string;
  contact: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  coverRecipient: string;
  coverBody: string;
}

const DEFAULT_RESUME: ResumeDraft = {
  fullName: 'Maya Sen',
  role: 'Frontend Software Engineer',
  contact: 'maya.sen@example.com · +1 (555) 234-5678 · Dhaka / Remote',
  summary: 'Detail-oriented engineer focused on accessible, fast web applications, clean design systems, and privacy-first browser tooling.',
  experience: 'Frontend Engineer — Northstar Web Studio (2023–Present)\n• Built modular React and TypeScript dashboards serving 45k monthly users.\n• Reduced bundle size by 38% and improved WCAG AA accessibility scores.\n\nJunior Web Developer — PixelCraft Labs (2021–2023)\n• Developed responsive marketing sites and interactive calculators.',
  education: 'B.Sc. in Computer Science — National University (2017–2021)',
  skills: 'HTML5, CSS3, TypeScript, React, Tailwind CSS, Accessibility (WCAG), Git, UI Systems',
  coverRecipient: 'Hiring Manager, Acme Digital',
  coverBody: 'I am excited to apply for the Frontend Engineer position at Acme Digital. Over the past four years, I have focused on crafting fast, accessible interfaces and dependable browser utilities.\n\nI would welcome the opportunity to discuss how my experience in responsive engineering and UI architecture can support your upcoming product roadmap.',
};

export const ResumeCoverBuilderTool: React.FC = () => {
  const [mode, setMode] = useState<'resume' | 'cover'>('resume');
  const [draft, setDraft] = useState<ResumeDraft>(() => safeGetJson<ResumeDraft>('draft_resume', DEFAULT_RESUME));

  useEffect(() => {
    safeSetJson('draft_resume', draft);
  }, [draft]);

  const update = (key: keyof ResumeDraft, val: string) => setDraft((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button type="button" onClick={() => setMode('resume')} className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${mode === 'resume' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            Resume Builder
          </button>
          <button type="button" onClick={() => setMode('cover')} className={`px-3.5 py-1.5 text-xs font-medium rounded-md ${mode === 'cover' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            Cover Letter
          </button>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
          <button type="button" onClick={() => setDraft(DEFAULT_RESUME)} className="px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
            Reset Sample
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3 no-print">
          <input type="text" value={draft.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Full Name" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <input type="text" value={draft.role} onChange={(e) => update('role', e.target.value)} placeholder="Headline / Role" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <input type="text" value={draft.contact} onChange={(e) => update('contact', e.target.value)} placeholder="Email · Phone · City" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />

          {mode === 'resume' ? (
            <>
              <textarea rows={3} value={draft.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Professional Summary" className="w-full p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
              <textarea rows={6} value={draft.experience} onChange={(e) => update('experience', e.target.value)} placeholder="Experience" className="w-full p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
              <textarea rows={2} value={draft.education} onChange={(e) => update('education', e.target.value)} placeholder="Education" className="w-full p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
              <textarea rows={2} value={draft.skills} onChange={(e) => update('skills', e.target.value)} placeholder="Skills" className="w-full p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </>
          ) : (
            <>
              <input type="text" value={draft.coverRecipient} onChange={(e) => update('coverRecipient', e.target.value)} placeholder="Recipient & Company" className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
              <textarea rows={9} value={draft.coverBody} onChange={(e) => update('coverBody', e.target.value)} placeholder="Cover letter paragraphs..." className="w-full p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </>
          )}
        </div>

        {/* Printable A4 Live Preview */}
        <div className="lg:col-span-7 bg-white text-slate-900 border border-slate-300 rounded-xl p-8 space-y-5 shadow-xs print-sheet">
          <div className="border-b border-slate-300 pb-4">
            <h2 className="font-display text-2xl font-bold text-slate-900">{draft.fullName || 'Your Name'}</h2>
            <p className="text-sm font-medium text-blue-700 mt-0.5">{draft.role}</p>
            <p className="text-xs text-slate-600 mt-1">{draft.contact}</p>
          </div>

          {mode === 'resume' ? (
            <div className="space-y-4 text-sm leading-relaxed">
              <section>
                <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">Summary</h3>
                <p className="mt-1 text-slate-800 whitespace-pre-wrap">{draft.summary}</p>
              </section>
              <section>
                <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">Experience</h3>
                <p className="mt-1 text-slate-800 whitespace-pre-wrap">{draft.experience}</p>
              </section>
              <section>
                <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">Education</h3>
                <p className="mt-1 text-slate-800 whitespace-pre-wrap">{draft.education}</p>
              </section>
              <section>
                <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">Skills</h3>
                <p className="mt-1 text-slate-800">{draft.skills}</p>
              </section>
            </div>
          ) : (
            <div className="space-y-4 text-sm leading-relaxed text-slate-800">
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
              <p className="font-semibold">Dear {draft.coverRecipient || 'Hiring Manager'},</p>
              <p className="whitespace-pre-wrap">{draft.coverBody}</p>
              <div className="pt-4">
                <p>Sincerely,</p>
                <p className="font-semibold mt-1">{draft.fullName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. INVOICE GENERATOR
// ============================================================================
interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

export const InvoiceGeneratorTool: React.FC = () => {
  const [from, setFrom] = useState('Smart Studio Services\nhello@smartstudio.example');
  const [billTo, setBillTo] = useState('Acme Retail Ltd.\nbilling@acme.example');
  const [invoiceNo, setInvoiceNo] = useState('INV-2026-014');
  const [currency, setCurrency] = useState('$');
  const [taxLabel, setTaxLabel] = useState('GST / Tax');
  const [taxPct, setTaxPct] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: '1', description: 'Responsive Website Design', qty: 1, rate: 850 },
    { id: '2', description: 'Performance & SEO Setup', qty: 2, rate: 175 },
  ]);

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.rate, 0);
  const taxAmt = (Math.max(0, subtotal - discount) * taxPct) / 100;
  const total = Math.max(0, subtotal - discount) + taxAmt;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap gap-2">
          <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value="$">USD ($)</option>
            <option value="₹">INR (₹)</option>
            <option value="৳">BDT (৳)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
          </select>
          <input type="text" value={taxLabel} onChange={(e) => setTaxLabel(e.target.value)} placeholder="Tax Label" className="w-28 px-2.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <input type="number" min={0} max={50} value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} className="w-20 px-2.5 py-2 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" title="Tax %" />
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      <div className="bg-white text-slate-900 border border-slate-300 rounded-xl p-6 sm:p-8 space-y-6 print-sheet">
        <div className="flex flex-wrap justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase">Invoice</div>
            <div className="font-mono text-lg font-bold">{invoiceNo}</div>
            <div className="text-xs text-slate-500 mt-1">Date: {new Date().toISOString().slice(0, 10)}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-xl">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">From</label>
              <textarea rows={2} value={from} onChange={(e) => setFrom(e.target.value)} className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Bill To</label>
              <textarea rows={2} value={billTo} onChange={(e) => setBillTo(e.target.value)} className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={line.id} className="grid grid-cols-12 gap-2 items-center text-sm">
              <input
                type="text"
                value={line.description}
                onChange={(e) => setLines((prev) => prev.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r)))}
                placeholder="Item description"
                className="col-span-6 px-2.5 py-1.5 border border-slate-200 rounded"
              />
              <input
                type="number"
                min={1}
                value={line.qty}
                onChange={(e) => setLines((prev) => prev.map((r, i) => (i === idx ? { ...r, qty: Number(e.target.value) } : r)))}
                className="col-span-2 px-2.5 py-1.5 font-mono border border-slate-200 rounded"
              />
              <input
                type="number"
                min={0}
                step="any"
                value={line.rate}
                onChange={(e) => setLines((prev) => prev.map((r, i) => (i === idx ? { ...r, rate: Number(e.target.value) } : r)))}
                className="col-span-2 px-2.5 py-1.5 font-mono border border-slate-200 rounded"
              />
              <div className="col-span-1 text-right font-mono tabular-nums font-medium">
                {currency}
                {(line.qty * line.rate).toFixed(0)}
              </div>
              <button type="button" onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))} className="col-span-1 flex justify-end text-slate-400 hover:text-red-600 no-print cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, { id: String(Date.now()), description: '', qty: 1, rate: 0 }])}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline no-print cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line Item</span>
          </button>
        </div>

        <div className="ml-auto max-w-xs space-y-2 text-sm border-t border-slate-200 pt-4">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-mono tabular-nums">{currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-2 no-print">
            <span className="text-slate-600">Discount</span>
            <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24 px-2 py-1 text-right font-mono text-xs border border-slate-200 rounded" />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{taxLabel} ({taxPct}%)</span>
            <span className="font-mono tabular-nums">{currency}{taxAmt.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-slate-300 pt-2">
            <span>Total Due</span>
            <span className="font-mono tabular-nums text-blue-700">{currency}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. ONLINE NOTEPAD, CHECKLIST & DAILY PLANNER
// ============================================================================
interface CheckTask {
  id: string;
  text: string;
  time: string;
  done: boolean;
}

export const OnlineNotepadTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'notepad' | 'checklist'>('notepad');
  const [notes, setNotes] = useState<string>(() => safeGetJson<string>('draft_notepad', ''));
  const [tasks, setTasks] = useState<CheckTask[]>(() =>
    safeGetJson<CheckTask[]>('draft_tasks', [
      { id: '1', text: 'Review morning priorities', time: '09:00', done: false },
      { id: '2', text: 'Export project invoice PDF', time: '14:00', done: false },
    ])
  );
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('10:00');

  useEffect(() => {
    safeSetJson('draft_notepad', notes);
  }, [notes]);

  useEffect(() => {
    safeSetJson('draft_tasks', tasks);
  }, [tasks]);

  return (
    <div className="space-y-5">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-sm">
        <button type="button" onClick={() => setTab('notepad')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'notepad' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Auto-Save Notepad
        </button>
        <button type="button" onClick={() => setTab('checklist')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'checklist' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Daily Planner & Checklist
        </button>
      </div>

      {tab === 'notepad' ? (
        <div className="space-y-3">
          <textarea
            rows={12}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write freely — your notes auto-save locally in this browser..."
            className="w-full p-4 text-sm leading-relaxed bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-mono tabular-nums">
              {notes.trim() ? notes.trim().split(/\s+/).length : 0} words · {notes.length} chars · Saved locally
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => downloadText(notes, 'smart-tools-notes.txt')} className="inline-flex items-center gap-1 px-3 py-1.5 font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
              <button type="button" onClick={() => setNotes('')} className="px-3 py-1.5 font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTask.trim()) return;
              setTasks((prev) => [...prev, { id: String(Date.now()), text: newTask.trim(), time: newTime, done: false }]);
              setNewTask('');
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a planned task..." className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            <button type="submit" className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
              Add Task
            </button>
          </form>

          <ul className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
            {tasks.map((task) => (
              <li key={task.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer min-w-0">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() =>
                      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
                    }
                    className="accent-blue-600"
                  />
                  <span className="font-mono text-xs text-slate-400">{task.time}</span>
                  <span className={`text-sm truncate ${task.done ? 'line-through text-slate-400' : ''}`}>{task.text}</span>
                </label>
                <button type="button" onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))} className="text-slate-400 hover:text-red-600 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={async () => {
              const md = tasks.map((t) => `- [${t.done ? 'x' : ' '}] ${t.time} — ${t.text}`).join('\n');
              if (await copyToClipboard(md)) notify('Checklist copied as Markdown');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy as Markdown</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. MEETING NOTES, MONTHLY CALENDAR & PRINTABLE A4 SHEET MAKER
// ============================================================================
export const MeetingCalendarMakerTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'meeting' | 'calendar' | 'a4'>('calendar');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [meetingTitle, setMeetingTitle] = useState('Weekly Product Sync');
  const [attendees, setAttendees] = useState('Maya, Alex, Rohan');
  const [agenda, setAgenda] = useState('1. Launch readiness review\n2. Performance audit\n3. Next sprint milestones');
  const [actions, setActions] = useState('- [ ] Finalize deployment checklist (Maya)\n- [ ] Verify mobile breakpoints (Alex)');

  const [sheetType, setSheetType] = useState<'lined' | 'dot' | 'grid'>('dot');

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {[
            { id: 'calendar', label: 'Monthly Calendar' },
            { id: 'meeting', label: 'Meeting Notes' },
            { id: 'a4', label: 'Printable A4 Paper' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as 'meeting' | 'calendar' | 'a4')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${tab === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {tab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex gap-3 no-print">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
              {Array.from({ length: 12 }, (_, m) => (
                <option key={m} value={m}>
                  {new Date(2026, m, 1).toLocaleString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            <input type="number" min={1970} max={2100} value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28 px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>

          <div className="bg-white text-slate-900 border border-slate-300 rounded-xl p-6 print-sheet">
            <h3 className="font-display text-2xl font-bold mb-4">
              {monthName} {year}
            </h3>
            <div className="grid grid-cols-7 border-t border-l border-slate-300 text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="p-2 font-semibold bg-slate-100 border-r border-b border-slate-300 text-center">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e_${i}`} className="h-20 p-1.5 border-r border-b border-slate-200 bg-slate-50/50" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => (
                <div key={i + 1} className="h-20 p-1.5 border-r border-b border-slate-300 font-mono tabular-nums font-semibold">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'meeting' && (
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            <input type="text" value={attendees} onChange={(e) => setAttendees(e.target.value)} className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
          <textarea rows={4} value={agenda} onChange={(e) => setAgenda(e.target.value)} className="w-full p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <textarea rows={4} value={actions} onChange={(e) => setActions(e.target.value)} className="w-full p-3 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <button
            type="button"
            onClick={async () => {
              const md = `# ${meetingTitle}\nDate: ${new Date().toISOString().slice(0, 10)}\nAttendees: ${attendees}\n\n## Agenda & Notes\n${agenda}\n\n## Action Items\n${actions}`;
              if (await copyToClipboard(md)) notify('Meeting minutes copied as Markdown');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Markdown Minutes</span>
          </button>
        </div>
      )}

      {tab === 'a4' && (
        <div className="space-y-4">
          <div className="flex gap-2 no-print">
            {(['lined', 'dot', 'grid'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setSheetType(t)} className={`px-3.5 py-1.5 text-xs font-medium capitalize rounded-lg border cursor-pointer ${sheetType === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-700'}`}>
                {t} Paper
              </button>
            ))}
          </div>
          <div
            className="w-full h-[540px] bg-white border border-slate-300 rounded-xl print-sheet"
            style={
              sheetType === 'lined'
                ? { backgroundImage: 'linear-gradient(to bottom, transparent 27px, #cbd5e1 28px)', backgroundSize: '100% 28px' }
                : sheetType === 'dot'
                ? { backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }
                : { backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }
            }
          />
        </div>
      )}
    </div>
  );
};
