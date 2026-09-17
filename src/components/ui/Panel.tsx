import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-md border border-border bg-paper-raised p-5', className)}>
      {children}
    </div>
  );
}
