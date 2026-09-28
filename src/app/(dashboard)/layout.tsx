import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { ToastProvider } from '@/components/ui/Toast';
import { AccessControlProvider } from '@/components/ui/AccessControlModal';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AccessControlProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </AccessControlProvider>
    </ToastProvider>
  );
}
