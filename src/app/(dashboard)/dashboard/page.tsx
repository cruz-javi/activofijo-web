import { Archive, ClipboardList, MapPin, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 md:p-10 mx-auto max-w-7xl w-full animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Panel de Control</h1>
        <p className="text-sm text-ink-secondary">Resumen consolidado del sistema de Activos Fijos UAGRM.</p>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Metric 1 */}
        <div className="bg-paper-raised border border-border-soft p-5 rounded-lg shadow-sm flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider group-hover:text-ink-secondary transition-colors">Total Activos</h3>
            <div className="h-8 w-8 rounded bg-border-soft text-ink flex items-center justify-center">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">14,230</span>
            <span className="text-[11px] text-ink-secondary mt-1">Bienes registrados en inventario</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-paper-raised border border-border-soft p-5 rounded-lg shadow-sm flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider group-hover:text-ink-secondary transition-colors">Asignaciones</h3>
            <div className="h-8 w-8 rounded bg-brand-surface text-brand flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">3,105</span>
            <span className="text-[11px] text-ink-secondary mt-1">Actas PB-14 vigentes</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-paper-raised border border-border-soft p-5 rounded-lg shadow-sm flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider group-hover:text-ink-secondary transition-colors">Inspecciones</h3>
            <div className="h-8 w-8 rounded bg-accent-surface text-accent-strong flex items-center justify-center">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">42</span>
            <span className="text-[11px] text-ink-secondary mt-1">En curso durante este mes</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-paper-raised border border-border-soft p-5 rounded-lg shadow-sm flex flex-col group hover:border-border transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider group-hover:text-ink-secondary transition-colors">Trámites</h3>
            <div className="h-8 w-8 rounded bg-danger-surface text-danger flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink font-mono tabular-nums">18</span>
            <span className="text-[11px] text-ink-secondary mt-1">Bajas pendientes de revisión</span>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <h2 className="text-base font-semibold text-ink mb-4">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/formularios/alta" className="group bg-paper-raised border border-border-soft p-4 rounded-lg hover:border-brand/50 hover:bg-brand-surface/30 transition-all flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">Nueva Alta</span>
            <span className="text-xs text-ink-secondary">Registrar un activo nuevo</span>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-brand transition-colors group-hover:translate-x-1" />
        </Link>
        
        <Link href="/asignaciones/nuevo" className="group bg-paper-raised border border-border-soft p-4 rounded-lg hover:border-brand/50 hover:bg-brand-surface/30 transition-all flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">Emitir Acta (PB-14)</span>
            <span className="text-xs text-ink-secondary">Generar acta de custodia</span>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-brand transition-colors group-hover:translate-x-1" />
        </Link>
        
        <Link href="/activos" className="group bg-paper-raised border border-border-soft p-4 rounded-lg hover:border-brand/50 hover:bg-brand-surface/30 transition-all flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ink group-hover:text-brand transition-colors">Buscar Activo</span>
            <span className="text-xs text-ink-secondary">Consultar el catálogo general</span>
          </div>
          <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-brand transition-colors group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
