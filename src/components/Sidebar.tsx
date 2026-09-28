'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Archive, 
  LogOut, 
  Users, 
  FileSignature, 
  ChevronDown, 
  LayoutDashboard, 
  FilePlus, 
  FileMinus, 
  Shield, 
  KeyRound, 
  Fingerprint, 
  X,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { WaitModal } from '@/components/ui/WaitModal';
import { useCurrentUser, clearUserCache } from '@/lib/hooks/useCurrentUser';

type SubItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiredPermiso?: string;
  requiredRole?: string;
};

type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  requiredPermiso?: string;
  requiredRole?: string;
  subItems?: SubItem[];
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { 
    label: 'Consultas', 
    icon: Archive,
    subItems: [
      { href: '/activos', label: 'Catálogo de Activos', icon: Archive, requiredPermiso: 'activos:leer' },
    ]
  },
  {
    label: 'Formularios',
    icon: FileSignature,
    subItems: [
      { href: '/formularios/alta', label: 'Alta de Activos', icon: FilePlus, requiredPermiso: 'activos:crear' },
      { href: '/formularios/baja', label: 'Baja de Activos', icon: FileMinus, requiredPermiso: 'activos:baja' },
    ]
  },
  {
    label: 'Seguridad y Auditoría',
    icon: Shield,
    subItems: [
      { href: '/usuarios', label: 'Usuarios y Accesos', icon: Users, requiredPermiso: 'usuarios:gestionar' },
      { href: '/roles', label: 'Roles y Permisos', icon: KeyRound, requiredPermiso: 'usuarios:gestionar' },
      { href: '/auditoria', label: 'Bitácora del Sistema', icon: Fingerprint, requiredPermiso: 'usuarios:gestionar' },
    ]
  },
];

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, hasPermiso, hasRole, roleLabel } = useCurrentUser();
  
  // Submenús inician colapsados tanto en Desktop como en Mobile
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleExpand = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      clearUserCache();
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  // Filtrado estricto: Las opciones no permitidas NO se muestran al usuario
  const visibleNavItems = NAV_ITEMS.map((item) => {
    if (item.subItems) {
      const allowedSubs = item.subItems.filter((sub) => {
        if (isAdmin) return true;
        const passPerm = !sub.requiredPermiso || hasPermiso(sub.requiredPermiso);
        const passRole = !sub.requiredRole || hasRole(sub.requiredRole);
        return passPerm && passRole;
      });
      if (allowedSubs.length === 0) return null;
      return { ...item, subItems: allowedSubs };
    }

    if (isAdmin) return item;
    const passPerm = !item.requiredPermiso || hasPermiso(item.requiredPermiso);
    const passRole = !item.requiredRole || hasRole(item.requiredRole);
    return passPerm && passRole ? item : null;
  }).filter(Boolean) as NavItem[];

  const renderLink = (item: { href: string; label: string; icon: LucideIcon }, isSub: boolean = false) => {
    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        onClick={() => onCloseMobile?.()}
        className={cn(
          'flex items-center gap-3 rounded-lg py-2.5 transition-all duration-150 cursor-pointer',
          isSub ? 'px-3 ml-5 text-xs font-medium' : 'px-3 text-sm font-medium',
          active
            ? 'bg-brand text-white shadow-xs font-semibold'
            : 'text-ink-secondary hover:bg-border-soft hover:text-ink',
        )}
      >
        <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'text-ink-tertiary')} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  if (!mounted) return null;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-paper">
      {/* Header Institucional */}
      <div className="flex items-center justify-between border-b border-border-soft px-5 py-5 bg-paper-raised">
        <Link href="/dashboard" className="flex items-center gap-3 truncate" onClick={() => onCloseMobile?.()}>
          <Image 
            src="/logo_uagrm_activo_fijo.svg" 
            alt="Escudo UAGRM" 
            width={38} 
            height={38} 
            className="w-9 h-9 shrink-0 drop-shadow-xs" 
          />
          <div className="flex flex-col truncate">
            <span className="font-serif text-sm font-bold leading-tight text-ink tracking-wide truncate">
              UAGRM
            </span>
            <span className="text-[11px] font-semibold text-brand tracking-wider uppercase mt-0.5 truncate">
              Activo Fijo
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navegación Filtrada */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
        <p className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">
          Módulos Autorizados
        </p>
        <ul className="flex flex-col gap-1">
          {visibleNavItems.map((item) => {
            if (item.subItems) {
              const isExpanded = !!expanded[item.label];
              return (
                <li key={item.label} className="flex flex-col gap-1">
                  <button 
                    type="button"
                    onClick={() => toggleExpand(item.label)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-ink-secondary hover:bg-border-soft hover:text-ink transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4 text-ink-tertiary" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-ink-muted transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                  </button>
                  {isExpanded && (
                    <ul className="flex flex-col gap-1 mt-0.5 animate-in slide-in-from-top-1 fade-in duration-150">
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
                {renderLink(item as { href: string; label: string; icon: LucideIcon })}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Usuario y Logout */}
      <div className="border-t border-border-soft p-4 bg-paper-raised">
        {user && (
          <div className="mb-3 px-2 flex flex-col gap-0.5">
            <p className="text-sm font-bold text-ink truncate" title={user.nombre || user.email}>
              {user.nombre || user.email}
            </p>
            <p className="text-xs font-semibold tracking-wider text-brand uppercase truncate" title={roleLabel}>
              {roleLabel}
            </p>
            {user.cargoInstitucional && (
              <p className="text-[11px] text-ink-tertiary truncate" title={user.cargoInstitucional}>
                {user.cargoInstitucional}
              </p>
            )}
          </div>
        )}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-ink-secondary hover:text-brand hover:bg-brand-surface transition-colors cursor-pointer" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Persistente */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col border-r border-border-soft sticky top-0">
        {sidebarContent}
      </aside>

      {/* Drawer Móvil con Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={onCloseMobile}
        >
          <div 
            className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Modal de espera durante logout */}
      <WaitModal 
        isOpen={isLoggingOut} 
        title="Cerrando sesión..." 
      />
    </>
  );
}
