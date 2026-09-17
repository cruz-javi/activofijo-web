import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Sello circular, ligeramente rotado — la marca de "esto quedó registrado".
// Usado para el monograma institucional y para el número de versión (auditoría).
export function Stamp({
  children,
  className,
  rotate = -5,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-accent/60 font-mono text-[10px] font-semibold leading-none text-accent-strong',
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
