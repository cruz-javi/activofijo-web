import { FilePlus } from 'lucide-react';

export default function AltaActivosPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="h-16 w-16 bg-brand-surface text-brand rounded-full flex items-center justify-center mb-6">
        <FilePlus className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-ink mb-2">Alta de Activos</h1>
      <p className="text-ink-secondary max-w-md">
        El módulo de registro inicial de activos está en construcción. Estará disponible en la próxima iteración.
      </p>
    </div>
  );
}
