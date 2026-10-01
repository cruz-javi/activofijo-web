import Link from 'next/link';
import { ArrowUpRight, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { DashboardActivoReciente } from '@/lib/dashboard-types';

interface TablaActivosRecientesProps {
  recientes: DashboardActivoReciente[];
}

function getEstadoTone(estado: string): 'brand' | 'accent' | 'danger' | 'neutral' | 'success' {
  const norm = estado.toUpperCase();
  if (norm.includes('USO') || norm.includes('BUENO') || norm.includes('NUEVO')) return 'brand';
  if (norm.includes('DEPÓSITO') || norm.includes('DEPOSITO') || norm.includes('REGULAR')) return 'accent';
  if (norm.includes('BAJA') || norm.includes('MALO')) return 'danger';
  if (norm.includes('MANTENIMIENTO')) return 'neutral';
  return 'success';
}

function formatearFecha(fechaStr: string) {
  try {
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fechaStr;
  }
}

export function TablaActivosRecientes({ recientes }: TablaActivosRecientesProps) {
  return (
    <div className="bg-paper-raised border border-border-soft rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-paper border border-border-soft text-ink flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink font-serif tracking-tight">
              Incorporaciones Recientes al Patrimonio
            </h2>
            <p className="text-xs text-ink-secondary">
              Últimos bienes inventariados formalmente en la institución
            </p>
          </div>
        </div>

        <Link
          href="/activos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-strong hover:underline transition-colors self-start sm:self-auto"
        >
          <span>Ir al Catálogo Completo</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recientes.length === 0 ? (
        <div className="py-10 text-center text-xs text-ink-tertiary">
          No hay activos registrados recientemente.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-soft text-ink-tertiary uppercase tracking-wider text-[11px]">
                <th className="py-3 pr-4 font-semibold">Código</th>
                <th className="py-3 px-4 font-semibold">Descripción del Bien</th>
                <th className="py-3 px-4 font-semibold">Grupo Contable</th>
                <th className="py-3 px-4 font-semibold text-right">Valor Contable</th>
                <th className="py-3 px-4 font-semibold text-center">Estado</th>
                <th className="py-3 pl-4 font-semibold text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft/60">
              {recientes.map((activo) => (
                <tr
                  key={activo.id}
                  className="hover:bg-paper/70 transition-colors group"
                >
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/activos?search=${encodeURIComponent(activo.codigo)}`}
                      className="font-mono font-bold text-brand hover:underline inline-flex items-center gap-1"
                    >
                      {activo.codigo}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-ink max-w-70 truncate" title={activo.descripcion}>
                    {activo.descripcion}
                  </td>
                  <td className="py-3.5 px-4 text-ink-secondary max-w-50 truncate" title={activo.grupo}>
                    {activo.grupo}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-ink text-right tabular-nums whitespace-nowrap">
                    Bs. {activo.valor.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <Badge tone={getEstadoTone(activo.estado)}>
                      {activo.estado}
                    </Badge>
                  </td>
                  <td className="py-3.5 pl-4 text-ink-tertiary text-right whitespace-nowrap font-mono">
                    {formatearFecha(activo.fechaAlta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
