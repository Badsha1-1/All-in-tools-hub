import React, { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Clock, Search, Star, Trash2 } from 'lucide-react';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { getToolsByCategory, TOOL_BY_ID, TOOLS } from '../data/tools';
import { useHub } from '../context/HubContext';
import { CategoryId } from '../types/hub';
import { CategoryIcon } from '../components/CategoryIcon';
import { ToolCard } from '../components/ToolCard';

export const CategoriesPage: React.FC = () => {
  const { navigate, t } = useHub();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="max-w-3xl pb-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          {t.sections.allCategories}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Explore all 10 specialized tool suites containing {TOOLS.length} browser-powered utilities.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => {
          const tools = getToolsByCategory(cat.id);
          const loc = t.categories[cat.id];
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                        {loc.name}
                      </h2>
                      <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {tools.length} {t.sections.toolsCount}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/category/${cat.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{t.sections.browseCategory}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {loc.description}
                </p>

                <ul className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/tool/${tool.slug}`)}
                        className="text-left text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block w-full"
                      >
                        {tool.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CategoryDetailPage: React.FC<{ categoryId: CategoryId }> = ({ categoryId }) => {
  const { t, navigate } = useHub();
  const category = CATEGORY_MAP[categoryId];
  const tools = useMemo(() => getToolsByCategory(categoryId), [categoryId]);
  const loc = t.categories[categoryId];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="pb-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CategoryIcon name={category.icon} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {loc.name}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              {loc.description}
            </p>
          </div>
        </div>
        <div className="text-sm font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
          {tools.length} {t.sections.toolsCount}
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} showCategory={false} />
        ))}
      </div>

      {/* Browse other categories */}
      <section className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Other Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.id !== categoryId).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(`/category/${cat.id}`)}
              className="px-3.5 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              {t.categories[cat.id].name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export const AllToolsPage: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const { t } = useHub();
  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>('all');
  const [sortBy, setSortBy] = useState<'category' | 'alpha'>('category');

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = TOOLS.filter((tool) => {
      if (categoryFilter !== 'all' && tool.categoryId !== categoryFilter) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
    if (sortBy === 'alpha') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [query, categoryFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          {t.nav.allTools}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Browse and filter all {TOOLS.length} browser-based tools across 10 categories.
        </p>

        {/* Search & Sort Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.search.placeholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setSortBy('category')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                sortBy === 'category'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              By Category
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alpha')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                sortBy === 'alpha'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              A–Z
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {t.search.allCategoriesFilter} ({TOOLS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t.categories[cat.id].shortName}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
        Showing {filteredTools.length} of {TOOLS.length} tools
      </div>

      {filteredTools.length === 0 ? (
        <div className="mt-8 py-16 text-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-6">
          <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {t.search.noResults}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.search.noResultsHint}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategoryFilter('all');
            }}
            className="mt-4 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.actions.reset}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FavoritesPage: React.FC = () => {
  const {
    t,
    navigate,
    favorites,
    recentTools,
    calcHistory,
    clearHistory,
    clearFavorites,
    storageAvailable,
  } = useHub();

  const [confirmMode, setConfirmMode] = useState<'history' | 'favorites' | null>(null);

  const favTools = favorites.map((id) => TOOL_BY_ID[id]).filter(Boolean);
  const visitedTools = recentTools.map((r) => ({ ...r, tool: TOOL_BY_ID[r.toolId] })).filter((r) => r.tool);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <header className="pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            {t.favorites.title}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {t.favorites.subtitle}
          </p>
          {!storageAvailable && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Browser localStorage is restricted in this session; favorites and history are stored in temporary memory only.
            </p>
          )}
        </div>
        {(visitedTools.length > 0 || calcHistory.length > 0) && (
          <button
            type="button"
            onClick={() => setConfirmMode('history')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.actions.clearHistory}</span>
          </button>
        )}
      </header>

      {/* Inline Confirmation Dialog */}
      {confirmMode && (
        <div
          role="alertdialog"
          aria-modal="true"
          className="p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="font-display text-sm font-semibold text-red-900 dark:text-red-200">
              {confirmMode === 'history' ? t.favorites.confirmClearTitle : 'Clear all saved favorites?'}
            </h2>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              {confirmMode === 'history'
                ? t.favorites.confirmClearDesc
                : 'This will unpin all favorite tools saved in this browser.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmMode(null)}
              className="px-3.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            >
              {t.actions.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirmMode === 'history') clearHistory();
                else clearFavorites();
                setConfirmMode(null);
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t.actions.confirm}
            </button>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {t.sections.yourFavorites} ({favTools.length})
            </h2>
          </div>
          {favTools.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmMode('favorites')}
              className="text-xs font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400"
            >
              Clear favorites
            </button>
          )}
        </div>

        {favTools.length === 0 ? (
          <div className="py-12 px-6 text-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="font-display font-semibold text-slate-900 dark:text-white">
              {t.favorites.emptyTitle}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.favorites.emptyDesc}</p>
            <button
              type="button"
              onClick={() => navigate('/all-tools')}
              className="mt-4 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t.hero.browseAll}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Visited */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {t.favorites.recentTitle}
          </h2>
        </div>

        {visitedTools.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.favorites.emptyRecent}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visitedTools.map(({ tool }) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>

      {/* Local Calculation History */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {t.favorites.calcHistoryTitle}
          </h2>
        </div>

        {calcHistory.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.favorites.emptyCalcHistory}</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Tool</th>
                  <th className="py-3 px-4 font-medium">Input / Expression</th>
                  <th className="py-3 px-4 font-medium text-right">Result</th>
                  <th className="py-3 px-4 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {calcHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {item.toolName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.expression}</td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-right text-blue-700 dark:text-blue-400">
                      {item.result}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-xs text-right text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
