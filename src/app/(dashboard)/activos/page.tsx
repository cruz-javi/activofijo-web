'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function ActivosPage() {
  const [activos, setActivos] = useState<ActivoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [grupoContable, setGrupoContable] = useState('Equipos de Computación');
  const [ubicacion, setUbicacion] = useState('Campus Central - FICCT');
  const [valor, setValor] = useState(1500);

  const router = useRouter();

  const fetchActivos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/activos?limit=50&offset=0');
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

  useEffect(() => {
    fetchActivos();
  }, []);

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
            <p className="text-xs text-slate-500">Módulo de Catálogo e Inventario Patrimonial</p>
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
            onClick={() => setShowForm(!showForm)}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {showForm ? 'Cancelar' : 'Nuevo Activo'}
          </button>
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
