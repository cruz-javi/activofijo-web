import { type ReactNode } from 'react';

// Agrupa campos relacionados dentro de un formulario largo, con un
// encabezado propio — evita la grilla plana de N campos sin jerarquía.
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-border-soft pt-4 first:border-t-0 first:pt-0">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}
