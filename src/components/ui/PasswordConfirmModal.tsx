'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
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

export function PasswordConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  assetSummary,
  isLoading,
  errorMessage,
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLocalError('Debe ingresar su contraseña institucional');
      return;
    }
    setLocalError(null);
    await onConfirm(password);
  };

  const handleClose = () => {
    if (isLoading) return;
    setPassword('');
    setLocalError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-paper border border-border rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-brand/10 text-brand">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Confirmación de Seguridad</h3>
              <p className="text-xs text-ink-secondary">Ingrese su contraseña para autorizar el registro</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="text-ink-tertiary hover:text-ink transition-colors p-1 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resumen del activo a firmar */}
        <div className="px-6 py-4 border-b border-border bg-paper text-xs space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-ink-secondary">Código Patrimonial:</span>
            <span className="font-mono font-semibold text-brand text-sm">{assetSummary.codigo}</span>
          </div>
          <div className="flex justify-between items-start py-1 border-b border-border/50">
            <span className="text-ink-secondary">Descripción:</span>
            <span className="font-medium text-ink text-right max-w-60 truncate">{assetSummary.descripcion}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-ink-secondary">Valor Adquisición:</span>
            <span className="font-mono font-semibold text-ink">BOB {assetSummary.monto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
          </div>
          {assetSummary.ubicacion && (
            <div className="flex justify-between items-center py-1">
              <span className="text-ink-secondary">Ubicación Asignada:</span>
              <span className="text-ink text-right truncate max-w-60">{assetSummary.ubicacion}</span>
            </div>
          )}
        </div>

        {/* Formulario de contraseña */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Por seguridad institucional, confirme su contraseña para autorizar el alta definitiva de este activo en el sistema patrimonial.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink">
              Contraseña de acceso institucional <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-tertiary">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError(null);
                }}
                disabled={isLoading}
                autoFocus
                placeholder="Ingrese su contraseña institucional..."
                className="w-full pl-9 pr-10 py-2 text-sm bg-subtle border border-border rounded-md text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-tertiary hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {(localError || errorMessage) && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                {localError || errorMessage}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !password.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Firmando operación...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Firmar y Dar de Alta
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
