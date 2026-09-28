import { type ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

export function FormSection({ 
  title, 
  description, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 h-6 w-6 shrink-0 text-ink-tertiary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description && <p className="text-sm text-ink-secondary">{description}</p>}
        </div>
      </div>
      <div className="pl-0 sm:pl-9">{children}</div>
    </div>
  );
}
