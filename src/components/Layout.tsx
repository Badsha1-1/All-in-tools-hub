import React, { useState } from 'react';
import {
  ChevronRight,
  Globe,
  Menu,
  Moon,
  Search,
  Sun,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { TOOL_BY_SLUG } from '../data/tools';
import { useHub } from '../context/HubContext';
import { Language } from '../types/hub';
import { SearchModal } from './SearchModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    route,
    navigate,
    t,
    theme,
    toggleTheme,
    language,
    setLanguage,
    setSearchOpen,
    toasts,
    dismissToast,
  } = useHub();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const breadcrumbs = (() => {
    const items: { label: string; path?: string }[] = [{ label: t.nav.home, path: '/' }];
    if (route.page === 'categories') items.push({ label: t.nav.categories });
    else if (route.page === 'all-tools') items.push({ label: t.nav.allTools });
    else if (route.page === 'favorites') items.push({ label: t.nav.favorites });
    else if (route.page === 'about') items.push({ label: t.nav.about });
    else if (route.page === 'contact') items.push({ label: t.footer.contact });
    else if (route.page === 'privacy') items.push({ label: t.footer.privacy });
    else if (route.page === 'terms') items.push({ label: t.footer.terms });
    else if (route.page === 'disclaimer') items.push({ label: t.footer.disclaimer });
    else if (route.page === 'category') {
      items.push({ label: t.nav.categories, path: '/categories' });
      items.push({ label: t.categories[route.categoryId].name });
    } else if (route.page === 'tool') {
      const tool = TOOL_BY_SLUG[route.slug];
      if (tool) {
        items.push({
          label: t.categories[tool.categoryId].shortName,
          path: `/category/${tool.categoryId}`,
        });
        items.push({ label: tool.name });
      }
    }
    return items;
  })();

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
      active
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              setMobileMenuOpen(false);
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            {t.brandName}
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
            <a
              href="#/categories"
              onClick={(e) => {
                e.preventDefault();
                navigate('/categories');
              }}
              className={navLinkClass(route.page === 'categories' || route.page === 'category')}
            >
              {t.nav.categories}
            </a>
            <a
              href="#/all-tools"
              onClick={(e) => {
                e.preventDefault();
                navigate('/all-tools');
              }}
              className={navLinkClass(route.page === 'all-tools')}
            >
              {t.nav.allTools}
            </a>
            <a
              href="#/favorites"
              onClick={(e) => {
                e.preventDefault();
                navigate('/favorites');
              }}
              className={navLinkClass(route.page === 'favorites')}
            >
              {t.nav.favorites}
            </a>
            <a
              href="#/about"
              onClick={(e) => {
                e.preventDefault();
                navigate('/about');
              }}
              className={navLinkClass(route.page === 'about')}
            >
              {t.nav.about}
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action (+ mobile menu trigger on narrow viewports) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>{t.nav.searchButton}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
            {[
              { label: t.nav.home, path: '/' },
              { label: t.nav.categories, path: '/categories' },
              { label: t.nav.allTools, path: '/all-tools' },
              { label: t.nav.favorites, path: '/favorites' },
              { label: t.nav.about, path: '/about' },
              { label: t.footer.contact, path: '/contact' },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Secondary Workspace Utility Bar: Breadcrumbs + Language + Theme */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={`${crumb.label}_${idx}`}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />}
                {crumb.path ? (
                  <button
                    type="button"
                    onClick={() => navigate(crumb.path!)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[220px] sm:max-w-none">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <label htmlFor="hub-lang-select" className="sr-only">
                {t.actions.language}
              </label>
              <select
                id="hub-lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-white dark:bg-slate-900">
                  English
                </option>
                <option value="bn" className="bg-white dark:bg-slate-900">
                  বাংলা
                </option>
                <option value="hi" className="bg-white dark:bg-slate-900">
                  हिन्दी
                </option>
              </select>
            </div>

            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
              |
            </span>

            {/* Light / Dark Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.actions.darkMode}</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.actions.lightMode}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Clean Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                {t.brandName}
              </button>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.footer.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {t.footer.localProcessingNote}
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                {t.footer.toolsHeading}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {CATEGORIES.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/category/${cat.id}`)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {t.categories[cat.id].name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                {t.footer.companyHeading}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {CATEGORIES.slice(5).map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/category/${cat.id}`)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {t.categories[cat.id].name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                {t.footer.legalHeading}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/about')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t.nav.about}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t.footer.contact}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/privacy')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t.footer.privacy}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/terms')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t.footer.terms}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('/disclaimer')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t.footer.disclaimer}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/all-tools')}
                className="hover:text-slate-900 dark:hover:text-white"
              >
                {t.nav.allTools}
              </button>
              <button
                type="button"
                onClick={() => navigate('/favorites')}
                className="hover:text-slate-900 dark:hover:text-white"
              >
                {t.nav.favorites}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <SearchModal />

      {/* Accessible Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none no-print"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-md ${
              toast.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : toast.type === 'info'
                ? 'bg-slate-900 dark:bg-slate-800 border-slate-800 dark:border-slate-700 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="opacity-70 hover:opacity-100 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
