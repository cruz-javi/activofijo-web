'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, X } from 'lucide-react';
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

  return (
    <>
      <PageHeader
        title="Catálogo de activos"
        description={`${total} registros contabilizados`}
        action={
          <Button
            onClick={() => {
              setEditingItem(null);
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => startEdit(item)}
                    disabled={item.estado === 'BAJA'}
                  >
                    Editar
                  </Button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </TableCard>
      )}
    </>
  );
}
