'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, AlertCircle, Clock, Smartphone } from 'lucide-react';
import { Button } from './Button';
import { CampoCodigoVerificacion, codigoCompleto } from '@/components/auth/CampoCodigoVerificacion';
import { guardarStepUpToken } from '@/lib/hooks/useStepUp';

interface TwoFactorConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (stepUpToken: string) => Promise<void>;
  assetSummary: {
    codigo: string;
    descripcion: string;
    monto: number;
    ubicacion?: string;
    responsable?: string;
  };
  isLoading: boolean;
  errorMessage?: string | null;
}

export function TwoFactorConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  assetSummary,
  isLoading,
  errorMessage,
}: TwoFactorConfirmModalProps) {
  const [codigo, setCodigo] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setCodigo('');
      setLocalError(null);
      autoSubmittedRef.current = false;
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const ejecutarVerificacion = async (codigoValidar: string) => {
    if (codigoValidar.length !== 6 || verificando || isLoading) return;
    setVerificando(true);
    setLocalError(null);

    try {
      const res = await fetch('/api/proxy/auth/stepup/verificar-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoValidar }),
      });

      const data = await res.json();
      if (!res.ok || !data.valido) {
        throw new Error(data.message || 'Código de verificación 2FA inválido o expirado');
      }

      guardarStepUpToken(data.stepUpToken, data.expiraEnSegundos || 300);
      await onConfirm(data.stepUpToken);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Error al verificar código');
      setCodigo('');
      autoSubmittedRef.current = false;
      inputRef.current?.focus();
    } finally {
      setVerificando(false);
    }
  };

  const handleCodigoChange = (val: string) => {
    setCodigo(val);
    setLocalError(null);
    if (val.length === 6 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      ejecutarVerificacion(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoCompleto(codigo, 'app')) {
      ejecutarVerificacion(codigo);
    }
  };

  const handleClose = () => {
    if (isLoading || verificando) return;
    setCodigo('');
    setLocalError(null);
    onClose();
  };

  if (!isOpen) return null;

  const procesando = isLoading || verificando;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft bg-paper">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-surface text-brand">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink font-serif">Firma de Seguridad 2FA</h3>
              <p className="text-xs text-ink-secondary">Código del autenticador para autorizar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={procesando}
            className="text-ink-tertiary hover:text-ink transition-colors p-1.5 rounded-full hover:bg-paper cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resumen del activo a firmar */}
        <div className="px-6 py-3.5 border-b border-border-soft bg-paper text-xs space-y-1.5">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-ink-secondary">Código Patrimonial:</span>
            <span className="font-mono font-bold text-brand text-xs">{assetSummary.codigo}</span>
          </div>
          <div className="flex justify-between items-start py-0.5">
            <span className="text-ink-secondary">Descripción:</span>
            <span className="font-medium text-ink text-right max-w-60 truncate">{assetSummary.descripcion}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-ink-secondary">Valor Adquisición:</span>
            <span className="font-mono font-bold text-ink">BOB {assetSummary.monto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
          </div>
          {assetSummary.ubicacion && (
            <div className="flex justify-between items-center py-0.5">
              <span className="text-ink-secondary">Ubicación:</span>
              <span className="text-ink text-right truncate max-w-60">{assetSummary.ubicacion}</span>
            </div>
          )}
        </div>

        {/* Formulario de 2FA TOTP */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-surface/50 border border-brand/20 text-xs text-ink-secondary leading-relaxed">
            <Clock className="h-4 w-4 shrink-0 text-brand mt-0.5" />
            <p>
              Introduzca su código TOTP de 6 dígitos. Una vez verificado, <strong className="text-ink font-semibold">permanecerá activo por 5 minutos</strong> para autorizar operaciones consecutivas sin volver a solicitarlo.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="totp-confirm-input" className="block text-xs font-semibold text-ink">
              Código de verificación (Google / Microsoft Authenticator) *
            </label>
            <CampoCodigoVerificacion
              ref={inputRef}
              id="totp-confirm-input"
              value={codigo}
              onChange={handleCodigoChange}
              disabled={procesando}
            />
            {(localError || errorMessage) && (
              <div className="flex items-center gap-1.5 text-xs text-danger font-medium mt-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{localError || errorMessage}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={procesando}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={procesando || !codigoCompleto(codigo, 'app')}
              className="gap-2 cursor-pointer"
            >
              {procesando ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Firmando operación…
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4" />
                  Firmar Operación
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
