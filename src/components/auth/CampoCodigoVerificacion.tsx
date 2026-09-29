'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/Input';

export type ModoCodigo = 'app' | 'respaldo';

interface CampoCodigoVerificacionProps {
  id: string;
  value: string;
  onChange: (valor: string) => void;
  modo?: ModoCodigo;
  disabled?: boolean;
}

const LONGITUD_APP = 6;
const LONGITUD_RESPALDO = 14;

export const CampoCodigoVerificacion = forwardRef<HTMLInputElement, CampoCodigoVerificacionProps>(
  ({ id, value, onChange, modo = 'app', disabled }, ref) => {
    const esApp = modo === 'app';

    const normalizar = (crudo: string) =>
      esApp ? crudo.replace(/\D/g, '').slice(0, LONGITUD_APP) : crudo.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, LONGITUD_RESPALDO);

    return (
      <Input
        ref={ref}
        id={id}
        name={id}
        type="text"
        inputMode={esApp ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        required
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(normalizar(e.target.value))}
        placeholder={esApp ? '000000' : 'XXXX-XXXX-XXXX'}
        maxLength={esApp ? LONGITUD_APP : LONGITUD_RESPALDO}
        className="h-12 text-center font-mono text-xl tabular-nums tracking-[0.3em] placeholder:tracking-[0.3em] disabled:opacity-60"
      />
    );
  },
);
CampoCodigoVerificacion.displayName = 'CampoCodigoVerificacion';

export function codigoCompleto(valor: string, modo: ModoCodigo): boolean {
  return modo === 'app' ? valor.length === LONGITUD_APP : valor.replace(/-/g, '').length === 12;
}
