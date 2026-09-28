'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface WaitModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export function WaitModal({
  isOpen,
  title = 'Procesando solicitud...',
  message = 'Por favor espere un momento mientras se completa la operación.',
}: WaitModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
    >
      <div 
        className="w-full max-w-sm rounded-2xl bg-paper-raised border border-border-soft p-6 sm:p-7 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-4 flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-surface border border-brand/20 flex items-center justify-center shadow-xs">
            <Image
              src="/logo_uagrm_activo_fijo.svg"
              alt="UAGRM"
              width={34}
              height={34}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>

        <h3 className="text-base font-bold text-ink font-serif tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-ink-secondary leading-relaxed max-w-xs">
          {message}
        </p>
      </div>
    </div>
  );
}
