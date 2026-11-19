import React, { useMemo, useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard, downloadText, formatBytes } from '../utils/download';

// ============================================================================
// 1. JSON FORMATTER & VALIDATOR
// ============================================================================
const SAMPLE_JSON = JSON.stringify(
  {
    site: 'Smart Tools Hub',
    categories: 10,
    privacy: 'browser-local',
    languages: ['en', 'bn', 'hi'],
    features: { offlineReady: true, darkMode: true },
  },
  null,
  2
);

function sortObjectKeys(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortObjectKeys);
  if (val && typeof val === 'object') {
    return Object.keys(val as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortObjectKeys((val as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return val;
}

export const JsonFormatterTool: React.FC = () => {
  const { notify } = useHub();
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState<{ ok: boolean; message: string }>({ ok: true, message: 'Valid JSON' });

  const validateAndTransform = (mode: 'format' | 'minify' | 'sort') => {
    try {
      const parsed = JSON.parse(input);
      const data = mode === 'sort' ? sortObjectKeys(parsed) : parsed;
      const out = mode === 'minify' ? JSON.stringify(data) : JSON.stringify(data, null, indent);
      setInput(out);
      setStatus({ ok: true, message: `Valid JSON (${formatBytes(new Blob([out]).size)})` });
      notify(mode === 'minify' ? 'JSON minified' : mode === 'sort' ? 'JSON formatted with sorted keys' : 'JSON formatted');
    } catch (err) {
      setStatus({ ok: false, message: err instanceof Error ? err.message : 'Invalid JSON syntax' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => validateAndTransform('format')} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            Format / Validate
          </button>
          <button type="button" onClick={() => validateAndTransform('minify')} className="px-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
            Minify
          </button>
          <button type="button" onClick={() => validateAndTransform('sort')} className="px-3.5 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
            Sort Keys
          </button>
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="px-2.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              if (await copyToClipboard(input)) notify('JSON copied');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
          <button
            type="button"
            onClick={() => downloadText(input, 'formatted.json', 'application/json')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.json</span>
          </button>
        </div>
      </div>

      <div className={`text-xs font-medium px-3.5 py-2 rounded-lg border ${status.ok ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'}`}>
        {status.message}
      </div>

      <textarea
        rows={13}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        className="w-full p-4 text-xs sm:text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl leading-relaxed"
      />
    </div>
  );
};

// ============================================================================
// 2. BASE64 ENCODER & DECODER (UTF-8 SAFE + FILE TO BASE64)
// ============================================================================
export const Base64Tool: React.FC = () => {
  const { notify } = useHub();
  const [input, setInput] = useState('Smart Tools Hub — বাংলা · हिन्दी');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const encodeText = () => {
    try {
      const bytes = new TextEncoder().encode(input);
      let bin = '';
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      setOutput(btoa(bin));
      setError('');
    } catch {
      setError('Failed to encode text.');
    }
  };

  const decodeText = () => {
    try {
      const bin = atob(input.trim());
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      setOutput(new TextDecoder().decode(bytes));
      setError('');
    } catch {
      setError('Input is not valid Base64.');
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('For browser responsiveness, keep File-to-Base64 uploads under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOutput(String(reader.result || ''));
      setError('');
      notify(`Encoded ${file.name} to Base64 Data URL`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={encodeText} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
          Encode to Base64
        </button>
        <button type="button" onClick={decodeText} className="px-4 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg cursor-pointer">
          Decode from Base64
        </button>
        <label className="px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
          <span>Encode File to Data URL</span>
          <input type="file" onChange={(e) => handleFile(e.target.files?.[0])} className="sr-only" />
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Input</label>
          <textarea rows={8} value={input} onChange={(e) => setInput(e.target.value)} className="w-full p-3.5 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-500">Output</label>
            <button
              type="button"
              disabled={!output}
              onClick={async () => {
                if (await copyToClipboard(output)) notify('Output copied');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
          <textarea rows={8} readOnly value={output} className="w-full p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. URL & HTML ENCODER / DECODER
// ============================================================================
export const UrlHtmlEncoderTool: React.FC = () => {
  const { notify } = useHub();
  const [mode, setMode] = useState<'url' | 'html'>('url');
  const [input, setInput] = useState('https://example.com/search?q=smart tools & calculators');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = (dir: 'encode' | 'decode') => {
    setError('');
    try {
      if (mode === 'url') {
        setOutput(dir === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
      } else if (dir === 'encode') {
        setOutput(
          input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
        );
      } else {
        const doc = new DOMParser().parseFromString(input, 'text/html');
        setOutput(doc.documentElement.textContent || '');
      }
    } catch {
      setError('Malformed input string for decoding.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setMode('url');
              setInput('https://example.com/search?q=smart tools & calculators');
              setOutput('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'url' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            URL Encode / Decode
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('html');
              setInput('<div class="card">5 < 10 & "safe"</div>');
              setOutput('');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'html' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            HTML Entities
          </button>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => run('encode')} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            Encode
          </button>
          <button type="button" onClick={() => run('decode')} className="px-4 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg cursor-pointer">
            Decode
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea rows={7} value={input} onChange={(e) => setInput(e.target.value)} className="w-full p-3.5 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
        <div className="space-y-1.5">
          <textarea rows={7} readOnly value={output} className="w-full p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
          <button
            type="button"
            disabled={!output}
            onClick={async () => {
              if (await copyToClipboard(output)) notify('Output copied');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 disabled:opacity-40 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Output</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. CSS, HTML & JS MINIFIER
// ============================================================================
export const CodeMinifierTool: React.FC = () => {
  const { notify } = useHub();
  const [lang, setLang] = useState<'css' | 'html' | 'js'>('css');
  const [code, setCode] = useState(
    '/* Primary Card */\n.card {\n  background-color: #ffffff;\n  border: 1px solid #e2e8f0;\n  padding: 16px 24px;\n}\n'
  );
  const [minified, setMinified] = useState('');

  const runMinify = () => {
    let out = code;
    if (lang === 'css') {
      out = code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
    } else if (lang === 'html') {
      out = code
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .trim();
    } else {
      out = code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .join('\n')
        .replace(/\s*([=+\-*/{}();,:])\s*/g, '$1');
    }
    setMinified(out);
    notify(`${lang.toUpperCase()} minified`);
  };

  const origBytes = new Blob([code]).size;
  const minBytes = new Blob([minified]).size;
  const savedPct = origBytes && minified ? Math.round(((origBytes - minBytes) / origBytes) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['css', 'html', 'js'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLang(l);
                setMinified('');
              }}
              className={`px-3.5 py-1.5 text-xs font-medium uppercase rounded-md ${lang === l ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <button type="button" onClick={runMinify} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
          Minify {lang.toUpperCase()}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Source ({formatBytes(origBytes)})</label>
          <textarea rows={9} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} className="w-full p-3.5 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Minified {minified ? `(${formatBytes(minBytes)} · -${savedPct}%)` : ''}
            </span>
            <button
              type="button"
              disabled={!minified}
              onClick={async () => {
                if (await copyToClipboard(minified)) notify('Minified code copied');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 disabled:opacity-40 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
          <textarea rows={9} readOnly value={minified} spellCheck={false} className="w-full p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. UUID v4 & WEB CRYPTO HASH GENERATOR
// ============================================================================
function fallbackUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const UuidHashTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'uuid' | 'hash'>('uuid');
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, fallbackUuidV4));
  const [hashInput, setHashInput] = useState('Smart Tools Hub');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const generateUuids = (n = count) => {
    const safeN = Math.max(1, Math.min(50, n));
    setUuids(Array.from({ length: safeN }, fallbackUuidV4));
  };

  const computeHashes = async (buffer: ArrayBuffer) => {
    if (!window.crypto?.subtle) {
      setError('Web Crypto API (crypto.subtle) requires a secure HTTPS or localhost browser context.');
      return;
    }
    setError('');
    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
    const out: Record<string, string> = {};
    for (const algo of algos) {
      const digest = await crypto.subtle.digest(algo, buffer);
      out[algo] = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    }
    setHashes(out);
    notify('Cryptographic hashes computed');
  };

  return (
    <div className="space-y-5">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-sm">
        <button type="button" onClick={() => setTab('uuid')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'uuid' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          UUID v4 Generator
        </button>
        <button type="button" onClick={() => setTab('hash')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'hash' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          SHA Hash Generator
        </button>
      </div>

      {tab === 'uuid' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Quantity:
              <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="ml-2 w-20 px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </label>
            <button type="button" onClick={() => generateUuids(count)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate UUIDs</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(uuids.join('\n'))) notify('All UUIDs copied');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All</span>
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs sm:text-sm">
            {uuids.map((u) => (
              <div key={u} className="px-4 py-2.5 flex items-center justify-between gap-2">
                <span className="break-all">{u}</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (await copyToClipboard(u)) notify('UUID copied');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <textarea rows={4} value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="Type text to hash..." className="w-full p-3.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => computeHashes(new TextEncoder().encode(hashInput).buffer)}
              className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              Compute Text Hashes
            </button>
            <label className="px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <span>Hash a Local File</span>
              <input
                type="file"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) computeHashes(await f.arrayBuffer());
                }}
                className="sr-only"
              />
            </label>
          </div>
          {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {Object.keys(hashes).length > 0 && (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
              {Object.entries(hashes).map(([algo, val]) => (
                <div key={algo} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500">{algo}</div>
                    <div className="font-mono text-xs break-all mt-0.5 text-slate-900 dark:text-slate-100">{val}</div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (await copyToClipboard(val)) notify(`${algo} copied`);
                    }}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-center shrink-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. COLOR PICKER & HEX / RGB / HSL CONVERTER + WCAG CONTRAST
// ============================================================================
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function relativeLuminance(r: number, g: number, b: number) {
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export const ColorPickerConverterTool: React.FC = () => {
  const { notify } = useHub();
  const [hex, setHex] = useState('#2563EB');

  const rgb = useMemo(() => hexToRgb(hex) || { r: 37, g: 99, b: 235 }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const lum = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const contrastWhite = (1.05) / (lum + 0.05);
  const contrastDark = (lum + 0.05) / (0.05 + 0.008);

  const formats = [
    { label: 'HEX', value: hex.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 space-y-4">
        <div
          className="h-44 rounded-xl border border-slate-200 dark:border-slate-800 flex items-end p-4"
          style={{ backgroundColor: hexToRgb(hex) ? hex : '#2563EB' }}
        >
          <span className="font-mono text-sm font-semibold px-2.5 py-1 rounded bg-black/45 text-white">
            {hex.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={hexToRgb(hex) ? hex : '#2563EB'} onChange={(e) => setHex(e.target.value)} className="h-11 w-16 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer" />
          <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#2563EB" className="flex-1 px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
          {formats.map((f) => (
            <div key={f.label} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 mr-3">{f.label}</span>
                <span className="font-mono text-sm font-medium">{f.value}</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (await copyToClipboard(f.value)) notify(`${f.label} copied`);
                }}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Copy
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="text-slate-500">White text on this color</div>
            <div className="mt-1 font-mono tabular-nums text-lg font-bold">
              {contrastWhite.toFixed(2)}:1 · {contrastWhite >= 4.5 ? 'WCAG AA Pass' : 'Low contrast'}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="text-slate-500">Dark text (#0F172A) on this color</div>
            <div className="mt-1 font-mono tabular-nums text-lg font-bold">
              {contrastDark.toFixed(2)}:1 · {contrastDark >= 4.5 ? 'WCAG AA Pass' : 'Low contrast'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. REGEX TESTER & UNIX TIMESTAMP CONVERTER
// ============================================================================
export const RegexTimestampTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'regex' | 'timestamp'>('regex');
  const [pattern, setPattern] = useState('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b');
  const [flags, setFlags] = useState('gi');
  const [sample, setSample] = useState('Contact support@smarttoolshub.dev or hello@example.org for updates.');
  const [epochInput, setEpochInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));

  const regexEval = useMemo(() => {
    try {
      const safeFlags = flags.includes('g') ? flags : `${flags}g`;
      const re = new RegExp(pattern, safeFlags);
      const matches = Array.from(sample.matchAll(re)).map((m) => ({
        value: m[0],
        index: m.index ?? 0,
      }));
      return { ok: true, matches, error: '' };
    } catch (err) {
      return { ok: false, matches: [], error: err instanceof Error ? err.message : 'Invalid regex' };
    }
  }, [pattern, flags, sample]);

  const parsedEpoch = useMemo(() => {
    const raw = Number(epochInput.trim());
    if (!Number.isFinite(raw)) return null;
    const ms = Math.abs(raw) < 1e12 ? raw * 1000 : raw;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return {
      iso: d.toISOString(),
      local: d.toLocaleString(),
      utc: d.toUTCString(),
      seconds: Math.floor(ms / 1000),
      millis: Math.floor(ms),
    };
  }, [epochInput]);

  return (
    <div className="space-y-5">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-sm">
        <button type="button" onClick={() => setTab('regex')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'regex' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Regex Tester
        </button>
        <button type="button" onClick={() => setTab('timestamp')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'timestamp' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Timestamp Converter
        </button>
      </div>

      {tab === 'regex' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-9">
              <label className="block text-xs font-medium text-slate-500 mb-1">Regular Expression Pattern</label>
              <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">Flags</label>
              <input type="text" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gi" className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Test String</label>
            <textarea rows={4} value={sample} onChange={(e) => setSample(e.target.value)} className="w-full p-3.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
          </div>

          {!regexEval.ok ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{regexEval.error}</p>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-mono text-slate-500">
                Found {regexEval.matches.length} match(es)
              </div>
              {regexEval.matches.map((m, idx) => (
                <div key={idx} className="text-xs font-mono text-slate-900 dark:text-slate-100">
                  #{idx + 1} [index {m.index}]: <span className="font-semibold text-blue-600 dark:text-blue-400">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Unix Timestamp (seconds or ms)</label>
              <div className="flex gap-2">
                <input type="text" value={epochInput} onChange={(e) => setEpochInput(e.target.value)} className="flex-1 px-3.5 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
                <button type="button" onClick={() => setEpochInput(String(Math.floor(Date.now() / 1000)))} className="px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
                  Now
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date & Time → Unix Epoch</label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  const d = new Date(e.target.value);
                  if (!Number.isNaN(d.getTime())) setEpochInput(String(Math.floor(d.getTime() / 1000)));
                }}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {parsedEpoch && (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono">
              {[
                { label: 'ISO 8601 (UTC)', val: parsedEpoch.iso },
                { label: 'Local Time', val: parsedEpoch.local },
                { label: 'RFC / UTC', val: parsedEpoch.utc },
                { label: 'Unix Seconds', val: String(parsedEpoch.seconds) },
                { label: 'Unix Milliseconds', val: String(parsedEpoch.millis) },
              ].map((row) => (
                <div key={row.label} className="px-4 py-3 flex items-center justify-between gap-3">
                  <span className="text-slate-500">{row.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900 dark:text-white">{row.val}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (await copyToClipboard(row.val)) notify('Timestamp copied');
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
