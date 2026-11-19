import React, { useMemo, useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard } from '../utils/download';

// ============================================================================
// 1. WORD, CHARACTER, SENTENCE, PARAGRAPH & READING TIME COUNTER
// ============================================================================
export const WordCounterTool: React.FC = () => {
  const { notify } = useHub();
  const [text, setText] = useState(
    'Smart Tools Hub brings together everyday browser utilities in one clean workspace. Paste an essay, article, or social post here to analyze word count, character length, sentence count, and estimated reading time instantaneously.'
  );

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
    const readMin = words / 200;
    const readDisplay = readMin < 1 ? `${Math.ceil(readMin * 60)} sec` : `${readMin.toFixed(1)} min`;
    return { words, chars, charsNoSpaces, sentences, paragraphs, readDisplay };
  }, [text]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Words', val: stats.words.toLocaleString() },
          { label: 'Characters', val: stats.chars.toLocaleString() },
          { label: 'No Spaces', val: stats.charsNoSpaces.toLocaleString() },
          { label: 'Sentences', val: stats.sentences.toLocaleString() },
          { label: 'Paragraphs', val: stats.paragraphs.toLocaleString() },
          { label: 'Read Time', val: stats.readDisplay },
        ].map((item) => (
          <div key={item.label} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">{item.label}</div>
            <div className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-900 dark:text-white">{item.val}</div>
          </div>
        ))}
      </div>

      <textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        className="w-full p-4 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl leading-relaxed"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            if (await copyToClipboard(text)) notify('Text copied');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Text</span>
        </button>
        <button
          type="button"
          onClick={() => setText('')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CASE CONVERTER & TEXT-TO-SLUG
// ============================================================================
export const CaseConverterTool: React.FC = () => {
  const { notify } = useHub();
  const [text, setText] = useState('smart tools hub: everyday browser utilities');

  const toWords = (s: string) =>
    s
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const transforms: { label: string; fn: (s: string) => string }[] = [
    { label: 'UPPERCASE', fn: (s) => s.toUpperCase() },
    { label: 'lowercase', fn: (s) => s.toLowerCase() },
    {
      label: 'Title Case',
      fn: (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    },
    {
      label: 'Sentence case',
      fn: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()),
    },
    {
      label: 'camelCase',
      fn: (s) =>
        toWords(s)
          .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
          .join(''),
    },
    {
      label: 'snake_case',
      fn: (s) => toWords(s).map((w) => w.toLowerCase()).join('_'),
    },
    {
      label: 'url-slug',
      fn: (s) =>
        s
          .toLowerCase()
          .normalize('NFKD')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/[\s_-]+/g, '-'),
    },
  ];

  return (
    <div className="space-y-4">
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to transform..."
        className="w-full p-4 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
      />
      <div className="flex flex-wrap gap-2">
        {transforms.map((tr) => (
          <button
            key={tr.label}
            type="button"
            onClick={() => setText(tr.fn(text))}
            className="px-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {tr.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={async () => {
            if (await copyToClipboard(text)) notify('Converted text copied');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Output</span>
        </button>
        <button type="button" onClick={() => setText('')} className="px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
          Clear
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 3. REMOVE EXTRA SPACES & DUPLICATE LINES
// ============================================================================
export const TextCleanerTool: React.FC = () => {
  const { notify } = useHub();
  const [input, setInput] = useState(
    'Apple   \nBanana\n  Apple\n\nCherry    pie\nBanana\n   Date  '
  );
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [dedupe, setDedupe] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const cleaned = useMemo(() => {
    let lines = input.split(/\r?\n/);
    if (collapseSpaces) lines = lines.map((l) => l.replace(/[ \t]+/g, ' '));
    if (trimLines) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter((l) => l.length > 0);
    if (dedupe) {
      const seen = new Set<string>();
      lines = lines.filter((l) => {
        const key = ignoreCase ? l.toLowerCase() : l;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return lines.join('\n');
  }, [input, collapseSpaces, trimLines, removeEmpty, dedupe, ignoreCase]);

  const removedChars = Math.max(0, input.length - cleaned.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
        {[
          { label: 'Collapse multiple spaces', val: collapseSpaces, set: setCollapseSpaces },
          { label: 'Trim line edges', val: trimLines, set: setTrimLines },
          { label: 'Remove blank lines', val: removeEmpty, set: setRemoveEmpty },
          { label: 'Remove duplicate lines', val: dedupe, set: setDedupe },
          { label: 'Case-insensitive dedupe', val: ignoreCase, set: setIgnoreCase },
        ].map((opt) => (
          <label key={opt.label} className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={opt.val} onChange={(e) => opt.set(e.target.checked)} className="accent-blue-600" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Original Input</label>
          <textarea rows={9} value={input} onChange={(e) => setInput(e.target.value)} className="w-full p-3.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-500">
              Cleaned Output ({removedChars} chars removed)
            </label>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(cleaned)) notify('Cleaned text copied');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
          <textarea rows={9} readOnly value={cleaned} className="w-full p-3.5 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. FIND & REPLACE, TEXT SORTER & REVERSER
// ============================================================================
export const TextTransformTool: React.FC = () => {
  const { notify } = useHub();
  const [text, setText] = useState('Zebra\nApple\nMango\nBanana\nCherry');
  const [findStr, setFindStr] = useState('');
  const [replaceStr, setReplaceStr] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const runReplace = () => {
    if (!findStr) return;
    const escaped = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, caseSensitive ? 'g' : 'gi');
    const matches = text.match(regex)?.length ?? 0;
    setText(text.replace(regex, replaceStr));
    notify(`Replaced ${matches} occurrence(s)`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Find</label>
          <input type="text" value={findStr} onChange={(e) => setFindStr(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Replace With</label>
          <input type="text" value={replaceStr} onChange={(e) => setReplaceStr(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div className="sm:col-span-4 flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="accent-blue-600" />
            <span>Match case</span>
          </label>
          <button type="button" onClick={runReplace} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer whitespace-nowrap">
            Replace All
          </button>
        </div>
      </div>

      <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="w-full p-4 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setText(text.split(/\r?\n/).sort((a, b) => a.localeCompare(b)).join('\n'))} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
          Sort A → Z
        </button>
        <button type="button" onClick={() => setText(text.split(/\r?\n/).sort((a, b) => b.localeCompare(a)).join('\n'))} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
          Sort Z → A
        </button>
        <button type="button" onClick={() => setText(text.split(/\r?\n/).sort((a, b) => a.length - b.length).join('\n'))} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
          Sort by Length
        </button>
        <button type="button" onClick={() => setText(text.split(/\r?\n/).reverse().join('\n'))} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
          Reverse Lines
        </button>
        <button type="button" onClick={() => setText([...text].reverse().join(''))} className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
          Reverse Characters
        </button>
        <button
          type="button"
          onClick={async () => {
            if (await copyToClipboard(text)) notify('Copied to clipboard');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 5. TEXT COMPARE (DIFF) & LOREM IPSUM GENERATOR
// ============================================================================
const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
];

export const TextCompareLoremTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'compare' | 'lorem'>('compare');
  const [left, setLeft] = useState('Line 1: Smart Tools Hub\nLine 2: Fast browser tools\nLine 3: Old line');
  const [right, setRight] = useState('Line 1: Smart Tools Hub\nLine 2: Fast browser tools\nLine 3: Updated line\nLine 4: Added line');
  const [paragraphs, setParagraphs] = useState(3);

  const diffRows = useMemo(() => {
    const a = left.split(/\r?\n/);
    const b = right.split(/\r?\n/);
    const maxLen = Math.max(a.length, b.length);
    const rows: { num: number; a: string; b: string; status: 'same' | 'changed' | 'added' | 'removed' }[] = [];
    for (let i = 0; i < maxLen; i++) {
      const la = a[i];
      const lb = b[i];
      if (la === lb) rows.push({ num: i + 1, a: la ?? '', b: lb ?? '', status: 'same' });
      else if (la === undefined) rows.push({ num: i + 1, a: '', b: lb, status: 'added' });
      else if (lb === undefined) rows.push({ num: i + 1, a: la, b: '', status: 'removed' });
      else rows.push({ num: i + 1, a: la, b: lb, status: 'changed' });
    }
    return rows;
  }, [left, right]);

  const loremText = useMemo(() => {
    const out: string[] = [];
    for (let p = 0; p < Math.max(1, Math.min(20, paragraphs)); p++) {
      const s1 = LOREM_SENTENCES[(p * 2) % LOREM_SENTENCES.length];
      const s2 = LOREM_SENTENCES[(p * 2 + 1) % LOREM_SENTENCES.length];
      const s3 = LOREM_SENTENCES[(p * 2 + 2) % LOREM_SENTENCES.length];
      out.push(`${s1} ${s2} ${s3}`);
    }
    return out.join('\n\n');
  }, [paragraphs]);

  return (
    <div className="space-y-5">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-sm">
        <button type="button" onClick={() => setTab('compare')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'compare' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Text Compare (Diff)
        </button>
        <button type="button" onClick={() => setTab('lorem')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'lorem' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Lorem Ipsum Generator
        </button>
      </div>

      {tab === 'compare' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Original Text</label>
              <textarea rows={6} value={left} onChange={(e) => setLeft(e.target.value)} className="w-full p-3 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Modified Text</label>
              <textarea rows={6} value={right} onChange={(e) => setRight(e.target.value)} className="w-full p-3 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden font-mono text-xs divide-y divide-slate-100 dark:divide-slate-800">
            {diffRows.map((row) => (
              <div
                key={row.num}
                className={`grid grid-cols-12 gap-2 px-3 py-2 ${
                  row.status === 'added'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : row.status === 'removed'
                    ? 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200'
                    : row.status === 'changed'
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-950'
                }`}
              >
                <span className="col-span-1 text-slate-400 tabular-nums">{row.num}</span>
                <span className="col-span-5 break-all">{row.a || '—'}</span>
                <span className="col-span-6 break-all">{row.b || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Paragraphs: <span className="font-mono">{paragraphs}</span>
            </label>
            <input type="range" min={1} max={12} value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} className="w-40 accent-blue-600" />
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(loremText)) notify('Lorem Ipsum copied');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>
          </div>
          <textarea readOnly rows={10} value={loremText} className="w-full p-4 text-sm leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
        </div>
      )}
    </div>
  );
};
