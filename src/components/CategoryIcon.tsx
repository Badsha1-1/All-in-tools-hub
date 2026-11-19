import React from 'react';
import {
  Briefcase,
  Calculator,
  Code2,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  QrCode,
  Share2,
  ShieldCheck,
  Type,
  Wrench,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Image':
      return <ImageIcon className={className} aria-hidden="true" />;
    case 'FileText':
      return <FileText className={className} aria-hidden="true" />;
    case 'Calculator':
      return <Calculator className={className} aria-hidden="true" />;
    case 'QrCode':
      return <QrCode className={className} aria-hidden="true" />;
    case 'Type':
      return <Type className={className} aria-hidden="true" />;
    case 'Code2':
      return <Code2 className={className} aria-hidden="true" />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'GraduationCap':
      return <GraduationCap className={className} aria-hidden="true" />;
    case 'Briefcase':
      return <Briefcase className={className} aria-hidden="true" />;
    case 'Share2':
      return <Share2 className={className} aria-hidden="true" />;
    default:
      return <Wrench className={className} aria-hidden="true" />;
  }
};
