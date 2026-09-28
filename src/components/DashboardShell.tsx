'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, roleLabel } = useCurrentUser();

  // Cerrar el drawer móvil automáticamente en cada cambio de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-paper">
      {/* Sidebar navegable: persistente en desktop, drawer deslizante en mobile */}
      <Sidebar 
        isOpenMobile={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)} 
      />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Barra superior institucional para dispositivos móviles */}
        <header className="sticky top-0 z-30 flex md:hidden items-center justify-between px-4 py-3 bg-paper-raised/95 backdrop-blur-md border-b border-border-soft transition-colors shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-paper transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo_uagrm_activo_fijo.svg"
                alt="Escudo UAGRM"
                width={28}
                height={28}
                className="w-7 h-7 object-contain drop-shadow-xs"
              />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xs leading-none text-ink">
                  UAGRM
                </span>
                <span className="text-[10px] font-semibold text-brand tracking-wider uppercase mt-0.5">
                  Activo Fijo
                </span>
              </div>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-semibold text-ink-secondary">
                {roleLabel}
              </span>
              <div 
                className="h-8 w-8 rounded-full bg-brand-surface border border-brand/30 text-brand flex items-center justify-center text-xs font-bold font-mono"
                title={`${user.nombre || user.email} (${roleLabel})`}
              >
                {user.nombre ? user.nombre.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </div>
            </div>
          )}
        </header>

        {/* Contenedor principal responsivo */}
        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
