'use client';

import { 
  Archive, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  PlusCircle, 
  KeyRound, 
  Fingerprint,
  Tag,
  ClipboardList,
  MapPin,
  LucideIcon 
} from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface ShortcutItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  permiso?: string;
  roles?: string[];
}

const ALL_SHORTCUTS: ShortcutItem[] = [
  {
    href: '/activos',
    title: 'Catálogo de Activos',
    description: 'Consultar inventario patrimonial y fichas técnicas',
    icon: Archive,
    permiso: 'activos:consultar',
  },
  {
    href: '/formularios/alta',
    title: 'Alta de Activos',
    description: 'Incorporación formal de nuevos bienes al patrimonio',
    icon: PlusCircle,
    permiso: 'activos:crear',
  },
  {
    href: '/etiquetas',
    title: 'Identificadores y Etiquetas',
    description: 'Generación e impresión de códigos QR y de barras',
    icon: Tag,
    permiso: 'etiquetas:gestionar',
  },
  {
    href: '/usuarios',
    title: 'Gestión de Usuarios',
    description: 'Administración de cuentas y funcionarios',
    icon: Users,
    permiso: 'usuarios:gestionar',
  },
  {
    href: '/roles',
    title: 'Roles y Permisos',
    description: 'Configuración granular de perfiles y accesos',
    icon: KeyRound,
    permiso: 'roles:gestionar',
  },
  {
    href: '/auditoria',
    title: 'Bitácora del Sistema',
    description: 'Registro forense de trazabilidad y eventos de seguridad',
    icon: Fingerprint,
    permiso: 'bitacora:consultar',
  },
];

export default function DashboardPage() {
  const { user, isAdmin, hasPermiso, roleLabel } = useCurrentUser();

  // Filtrar atajos estrictamente según permisos para evitar fugas de información
  const authorizedShortcuts = ALL_SHORTCUTS.filter((item) => {
    if (isAdmin) return true;
    if (!item.permiso) return true;
    return hasPermiso(item.permiso);
  });

  return (
    <div className="flex-1 w-full animate-in fade-in duration-300">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink tracking-tight font-serif">
          Panel de Control
        </h1>
        <p className="text-sm text-ink-secondary">
          Bienvenido(a), <strong className="text-ink font-semibold">{user?.nombre || user?.email}</strong> ({roleLabel}).
        </p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
        <div className="bg-paper-raised border border-border-soft p-5 rounded-xl shadow-xs flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
              Total Activos
            </h3>
            <div className="h-8 w-8 rounded-lg bg-border-soft text-ink flex items-center justify-center">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">14,230</span>
            <span className="text-[11px] text-ink-secondary mt-1">Bienes registrados en inventario</span>
          </div>
        </div>

        <div className="bg-paper-raised border border-border-soft p-5 rounded-xl shadow-xs flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
              Asignaciones
            </h3>
            <div className="h-8 w-8 rounded-lg bg-brand-surface text-brand flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">3,105</span>
            <span className="text-[11px] text-ink-secondary mt-1">Actas PB-14 vigentes</span>
          </div>
        </div>

        <div className="bg-paper-raised border border-border-soft p-5 rounded-xl shadow-xs flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
              Inspecciones
            </h3>
            <div className="h-8 w-8 rounded-lg bg-accent-surface text-accent-strong flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">42</span>
            <span className="text-[11px] text-ink-secondary mt-1">En curso durante este período</span>
          </div>
        </div>

        <div className="bg-paper-raised border border-border-soft p-5 rounded-xl shadow-xs flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
              Trámites
            </h3>
            <div className="h-8 w-8 rounded-lg bg-danger-surface text-danger flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">18</span>
            <span className="text-[11px] text-ink-secondary mt-1">Bajas y transferencias activas</span>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink font-serif tracking-tight">
          Accesos Rápidos Autorizados
        </h2>
        <span className="text-xs text-ink-tertiary">
          Filtrado por permisos de su rol
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authorizedShortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group bg-paper-raised border border-border-soft p-4 rounded-xl hover:border-brand/40 hover:bg-brand-surface/20 transition-all flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3.5 truncate">
              <div className="h-9 w-9 rounded-lg bg-paper border border-border-soft flex items-center justify-center text-ink-secondary group-hover:text-brand group-hover:border-brand/30 transition-colors shrink-0">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors truncate">
                  {item.title}
                </span>
                <span className="text-xs text-ink-secondary truncate">
                  {item.description}
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-brand transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
}
