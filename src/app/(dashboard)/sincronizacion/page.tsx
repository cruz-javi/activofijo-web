'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SincronizacionLog {
  id: string;
  estado: string;
  registrosImportados: number;
  registrosOmitidos: number;
  registrosConError: number;
  ejecutadoPor: string;
  fecha: string;
}

const ESTADO_STYLES: Record<string, string> = {
  COMPLETADA: 'bg-emerald-100 text-emerald-800',
  COMPLETADA_CON_ERRORES: 'bg-amber-100 text-amber-800',
  FALLIDA: 'bg-red-100 text-red-800',
};

export default function SincronizacionPage() {
  const router = useRouter();
  const [historial, setHistorial] = useState<SincronizacionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [ejecutando, setEjecutando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/sincronizacion/historial');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setHistorial(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const handleEjecutar = async () => {
    setEjecutando(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/sincronizacion/ejecutar', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al ejecutar la sincronización');
      }
      await fetchHistorial();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEjecutando(false);
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
              <Link href="/activos" className="hover:text-slate-900 hover:underline">
                Catálogo
              </Link>
              <span className="font-medium text-slate-900">Sincronización</span>
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
            <h2 className="text-xl font-medium text-slate-800">Sincronización de Inventario Base</h2>
            <p className="text-sm text-slate-500">
              Ingesta de registros desde el sistema patrimonial heredado hacia el catálogo actual.
            </p>
          </div>
          <button
            onClick={handleEjecutar}
            disabled={ejecutando}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {ejecutando ? 'Sincronizando...' : 'Ejecutar Sincronización'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Cargando historial...
          </div>
        ) : historial.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Aún no se ha ejecutado ninguna sincronización.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Importados</th>
                  <th className="px-4 py-3 text-right">Omitidos</th>
                  <th className="px-4 py-3 text-right">Con error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {historial.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {new Date(log.fecha).toLocaleString('es-BO')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ESTADO_STYLES[log.estado] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-900">
                      {log.registrosImportados}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-500">
                      {log.registrosOmitidos}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-red-600">
                      {log.registrosConError}
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
