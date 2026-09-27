'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Archive, 
  LogOut, 
  Users, 
  ClipboardList, 
  FileSignature, 
  Scale, 
  MapPin,
  ChevronDown,
  LayoutDashboard,
  FilePlus,
  FileMinus,
  Files
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

type NavItem = {
  href?: string;
  label: string;
  icon: any;
  subItems?: { href: string; label: string; icon: any }[];
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { 
    label: 'Consultas', 
    icon: Archive,
    subItems: [
      { href: '/activos', label: 'Catálogo General', icon: Archive },
      { href: '/gestion-documental', label: 'Gestión Documental', icon: Files },
    ]
  },
  { href: '/asignaciones', label: 'Asignaciones', icon: ClipboardList },
  {
    label: 'Formularios',
    icon: FileSignature,
    subItems: [
      { href: '/formularios/alta', label: 'Alta de Activos', icon: FilePlus },
      { href: '/formularios/baja', label: 'Baja de Activos', icon: FileMinus },
    ]
  },
  { href: '/inspecciones', label: 'Inspecciones', icon: MapPin },
  { href: '/normativa', label: 'Normativa', icon: Scale },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/usuarios', label: 'Usuarios y Accesos', icon: Users }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const navItems = user?.rol === 'ADMIN' ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Consultas': true,
    'Formularios': true
  });
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const renderLink = (item: { href: string; label: string; icon: any }, isSub: boolean = false) => {
    const active = pathname.startsWith(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-md py-2.5 transition-all duration-200',
          isSub ? 'px-3 ml-6 text-sm' : 'px-3 text-sm',
          active
            ? 'bg-brand text-white shadow-sm font-medium'
            : 'text-ink-secondary hover:bg-border-soft hover:text-ink font-medium',
        )}
      >
        <item.icon className={cn("h-4 w-4", active ? "text-white" : "text-ink-tertiary")} />
        {item.label}
      </Link>
    );
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border-soft bg-paper">
      <div className="flex flex-col items-center gap-3 border-b border-border-soft px-5 py-6 bg-paper-raised">
        <div className="flex items-center gap-3 w-full">
          <Image src="/logo_uagrm_activo_fijo.svg" alt="Escudo UAGRM" width={40} height={40} className="w-10 h-10 shrink-0" />
          <div className="flex flex-col truncate">
            <p className="font-serif text-sm font-bold leading-tight text-ink tracking-wide truncate">UAGRM</p>
            <p className="text-[11px] font-semibold text-ink-secondary tracking-wide uppercase mt-0.5 truncate">Activo Fijo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">
          Módulos del Sistema
        </p>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            if (item.subItems) {
              const isExpanded = expanded[item.label];
              return (
                <li key={item.label} className="flex flex-col gap-1">
                  <button 
                    onClick={() => toggleExpand(item.label)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-ink-secondary hover:bg-border-soft hover:text-ink transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-ink-tertiary" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-ink-muted transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
                  </button>
                  {isExpanded && (
                    <ul className="flex flex-col gap-1 mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
                      {item.subItems.map(sub => (
                        <li key={sub.href}>
                          {renderLink(sub, true)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            
            return (
              <li key={item.href}>
                {renderLink(item as { href: string; label: string; icon: any })}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-soft p-4 bg-paper-raised">
        {user && (
          <div className="mb-3 px-2 flex flex-col gap-0.5">
            <p className="text-sm font-bold text-ink truncate" title={user.nombre || user.email}>
              {user.nombre || user.email}
            </p>
            <p className="text-[10px] font-semibold tracking-wider text-ink-tertiary uppercase truncate">
              {user.rol}
            </p>
          </div>
        )}
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
