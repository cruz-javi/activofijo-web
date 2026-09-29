import { type ReactNode } from 'react';

interface FilterFieldProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function FilterField({ label, htmlFor, className, children }: FilterFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
