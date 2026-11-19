import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { TOOLS } from '../data/tools';
import { useHub } from '../context/HubContext';
import { CategoryId } from '../types/hub';

export const SearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, navigate, recentSearches, addRecentSearch, t } = useHub();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      if (selectedCategory !== 'all' && tool.categoryId !== selectedCategory) return false;
      if (!q) return true;
      const catName = t.categories[tool.categoryId]?.name.toLowerCase() || '';
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        catName.includes(q)
      );
    }).slice(0, 12);
  }, [query, selectedCategory, t]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, selectedCategory]);

  if (!searchOpen) return null;

  const openTool = (slug: string) => {
    if (query.trim().length >= 2) {
      addRecentSearch(query.trim());
    }
    setSearchOpen(false);
    navigate(`/tool/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      openTool(results[activeIndex].slug);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 backdrop-blur-xs p-4 sm:pt-16 no-print"
      role="dialog"
      aria-modal="true"
      aria-label={t.search.modalTitle}
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive category filter bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto bg-slate-50/70 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
            }`}
          >
            {t.search.allCategoriesFilter}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {t.categories[cat.id].shortName}
            </button>
          ))}
        </div>

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {t.search.recentSearches}:
            </span>
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-1.5 py-0.5 rounded"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Results list */}
        <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {results.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <p className="font-display font-semibold text-slate-900 dark:text-slate-100">
                {t.search.noResults}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.search.noResultsHint}</p>
            </div>
          ) : (
            results.map((tool, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openTool(tool.slug)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-4 transition-colors ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {tool.name}
                      </span>
                      <span className="text-xs text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {t.categories[tool.categoryId].shortName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {tool.shortDescription}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{t.search.shortcutHint}</span>
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              navigate(query ? `/all-tools?q=${encodeURIComponent(query)}` : '/all-tools');
            }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline whitespace-nowrap"
          >
            {t.sections.viewAll} ({TOOLS.length})
          </button>
        </div>
      </div>
    </div>
  );
};
