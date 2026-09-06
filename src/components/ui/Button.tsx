import React from 'react';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#f5c84b] text-[#07040d] hover:bg-[#ffd96b] border-transparent glow-gold font-bold',
  secondary: 'bg-[#9b5cff]/10 text-[#9b5cff] hover:bg-[#9b5cff]/20 border-[#9b5cff]/40',
  ghost: 'bg-transparent text-[#eee8ff]/60 hover:text-[#eee8ff] hover:bg-[#1a1028] border-transparent',
  danger: 'bg-[#ff4d6d]/10 text-[#ff4d6d] hover:bg-[#ff4d6d]/20 border-[#ff4d6d]/40',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[10px] px-2.5 py-1.5 rounded-md gap-1.5',
  md: 'text-xs px-3.5 py-2.5 rounded-lg gap-2',
  lg: 'text-sm px-5 py-3 rounded-xl gap-2',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center font-mono uppercase tracking-wider transition-all duration-150 border ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.97]'
      } ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
    </button>
  );
}
