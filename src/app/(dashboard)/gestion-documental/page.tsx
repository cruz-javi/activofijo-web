import { Files } from 'lucide-react';

export default function GestionDocumentalPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="h-16 w-16 bg-border-soft text-ink-secondary rounded-full flex items-center justify-center mb-6">
        <Files className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-ink mb-2">Gestión Documental</h1>
      <p className="text-ink-secondary max-w-md">
        Repositorio centralizado de actas firmadas y cuadros valorados. Módulo en desarrollo.
      </p>
    </div>
  );
}
