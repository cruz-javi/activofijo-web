import { FileMinus } from 'lucide-react';

export default function BajaActivosPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="h-16 w-16 bg-danger-surface text-danger rounded-full flex items-center justify-center mb-6">
        <FileMinus className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-ink mb-2">Baja de Activos</h1>
      <p className="text-ink-secondary max-w-md">
        El proceso de dar de baja un bien (remates, mermas, obsoletos) está en construcción. Estará disponible pronto.
      </p>
    </div>
  );
}
