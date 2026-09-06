import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  color?: string;
  className?: string;
  as?: 'h2' | 'h3' | 'h4';
}

export default function SectionHeader({ title, icon: Icon, color = 'text-[#f5c84b]', className = '', as: Tag = 'h3' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" />}
      <Tag className={`text-[10px] uppercase tracking-widest font-bold font-mono ${color}`}>{title}</Tag>
    </div>
  );
}
