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
        {/* El marco no rota: gira un degradado cónico detrás de él y el tramo más intenso simula el avance de la carga */}
        <div className="relative mb-4 h-[72px] w-[72px] overflow-hidden rounded-[22px] bg-brand/15">
          <div className="absolute -inset-1/2 animate-spin bg-[conic-gradient(from_0deg,transparent_0%,transparent_45%,var(--color-brand)_100%)]" />
          <div className="absolute inset-[3px] flex items-center justify-center rounded-[19px] bg-paper-raised">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand-surface shadow-xs">
              <Image
                src="/logo_uagrm_activo_fijo.svg"
                alt="UAGRM"
                width={34}
                height={34}
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-ink font-serif tracking-tight text-center">
          {title}
        </h3>
      </div>
    </div>
  );
}
