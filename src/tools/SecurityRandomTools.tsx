import React, { useMemo, useState } from 'react';
import { Copy, Lock, RefreshCw, ShieldAlert, Unlock } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard } from '../utils/download';

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const arr = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  let value = 0;
  do {
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value >= limit);
  return value % maxExclusive;
}

const WORDLIST = [
  'amber', 'anchor', 'atlas', 'breeze', 'canyon', 'cedar', 'cinder', 'cobalt', 'compass', 'coral',
  'delta', 'ember', 'falcon', 'fjord', 'forest', 'glacier', 'granite', 'harbor', 'horizon', 'ivory',
  'jasper', 'kestrel', 'lantern', 'linden', 'marble', 'meadow', 'meteor', 'nebula', 'nectar', 'obsidian',
  'olive', 'onyx', 'orchid', 'osprey', 'pebble', 'phoenix', 'pine', 'prism', 'quartz', 'raven',
  'redwood', 'ridge', 'river', 'saffron', 'sequoia', 'silver', 'solstice', 'sparrow', 'summit', 'timber',
  'topaz', 'tundra', 'valley', 'velvet', 'verbena', 'voyager', 'walnut', 'willow', 'zenith', 'zephyr',
];

// ============================================================================
// 1. CRYPTOGRAPHIC PASSWORD, PASSPHRASE & STRENGTH CHECKER
// ============================================================================
export const PasswordGeneratorTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'password' | 'passphrase' | 'checker'>('password');
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [checkText, setCheckText] = useState('');

  const buildPassword = () => {
    let pool = '';
    if (upper) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (digits) pool += '0123456789';
    if (symbols) pool += '!@#$%^&*()-_=+[]{}';
    if (!pool) return 'Select at least one character set';
    let out = '';
    for (let i = 0; i < length; i++) {
      out += pool[secureRandomInt(pool.length)];
    }
    return out;
  };

  const buildPassphrase = () => {
    const words = Array.from({ length: wordCount }, () => WORDLIST[secureRandomInt(WORDLIST.length)]);
    return `${words.join(separator)}${separator}${secureRandomInt(90) + 10}`;
  };

  const [generated, setGenerated] = useState<string>(() => buildPassword());
  const [passphrase, setPassphrase] = useState<string>(() => buildPassphrase());

  const strength = useMemo(() => {
    const p = tab === 'checker' ? checkText : tab === 'password' ? generated : passphrase;
    let charset = 0;
    if (/[a-z]/.test(p)) charset += 26;
    if (/[A-Z]/.test(p)) charset += 26;
    if (/[0-9]/.test(p)) charset += 10;
    if (/[^A-Za-z0-9]/.test(p)) charset += 32;
    const entropy = p.length && charset ? Math.round(p.length * Math.log2(charset)) : 0;
    const label = entropy >= 80 ? 'Very Strong' : entropy >= 60 ? 'Strong' : entropy >= 40 ? 'Moderate' : 'Weak';
    const color =
      entropy >= 80
        ? 'text-emerald-700 dark:text-emerald-400'
        : entropy >= 60
        ? 'text-blue-700 dark:text-blue-400'
        : entropy >= 40
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-red-700 dark:text-red-400';
    return { entropy, label, color, length: p.length };
  }, [tab, checkText, generated, passphrase]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-lg">
        {[
          { id: 'password', label: 'Password Generator' },
          { id: 'passphrase', label: 'Passphrase Generator' },
          { id: 'checker', label: 'Strength Checker' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as 'password' | 'passphrase' | 'checker')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tab === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'password' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <code className="font-mono text-base sm:text-lg font-semibold break-all text-slate-900 dark:text-white">
              {generated}
            </code>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  if (await copyToClipboard(generated)) notify('Password copied (not saved to history)');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setGenerated(buildPassword())}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Length: <span className="font-mono tabular-nums">{length}</span> characters
              <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-blue-600 mt-1" />
            </label>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300">
              {[
                { label: 'Uppercase (A–Z)', val: upper, set: setUpper },
                { label: 'Lowercase (a–z)', val: lower, set: setLower },
                { label: 'Numbers (0–9)', val: digits, set: setDigits },
                { label: 'Symbols (!@#$)', val: symbols, set: setSymbols },
              ].map((opt) => (
                <label key={opt.label} className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={opt.val} onChange={(e) => opt.set(e.target.checked)} className="accent-blue-600" />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'passphrase' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <code className="font-mono text-base sm:text-lg font-semibold break-all text-slate-900 dark:text-white">
              {passphrase}
            </code>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (await copyToClipboard(passphrase)) notify('Passphrase copied');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
              <button type="button" onClick={() => setPassphrase(buildPassphrase())} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Passphrase</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Words ({wordCount})</label>
              <input type="range" min={3} max={8} value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Separator</label>
              <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
                <option value="-">Hyphen (-)</option>
                <option value=".">Dot (.)</option>
                <option value="_">Underscore (_)</option>
                <option value=" ">Space</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tab === 'checker' && (
        <div className="space-y-3 max-w-xl">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Enter a password to evaluate offline (never transmitted or stored)
          </label>
          <input
            type="text"
            value={checkText}
            onChange={(e) => setCheckText(e.target.value)}
            placeholder="Type or paste a test password..."
            className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="font-mono tabular-nums">
          Strength: <span className={`font-semibold ${strength.color}`}>{strength.label}</span> · ~{strength.entropy} bits entropy · {strength.length} chars
        </div>
        <div className="inline-flex items-center gap-1.5 text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Client-side utility only; does not replace a password manager or professional security review.</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. RANDOM NUMBER, DICE ROLLER & COIN FLIP
// ============================================================================
export const RandomUtilityTool: React.FC = () => {
  const [tab, setTab] = useState<'number' | 'dice' | 'coin'>('number');
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [qty, setQty] = useState(5);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [numbers, setNumbers] = useState<number[]>([42, 17, 89, 5, 63]);

  const [sides, setSides] = useState(6);
  const [diceCount, setDiceCount] = useState(2);
  const [diceRolls, setDiceRolls] = useState<number[]>([4, 6]);

  const [coinResult, setCoinResult] = useState<'Heads' | 'Tails'>('Heads');
  const [tally, setTally] = useState({ heads: 1, tails: 0 });

  const rollNumbers = () => {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    const span = high - low + 1;
    const count = Math.max(1, Math.min(50, uniqueOnly ? Math.min(qty, span) : qty));
    if (uniqueOnly) {
      const set = new Set<number>();
      while (set.size < count) {
        set.add(low + secureRandomInt(span));
      }
      setNumbers(Array.from(set));
    } else {
      setNumbers(Array.from({ length: count }, () => low + secureRandomInt(span)));
    }
  };

  const rollDice = () => {
    setDiceRolls(Array.from({ length: diceCount }, () => secureRandomInt(sides) + 1));
  };

  const flipCoin = () => {
    const next = secureRandomInt(2) === 0 ? 'Heads' : 'Tails';
    setCoinResult(next);
    setTally((prev) => ({
      heads: prev.heads + (next === 'Heads' ? 1 : 0),
      tails: prev.tails + (next === 'Tails' ? 1 : 0),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-md">
        {[
          { id: 'number', label: 'Random Number' },
          { id: 'dice', label: 'Dice Roller' },
          { id: 'coin', label: 'Coin Flip' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as 'number' | 'dice' | 'coin')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
              tab === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'number' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Min</label>
              <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Max</label>
              <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Count</label>
              <input type="number" min={1} max={50} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pb-2 cursor-pointer">
              <input type="checkbox" checked={uniqueOnly} onChange={(e) => setUniqueOnly(e.target.checked)} className="accent-blue-600" />
              <span>Unique only</span>
            </label>
          </div>
          <button type="button" onClick={rollNumbers} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            Generate Numbers
          </button>
          <div className="flex flex-wrap gap-2">
            {numbers.map((n, i) => (
              <span key={`${n}_${i}`} className="px-4 py-2 font-mono tabular-nums text-lg font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {tab === 'dice' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Die Type</label>
              <select value={sides} onChange={(e) => setSides(Number(e.target.value))} className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
                {[4, 6, 8, 10, 12, 20].map((s) => <option key={s} value={s}>D{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Number of Dice</label>
              <select value={diceCount} onChange={(e) => setDiceCount(Number(e.target.value))} className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
                {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="button" onClick={rollDice} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
              Roll Dice
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {diceRolls.map((r, i) => (
              <div key={i} className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono text-2xl font-bold">
                {r}
              </div>
            ))}
            <span className="text-sm font-mono tabular-nums text-slate-600 dark:text-slate-400 ml-2">
              Sum: <strong>{diceRolls.reduce((a, b) => a + b, 0)}</strong>
            </span>
          </div>
        </div>
      )}

      {tab === 'coin' && (
        <div className="space-y-4">
          <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center max-w-sm space-y-4">
            <div className="font-display text-4xl font-bold text-blue-600 dark:text-blue-400">{coinResult}</div>
            <div className="text-xs font-mono tabular-nums text-slate-500">
              Heads: {tally.heads} · Tails: {tally.tails}
            </div>
            <div className="flex justify-center gap-2">
              <button type="button" onClick={flipCoin} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
                Flip Coin
              </button>
              <button type="button" onClick={() => setTally({ heads: 0, tails: 0 })} className="px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
                Reset Tally
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. RANDOM NAME, LIST WINNER PICKER & COLOR PALETTE GENERATOR
// ============================================================================
const FIRST_NAMES = ['Aarav', 'Ananya', 'Clara', 'Daniel', 'Farhan', 'Hannah', 'Ishaan', 'Maya', 'Nadia', 'Noah', 'Priya', 'Rohan', 'Sofia', 'Tariq', 'Zara'];
const LAST_NAMES = ['Ahmed', 'Bose', 'Chen', 'Das', 'Fernandez', 'Gupta', 'Khan', 'Kim', 'Miller', 'Patel', 'Rahman', 'Rivera', 'Roy', 'Sen', 'Walker'];

function randomHex(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return `#${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

export const RandomNameColorTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'names' | 'picker' | 'colors'>('names');
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: 6 }, () => `${FIRST_NAMES[secureRandomInt(FIRST_NAMES.length)]} ${LAST_NAMES[secureRandomInt(LAST_NAMES.length)]}`)
  );
  const [customList, setCustomList] = useState('Aarav\nNadia\nRohan\nMaya\nTariq');
  const [winner, setWinner] = useState('');
  const [swatches, setSwatches] = useState<{ hex: string; locked: boolean }[]>(() =>
    Array.from({ length: 5 }, () => ({ hex: randomHex(), locked: false }))
  );

  const regenNames = () => {
    setNames(
      Array.from({ length: 6 }, () => `${FIRST_NAMES[secureRandomInt(FIRST_NAMES.length)]} ${LAST_NAMES[secureRandomInt(LAST_NAMES.length)]}`)
    );
  };

  const pickWinner = () => {
    const entries = customList
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!entries.length) return;
    setWinner(entries[secureRandomInt(entries.length)]);
  };

  const regenColors = () => {
    setSwatches((prev) => prev.map((s) => (s.locked ? s : { ...s, hex: randomHex() })));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-lg">
        {[
          { id: 'names', label: 'Random Names' },
          { id: 'picker', label: 'Custom List Picker' },
          { id: 'colors', label: 'Random Color Palette' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as 'names' | 'picker' | 'colors')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tab === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'names' && (
        <div className="space-y-4">
          <button type="button" onClick={regenNames} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate 6 Names</span>
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {names.map((n, i) => (
              <button
                key={`${n}_${i}`}
                type="button"
                onClick={async () => {
                  if (await copyToClipboard(n)) notify(`Copied "${n}"`);
                }}
                className="p-3.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-500 flex items-center justify-between cursor-pointer"
              >
                <span className="text-sm font-medium">{n}</span>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'picker' && (
        <div className="space-y-4 max-w-lg">
          <label className="block text-xs text-slate-500">Paste one name/item per line:</label>
          <textarea rows={6} value={customList} onChange={(e) => setCustomList(e.target.value)} className="w-full p-3.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
          <button type="button" onClick={pickWinner} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            Pick Random Winner
          </button>
          {winner && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-lg font-display font-bold text-blue-700 dark:text-blue-300">
              Selected: {winner}
            </div>
          )}
        </div>
      )}

      {tab === 'colors' && (
        <div className="space-y-4">
          <button type="button" onClick={regenColors} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate Palette</span>
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {swatches.map((s, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="h-28" style={{ backgroundColor: s.hex }} />
                <div className="p-2.5 bg-white dark:bg-slate-950 flex items-center justify-between text-xs font-mono">
                  <button
                    type="button"
                    onClick={async () => {
                      if (await copyToClipboard(s.hex)) notify(`Copied ${s.hex}`);
                    }}
                    className="hover:text-blue-600 cursor-pointer"
                  >
                    {s.hex}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSwatches((prev) => prev.map((item, i) => (i === idx ? { ...item, locked: !item.locked } : item)))
                    }
                    aria-label={s.locked ? 'Unlock swatch' : 'Lock swatch'}
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    {s.locked ? <Lock className="w-3.5 h-3.5 text-blue-600" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
