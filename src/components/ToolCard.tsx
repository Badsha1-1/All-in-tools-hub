import React from 'react';
import { Star, ArrowUpRight } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { ToolMeta } from '../types/hub';

interface ToolCardProps {
  tool: ToolMeta;
  showCategory?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, showCategory = true }) => {
  const { navigate, isFavorite, toggleFavorite, t } = useHub();
  const fav = isFavorite(tool.id);
  const categoryLabel = t.categories[tool.categoryId]?.shortName || tool.categoryId;

  return (
    <article className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-colors duration-150 hover:border-blue-500/70 dark:hover:border-blue-500/60">
      <div>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/tool/${tool.slug}`)}
            className="text-left focus-visible:outline-none after:content-[''] after:absolute after:inset-0"
          >
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {tool.name}
            </h3>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(tool.id);
            }}
            aria-label={fav ? t.actions.removeFavorite : t.actions.addFavorite}
            aria-pressed={fav}
            className={`relative z-10 shrink-0 p-1.5 rounded-lg transition-colors ${
              fav
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${fav ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
          {tool.shortDescription}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 min-w-0">
          {showCategory && <span className="truncate">{categoryLabel}</span>}
          {showCategory && <span aria-hidden="true">·</span>}
          <span>Browser local</span>
        </div>
        <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 shrink-0">
          {t.actions.openTool}
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
};
