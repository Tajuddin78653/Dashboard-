'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variantMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gold-500 text-navy-950 font-semibold hover:bg-gold-400 active:bg-gold-600 border border-transparent',
  secondary:
    'bg-navy-700 text-gold-500 font-semibold border border-gold-500/60 hover:border-gold-500 hover:bg-navy-600',
  ghost:
    'bg-transparent text-gold-500 border border-transparent hover:bg-navy-800 hover:text-gold-400',
  danger:
    'bg-danger text-white font-semibold border border-transparent hover:bg-red-500 active:bg-red-600',
};

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-7 px-3 text-xs rounded-md gap-1.5',
  md: 'h-9 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-base rounded-lg gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150 focus-gold focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        className,
      )}
    >
      {loading && (
        <Spinner
          size={size === 'lg' ? 'md' : 'sm'}
          className="text-current border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

export default Button;
