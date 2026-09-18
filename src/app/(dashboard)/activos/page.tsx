'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, X, History } from 'lucide-react';
import { AssetTag } from '@/components/AssetTag';
import { Stamp } from '@/components/Stamp';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormSection } from '@/components/ui/FormSection';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Td, TBody, TableCard, Th, THead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { ESTADO_ACTIVO_TONE } from '@/lib/estado';

interface ActivoItem {
  id: string;
  codigo: string;
  descripcion: string;
  grupoContable: string;
  ubicacion: string;
  estado: string;
  valor: number;
  version: number;
}

interface EventoHistorial {
  version: number;
  eventType: string;
  recordedAt: string;
  payload: Record<string, unknown>;
}

interface Depreciacion {
  valorOriginal: number;
  valorActual: number;
  depreciacionAcumulada: number;
  antiguedadAnios: number;
  vidaUtilRestanteAnios: number;
  totalmenteDepreciado: boolean;
  reglaAplicada: { vidaUtilAnios: number; valorResidualPorcentaje: number };
}

interface ReconstruccionResultado {
  codigo: string;
  descripcion: string;
  ubicacion: string;
  estado: string;
  valor: number;
  version: number;
  _meta: { eventType: string; version: number; recordedAt: string; integridadVerificada: boolean };
}

function extractErrorMessage(errData: any, fallback: string): string {
  if (Array.isArray(errData?.details) && errData.details.length > 0) {
    return errData.details.map((d: any) => d.message).join(' ');
  }
  return errData?.message || fallback;
}

const ESTADO_OPTIONS = ['BUENO', 'REGULAR', 'EXCELENTE', 'MALO', 'BAJA'];
const PAGE_SIZE = 20;

export default function ActivosPage() {
  return (
    <Suspense
      fallback={<Panel className="p-12 text-center text-sm text-ink-tertiary">Cargando catálogo…</Panel>}
    >
      <ActivosContent />
    </Suspense>
  );
}

function ActivosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [activos, setActivos] = useState<ActivoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros (inicializados desde la URL para permitir deep-linking)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ubicacionFilter, setUbicacionFilter] = useState(searchParams.get('ubicacion') || '');
  const [estadoFilter, setEstadoFilter] = useState(searchParams.get('estado') || '');

  // Form state (alta)
  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [grupoContable, setGrupoContable] = useState('Equipos de Computación');
  const [ubicacion, setUbicacion] = useState('Campus Central - FICCT');
  const [valor, setValor] = useState(1500);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form state (edición)
  const [editingItem, setEditingItem] = useState<ActivoItem | null>(null);
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editGrupoContable, setEditGrupoContable] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');
  const [editEstado, setEditEstado] = useState('');
  const [editValor, setEditValor] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Historial / depreciación / reconstrucción histórica (HU03 + HU05)
  const [historialItem, setHistorialItem] = useState<ActivoItem | null>(null);
  const [eventos, setEventos] = useState<EventoHistorial[]>([]);
  const [eventosLoading, setEventosLoading] = useState(false);
  const [depreciacion, setDepreciacion] = useState<Depreciacion | null>(null);
  const [depreciacionError, setDepreciacionError] = useState<string | null>(null);
  const [reconstruccionFecha, setReconstruccionFecha] = useState('');
  const [reconstruccionResultado, setReconstruccionResultado] = useState<ReconstruccionResultado | null>(
    null,
  );
  const [reconstruccionError, setReconstruccionError] = useState<string | null>(null);
  const [reconstruccionLoading, setReconstruccionLoading] = useState(false);

  const buildQuery = () => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String((page - 1) * PAGE_SIZE),
    });
    if (search) params.set('search', search);
    if (ubicacionFilter) params.set('ubicacion', ubicacionFilter);
    if (estadoFilter) params.set('estado', estadoFilter);
    return params;
  };

  const fetchActivos = async () => {
    setLoading(true);
    try {
      const params = buildQuery();
      const res = await fetch(`/api/proxy/activos?${params.toString()}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setActivos(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refleja los filtros en la URL (deep-linking) y dispara la consulta,
  // con debounce para no golpear la API en cada tecla de la búsqueda.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = buildQuery();
      params.delete('limit');
      params.delete('offset');
      const qs = params.toString();
      router.replace(qs ? `/activos?${qs}` : '/activos');
      fetchActivos();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ubicacionFilter, estadoFilter, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const res = await fetch('/api/proxy/activos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          descripcion,
          grupoContable,
          ubicacion,
          estado: 'BUENO',
          valor: Number(valor),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al registrar activo');
      }

      setShowForm(false);
      setCodigo('');
      setDescripcion('');
      toast.show('Activo registrado correctamente.');
      await fetchActivos();
    } catch (err: any) {
      setCreateError(err.message);
    }
  };

  const startEdit = (item: ActivoItem) => {
    setShowForm(false);
    setHistorialItem(null);
    setEditingItem(item);
    setEditDescripcion(item.descripcion);
    setEditGrupoContable(item.grupoContable);
    setEditUbicacion(item.ubicacion);
    setEditEstado(item.estado);
    setEditValor(item.valor);
    setEditError(null);
  };

  const cancelEdit = () => setEditingItem(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/proxy/activos/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: editDescripcion,
          grupoContable: editGrupoContable,
          ubicacion: editUbicacion,
          estado: editEstado,
          valor: Number(editValor),
          expectedVersion: editingItem.version,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al actualizar el activo');
      }

      setEditingItem(null);
      toast.show('Cambios guardados.');
      await fetchActivos();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const openHistorial = async (item: ActivoItem) => {
    setShowForm(false);
    setEditingItem(null);
    setHistorialItem(item);
    setReconstruccionResultado(null);
    setReconstruccionError(null);
    setReconstruccionFecha('');
    setDepreciacionError(null);
    setDepreciacion(null);
    setEventosLoading(true);
    try {
      const [resEventos, resDepreciacion] = await Promise.all([
        fetch(`/api/proxy/activos/${item.id}/historial`),
        fetch(`/api/proxy/activos/${item.id}/depreciacion`),
      ]);
      if (resEventos.ok) setEventos(await resEventos.json());
      if (resDepreciacion.ok) {
        setDepreciacion(await resDepreciacion.json());
      } else {
        const errData = await resDepreciacion.json();
        setDepreciacionError(extractErrorMessage(errData, 'No se pudo calcular la depreciación'));
      }
    } finally {
      setEventosLoading(false);
    }
  };

  const closeHistorial = () => setHistorialItem(null);

  const handleReconstruir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historialItem || !reconstruccionFecha) return;
    setReconstruccionLoading(true);
    setReconstruccionError(null);
    setReconstruccionResultado(null);
    try {
      const fechaIso = new Date(reconstruccionFecha).toISOString();
      const res = await fetch(
        `/api/proxy/activos/${historialItem.id}/reconstruccion?fecha=${encodeURIComponent(fechaIso)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'No se pudo reconstruir el estado en esa fecha'));
      }
      setReconstruccionResultado(data);
    } catch (err: any) {
      setReconstruccionError(err.message);
    } finally {
      setReconstruccionLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Catálogo de activos"
        description={`${total} registros contabilizados`}
        action={
          <Button
            onClick={() => {
              setEditingItem(null);
              setHistorialItem(null);
              setCreateError(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Nuevo activo
              </>
            )}
          </Button>
        }
      />

      <Panel className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Buscar por código" htmlFor="search">
          <Input
            id="search"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="UAGRM-2026-001"
          />
        </Field>
        <Field label="Ubicación" htmlFor="ubicacion-filter">
          <Input
            id="ubicacion-filter"
            type="text"
            value={ubicacionFilter}
            onChange={(e) => {
              setUbicacionFilter(e.target.value);
              setPage(1);
            }}
            placeholder="FICCT, Facultad de Derecho…"
          />
        </Field>
        <Field label="Estado" htmlFor="estado-filter">
          <Select
            id="estado-filter"
            value={estadoFilter}
            onChange={(e) => {
              setEstadoFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {ESTADO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </Field>
      </Panel>

      {showForm && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center gap-2">
            <Badge tone="accent">Alta patrimonial</Badge>
            <span className="text-xs text-ink-tertiary">Registro event-sourced</span>
          </div>
          {createError && (
            <div className="mb-4 rounded-sm border border-danger/25 bg-danger-surface px-3 py-2 text-sm text-danger">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <FormSection title="Identificación">
              <Field label="Código" htmlFor="codigo">
                <Input
                  id="codigo"
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="UAGRM-2026-001"
                  required
                />
              </Field>
              <Field label="Descripción" htmlFor="descripcion" className="md:col-span-2">
                <Input
                  id="descripcion"
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Computadora Servidor de Laboratorio"
                  required
                />
              </Field>
            </FormSection>

            <FormSection title="Clasificación patrimonial">
              <Field label="Grupo contable" htmlFor="grupo-contable">
                <Input
                  id="grupo-contable"
                  type="text"
                  value={grupoContable}
                  onChange={(e) => setGrupoContable(e.target.value)}
                  required
                />
              </Field>
              <Field label="Ubicación" htmlFor="ubicacion">
                <Input
                  id="ubicacion"
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  required
                />
              </Field>
              <Field label="Valor (Bs.)" htmlFor="valor">
                <Input
                  id="valor"
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  required
                />
              </Field>
            </FormSection>

            <div>
              <Button type="submit">Guardar en core</Button>
            </div>
          </form>
        </Panel>
      )}

      {editingItem && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center gap-2">
            <AssetTag code={editingItem.codigo} />
            <Stamp className="h-6 w-6 text-[9px]">v{editingItem.version}</Stamp>
          </div>
          {editError && (
            <div className="mb-4 rounded-sm border border-danger/25 bg-danger-surface px-3 py-2 text-sm text-danger">
              {editError}
            </div>
          )}
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <FormSection title="Detalle del activo">
              <Field label="Descripción" htmlFor="edit-descripcion" className="md:col-span-2">
                <Input
                  id="edit-descripcion"
                  type="text"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  required
                />
              </Field>
              <Field label="Grupo contable" htmlFor="edit-grupo-contable">
                <Input
                  id="edit-grupo-contable"
                  type="text"
                  value={editGrupoContable}
                  onChange={(e) => setEditGrupoContable(e.target.value)}
                  required
                />
              </Field>
              <Field label="Ubicación" htmlFor="edit-ubicacion">
                <Input
                  id="edit-ubicacion"
                  type="text"
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                  required
                />
              </Field>
            </FormSection>

            <FormSection title="Estado y valorización">
              <Field label="Estado" htmlFor="edit-estado">
                <Select
                  id="edit-estado"
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value)}
                >
                  {ESTADO_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Valor (Bs.)" htmlFor="edit-valor">
                <Input
                  id="edit-valor"
                  type="number"
                  value={editValor}
                  onChange={(e) => setEditValor(Number(e.target.value))}
                  required
                />
              </Field>
            </FormSection>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={editSaving}>
                {editSaving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {historialItem && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AssetTag code={historialItem.codigo} />
              <span className="text-xs text-ink-tertiary">{historialItem.descripcion}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={closeHistorial}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {eventosLoading ? (
            <p className="text-sm text-ink-tertiary">Cargando historial…</p>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
                  Línea de tiempo de eventos
                </p>
                <ul className="flex flex-col gap-2">
                  {eventos.map((ev) => (
                    <li
                      key={ev.version}
                      className="flex items-center gap-3 rounded-sm border border-border-soft bg-paper px-3 py-2 text-sm"
                    >
                      <Stamp className="h-6 w-6 text-[9px]">v{ev.version}</Stamp>
                      <span className="font-medium text-ink">{ev.eventType}</span>
                      <span className="ml-auto font-mono text-xs text-ink-tertiary">
                        {new Date(ev.recordedAt).toLocaleString('es-BO')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border-soft pt-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
                  Depreciación estimada (hoy)
                </p>
                {depreciacionError ? (
                  <p className="text-sm text-ink-tertiary">{depreciacionError}</p>
                ) : depreciacion ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div>
                      <p className="text-[11px] text-ink-tertiary">Valor original</p>
                      <p className="font-mono text-sm font-semibold text-ink">
                        Bs. {depreciacion.valorOriginal.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-tertiary">Valor actual</p>
                      <p className="font-mono text-sm font-semibold text-ink">
                        Bs. {depreciacion.valorActual.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-tertiary">Depreciación acumulada</p>
                      <p className="font-mono text-sm font-semibold text-ink">
                        Bs. {depreciacion.depreciacionAcumulada.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-ink-tertiary">Vida útil restante</p>
                      <p className="font-mono text-sm font-semibold text-ink">
                        {depreciacion.vidaUtilRestanteAnios.toFixed(1)} años
                      </p>
                    </div>
                    {depreciacion.totalmenteDepreciado && (
                      <div className="col-span-full">
                        <Badge tone="accent">Totalmente depreciado</Badge>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="border-t border-border-soft pt-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
                  Reconstruir estado a una fecha (time-travel)
                </p>
                <form onSubmit={handleReconstruir} className="flex flex-wrap items-end gap-3">
                  <Field label="Fecha y hora" htmlFor="reconstruccion-fecha">
                    <Input
                      id="reconstruccion-fecha"
                      type="datetime-local"
                      value={reconstruccionFecha}
                      onChange={(e) => setReconstruccionFecha(e.target.value)}
                      required
                    />
                  </Field>
                  <Button type="submit" variant="secondary" disabled={reconstruccionLoading}>
                    {reconstruccionLoading ? 'Reconstruyendo…' : 'Reconstruir'}
                  </Button>
                </form>

                {reconstruccionError && (
                  <p className="mt-3 text-sm text-danger">{reconstruccionError}</p>
                )}

                {reconstruccionResultado && (
                  <div className="mt-4 rounded-sm border border-border-soft bg-paper p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge tone="neutral">v{reconstruccionResultado._meta.version}</Badge>
                      <span className="text-xs text-ink-tertiary">
                        {new Date(reconstruccionResultado._meta.recordedAt).toLocaleString('es-BO')}
                      </span>
                      <Badge tone={reconstruccionResultado._meta.integridadVerificada ? 'brand' : 'danger'}>
                        {reconstruccionResultado._meta.integridadVerificada
                          ? 'Integridad verificada'
                          : 'Integridad comprometida'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-[11px] text-ink-tertiary">Descripción</p>
                        <p className="text-ink">{reconstruccionResultado.descripcion}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-ink-tertiary">Ubicación</p>
                        <p className="text-ink">{reconstruccionResultado.ubicacion}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-ink-tertiary">Estado</p>
                        <p className="text-ink">{reconstruccionResultado.estado}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-ink-tertiary">Valor</p>
                        <p className="font-mono text-ink">
                          Bs. {Number(reconstruccionResultado.valor).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Panel>
      )}

      {loading ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">Cargando catálogo…</Panel>
      ) : error ? (
        <div className="rounded-md border border-danger/25 bg-danger-surface p-4 text-sm text-danger">
          Error al consultar catálogo: {error}
        </div>
      ) : activos.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          No se registran activos fijos en el modo actual.
        </Panel>
      ) : (
        <TableCard
          footer={<Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />}
        >
          <THead>
            <Th>Código</Th>
            <Th>Descripción</Th>
            <Th>Grupo contable</Th>
            <Th>Ubicación</Th>
            <Th>Estado</Th>
            <Th className="text-right">Valor</Th>
            <Th className="text-center">Versión</Th>
            <Th className="text-center">Acciones</Th>
          </THead>
          <TBody>
            {activos.map((item) => (
              <Tr key={item.id}>
                <Td>
                  <AssetTag code={item.codigo} />
                </Td>
                <Td className="text-ink">{item.descripcion}</Td>
                <Td className="text-ink-secondary">{item.grupoContable}</Td>
                <Td className="text-ink-secondary">{item.ubicacion}</Td>
                <Td>
                  <Badge tone={ESTADO_ACTIVO_TONE[item.estado] ?? 'neutral'}>{item.estado}</Badge>
                </Td>
                <Td className="text-right font-mono text-[13px] font-semibold tabular-nums text-ink">
                  Bs. {Number(item.valor).toFixed(2)}
                </Td>
                <Td>
                  <div className="flex justify-center">
                    <Stamp className="h-6 w-6 text-[9px]">v{item.version}</Stamp>
                  </div>
                </Td>
                <Td className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => startEdit(item)}
                      disabled={item.estado === 'BAJA'}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openHistorial(item)}>
                      <History className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </TableCard>
      )}
    </>
  );
}
