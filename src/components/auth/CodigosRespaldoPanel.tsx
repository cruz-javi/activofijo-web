'use client';

import { useState } from 'react';
import { Check, Copy, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CodigosRespaldoPanelProps {
  codigos: string[];
  etiquetaContinuar?: string;
  onContinuar: () => void;
}

export function CodigosRespaldoPanel({ codigos, etiquetaContinuar = 'Continuar', onContinuar }: CodigosRespaldoPanelProps) {
  const [copiado, setCopiado] = useState(false);
  const [guardados, setGuardados] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigos.join('\n'));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3.5 rounded-xl border border-accent/30 bg-accent-surface text-xs leading-relaxed text-ink">
        <KeyRound className="h-4 w-4 shrink-0 mt-0.5 text-accent-strong" />
        <p>
          <strong className="font-semibold">Guarde estos códigos de respaldo.</strong> Cada uno sirve una sola vez si pierde
          acceso a su aplicación autenticadora. No volverán a mostrarse.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2" aria-label="Códigos de respaldo">
        {codigos.map((codigo) => (
          <li
            key={codigo}
            className="h-9 flex items-center justify-center rounded-lg border border-border-soft bg-paper font-mono text-sm tabular-nums text-ink"
          >
            {codigo}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={copiar}>
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiado ? 'Copiados' : 'Copiar códigos'}
        </Button>
        <label className="flex items-center gap-2 text-xs text-ink cursor-pointer">
          <input
            type="checkbox"
            checked={guardados}
            onChange={(e) => setGuardados(e.target.checked)}
            className="h-4 w-4 rounded border-border-soft text-brand focus:ring-brand cursor-pointer"
          />
          Ya los guardé en un lugar seguro
        </label>
      </div>

      <Button type="button" className="w-full h-11" disabled={!guardados} onClick={onContinuar}>
        {etiquetaContinuar}
      </Button>
    </div>
  );
}
