import { RefreshCw } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';

interface LoadingPanelProps {
  message: string;
}

export function LoadingPanel({ message }: LoadingPanelProps) {
  return (
    <Panel className="p-12 text-center text-sm text-ink-tertiary">
      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-brand" />
      {message}
    </Panel>
  );
}
