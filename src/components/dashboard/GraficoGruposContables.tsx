import { Layers, TrendingUp } from 'lucide-react';
import type { DashboardGrupoItem } from '@/lib/dashboard-types';

interface GraficoGruposContablesProps {
  grupos: DashboardGrupoItem[];
  totalInventario: number;
}

export function GraficoGruposContables({ grupos, totalInventario }: GraficoGruposContablesProps) {
  const maxValor = Math.max(...grupos.map((g) => g.valor), 1);

  return (
    <div className="bg-paper-raised border border-border-soft rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-surface text-brand flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink font-serif tracking-tight">
                Top Grupos Contables
              </h2>
              <p className="text-xs text-ink-secondary">
                Concentración de valor presupuestario y volumen
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-brand bg-brand-surface px-2.5 py-1 rounded-full border border-brand/20">
            En Bolivianos (Bs.)
          </span>
        </div>

        {grupos.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-tertiary">
            No se registran grupos contables con activos activos en el sistema.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {grupos.map((item, idx) => {
              // Proporción relativa al grupo mayor para la barra visual
              const porcentajeBarra = Math.min(100, Math.max(5, (item.valor / maxValor) * 100));
              const porcentajeDelTotal = totalInventario > 0
                ? ((item.valor / totalInventario) * 100).toFixed(1)
                : '0.0';

              return (
                <div key={item.codigo} className="group flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-md bg-paper border border-border-soft text-[10px] font-mono font-bold text-ink-secondary shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-ink truncate group-hover:text-brand transition-colors" title={item.nombre}>
                        {item.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-ink-tertiary text-[11px]">
                        {item.cantidad.toLocaleString('es-BO')} bienes
                      </span>
                      <span className="font-mono font-semibold text-ink tabular-nums">
                        Bs. {item.valor.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-2 w-full bg-border-soft/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-brand to-brand-strong rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${porcentajeBarra}%` }}
                    />
                  </div>

                  <div className="flex justify-end text-[10px] text-ink-tertiary font-mono">
                    <span>{porcentajeDelTotal}% del inventario valorado</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border-soft/70 flex items-center justify-between text-xs">
        <span className="text-ink-secondary flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-brand" /> Total 5 grupos principales
        </span>
        <span className="font-mono font-bold text-ink tabular-nums">
          Bs. {grupos.reduce((acc, g) => acc + g.valor, 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
