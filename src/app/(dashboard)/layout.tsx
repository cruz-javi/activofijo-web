import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
