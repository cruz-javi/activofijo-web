'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, ShieldAlert, Smartphone } from 'lucide-react';
import { CampoCodigoVerificacion, codigoCompleto, type ModoCodigo } from './CampoCodigoVerificacion';

interface VerificacionDosFactoresFormProps {
  onVerificado: () => void;
  onVolver: () => void;
}

export function VerificacionDosFactoresForm({ onVerificado, onVolver }: VerificacionDosFactoresFormProps) {
  const [codigo, setCodigo] = useState('');
  const [modo, setModo] = useState<ModoCodigo>('app');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [modo]);

  const cambiarModo = () => {
    setModo((actual) => (actual === 'app' ? 'respaldo' : 'app'));
    setCodigo('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/2fa/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Código de verificación inválido o vencido');
      }
      onVerificado();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible verificar el código');
      setCodigo('');
    } finally {
      setLoading(false);
    }
  };

  const sesionExpirada = error?.includes('expiró');

  return (
    <div>
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-brand-surface text-brand flex items-center justify-center shrink-0">
          <Smartphone className="h-5 w-5" />
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          {modo === 'app'
            ? 'Ingrese el código de 6 dígitos que muestra su aplicación autenticadora.'
            : 'Ingrese uno de los códigos de respaldo que guardó al activar la verificación.'}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-5 p-3.5 rounded-xl border border-danger/25 bg-danger-surface text-danger text-xs leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        <div>
          <label htmlFor="codigo-verificacion" className="block text-xs font-semibold text-ink mb-1.5">
            {modo === 'app' ? 'Código de verificación' : 'Código de respaldo'}
          </label>
          <CampoCodigoVerificacion
            ref={inputRef}
            id="codigo-verificacion"
            value={codigo}
            onChange={setCodigo}
            modo={modo}
            disabled={loading || sesionExpirada}
          />
        </div>

        <button
          type="submit"
          disabled={loading || sesionExpirada || !codigoCompleto(codigo, modo)}
          className="w-full h-11 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-strong disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando…</span>
            </>
          ) : (
            <>
              <span>Verificar e ingresar</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-border-soft flex items-center justify-between gap-3 text-xs">
        <button type="button" onClick={cambiarModo} className="text-brand hover:text-brand-strong font-medium cursor-pointer">
          {modo === 'app' ? 'Usar un código de respaldo' : 'Usar mi aplicación autenticadora'}
        </button>
        <button type="button" onClick={onVolver} className="text-ink-tertiary hover:text-ink cursor-pointer">
          Volver
        </button>
      </div>
    </div>
  );
}
