import { cn } from '@/lib/utils';
import { ElementType, InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ElementType;
  wrapperClassName?: string;
  children?: ReactNode;
}

export function Input({
  label,
  error,
  icon: Icon,
  wrapperClassName,
  className,
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Icon className="h-4 w-4 text-[#4a5a8a]" />
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-navy-800 text-sm text-slate-100 placeholder:text-[#4a5a8a]',
            'transition-colors duration-150',
            'focus-gold focus-visible:outline-none',
            error
              ? 'border-danger/60 focus:border-danger'
              : 'border-[#1e2d5a] hover:border-[#2e3d6a] focus:border-gold-500/60',
            Icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
            className,
          )}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

export default Input;
