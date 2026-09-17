'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

export default function ActivosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activos, setActivos] = useState<ActivoItem[]>([]);
  const [total, setTotal] = useState(0);
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
    const params = new URLSearchParams({ limit: '50', offset: '0' });
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
  }, [search, ubicacionFilter, estadoFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await fetchActivos();
    } catch (err: any) {
      alert(err.message);
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
      await fetchActivos();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">UAGRM — Activo Fijo</h1>
            <nav className="mt-1 flex gap-4 text-xs text-slate-500">
              <span className="font-medium text-slate-900">Catálogo</span>
              <Link href="/sincronizacion" className="hover:text-slate-900 hover:underline">
                Sincronización
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium text-slate-800">Catálogo de Activos</h2>
            <p className="text-sm text-slate-500">{total} registros contabilizados</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(!showForm);
            }}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {showForm ? 'Cancelar' : 'Nuevo Activo'}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">Buscar por código</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="UAGRM-2026-001"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Ubicación</label>
            <input
              type="text"
              value={ubicacionFilter}
              onChange={(e) => setUbicacionFilter(e.target.value)}
              placeholder="FICCT, Facultad de Derecho..."
              className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Estado</label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">Todos</option>
              {ESTADO_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">
              Registrar Nuevo Activo (Event Sourced)
            </h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Código</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="UAGRM-2026-001"
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Computadora Servidor de Laboratorio"
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Grupo Contable</label>
                <input
                  type="text"
                  value={grupoContable}
                  onChange={(e) => setGrupoContable(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Ubicación</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Valor (Bs.)</label>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-end md:col-span-3">
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Guardar en Core
                </button>
              </div>
            </form>
          </div>
        )}

        {editingItem && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">
              Editar Activo — {editingItem.codigo} (v{editingItem.version})
            </h3>
            {editError && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {editError}
              </div>
            )}
            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600">Descripción</label>
                <input
                  type="text"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Grupo Contable</label>
                <input
                  type="text"
                  value={editGrupoContable}
                  onChange={(e) => setEditGrupoContable(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Ubicación</label>
                <input
                  type="text"
                  value={editUbicacion}
                  onChange={(e) => setEditUbicacion(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Estado</label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm"
                >
                  {ESTADO_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Valor (Bs.)</label>
                <input
                  type="number"
                  value={editValor}
                  onChange={(e) => setEditValor(Number(e.target.value))}
                  required
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-end gap-2 md:col-span-3">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {editSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Cargando catálogo...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Error al consultar catálogo: {error}
          </div>
        ) : activos.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No se registran activos fijos en el modo actual.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Grupo Contable</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Versión</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {activos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">
                      {item.codigo}
                    </td>
                    <td className="px-4 py-3 text-slate-900">{item.descripcion}</td>
                    <td className="px-4 py-3 text-slate-600">{item.grupoContable}</td>
                    <td className="px-4 py-3 text-slate-600">{item.ubicacion}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-900">
                      Bs. {Number(item.valor).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">
                      v{item.version}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => startEdit(item)}
                        disabled={item.estado === 'BAJA'}
                        className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
