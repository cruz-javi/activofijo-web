import { cn } from '@/lib/utils';

// Placa de inventario: el código patrimonial se lee como si estuviera
// remachado al activo, no como texto plano en una celda.
export function AssetTag({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border border-brand/25 bg-brand-surface py-1 pl-4 pr-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-brand-strong',
        className,
      )}
      style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%)' }}
    >
      {code}
    </span>
  );
}
