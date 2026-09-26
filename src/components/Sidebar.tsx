'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Archive, 
  LogOut, 
  RefreshCw, 
  Users, 
  ClipboardList, 
  FileSignature, 
  Scale, 
  MapPin 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

const NAV_ITEMS = [
  { href: '/activos', label: 'Catálogo General', icon: Archive },
  { href: '/asignaciones', label: 'Asignaciones', icon: ClipboardList },
  { href: '/tramites', label: 'Trámites y Bajas', icon: FileSignature },
  { href: '/inspecciones', label: 'Inspecciones', icon: MapPin },
  { href: '/normativa', label: 'Normativa', icon: Scale },
  { href: '/sincronizacion', label: 'Sincronización', icon: RefreshCw },
];

const ADMIN_NAV_ITEMS = [{ href: '/usuarios', label: 'Usuarios y Accesos', icon: Users }];

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
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-paper-raised">
      <div className="flex flex-col items-center gap-3 border-b border-border px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white font-bold font-serif shadow-sm">
            AF
          </div>
          <div>
            <p className="font-serif text-sm font-bold leading-tight text-ink tracking-wide">UAGRM</p>
            <p className="text-[11px] font-semibold text-ink-tertiary tracking-wide uppercase mt-0.5">Activo Fijo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
          Módulos del Sistema
        </p>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200',
                    active
                      ? 'bg-brand text-white shadow-sm font-medium'
                      : 'text-ink-secondary hover:bg-border-soft hover:text-ink font-medium',
                  )}
                >
                  <item.icon className={cn("h-4 w-4", active ? "text-white" : "text-ink-tertiary")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4 bg-paper">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-ink-secondary hover:text-brand hover:bg-brand-surface transition-colors" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
