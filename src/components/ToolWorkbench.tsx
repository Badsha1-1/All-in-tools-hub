import React, { useEffect, useState } from 'react';
import { ChevronDown, ShieldCheck, Star } from 'lucide-react';
import { TOOL_BY_ID } from '../data/tools';
import { useHub } from '../context/HubContext';
import { ToolMeta } from '../types/hub';
import { ToolCard } from './ToolCard';

interface ToolWorkbenchProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

export const ToolWorkbench: React.FC<ToolWorkbenchProps> = ({ tool, children }) => {
  const { isFavorite, toggleFavorite, recordToolVisit, navigate, t } = useHub();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const fav = isFavorite(tool.id);

  useEffect(() => {
    recordToolVisit(tool.id);
    setOpenFaq(0);
  }, [tool.id, recordToolVisit]);

  const relatedTools = tool.relatedIds
    .map((id) => TOOL_BY_ID[id])
    .filter((item): item is ToolMeta => Boolean(item));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Tool Header */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 no-print">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => navigate(`/category/${tool.categoryId}`)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t.categories[tool.categoryId].name}
            </button>
            <span aria-hidden="true">·</span>
            <span>{tool.processingNote || 'Runs locally in your browser'}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tool.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {tool.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(tool.id)}
          aria-pressed={fav}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            fav
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Star className={`w-4 h-4 ${fav ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{fav ? t.actions.removeFavorite : t.actions.addFavorite}</span>
        </button>
      </header>

      {/* Main Interactive Tool Area */}
      <section className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-7">
        {children}
      </section>

      {/* Privacy & Accuracy Strip */}
      <div className="mt-6 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 no-print">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
        <span>
          {tool.processingNote ||
            'Client-side execution: your inputs stay in browser memory and are not sent to remote servers.'}
        </span>
      </div>

      {/* Usage Guide + FAQs */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        <section>
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {t.sections.howToUse}
          </h2>
          <ol className="mt-4 space-y-3">
            {tool.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 pt-0.5 tabular-nums shrink-0">
                  0{index + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {t.sections.faq}
          </h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
            {tool.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 text-left text-sm font-medium text-slate-900 dark:text-slate-100"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-150 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 no-print">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {t.sections.relatedTools}
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTools.map((rel) => (
              <ToolCard key={rel.id} tool={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
