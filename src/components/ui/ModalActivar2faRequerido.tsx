'use client';

import { ShieldCheck, X, ShieldAlert } from 'lucide-react';
import { ConfiguracionDosFactores } from '@/components/auth/ConfiguracionDosFactores';
import { refreshCurrentUser } from '@/lib/hooks/useCurrentUser';

interface ModalActivar2faRequeridoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ENDPOINTS_PROXY_2FA = {
  configurar: '/api/proxy/auth/2fa/configurar',
  activar: '/api/proxy/auth/2fa/activar',
};

export function ModalActivar2faRequerido({
  isOpen,
  onClose,
  onSuccess,
}: ModalActivar2faRequeridoProps) {
  if (!isOpen) return null;

  const handleCompletado = async () => {
    await refreshCurrentUser();
    onSuccess();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-lg bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-soft">
          <div className="h-10 w-10 rounded-xl bg-brand-surface text-brand flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-ink text-base font-serif">
              Activación de 2FA Requerida
            </h3>
            <p className="text-xs text-ink-tertiary">
              Requisito de seguridad institucional para operaciones patrimoniales
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Has omitido la verificación en 2 pasos al iniciar sesión. Para registrar o modificar bienes patrimoniales, <strong className="font-semibold">es obligatorio vincular tu autenticador</strong>. Los datos de tu formulario permanecen guardados intactos.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          <ConfiguracionDosFactores
            endpoints={ENDPOINTS_PROXY_2FA}
            etiquetaContinuar="Continuar con la operación"
            obligatorio={true}
            onCompletado={handleCompletado}
            onCancelar={onClose}
          />
        </div>
      </div>
    </div>
  );
}
