import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Tone } from '@/lib/estado';

const toneClasses: Record<Tone, string> = {
  brand: 'bg-brand-surface text-brand-strong',
  accent: 'bg-accent-surface text-accent-strong',
  danger: 'bg-danger-surface text-danger',
  neutral: 'bg-border-soft text-ink-secondary',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
