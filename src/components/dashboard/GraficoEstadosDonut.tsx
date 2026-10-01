'use client';

import { Activity, ShieldCheck } from 'lucide-react';
import type { DashboardEstadoItem } from '@/lib/dashboard-types';

interface GraficoEstadosDonutProps {
  estados: DashboardEstadoItem[];
  porcentajeOperativos: number;
}

interface ColorScheme {
  stroke: string;
  bg: string;
  text: string;
  dot: string;
}

const DEFAULT_COLOR: ColorScheme = {
  stroke: '#94A3B8',
  bg: 'bg-slate-100',
  text: 'text-slate-600',
  dot: 'bg-slate-400',
};

const COLOR_MAP: Record<string, ColorScheme> = {
  brand: {
    stroke: '#B91C1C',
    bg: 'bg-brand-surface',
    text: 'text-brand',
    dot: 'bg-brand',
  },
  accent: {
    stroke: '#D97706',
    bg: 'bg-accent-surface',
    text: 'text-accent-strong',
    dot: 'bg-accent',
  },
  danger: {
    stroke: '#DC2626',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-600',
  },
  neutral: {
    stroke: '#94A3B8',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  success: {
    stroke: '#059669',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
  },
};

export function GraficoEstadosDonut({ estados, porcentajeOperativos }: GraficoEstadosDonutProps) {
  const totalCantidad = estados.reduce((acc, e) => acc + e.cantidad, 0);

  // Dimensiones del Donut SVG
  const radius = 56;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Cálculo de los offsets acumulados
  let accumulatedPercent = 0;
  const segments = estados.map((item) => {
    const fraction = totalCantidad > 0 ? item.cantidad / totalCantidad : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference * (1 - fraction)}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += fraction;
    const colors: ColorScheme = (item.colorTone && COLOR_MAP[item.colorTone]) ? COLOR_MAP[item.colorTone]! : DEFAULT_COLOR;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      colors,
    };
  });

  return (
    <div className="bg-paper-raised border border-border-soft rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink font-serif tracking-tight">
                Estado Físico y Operatividad
              </h2>
              <p className="text-xs text-ink-secondary">
                Condición de servicio de los activos en inventario
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Confiabilidad
          </span>
        </div>

        {estados.length === 0 ? (
          <div className="py-12 text-center text-xs text-ink-tertiary">
            No se registran datos de estados físicos.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
            {/* Donut SVG con porcentaje central */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                className="transform -rotate-90"
              >
                {/* Círculo de fondo tenue */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="var(--color-border-soft, #E2E8F0)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Segmentos de arco por estado */}
                {segments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={seg.colors?.stroke || DEFAULT_COLOR.stroke}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-700 ease-out hover:opacity-85"
                  />
                ))}
              </svg>

              {/* Indicador central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-ink tracking-tight tabular-nums">
                  {porcentajeOperativos}%
                </span>
                <span className="text-[10px] uppercase font-semibold text-ink-tertiary tracking-wider">
                  Operativo
                </span>
              </div>
            </div>

            {/* Leyenda interactiva con datos precisos */}
            <div className="flex-1 w-full space-y-2.5">
              {segments.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-paper transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.colors?.dot || DEFAULT_COLOR.dot}`}
                    />
                    <span className="font-medium text-ink truncate">
                      {item.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-xs shrink-0">
                    <span className="text-ink font-semibold">
                      {item.cantidad.toLocaleString('es-BO')}
                    </span>
                    <span className="text-ink-tertiary text-[11px]">
                      ({item.porcentaje}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border-soft/70 flex items-center justify-between text-xs">
        <span className="text-ink-secondary">
          Total bienes clasificados
        </span>
        <span className="font-mono font-bold text-ink tabular-nums">
          {totalCantidad.toLocaleString('es-BO')} activos
        </span>
      </div>
    </div>
  );
}
