import { CategoryMeta } from '../types/hub';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'image-tools',
    name: 'Image & Photo Tools',
    shortName: 'Image',
    description: 'Resize, compress to target KB, crop, convert formats, and prepare passport or signature photos locally.',
    icon: 'Image',
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    shortName: 'PDF',
    description: 'Merge, split, rotate, delete pages, convert images to PDF, render PDFs to JPG/PNG, and inspect metadata.',
    icon: 'FileText',
  },
  {
    id: 'calculator-tools',
    name: 'Calculators & Converters',
    shortName: 'Calculators',
    description: 'Age, dates, percentages, BMI, GST/EMI/loans, live exchange rates, and unit conversions.',
    icon: 'Calculator',
  },
  {
    id: 'qr-tools',
    name: 'QR & Barcode Tools',
    shortName: 'QR & Barcode',
    description: 'Generate custom URL, Wi-Fi, and contact QR codes, retail barcodes, and scan QR codes safely.',
    icon: 'QrCode',
  },
  {
    id: 'text-tools',
    name: 'Text & Writing Tools',
    shortName: 'Text',
    description: 'Count words and reading time, convert case, clean spaces, remove duplicates, sort, and compare text.',
    icon: 'Type',
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    shortName: 'Developer',
    description: 'Format JSON, encode Base64/URL/HTML, minify web code, generate UUIDs/hashes, test regex, and convert timestamps.',
    icon: 'Code2',
  },
  {
    id: 'security-tools',
    name: 'Security & Random Tools',
    shortName: 'Security',
    description: 'Create cryptographic passwords and passphrases, test password strength, roll dice, flip coins, and pick names.',
    icon: 'ShieldCheck',
  },
  {
    id: 'student-tools',
    name: 'Student & Education Tools',
    shortName: 'Student',
    description: 'Compute GPA/CGPA and grades, benchmark typing speed, track exam countdowns, and take interactive quizzes.',
    icon: 'GraduationCap',
  },
  {
    id: 'productivity-tools',
    name: 'Document & Productivity',
    shortName: 'Productivity',
    description: 'Build printable resumes, cover letters, GST invoices, daily planners, meeting notes, and A4 calendars.',
    icon: 'Briefcase',
  },
  {
    id: 'social-tools',
    name: 'Social & Creator Tools',
    shortName: 'Creator',
    description: 'Resize YouTube thumbnails and Instagram graphics, organize tags/hashtags, and preview Open Graph cards.',
    icon: 'Share2',
  },
];

export const CATEGORY_MAP: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);
