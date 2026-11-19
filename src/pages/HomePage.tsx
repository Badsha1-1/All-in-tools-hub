import React, { useMemo, useState } from 'react';
import { ArrowRight, Clock, Search, Star } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { getToolsByCategory, TOOL_BY_ID, TOOLS } from '../data/tools';
import { useHub } from '../context/HubContext';
import { CategoryIcon } from '../components/CategoryIcon';
import { ToolCard } from '../components/ToolCard';

export const HomePage: React.FC = () => {
  const { navigate, t, favorites, recentTools, addRecentSearch } = useHub();
  const [heroQuery, setHeroQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const popularTools = useMemo(() => TOOLS.filter((tool) => tool.popular).slice(0, 12), []);
  const recentlyAdded = useMemo(() => TOOLS.filter((tool) => tool.recentlyAdded), []);

  const quickResults = useMemo(() => {
    const q = heroQuery.trim().toLowerCase();
    if (!q) return [];
    return TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [heroQuery]);

  const savedFavoriteTools = useMemo(
    () => favorites.map((id) => TOOL_BY_ID[id]).filter(Boolean).slice(0, 4),
    [favorites]
  );

  const recentVisitedTools = useMemo(
    () => recentTools.map((r) => TOOL_BY_ID[r.toolId]).filter(Boolean).slice(0, 4),
    [recentTools]
  );

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroQuery.trim();
    if (!trimmed) {
      navigate('/all-tools');
      return;
    }
    addRecentSearch(trimmed);
    if (quickResults.length === 1) {
      navigate(`/tool/${quickResults[0].slug}`);
    } else {
      navigate(`/all-tools?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
              {t.hero.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {t.hero.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {t.hero.subtitle}
            </p>

            {/* Hero Live Search */}
            <form onSubmit={handleHeroSearchSubmit} className="mt-8 relative max-w-2xl">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-colors">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" aria-hidden="true" />
                <input
                  type="search"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 180)}
                  placeholder={t.hero.searchPlaceholder}
                  aria-label={t.hero.searchPlaceholder}
                  className="w-full px-3.5 py-3.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.nav.searchButton}
                </button>
              </div>

              {focused && quickResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-20 divide-y divide-slate-100 dark:divide-slate-800">
                  {quickResults.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onMouseDown={() => {
                        addRecentSearch(heroQuery.trim());
                        navigate(`/tool/${tool.slug}`);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {tool.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t.categories[tool.categoryId].name} · {tool.shortDescription}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <button
                type="button"
                onClick={() => navigate('/all-tools')}
                className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                <span>{t.hero.browseAll} ({TOOLS.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
              >
                {t.hero.exploreCategories}
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.hero.privacyNote}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Quick Access (Favorites & Recently Used — shown when populated) */}
        {(savedFavoriteTools.length > 0 || recentVisitedTools.length > 0) && (
          <section aria-labelledby="quick-access-heading">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2
                id="quick-access-heading"
                className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
              >
                {t.sections.quickAccess}
              </h2>
              <button
                type="button"
                onClick={() => navigate('/favorites')}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                {t.sections.viewAll}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedFavoriteTools.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{t.sections.yourFavorites}</span>
                  </div>
                  <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                    {savedFavoriteTools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => navigate(`/tool/${tool.slug}`)}
                        className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <span className="text-sm font-medium truncate">{tool.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {t.categories[tool.categoryId].shortName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recentVisitedTools.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t.sections.recentlyUsed}</span>
                  </div>
                  <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                    {recentVisitedTools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => navigate(`/tool/${tool.slug}`)}
                        className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <span className="text-sm font-medium truncate">{tool.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {t.categories[tool.categoryId].shortName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* All 10 Categories Grid */}
        <section aria-labelledby="categories-heading">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="categories-heading"
                className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
              >
                {t.sections.allCategories}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                10 practical utility suites — {TOOLS.length} browser-ready tools
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              {t.sections.viewAll}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => {
              const count = getToolsByCategory(cat.id).length;
              const loc = t.categories[cat.id];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(`/category/${cat.id}`)}
                  className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500/70 dark:hover:border-blue-500/60 transition-colors flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <CategoryIcon name={cat.icon} className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="mt-3.5 font-display text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {loc.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {loc.description}
                    </p>
                  </div>
                  <div className="mt-4 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {count} {t.sections.toolsCount}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Popular Tools */}
        <section aria-labelledby="popular-heading">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="popular-heading"
                className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
              >
                {t.sections.popularTools}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Everyday essentials ready with zero setup
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/all-tools')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              {t.sections.viewAll} ({TOOLS.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Recently Added Utilities */}
        {recentlyAdded.length > 0 && (
          <section aria-labelledby="recent-added-heading">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2
                id="recent-added-heading"
                className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
              >
                {t.sections.recentlyAdded}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyAdded.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
