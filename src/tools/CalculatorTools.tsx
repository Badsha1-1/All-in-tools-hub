import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard } from '../utils/download';

// ============================================================================
// 1. AGE CALCULATOR
// ============================================================================
export const AgeCalculatorTool: React.FC = () => {
  const { notify, addCalcHistory } = useHub();
  const todayIso = new Date().toISOString().slice(0, 10);
  const [dob, setDob] = useState('1998-05-15');
  const [asOf, setAsOf] = useState(todayIso);

  const result = useMemo(() => {
    const start = new Date(`${dob}T00:00:00`);
    const end = new Date(`${asOf}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return null;
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonthDays;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    let nextBirthday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
    if (nextBirthday <= end) {
      nextBirthday = new Date(end.getFullYear() + 1, start.getMonth(), start.getDate());
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - end.getTime()) / 86_400_000);

    return { years, months, days, totalDays, totalWeeks, totalMonths, daysToNextBirthday };
  }, [dob, asOf]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date of Birth</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Calculate Age As Of</label>
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
      </div>

      {!result ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Date of birth must be on or before the target date.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="text-xs text-slate-600 dark:text-slate-400">Exact Age</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-blue-700 dark:text-blue-300">
                {result.years}y {result.months}m {result.days}d
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Days Lived</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
                {result.totalDays.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">Next Birthday In</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
                {result.daysToNextBirthday} days
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 pt-2">
            <span className="font-mono tabular-nums">
              {result.totalMonths.toLocaleString()} months · {result.totalWeeks.toLocaleString()} weeks · {(result.totalDays * 24).toLocaleString()} hours
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  const summary = `${result.years} years, ${result.months} months, ${result.days} days (${result.totalDays.toLocaleString()} days)`;
                  await copyToClipboard(summary);
                  addCalcHistory('Age Calculator', `DOB ${dob} → ${asOf}`, `${result.years}y ${result.months}m ${result.days}d`);
                  notify('Age summary copied and logged');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy & Log</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDob('1998-05-15');
                  setAsOf(todayIso);
                }}
                className="px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. DATE DIFFERENCE & DAYS BETWEEN DATES
// ============================================================================
export const DateDifferenceTool: React.FC = () => {
  const { notify, addCalcHistory } = useHub();
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [includeEnd, setIncludeEnd] = useState(false);

  const stats = useMemo(() => {
    const a = new Date(`${startDate}T00:00:00`);
    const b = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
    const from = a <= b ? a : b;
    const to = a <= b ? b : a;
    const totalDays = Math.round((to.getTime() - from.getTime()) / 86_400_000) + (includeEnd ? 1 : 0);

    let weekdays = 0;
    const cursor = new Date(from);
    const limit = Math.min(totalDays, 40000);
    for (let i = 0; i < limit; i++) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) weekdays++;
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      totalDays,
      weeks: Math.floor(totalDays / 7),
      remDays: totalDays % 7,
      weekdays,
      weekends: Math.max(0, totalDays - weekdays),
    };
  }, [startDate, endDate, includeEnd]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
        <input type="checkbox" checked={includeEnd} onChange={(e) => setIncludeEnd(e.target.checked)} className="accent-blue-600" />
        <span>Include end date (+1 day)</span>
      </label>

      {stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Days</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-blue-700 dark:text-blue-300">
                {stats.totalDays.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">Weeks + Days</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold">
                {stats.weeks}w {stats.remDays}d
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">Weekdays (Mon–Fri)</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold">
                {stats.weekdays.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const out = `${stats.totalDays} days (${stats.weeks} weeks, ${stats.remDays} days)`;
              await copyToClipboard(out);
              addCalcHistory('Date Difference', `${startDate} to ${endDate}`, `${stats.totalDays} days`);
              notify('Date difference copied');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy & Log</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. PERCENTAGE & DISCOUNT CALCULATOR
// ============================================================================
export const PercentageCalculatorTool: React.FC = () => {
  const { notify, addCalcHistory } = useHub();
  const [mode, setMode] = useState<'of' | 'isWhat' | 'change' | 'discount'>('of');
  const [a, setA] = useState('15');
  const [b, setB] = useState('2500');
  const [extraDiscount, setExtraDiscount] = useState('0');

  const nA = Number(a);
  const nB = Number(b);
  const nExtra = Number(extraDiscount) || 0;

  let headline = '—';
  let explanation = '';

  if (Number.isFinite(nA) && Number.isFinite(nB)) {
    if (mode === 'of') {
      const val = (nA / 100) * nB;
      headline = val.toLocaleString(undefined, { maximumFractionDigits: 4 });
      explanation = `${nA}% of ${nB} = (${nA} ÷ 100) × ${nB} = ${headline}`;
    } else if (mode === 'isWhat') {
      const val = nB === 0 ? NaN : (nA / nB) * 100;
      headline = Number.isFinite(val) ? `${val.toFixed(2)}%` : 'Cannot divide by 0';
      explanation = Number.isFinite(val) ? `${nA} is ${val.toFixed(2)}% of ${nB}` : 'Denominator must be non-zero.';
    } else if (mode === 'change') {
      const val = nA === 0 ? NaN : ((nB - nA) / Math.abs(nA)) * 100;
      headline = Number.isFinite(val) ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}%` : 'Cannot divide by 0';
      explanation = Number.isFinite(val) ? `Change from ${nA} to ${nB} is ${headline} (diff: ${(nB - nA).toFixed(2)})` : 'Starting value must be non-zero.';
    } else {
      const afterFirst = nB * (1 - nA / 100);
      const finalPrice = afterFirst * (1 - nExtra / 100);
      const saved = nB - finalPrice;
      headline = finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      explanation = `You save ${saved.toFixed(2)} off ${nB.toFixed(2)} (${nA}%${nExtra > 0 ? ` + extra ${nExtra}%` : ''})`;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-2xl">
        {[
          { id: 'of', label: 'X% of Y' },
          { id: 'isWhat', label: 'X is what % of Y' },
          { id: 'change', label: '% Change (X → Y)' },
          { id: 'discount', label: 'Shopping Discount' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id as 'of' | 'isWhat' | 'change' | 'discount')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              mode === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            {mode === 'of' ? 'Percentage (%)' : mode === 'isWhat' ? 'Part Value (X)' : mode === 'change' ? 'Original Value (X)' : 'Discount (%)'}
          </label>
          <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            {mode === 'of' ? 'Base Number (Y)' : mode === 'isWhat' ? 'Total Value (Y)' : mode === 'change' ? 'New Value (Y)' : 'Original Price'}
          </label>
          <input type="number" step="any" value={b} onChange={(e) => setB(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        {mode === 'discount' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Extra Discount % (optional)</label>
            <input type="number" step="any" value={extraDiscount} onChange={(e) => setExtraDiscount(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
        )}
      </div>

      <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{mode === 'discount' ? 'Final Price' : 'Result'}</div>
          <div className="mt-1 font-mono tabular-nums text-3xl font-bold text-blue-700 dark:text-blue-300">{headline}</div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{explanation}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await copyToClipboard(headline);
            addCalcHistory('Percentage Calculator', explanation, headline);
            notify('Result copied and saved to history');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg self-start sm:self-center cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Result</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 4. BMI CALCULATOR
// ============================================================================
export const BmiCalculatorTool: React.FC = () => {
  const { notify, addCalcHistory } = useHub();
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [cm, setCm] = useState('172');
  const [kg, setKg] = useState('68');
  const [ft, setFt] = useState('5');
  const [inches, setInches] = useState('8');
  const [lbs, setLbs] = useState('150');

  const computed = useMemo(() => {
    let heightM = 0;
    let weightKg = 0;
    if (unit === 'metric') {
      heightM = Number(cm) / 100;
      weightKg = Number(kg);
    } else {
      const totalInches = Number(ft) * 12 + Number(inches);
      heightM = totalInches * 0.0254;
      weightKg = Number(lbs) * 0.45359237;
    }
    if (heightM <= 0.4 || weightKg <= 5) return null;
    const bmi = weightKg / (heightM * heightM);
    const minHealthyKg = 18.5 * heightM * heightM;
    const maxHealthyKg = 24.9 * heightM * heightM;

    let category = 'Normal weight';
    let tone = 'text-emerald-700 dark:text-emerald-400';
    if (bmi < 18.5) {
      category = 'Underweight';
      tone = 'text-amber-700 dark:text-amber-400';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      tone = 'text-amber-700 dark:text-amber-400';
    } else if (bmi >= 30) {
      category = 'Obese';
      tone = 'text-red-700 dark:text-red-400';
    }
    return { bmi, category, tone, minHealthyKg, maxHealthyKg };
  }, [unit, cm, kg, ft, inches, lbs]);

  return (
    <div className="space-y-6">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-xs">
        <button type="button" onClick={() => setUnit('metric')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${unit === 'metric' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Metric (cm / kg)
        </button>
        <button type="button" onClick={() => setUnit('imperial')} className={`flex-1 py-1.5 text-xs font-medium rounded-md ${unit === 'imperial' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          Imperial (ft-in / lb)
        </button>
      </div>

      {unit === 'metric' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Height (cm)</label>
            <input type="number" value={cm} onChange={(e) => setCm(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Weight (kg)</label>
            <input type="number" value={kg} onChange={(e) => setKg(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Feet</label>
            <input type="number" value={ft} onChange={(e) => setFt(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Inches</label>
            <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Weight (lbs)</label>
            <input type="number" value={lbs} onChange={(e) => setLbs(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
        </div>
      )}

      {computed ? (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500">Body Mass Index</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono tabular-nums text-4xl font-bold text-slate-900 dark:text-white">
                  {computed.bmi.toFixed(1)}
                </span>
                <span className={`text-sm font-semibold ${computed.tone}`}>{computed.category}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                const txt = `BMI: ${computed.bmi.toFixed(1)} (${computed.category})`;
                await copyToClipboard(txt);
                addCalcHistory('BMI Calculator', unit === 'metric' ? `${cm}cm, ${kg}kg` : `${ft}ft ${inches}in, ${lbs}lb`, txt);
                notify('BMI copied');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Standard WHO normal range (18.5–24.9) for your height:{' '}
            <span className="font-mono tabular-nums font-medium text-slate-900 dark:text-white">
              {computed.minHealthyKg.toFixed(1)} kg – {computed.maxHealthyKg.toFixed(1)} kg
            </span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">Enter a valid height and weight.</p>
      )}
    </div>
  );
};

// ============================================================================
// 5. EMI, LOAN, GST, SIMPLE & COMPOUND INTEREST CALCULATOR
// ============================================================================
export const FinanceCalculatorTool: React.FC = () => {
  const { notify, addCalcHistory } = useHub();
  const [tab, setTab] = useState<'emi' | 'gst' | 'simple' | 'compound'>('emi');
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('9.5');
  const [years, setYears] = useState('5');
  const [gstRate, setGstRate] = useState('18');
  const [gstMode, setGstMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [compFreq, setCompFreq] = useState(12);

  const P = Math.max(0, Number(principal) || 0);
  const R = Math.max(0, Number(rate) || 0);
  const T = Math.max(0, Number(years) || 0);
  const G = Math.max(0, Number(gstRate) || 0);

  const output = useMemo(() => {
    if (tab === 'emi') {
      const n = Math.max(1, Math.round(T * 12));
      const r = R / 12 / 100;
      const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - P;
      return [
        { label: 'Monthly EMI', value: emi.toLocaleString(undefined, { maximumFractionDigits: 2 }), highlight: true },
        { label: 'Total Interest', value: totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: 'Total Repayment', value: totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
      ];
    }
    if (tab === 'gst') {
      if (gstMode === 'exclusive') {
        const tax = (P * G) / 100;
        return [
          { label: 'Net Amount', value: P.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
          { label: `GST (${G}%)`, value: tax.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
          { label: 'Total Payable', value: (P + tax).toLocaleString(undefined, { maximumFractionDigits: 2 }), highlight: true },
        ];
      }
      const net = P / (1 + G / 100);
      const tax = P - net;
      return [
        { label: 'Base Price (Excl. GST)', value: net.toLocaleString(undefined, { maximumFractionDigits: 2 }), highlight: true },
        { label: `GST Included (${G}%)`, value: tax.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: 'Gross Amount', value: P.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
      ];
    }
    if (tab === 'simple') {
      const si = (P * R * T) / 100;
      return [
        { label: 'Simple Interest', value: si.toLocaleString(undefined, { maximumFractionDigits: 2 }), highlight: true },
        { label: 'Principal', value: P.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
        { label: 'Total Maturity Value', value: (P + si).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
      ];
    }
    const amount = P * Math.pow(1 + R / 100 / compFreq, compFreq * T);
    const ci = amount - P;
    return [
      { label: 'Maturity Amount', value: amount.toLocaleString(undefined, { maximumFractionDigits: 2 }), highlight: true },
      { label: 'Compound Interest Earned', value: ci.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
      { label: 'Principal', value: P.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
    ];
  }, [tab, P, R, T, G, gstMode, compFreq]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-2xl">
        {[
          { id: 'emi', label: 'Loan / EMI' },
          { id: 'gst', label: 'GST Tax' },
          { id: 'simple', label: 'Simple Interest' },
          { id: 'compound', label: 'Compound Interest' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as 'emi' | 'gst' | 'simple' | 'compound')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tab === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            {tab === 'gst' ? 'Amount' : 'Principal Amount'}
          </label>
          <input type="number" min={0} value={principal} onChange={(e) => setPrincipal(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>

        {tab === 'gst' ? (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">GST Rate (%)</label>
              <div className="flex gap-1.5">
                {[5, 12, 18, 28].map((v) => (
                  <button key={v} type="button" onClick={() => setGstRate(String(v))} className={`px-2.5 py-2 text-xs font-mono rounded-lg border cursor-pointer ${gstRate === String(v) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-700'}`}>
                    {v}%
                  </button>
                ))}
                <input type="number" value={gstRate} onChange={(e) => setGstRate(e.target.value)} className="w-20 px-2.5 py-2 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tax Mode</label>
              <select value={gstMode} onChange={(e) => setGstMode(e.target.value as 'exclusive' | 'inclusive')} className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
                <option value="exclusive">Add GST (Exclusive)</option>
                <option value="inclusive">Remove GST (Inclusive)</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Annual Interest Rate (%)</label>
              <input type="number" step="0.1" min={0} value={rate} onChange={(e) => setRate(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Duration (Years)</label>
              <input type="number" step="0.5" min={0.1} value={years} onChange={(e) => setYears(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
          </>
        )}
      </div>

      {tab === 'compound' && (
        <div className="max-w-xs">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Compounding Frequency</label>
          <select value={compFreq} onChange={(e) => setCompFreq(Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value={1}>Annually (1×/yr)</option>
            <option value={2}>Semi-Annually (2×/yr)</option>
            <option value={4}>Quarterly (4×/yr)</option>
            <option value={12}>Monthly (12×/yr)</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {output.map((card) => (
          <div
            key={card.label}
            className={`p-4 rounded-xl border ${
              card.highlight
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="text-xs text-slate-600 dark:text-slate-400">{card.label}</div>
            <div className={`mt-1 font-mono tabular-nums text-2xl font-bold ${card.highlight ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={async () => {
          const text = output.map((o) => `${o.label}: ${o.value}`).join(' | ');
          await copyToClipboard(text);
          addCalcHistory(`Finance (${tab.toUpperCase()})`, `P=${P}, R=${tab === 'gst' ? G : R}%`, output[0].value);
          notify('Breakdown copied & saved to history');
        }}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
      >
        <Copy className="w-3.5 h-3.5" />
        <span>Copy Breakdown</span>
      </button>
    </div>
  );
};

// ============================================================================
// 6. LIVE CURRENCY CONVERTER (REAL PUBLIC API, NEVER INVENTED RATES)
// ============================================================================
const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'INR', 'BDT', 'CAD', 'AUD', 'JPY', 'CNY', 'AED', 'SAR', 'SGD', 'CHF', 'MYR', 'PKR', 'NPR', 'BRL', 'ZAR', 'KRW', 'THB',
];

export const CurrencyConverterTool: React.FC = () => {
  const { notify, addCalcHistory } = useHub();
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BDT');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRates = async (base: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.result !== 'success' || !data.rates) {
        throw new Error('Exchange-rate feed returned an unexpected payload.');
      }
      setRates(data.rates);
      setUpdatedAt(data.time_last_update_utc || new Date().toUTCString());
    } catch (err) {
      setRates(null);
      setUpdatedAt('');
      setError(
        err instanceof Error
          ? `Live exchange rates unavailable (${err.message}). Check your internet connection and retry—rates are never fabricated.`
          : 'Live exchange rates are currently unreachable.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(from);
  }, [from]);

  const numericAmount = Number(amount);
  const unitRate = rates ? rates[to] : undefined;
  const converted = unitRate && Number.isFinite(numericAmount) ? numericAmount * unitRate : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Amount</label>
          <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-3 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            aria-label="Swap currencies"
            className="p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
          Fetching live exchange rates from open.er-api.com...
        </div>
      )}

      {error && (
        <div role="alert" className="p-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-3">
          <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => fetchRates(from)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-red-600 text-white rounded-lg cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Live Fetch</span>
          </button>
        </div>
      )}

      {!loading && !error && converted !== null && unitRate && (
        <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {numericAmount.toLocaleString()} {from} =
              </div>
              <div className="mt-1 font-mono tabular-nums text-3xl font-bold text-blue-700 dark:text-blue-300">
                {converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const resStr = `${converted.toFixed(2)} ${to}`;
                  await copyToClipboard(resStr);
                  addCalcHistory('Currency Converter', `${numericAmount} ${from} → ${to}`, resStr);
                  notify('Converted amount copied');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
              <button type="button" onClick={() => fetchRates(from)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            1 {from} = {unitRate.toFixed(4)} {to} · Rate updated: {updatedAt} (Source: open.er-api.com)
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. UNIT CONVERTER (Length, Weight, Temperature, Time, Data Storage)
// ============================================================================
type UnitCat = 'length' | 'weight' | 'temperature' | 'time' | 'data';

const LINEAR_UNITS: Record<Exclude<UnitCat, 'temperature'>, { id: string; label: string; toBase: number }[]> = {
  length: [
    { id: 'mm', label: 'Millimeters (mm)', toBase: 0.001 },
    { id: 'cm', label: 'Centimeters (cm)', toBase: 0.01 },
    { id: 'm', label: 'Meters (m)', toBase: 1 },
    { id: 'km', label: 'Kilometers (km)', toBase: 1000 },
    { id: 'in', label: 'Inches (in)', toBase: 0.0254 },
    { id: 'ft', label: 'Feet (ft)', toBase: 0.3048 },
    { id: 'mi', label: 'Miles (mi)', toBase: 1609.344 },
  ],
  weight: [
    { id: 'mg', label: 'Milligrams (mg)', toBase: 0.000001 },
    { id: 'g', label: 'Grams (g)', toBase: 0.001 },
    { id: 'kg', label: 'Kilograms (kg)', toBase: 1 },
    { id: 'oz', label: 'Ounces (oz)', toBase: 0.028349523125 },
    { id: 'lb', label: 'Pounds (lb)', toBase: 0.45359237 },
    { id: 't', label: 'Metric Tons (t)', toBase: 1000 },
  ],
  time: [
    { id: 'ms', label: 'Milliseconds (ms)', toBase: 0.001 },
    { id: 's', label: 'Seconds (s)', toBase: 1 },
    { id: 'min', label: 'Minutes (min)', toBase: 60 },
    { id: 'hr', label: 'Hours (hr)', toBase: 3600 },
    { id: 'day', label: 'Days', toBase: 86400 },
    { id: 'wk', label: 'Weeks', toBase: 604800 },
  ],
  data: [
    { id: 'B', label: 'Bytes (B)', toBase: 1 },
    { id: 'KB', label: 'Kilobytes (KB, 1024 B)', toBase: 1024 },
    { id: 'MB', label: 'Megabytes (MB)', toBase: 1024 ** 2 },
    { id: 'GB', label: 'Gigabytes (GB)', toBase: 1024 ** 3 },
    { id: 'TB', label: 'Terabytes (TB)', toBase: 1024 ** 4 },
  ],
};

const TEMP_UNITS = [
  { id: 'C', label: 'Celsius (°C)' },
  { id: 'F', label: 'Fahrenheit (°F)' },
  { id: 'K', label: 'Kelvin (K)' },
];

export const UnitConverterTool: React.FC = () => {
  const { notify } = useHub();
  const [cat, setCat] = useState<UnitCat>('length');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('mi');

  const unitList = cat === 'temperature' ? TEMP_UNITS : LINEAR_UNITS[cat];

  const handleCatChange = (next: UnitCat) => {
    setCat(next);
    const list = next === 'temperature' ? TEMP_UNITS : LINEAR_UNITS[next];
    setFromUnit(list[0].id);
    setToUnit(list[Math.min(2, list.length - 1)].id);
  };

  const convertVal = (val: number, from: string, to: string): number => {
    if (cat === 'temperature') {
      let c = val;
      if (from === 'F') c = ((val - 32) * 5) / 9;
      else if (from === 'K') c = val - 273.15;
      if (to === 'F') return (c * 9) / 5 + 32;
      if (to === 'K') return c + 273.15;
      return c;
    }
    const list = LINEAR_UNITS[cat];
    const f = list.find((u) => u.id === from) || list[0];
    const t = list.find((u) => u.id === to) || list[0];
    return (val * f.toBase) / t.toBase;
  };

  const num = Number(value);
  const converted = Number.isFinite(num) ? convertVal(num, fromUnit, toUnit) : NaN;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-2xl">
        {(
          [
            { id: 'length', label: 'Length' },
            { id: 'weight', label: 'Weight' },
            { id: 'temperature', label: 'Temperature' },
            { id: 'time', label: 'Time' },
            { id: 'data', label: 'Data Storage' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleCatChange(item.id)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              cat === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Value</label>
          <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">From</label>
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            {unitList.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">To</label>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            {unitList.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
          </select>
        </div>
      </div>

      {Number.isFinite(converted) && (
        <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Converted Result</div>
            <div className="mt-1 font-mono tabular-nums text-3xl font-bold text-blue-700 dark:text-blue-300">
              {Number(converted.toPrecision(8)).toString()} {toUnit}
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await copyToClipboard(`${converted} ${toUnit}`);
              notify('Converted value copied');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
      )}
    </div>
  );
};
