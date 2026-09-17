'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Td, TBody, TableCard, Th, THead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { ESTADO_SYNC_TONE } from '@/lib/estado';

interface SincronizacionLog {
  id: string;
  estado: string;
  registrosImportados: number;
  registrosOmitidos: number;
  registrosConError: number;
  ejecutadoPor: string;
  fecha: string;
}

export default function SincronizacionPage() {
  const router = useRouter();
  const toast = useToast();
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
      toast.show('Sincronización completada.');
      await fetchHistorial();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEjecutando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Sincronización de inventario base"
        description="Ingesta de registros desde el sistema patrimonial heredado hacia el catálogo actual."
        action={
          <Button onClick={handleEjecutar} disabled={ejecutando}>
            <RefreshCw className={ejecutando ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            {ejecutando ? 'Sincronizando…' : 'Ejecutar sincronización'}
          </Button>
        }
      />

      {error && (
        <div className="mb-6 rounded-md border border-danger/25 bg-danger-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">Cargando historial…</Panel>
      ) : historial.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          Aún no se ha ejecutado ninguna sincronización.
        </Panel>
      ) : (
        <TableCard>
          <THead>
            <Th>Fecha</Th>
            <Th>Estado</Th>
            <Th className="text-right">Importados</Th>
            <Th className="text-right">Omitidos</Th>
            <Th className="text-right">Con error</Th>
          </THead>
          <TBody>
            {historial.map((log) => (
              <Tr key={log.id}>
                <Td className="font-mono text-xs text-ink-secondary">
                  {new Date(log.fecha).toLocaleString('es-BO')}
                </Td>
                <Td>
                  <Badge tone={ESTADO_SYNC_TONE[log.estado] ?? 'neutral'}>{log.estado}</Badge>
                </Td>
                <Td className="text-right font-mono text-[13px] font-semibold tabular-nums text-ink">
                  {log.registrosImportados}
                </Td>
                <Td className="text-right font-mono text-xs tabular-nums text-ink-tertiary">
                  {log.registrosOmitidos}
                </Td>
                <Td className="text-right font-mono text-xs tabular-nums text-danger">
                  {log.registrosConError}
                </Td>
              </Tr>
            ))}
          </TBody>
        </TableCard>
      )}
    </>
  );
}
