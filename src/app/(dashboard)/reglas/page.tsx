'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormSection } from '@/components/ui/FormSection';
import { Input } from '@/components/ui/Input';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Td, TBody, TableCard, Th, THead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface ReglaFila {
  grupoContable: string;
  vidaUtilAnios: number;
  valorResidualPorcentaje: number;
}

interface ConfiguracionReglas {
  id: string;
  version: number;
  reglas: { reglas: ReglaFila[]; reglaPorDefecto: Omit<ReglaFila, 'grupoContable'> | null };
  resolucion: string;
  descripcion: string | null;
  activa: boolean;
  createdAt: string;
}

function extractErrorMessage(errData: any, fallback: string): string {
  if (Array.isArray(errData?.details) && errData.details.length > 0) {
    return errData.details.map((d: any) => d.message).join(' ');
  }
  return errData?.message || fallback;
}

const FILA_VACIA: ReglaFila = { grupoContable: '', vidaUtilAnios: 5, valorResidualPorcentaje: 0 };

export default function ReglasPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser, loading: loadingUser } = useCurrentUser();

  const [activa, setActiva] = useState<ConfiguracionReglas | null>(null);
  const [historial, setHistorial] = useState<ConfiguracionReglas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resolucion, setResolucion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [filas, setFilas] = useState<ReglaFila[]>([{ ...FILA_VACIA }]);
  const [usarDefecto, setUsarDefecto] = useState(false);
  const [defecto, setDefecto] = useState<Omit<ReglaFila, 'grupoContable'>>({
    vidaUtilAnios: 10,
    valorResidualPorcentaje: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [resActiva, resHistorial] = await Promise.all([
        fetch('/api/proxy/reglas/configuracion'),
        fetch('/api/proxy/reglas/configuracion/historial'),
      ]);

      if (resActiva.status === 401 || resHistorial.status === 401) {
        router.push('/login');
        return;
      }
      if (resActiva.status === 403 || resHistorial.status === 403) {
        setError('No tenés permisos para ver la configuración de reglas.');
        return;
      }

      if (resActiva.ok) {
        const data = await resActiva.json();
        setActiva(data);
        setResolucion(data.resolucion);
        setDescripcion(data.descripcion || '');
        setFilas(data.reglas.reglas.length > 0 ? data.reglas.reglas : [{ ...FILA_VACIA }]);
        if (data.reglas.reglaPorDefecto) {
          setUsarDefecto(true);
          setDefecto(data.reglas.reglaPorDefecto);
        }
      } else {
        setActiva(null);
      }

      if (resHistorial.ok) {
        setHistorial(await resHistorial.json());
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadingUser && currentUser && currentUser.rol !== 'ADMIN') {
      router.push('/activos');
    }
  }, [loadingUser, currentUser, router]);

  const actualizarFila = (index: number, campo: keyof ReglaFila, valor: string) => {
    setFilas((prev) =>
      prev.map((fila, i) =>
        i === index
          ? { ...fila, [campo]: campo === 'grupoContable' ? valor : Number(valor) }
          : fila,
      ),
    );
  };

  const agregarFila = () => setFilas((prev) => [...prev, { ...FILA_VACIA }]);
  const quitarFila = (index: number) => setFilas((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/proxy/reglas/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reglas: filas,
          reglaPorDefecto: usarDefecto ? defecto : undefined,
          resolucion,
          descripcion: descripcion || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(extractErrorMessage(errData, 'Error al guardar la configuración'));
      }

      toast.show('Nueva versión de reglas guardada y activada.');
      await cargar();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reglas de depreciación"
        description="Configuración paramétrica de resoluciones institucionales por grupo contable (línea recta)."
      />

      {error && (
        <div className="mb-6 rounded-md border border-danger/25 bg-danger-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">Cargando configuración…</Panel>
      ) : (
        <>
          <Panel className="mb-6">
            <div className="mb-5 flex items-center gap-2">
              <Badge tone={activa ? 'brand' : 'neutral'}>
                {activa ? `Vigente · versión ${activa.version}` : 'Sin configuración activa'}
              </Badge>
              {activa && (
                <span className="text-xs text-ink-tertiary">
                  {new Date(activa.createdAt).toLocaleDateString('es-BO')}
                </span>
              )}
            </div>

            {saveError && (
              <div className="mb-4 rounded-sm border border-danger/25 bg-danger-surface px-3 py-2 text-sm text-danger">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormSection title="Resolución institucional">
                <Field label="Resolución" htmlFor="resolucion" className="md:col-span-2">
                  <Input
                    id="resolucion"
                    type="text"
                    value={resolucion}
                    onChange={(e) => setResolucion(e.target.value)}
                    placeholder="R.R. 1234/2026"
                    required
                    minLength={3}
                  />
                </Field>
                <Field label="Descripción (opcional)" htmlFor="descripcion">
                  <Input
                    id="descripcion"
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Actualización de vidas útiles 2026"
                  />
                </Field>
              </FormSection>

              <div className="border-t border-border-soft pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
                    Reglas por grupo contable
                  </p>
                  <Button type="button" variant="secondary" size="sm" onClick={agregarFila}>
                    <Plus className="h-3.5 w-3.5" />
                    Agregar regla
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {filas.map((fila, i) => (
                    <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                      <Field label="Grupo contable" htmlFor={`grupo-${i}`}>
                        <Input
                          id={`grupo-${i}`}
                          type="text"
                          value={fila.grupoContable}
                          onChange={(e) => actualizarFila(i, 'grupoContable', e.target.value)}
                          placeholder="Equipos de Computación"
                          required
                        />
                      </Field>
                      <Field label="Vida útil (años)" htmlFor={`vida-${i}`}>
                        <Input
                          id={`vida-${i}`}
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={fila.vidaUtilAnios}
                          onChange={(e) => actualizarFila(i, 'vidaUtilAnios', e.target.value)}
                          required
                        />
                      </Field>
                      <Field label="Valor residual %" htmlFor={`residual-${i}`}>
                        <Input
                          id={`residual-${i}`}
                          type="number"
                          min="0"
                          max="100"
                          value={fila.valorResidualPorcentaje}
                          onChange={(e) => actualizarFila(i, 'valorResidualPorcentaje', e.target.value)}
                        />
                      </Field>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => quitarFila(i)}
                          disabled={filas.length === 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border-soft pt-4">
                <label className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
                  <input
                    type="checkbox"
                    checked={usarDefecto}
                    onChange={(e) => setUsarDefecto(e.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  Regla por defecto (grupos contables no listados arriba)
                </label>
                {usarDefecto && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Field label="Vida útil (años)" htmlFor="defecto-vida">
                      <Input
                        id="defecto-vida"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={defecto.vidaUtilAnios}
                        onChange={(e) =>
                          setDefecto((d) => ({ ...d, vidaUtilAnios: Number(e.target.value) }))
                        }
                      />
                    </Field>
                    <Field label="Valor residual %" htmlFor="defecto-residual">
                      <Input
                        id="defecto-residual"
                        type="number"
                        min="0"
                        max="100"
                        value={defecto.valorResidualPorcentaje}
                        onChange={(e) =>
                          setDefecto((d) => ({ ...d, valorResidualPorcentaje: Number(e.target.value) }))
                        }
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar nueva versión'}
                </Button>
              </div>
            </form>
          </Panel>

          {historial.length > 0 && (
            <TableCard>
              <THead>
                <Th>Versión</Th>
                <Th>Resolución</Th>
                <Th>Descripción</Th>
                <Th>Fecha</Th>
                <Th className="text-center">Estado</Th>
              </THead>
              <TBody>
                {historial.map((c) => (
                  <Tr key={c.id}>
                    <Td className="font-mono text-xs text-ink">v{c.version}</Td>
                    <Td className="text-ink-secondary">{c.resolucion}</Td>
                    <Td className="text-ink-tertiary">{c.descripcion || '—'}</Td>
                    <Td className="font-mono text-xs text-ink-tertiary">
                      {new Date(c.createdAt).toLocaleDateString('es-BO')}
                    </Td>
                    <Td className="text-center">
                      <Badge tone={c.activa ? 'brand' : 'neutral'}>
                        {c.activa ? 'Vigente' : 'Reemplazada'}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </TableCard>
          )}
        </>
      )}
    </>
  );
}
