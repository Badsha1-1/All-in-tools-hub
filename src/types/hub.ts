export type Language = 'en' | 'bn' | 'hi';
export type ThemeMode = 'light' | 'dark';

export type CategoryId =
  | 'image-tools'
  | 'pdf-tools'
  | 'calculator-tools'
  | 'qr-tools'
  | 'text-tools'
  | 'developer-tools'
  | 'security-tools'
  | 'student-tools'
  | 'productivity-tools'
  | 'social-tools';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolMeta {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: CategoryId;
  tags: string[];
  popular?: boolean;
  recentlyAdded?: boolean;
  steps: string[];
  faqs: ToolFaq[];
  relatedIds: string[];
  processingNote?: string;
}

export interface RecentToolEntry {
  toolId: string;
  visitedAt: number;
}

export interface CalcHistoryEntry {
  id: string;
  toolName: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type RouteState =
  | { page: 'home' }
  | { page: 'categories' }
  | { page: 'category'; categoryId: CategoryId }
  | { page: 'all-tools'; initialQuery?: string }
  | { page: 'favorites' }
  | { page: 'tool'; slug: string }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'privacy' }
  | { page: 'terms' }
  | { page: 'disclaimer' }
  | { page: 'not-found'; rawPath: string };
