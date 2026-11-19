import React, { Suspense, lazy } from 'react';
import { TOOL_BY_SLUG } from '../data/tools';
import { ToolWorkbench } from '../components/ToolWorkbench';
import { NotFoundPage } from '../pages/InfoPages';

// Lazy-loaded functional groups for fast initial homepage loads
const ImageTools = lazy(() =>
  import('./ImageTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'image-resizer':
          return <m.ImageResizerTool />;
        case 'image-compressor':
          return <m.ImageCompressorTool />;
        case 'image-cropper':
          return <m.ImageCropperTool />;
        case 'image-format-converter':
          return <m.ImageFormatConverterTool />;
        case 'passport-photo-maker':
          return <m.PassportPhotoMakerTool />;
        case 'signature-resizer':
          return <m.SignatureResizerTool />;
        default:
          return null;
      }
    },
  }))
);

const PdfTools = lazy(() =>
  import('./PdfTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'jpg-to-pdf':
          return <m.JpgToPdfTool />;
        case 'pdf-to-jpg':
          return <m.PdfToJpgTool />;
        case 'pdf-merger':
          return <m.PdfMergerTool />;
        case 'pdf-splitter':
          return <m.PdfSplitterTool />;
        case 'pdf-rotate-delete':
          return <m.PdfRotateDeleteTool />;
        case 'pdf-watermark-tools':
          return <m.PdfWatermarkTools />;
        default:
          return null;
      }
    },
  }))
);

const CalculatorTools = lazy(() =>
  import('./CalculatorTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'age-calculator':
          return <m.AgeCalculatorTool />;
        case 'date-difference':
          return <m.DateDifferenceTool />;
        case 'percentage-calculator':
          return <m.PercentageCalculatorTool />;
        case 'bmi-calculator':
          return <m.BmiCalculatorTool />;
        case 'finance-calculator':
          return <m.FinanceCalculatorTool />;
        case 'currency-converter':
          return <m.CurrencyConverterTool />;
        case 'unit-converter':
          return <m.UnitConverterTool />;
        default:
          return null;
      }
    },
  }))
);

const QrBarcodeTools = lazy(() =>
  import('./QrBarcodeTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'qr-generator':
          return <m.QrGeneratorTool />;
        case 'qr-scanner':
          return <m.QrScannerTool />;
        case 'barcode-generator':
          return <m.BarcodeGeneratorTool />;
        default:
          return null;
      }
    },
  }))
);

const TextTools = lazy(() =>
  import('./TextTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'word-counter':
          return <m.WordCounterTool />;
        case 'case-converter':
          return <m.CaseConverterTool />;
        case 'text-cleaner':
          return <m.TextCleanerTool />;
        case 'text-transform':
          return <m.TextTransformTool />;
        case 'text-compare-lorem':
          return <m.TextCompareLoremTool />;
        default:
          return null;
      }
    },
  }))
);

const DeveloperTools = lazy(() =>
  import('./DeveloperTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'json-formatter':
          return <m.JsonFormatterTool />;
        case 'base64-encoder':
          return <m.Base64Tool />;
        case 'url-html-encoder':
          return <m.UrlHtmlEncoderTool />;
        case 'code-minifier':
          return <m.CodeMinifierTool />;
        case 'uuid-hash-generator':
          return <m.UuidHashTool />;
        case 'color-picker-converter':
          return <m.ColorPickerConverterTool />;
        case 'regex-timestamp':
          return <m.RegexTimestampTool />;
        default:
          return null;
      }
    },
  }))
);

const SecurityRandomTools = lazy(() =>
  import('./SecurityRandomTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'password-generator':
          return <m.PasswordGeneratorTool />;
        case 'random-utility':
          return <m.RandomUtilityTool />;
        case 'random-name-color':
          return <m.RandomNameColorTool />;
        default:
          return null;
      }
    },
  }))
);

const StudentTools = lazy(() =>
  import('./StudentTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'gpa-calculator':
          return <m.GpaCalculatorTool />;
        case 'typing-speed-test':
          return <m.TypingSpeedTestTool />;
        case 'exam-countdown':
          return <m.ExamCountdownTool />;
        case 'quiz-generator':
          return <m.QuizGeneratorTool />;
        default:
          return null;
      }
    },
  }))
);

const ProductivityTools = lazy(() =>
  import('./ProductivityTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'resume-cover-builder':
          return <m.ResumeCoverBuilderTool />;
        case 'invoice-generator':
          return <m.InvoiceGeneratorTool />;
        case 'online-notepad':
          return <m.OnlineNotepadTool />;
        case 'meeting-calendar-maker':
          return <m.MeetingCalendarMakerTool />;
        default:
          return null;
      }
    },
  }))
);

const SocialCreatorTools = lazy(() =>
  import('./SocialCreatorTools').then((m) => ({
    default: ({ id }: { id: string }) => {
      switch (id) {
        case 'social-media-resizer':
          return <m.SocialMediaResizerTool />;
        case 'hashtag-generator':
          return <m.HashtagCreatorTool />;
        case 'og-preview':
          return <m.OpenGraphPreviewTool />;
        default:
          return null;
      }
    },
  }))
);

const ToolLoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse py-4" aria-label="Loading tool...">
    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
    <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-40" />
  </div>
);

export const ToolPage: React.FC<{ slug: string }> = ({ slug }) => {
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) return <NotFoundPage rawPath={`tool/${slug}`} />;

  const renderGroup = () => {
    switch (tool.categoryId) {
      case 'image-tools':
        return <ImageTools id={tool.id} />;
      case 'pdf-tools':
        return <PdfTools id={tool.id} />;
      case 'calculator-tools':
        return <CalculatorTools id={tool.id} />;
      case 'qr-tools':
        return <QrBarcodeTools id={tool.id} />;
      case 'text-tools':
        return <TextTools id={tool.id} />;
      case 'developer-tools':
        return <DeveloperTools id={tool.id} />;
      case 'security-tools':
        return <SecurityRandomTools id={tool.id} />;
      case 'student-tools':
        return <StudentTools id={tool.id} />;
      case 'productivity-tools':
        return <ProductivityTools id={tool.id} />;
      case 'social-tools':
        return <SocialCreatorTools id={tool.id} />;
    }
  };

  return (
    <ToolWorkbench tool={tool}>
      <Suspense fallback={<ToolLoadingSkeleton />}>{renderGroup()}</Suspense>
    </ToolWorkbench>
  );
};
