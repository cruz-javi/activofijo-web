import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Tone } from '@/lib/estado';

export type ToneVariant = Tone | 'success';

const toneClasses: Record<ToneVariant, string> = {
  brand: 'bg-brand-surface text-brand-strong',
  accent: 'bg-accent-surface text-accent-strong',
  danger: 'bg-danger-surface text-danger',
  neutral: 'bg-border-soft text-ink-secondary',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: ToneVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
