import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CATEGORY_MAP } from '../data/categories';
import { TRANSLATIONS, TranslationBundle } from '../data/i18n';
import { TOOL_BY_SLUG } from '../data/tools';
import {
  CalcHistoryEntry,
  CategoryId,
  Language,
  RecentToolEntry,
  RouteState,
  ThemeMode,
  ToastItem,
} from '../types/hub';
import { isLocalStorageAvailable, safeGetJson, safeSetJson } from '../utils/storage';

interface HubContextValue {
  route: RouteState;
  navigate: (path: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationBundle;
  theme: ThemeMode;
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  recentTools: RecentToolEntry[];
  recordToolVisit: (toolId: string) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  calcHistory: CalcHistoryEntry[];
  addCalcHistory: (toolName: string, expression: string, result: string) => void;
  clearHistory: () => void;
  clearFavorites: () => void;
  toasts: ToastItem[];
  notify: (message: string, type?: ToastItem['type']) => void;
  dismissToast: (id: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  storageAvailable: boolean;
}

const HubContext = createContext<HubContextValue | null>(null);

export function parseHashToRoute(hash: string): RouteState {
  const cleaned = hash.replace(/^#\/?/, '').trim();
  if (!cleaned) return { page: 'home' };

  const [pathPart, queryPart] = cleaned.split('?');
  const segments = pathPart.split('/').filter(Boolean);

  if (segments.length === 0) return { page: 'home' };

  const first = segments[0];
  if (first === 'categories') return { page: 'categories' };
  if (first === 'all-tools') {
    const params = new URLSearchParams(queryPart || '');
    return { page: 'all-tools', initialQuery: params.get('q') || undefined };
  }
  if (first === 'favorites') return { page: 'favorites' };
  if (first === 'about') return { page: 'about' };
  if (first === 'contact') return { page: 'contact' };
  if (first === 'privacy') return { page: 'privacy' };
  if (first === 'terms') return { page: 'terms' };
  if (first === 'disclaimer') return { page: 'disclaimer' };

  if (first === 'category' && segments[1] && CATEGORY_MAP[segments[1]]) {
    return { page: 'category', categoryId: segments[1] as CategoryId };
  }

  if (first === 'tool' && segments[1] && TOOL_BY_SLUG[segments[1]]) {
    return { page: 'tool', slug: segments[1] };
  }

  return { page: 'not-found', rawPath: cleaned };
}

export const HubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteState>(() => parseHashToRoute(window.location.hash));
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = safeGetJson<Language>('lang', 'en');
    return saved === 'bn' || saved === 'hi' ? saved : 'en';
  });
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = safeGetJson<ThemeMode>('theme', 'light');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [favorites, setFavorites] = useState<string[]>(() =>
    safeGetJson<string[]>('favorites', []).slice(0, 60)
  );
  const [recentTools, setRecentTools] = useState<RecentToolEntry[]>(() =>
    safeGetJson<RecentToolEntry[]>('recent_tools', []).slice(0, 12)
  );
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    safeGetJson<string[]>('recent_searches', []).slice(0, 8)
  );
  const [calcHistory, setCalcHistory] = useState<CalcHistoryEntry[]>(() =>
    safeGetJson<CalcHistoryEntry[]>('calc_history', []).slice(0, 25)
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const storageAvailable = useMemo(() => isLocalStorageAvailable(), []);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeSetJson('theme', theme);
  }, [theme]);

  // Sync language attribute
  useEffect(() => {
    document.documentElement.lang = language;
    safeSetJson('lang', language);
  }, [language]);

  // Listen for hash changes
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashToRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Global keyboard shortcuts (Ctrl+K / Cmd+K for search)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Dynamic SEO document title and meta description per route
  useEffect(() => {
    let title = 'Smart Tools Hub — Your Everyday Tools, All in One Place';
    let desc =
      '46+ fast, privacy-first browser utilities across 10 categories: Image, PDF, Calculators, QR/Barcode, Text, Developer, Security, Student, Productivity, and Creator tools.';

    if (route.page === 'tool') {
      const tool = TOOL_BY_SLUG[route.slug];
      if (tool) {
        title = `${tool.name} — Smart Tools Hub`;
        desc = tool.shortDescription;
      }
    } else if (route.page === 'category') {
      const cat = CATEGORY_MAP[route.categoryId];
      if (cat) {
        title = `${cat.name} — Smart Tools Hub`;
        desc = cat.description;
      }
    } else if (route.page === 'all-tools') {
      title = 'All 46 Tools Directory — Smart Tools Hub';
    } else if (route.page === 'categories') {
      title = 'All 10 Tool Categories — Smart Tools Hub';
    } else if (route.page === 'favorites') {
      title = 'Favorites & History — Smart Tools Hub';
    } else if (route.page === 'about') {
      title = 'About — Smart Tools Hub';
    } else if (route.page === 'contact') {
      title = 'Contact — Smart Tools Hub';
    } else if (route.page === 'privacy') {
      title = 'Privacy Policy — Smart Tools Hub';
    } else if (route.page === 'terms') {
      title = 'Terms of Use — Smart Tools Hub';
    } else if (route.page === 'disclaimer') {
      title = 'Disclaimer — Smart Tools Hub';
    } else if (route.page === 'not-found') {
      title = 'Page Not Found — Smart Tools Hub';
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
  }, [route]);

  const navigate = useCallback((path: string) => {
    const normalized = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`;
    if (window.location.hash === normalized) {
      setRoute(parseHashToRoute(normalized));
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.location.hash = normalized;
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleFavorite = useCallback(
    (toolId: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(toolId);
        const next = exists ? prev.filter((id) => id !== toolId) : [toolId, ...prev].slice(0, 60);
        safeSetJson('favorites', next);
        notify(exists ? 'Removed from favorites' : 'Saved to favorites', 'info');
        return next;
      });
    },
    [notify]
  );

  const isFavorite = useCallback((toolId: string) => favorites.includes(toolId), [favorites]);

  const recordToolVisit = useCallback((toolId: string) => {
    setRecentTools((prev) => {
      const filtered = prev.filter((e) => e.toolId !== toolId);
      const next = [{ toolId, visitedAt: Date.now() }, ...filtered].slice(0, 12);
      safeSetJson('recent_tools', next);
      return next;
    });
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 8);
      safeSetJson('recent_searches', next);
      return next;
    });
  }, []);

  const addCalcHistory = useCallback((toolName: string, expression: string, result: string) => {
    const entry: CalcHistoryEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      toolName,
      expression,
      result,
      timestamp: Date.now(),
    };
    setCalcHistory((prev) => {
      const next = [entry, ...prev].slice(0, 25);
      safeSetJson('calc_history', next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setRecentTools([]);
    setRecentSearches([]);
    setCalcHistory([]);
    safeSetJson('recent_tools', []);
    safeSetJson('recent_searches', []);
    safeSetJson('calc_history', []);
    notify('Local history cleared', 'info');
  }, [notify]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    safeSetJson('favorites', []);
    notify('Favorites cleared', 'info');
  }, [notify]);

  const t = TRANSLATIONS[language];

  const value = useMemo<HubContextValue>(
    () => ({
      route,
      navigate,
      language,
      setLanguage,
      t,
      theme,
      toggleTheme,
      favorites,
      toggleFavorite,
      isFavorite,
      recentTools,
      recordToolVisit,
      recentSearches,
      addRecentSearch,
      calcHistory,
      addCalcHistory,
      clearHistory,
      clearFavorites,
      toasts,
      notify,
      dismissToast,
      searchOpen,
      setSearchOpen,
      storageAvailable,
    }),
    [
      route,
      navigate,
      language,
      setLanguage,
      t,
      theme,
      toggleTheme,
      favorites,
      toggleFavorite,
      isFavorite,
      recentTools,
      recordToolVisit,
      recentSearches,
      addRecentSearch,
      calcHistory,
      addCalcHistory,
      clearHistory,
      clearFavorites,
      toasts,
      notify,
      dismissToast,
      searchOpen,
      storageAvailable,
    ]
  );

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
};

export function useHub(): HubContextValue {
  const ctx = useContext(HubContext);
  if (!ctx) throw new Error('useHub must be used within HubProvider');
  return ctx;
}
