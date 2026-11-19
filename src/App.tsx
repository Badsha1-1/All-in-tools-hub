import React from 'react';
import { HubProvider, useHub } from './context/HubContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AllToolsPage, CategoriesPage, CategoryDetailPage, FavoritesPage } from './pages/DirectoryPages';
import { AboutPage, ContactPage, DisclaimerPage, NotFoundPage, PrivacyPage, TermsPage } from './pages/InfoPages';
import { ToolPage } from './tools/ToolRenderer';

class HubErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected error occurred.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{this.state.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, message: '' });
              window.location.hash = '#/';
            }}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const HubRouter: React.FC = () => {
  const { route } = useHub();

  switch (route.page) {
    case 'home':
      return <HomePage />;
    case 'categories':
      return <CategoriesPage />;
    case 'category':
      return <CategoryDetailPage categoryId={route.categoryId} />;
    case 'all-tools':
      return <AllToolsPage key={route.initialQuery || 'all'} initialQuery={route.initialQuery} />;
    case 'favorites':
      return <FavoritesPage />;
    case 'tool':
      return <ToolPage key={route.slug} slug={route.slug} />;
    case 'about':
      return <AboutPage />;
    case 'contact':
      return <ContactPage />;
    case 'privacy':
      return <PrivacyPage />;
    case 'terms':
      return <TermsPage />;
    case 'disclaimer':
      return <DisclaimerPage />;
    case 'not-found':
      return <NotFoundPage rawPath={route.rawPath} />;
  }
};

export default function App() {
  return (
    <HubProvider>
      <Layout>
        <HubErrorBoundary>
          <HubRouter />
        </HubErrorBoundary>
      </Layout>
    </HubProvider>
  );
}
