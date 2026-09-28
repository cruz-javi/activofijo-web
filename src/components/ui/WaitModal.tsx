'use client';

import Image from 'next/image';

interface WaitModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export function WaitModal({
  isOpen,
  title = 'Cerrando sesión...',
}: WaitModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
    >
      <div 
        className="w-56 max-w-full rounded-2xl bg-paper-raised border border-border-soft p-6 shadow-2xl text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícono institucional con anillo concéntrico de carga perfectamente centrado */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-surface border border-brand/20 flex items-center justify-center shadow-xs">
            <Image
              src="/logo_uagrm_activo_fijo.svg"
              alt="UAGRM"
              width={34}
              height={34}
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="absolute inset-0 -m-1 rounded-[18px] border-2 border-brand border-t-transparent animate-spin" />
        </div>

        <h3 className="text-sm font-bold text-ink font-serif tracking-tight text-center">
          {title}
        </h3>
      </div>
    </div>
  );
}
