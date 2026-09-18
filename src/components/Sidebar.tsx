'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Archive, LogOut, RefreshCw, Users, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Stamp } from '@/components/Stamp';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

const NAV_ITEMS = [
  { href: '/activos', label: 'Catálogo', icon: Archive },
  { href: '/sincronizacion', label: 'Sincronización', icon: RefreshCw },
];

const ADMIN_NAV_ITEMS = [
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/reglas', label: 'Reglas de depreciación', icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const navItems = user?.rol === 'ADMIN' ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-paper-raised">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <Stamp rotate={-4} className="h-8 w-8 text-[10px]">
          AF
        </Stamp>
        <div>
          <p className="font-serif text-sm font-semibold leading-tight text-ink">UAGRM</p>
          <p className="text-[11px] text-ink-tertiary">Activo Fijo</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2.5 pb-2 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
          Patrimonio
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors',
                    active
                      ? 'bg-brand-surface font-medium text-brand-strong'
                      : 'text-ink-secondary hover:bg-border-soft hover:text-ink',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
