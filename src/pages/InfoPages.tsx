import React, { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { useHub } from '../context/HubContext';
import { copyToClipboard } from '../utils/download';

export const AboutPage: React.FC = () => {
  const { navigate } = useHub();
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <header className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          About Smart Tools Hub
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Your Everyday Tools, All in One Place.
        </p>
      </header>

      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        Smart Tools Hub is a standalone, browser-first collection of {TOOLS.length} practical everyday utilities organized
        across 10 categories: Image & Photo, PDF, Calculators & Converters, QR & Barcode, Text & Writing, Developer,
        Security & Random, Student & Education, Document & Productivity, and Social & Creator tools.
      </p>

      <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white pt-2">
        Design & Engineering Principles
      </h2>
      <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
        <li>
          <strong>Privacy by default:</strong> Images, PDFs, QR scans, hashes, and generated passwords are processed
          locally in your browser using HTML5 Canvas, pdf-lib, PDF.js, jsQR, and Web Crypto APIs.
        </li>
        <li>
          <strong>Honest functionality:</strong> Every advertised tool works genuinely. Where external data is required
          (such as live currency exchange rates), the data source and timestamp are displayed transparently.
        </li>
        <li>
          <strong>Accessible & multilingual:</strong> Designed for both 360px mobile screens and large desktops with
          Light/Dark themes and English, Bengali (বাংলা), and Hindi (हिन्दी) interface support.
        </li>
      </ul>

      <div className="pt-4">
        <button
          type="button"
          onClick={() => navigate('/all-tools')}
          className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          Explore All {TOOLS.length} Tools
        </button>
      </div>
    </article>
  );
};

export const ContactPage: React.FC = () => {
  const { notify } = useHub();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Tool Suggestion');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submittedDraft, setSubmittedDraft] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.trim().length < 10) {
      setError('Please enter your name, a valid email address, and a message of at least 10 characters.');
      return;
    }
    setError('');
    const formatted = `Topic: ${topic}\nFrom: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`;
    setSubmittedDraft(formatted);
    notify('Message validated and formatted for sending');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <header className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Contact</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Report a bug, suggest a new browser utility, or share feedback about Smart Tools Hub.
        </p>
      </header>

      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
        Note: Smart Tools Hub is a static, privacy-first website with no backend mail server. Submitting this form
        validates and formats your inquiry locally so you can copy it or open it in your preferred email client.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Your Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Topic
          </label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
          >
            <option>Tool Suggestion</option>
            <option>Bug Report</option>
            <option>Translation Feedback</option>
            <option>General Inquiry</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-msg" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Message
          </label>
          <textarea
            id="contact-msg"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your request or issue..."
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Prepare Inquiry
          </button>
          <button
            type="button"
            onClick={() => {
              setName('');
              setEmail('');
              setMessage('');
              setError('');
              setSubmittedDraft(null);
            }}
            className="px-4 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </form>

      {submittedDraft && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Inquiry ready</span>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap bg-white dark:bg-slate-950 p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-900/60">
            {submittedDraft}
          </pre>
          <button
            type="button"
            onClick={async () => {
              const ok = await copyToClipboard(submittedDraft);
              if (ok) notify('Formatted message copied to clipboard');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Formatted Message</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const PrivacyPage: React.FC = () => (
  <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
    <header className="pb-6 border-b border-slate-200 dark:border-slate-800">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="mt-1 text-xs text-slate-500">Client-Side Privacy Commitment</p>
    </header>
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
      Smart Tools Hub is built to run utilities directly in your browser. Files you open in our Image, PDF, QR Scanner,
      Hash, and Document tools are processed locally in device memory and are never uploaded to a Smart Tools Hub server.
    </p>
    <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Local Browser Storage</h2>
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
      We store only non-sensitive preferences—such as your selected theme, language, pinned favorite tool IDs, recent
      visits, non-sensitive calculator logs, and local notepad/resume/invoice drafts—inside your browser’s{' '}
      <code className="font-mono text-xs">localStorage</code>. Generated passwords are never written to storage. You can
      clear local history and favorites at any time from the Favorites page.
    </p>
    <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">External Network Requests</h2>
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
      Only the Live Currency Converter makes an external network request (to the public{' '}
      <code className="font-mono text-xs">open.er-api.com</code> exchange-rate feed) to retrieve up-to-date market rates
      with an explicit timestamp. Standard web fonts may be loaded from Google Fonts.
    </p>
  </article>
);

export const TermsPage: React.FC = () => (
  <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
    <header className="pb-6 border-b border-slate-200 dark:border-slate-800">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Terms of Use</h1>
    </header>
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
      Smart Tools Hub provides browser-based utilities free of charge on an “as-is” and “as-available” basis. By using
      this website, you agree to use the tools lawfully and verify outputs before relying on them for legal, financial,
      medical, or production-critical purposes.
    </p>
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
      You retain full ownership of all images, PDFs, documents, and text you process in your browser. Smart Tools Hub
      does not claim rights over user-generated files or drafts.
    </p>
  </article>
);

export const DisclaimerPage: React.FC = () => (
  <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
    <header className="pb-6 border-b border-slate-200 dark:border-slate-800">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Disclaimer</h1>
    </header>
    <ul className="list-disc pl-5 space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li>
        <strong>Health & Financial Calculators:</strong> Results from the BMI, EMI, Loan, GST, Interest, and Currency
        calculators are for general informational estimates only and do not constitute medical, tax, or financial advice.
      </li>
      <li>
        <strong>Security & Cryptography Tools:</strong> Client-side password and hash utilities use standard Web Crypto
        APIs where supported, but do not replace a dedicated password manager, two-factor authentication, or a
        professional security review.
      </li>
      <li>
        <strong>QR Code Scanning:</strong> Always verify decoded URLs before visiting third-party websites.
      </li>
    </ul>
  </article>
);

export const NotFoundPage: React.FC<{ rawPath?: string }> = ({ rawPath }) => {
  const { navigate, t } = useHub();
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="font-mono text-5xl font-bold text-blue-600 dark:text-blue-400">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {rawPath
          ? `We could not find a page or tool matching "${rawPath}".`
          : 'The page or tool you requested does not exist.'}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          {t.actions.backHome}
        </button>
        <button
          type="button"
          onClick={() => navigate('/all-tools')}
          className="px-4 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          {t.hero.browseAll}
        </button>
      </div>
    </div>
  );
};
