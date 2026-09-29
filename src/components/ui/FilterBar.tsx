import { type FormEventHandler, type ReactNode } from 'react';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  children: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  className?: string;
}

export function FilterBar({ children, onSubmit, className }: FilterBarProps) {
  return (
    <Panel className={cn('mb-6 p-4 sm:p-5', className)}>
      <form
        onSubmit={onSubmit ?? ((e) => e.preventDefault())}
        className="grid grid-cols-1 items-end gap-3.5 sm:grid-cols-2 lg:grid-cols-5"
      >
        {children}
      </form>
    </Panel>
  );
}
