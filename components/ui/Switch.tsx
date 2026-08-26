'use client';

import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, disabled = false, className }: SwitchProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out focus-gold focus-visible:outline-none',
          checked ? 'bg-gold-500' : 'bg-navy-600',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm',
            'transform transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-slate-300">{label}</span>
      )}
    </label>
  );
}

export default Switch;
