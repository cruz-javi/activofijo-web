import { Clock } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <Panel className="flex max-w-md flex-col items-center justify-center p-12 shadow-sm border-t-4 border-brand">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-surface text-brand mb-6">
          <Clock className="h-8 w-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">{title}</h2>
        <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
          {description}
        </p>
        <div className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary bg-paper-raised px-4 py-1.5 border border-border rounded-full">
          Próximamente
        </div>
      </Panel>
    </div>
  );
}
