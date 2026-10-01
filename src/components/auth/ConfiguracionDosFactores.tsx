'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import type { ActivacionDosFactores, ConfiguracionDosFactores as Configuracion } from '@/lib/auth-types';
import { CampoCodigoVerificacion, codigoCompleto } from './CampoCodigoVerificacion';
import { CodigosRespaldoPanel } from './CodigosRespaldoPanel';

interface ConfiguracionDosFactoresProps {
  endpoints: { configurar: string; activar: string };
  etiquetaContinuar?: string;
  obligatorio?: boolean;
  onOmitir?: () => void;
  onCompletado: () => void;
  onCancelar?: () => void;
}

const TAMANO_QR = 176;

function agruparClave(secreto: string): string {
  return secreto.replace(/(.{4})/g, '$1 ').trim();
}

export function ConfiguracionDosFactores({
  endpoints,
  etiquetaContinuar,
  obligatorio = false,
  onOmitir,
  onCompletado,
  onCancelar,
}: ConfiguracionDosFactoresProps) {
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [codigo, setCodigo] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigosRespaldo, setCodigosRespaldo] = useState<string[] | null>(null);
  const solicitudEnCurso = useRef(false);

  const prepararConfiguracion = useCallback(async () => {
    // Cada solicitud genera un secreto nuevo en el servidor: evitar duplicados (p. ej. doble montaje en desarrollo).
    if (solicitudEnCurso.current) return;
    solicitudEnCurso.current = true;
    setCargando(true);
    setError(null);

    try {
      const res = await fetch(endpoints.configurar, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'No fue posible preparar la verificación');
      }
      setConfiguracion(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible preparar la verificación');
    } finally {
      solicitudEnCurso.current = false;
      setCargando(false);
    }
  }, [endpoints.configurar]);

  useEffect(() => {
    prepararConfiguracion();
  }, [prepararConfiguracion]);

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmando(true);

    try {
      const res = await fetch(endpoints.activar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      const data: ActivacionDosFactores & { message?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Código de verificación inválido o vencido');
      }
      setCodigosRespaldo(data.codigosRespaldo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible activar la verificación');
      setCodigo('');
    } finally {
      setConfirmando(false);
    }
  };

  if (codigosRespaldo) {
    return <CodigosRespaldoPanel codigos={codigosRespaldo} etiquetaContinuar={etiquetaContinuar} onContinuar={onCompletado} />;
  }

  return (
    <div className="space-y-5">
      {obligatorio && (
        <div className="p-3 rounded-xl border border-brand/25 bg-brand-surface/50 text-brand text-xs flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Su rol institucional requiere <strong className="font-semibold">verificación en dos pasos obligatoria</strong> para acceder al sistema.
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3.5 rounded-xl border border-danger/25 bg-danger-surface text-danger text-xs leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            {!configuracion && (
              <button type="button" onClick={prepararConfiguracion} className="mt-2 inline-flex items-center gap-1.5 font-semibold underline cursor-pointer">
                <RotateCcw className="h-3 w-3" /> Reintentar
              </button>
            )}
          </div>
        </div>
      )}

      <ol className="space-y-4 text-sm text-ink-secondary">
        <li className="flex gap-3">
          <span className="h-6 w-6 shrink-0 rounded-full bg-brand-surface text-brand text-xs font-bold flex items-center justify-center">1</span>
          <p className="leading-relaxed">
            Instale <strong className="text-ink">Google Authenticator</strong> o <strong className="text-ink">Microsoft Authenticator</strong> en su celular.
          </p>
        </li>
        <li className="flex gap-3">
          <span className="h-6 w-6 shrink-0 rounded-full bg-brand-surface text-brand text-xs font-bold flex items-center justify-center">2</span>
          <div className="flex-1">
            <p className="leading-relaxed mb-3">Escanee este código QR desde la aplicación.</p>
            <div className="flex flex-col items-center justify-center my-2 text-center">
              <div
                className="flex items-center justify-center rounded-2xl border border-border-soft bg-white shadow-xs p-3 transition-transform hover:scale-[1.02]"
                style={{ width: TAMANO_QR + 24, height: TAMANO_QR + 24 }}
              >
                {cargando || !configuracion ? (
                  <div className="animate-pulse rounded-xl bg-border-soft" style={{ width: TAMANO_QR, height: TAMANO_QR }} aria-label="Preparando código QR" />
                ) : (
                  <QRCodeSVG value={configuracion.otpauthUri} size={TAMANO_QR} marginSize={0} title="Código QR de verificación" />
                )}
              </div>
              {configuracion && (
                <div className="mt-3 max-w-sm text-center">
                  <p className="text-xs text-ink-tertiary leading-relaxed">
                    ¿No puede escanearlo? Ingrese esta clave manualmente:
                  </p>
                  <span className="inline-block mt-1 font-mono text-xs font-semibold tabular-nums text-ink bg-paper px-2.5 py-1 rounded-md border border-border-soft break-all select-all">
                    {agruparClave(configuracion.secreto)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="h-6 w-6 shrink-0 rounded-full bg-brand-surface text-brand text-xs font-bold flex items-center justify-center">3</span>
          <form onSubmit={confirmar} autoComplete="off" className="flex-1 space-y-3">
            <p className="leading-relaxed">Ingrese el código de 6 dígitos que aparece en la aplicación para confirmar.</p>
            <Field label="Código de verificación" htmlFor="codigo-activacion">
              <CampoCodigoVerificacion
              id="codigo-activacion"
              value={codigo}
              onChange={setCodigo}
              disabled={!configuracion || confirmando}
            />
            </Field>
            <div className="flex items-center gap-2">
              <Button type="submit" className="flex-1 h-11" disabled={!configuracion || confirmando || !codigoCompleto(codigo, 'app')}>
                {confirmando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirmando…
                  </>
                ) : (
                  <>
                    Activar verificación
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              {onCancelar && (
                <Button type="button" variant="secondary" className="h-11" onClick={onCancelar} disabled={confirmando}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </li>
      </ol>

      {!obligatorio && onOmitir && (
        <div className="pt-2 text-center border-t border-border-soft">
          <button
            type="button"
            onClick={onOmitir}
            disabled={confirmando}
            className="text-xs text-ink-secondary hover:text-brand hover:underline cursor-pointer font-medium py-1 px-3 rounded-lg hover:bg-paper transition-colors"
          >
            Omitir por ahora (Continuar al sistema sin 2FA)
          </button>
        </div>
      )}
    </div>
  );
}
