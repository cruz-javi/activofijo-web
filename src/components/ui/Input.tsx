import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-sm border border-border bg-paper px-3 text-sm text-ink placeholder:text-ink-muted outline-none transition-colors duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
