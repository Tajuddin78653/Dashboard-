import { cn } from '@/lib/utils';
import { ChevronDownIcon } from 'lucide-react';
import { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  wrapperClassName?: string;
}

export function Select({
  label,
  options,
  error,
  wrapperClassName,
  className,
  id,
  ...rest
}: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-lg border bg-navy-800 text-sm text-slate-100 px-3 py-2 pr-9',
            'transition-colors duration-150',
            'focus-gold focus-visible:outline-none',
            error
              ? 'border-danger/60 focus:border-danger'
              : 'border-[#1e2d5a] hover:border-[#2e3d6a] focus:border-gold-500/60',
            className,
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-navy-800">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDownIcon className="h-4 w-4 text-[#4a5a8a]" />
        </span>
      </div>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  );
}

export default Select;
