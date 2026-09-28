'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Printer, 
  Search, 
  Filter, 
  Eye, 
  X, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Globe, 
  Fingerprint, 
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Td, TBody, TableCard, Th, THead, Tr } from '@/components/ui/Table';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface AuditItem {
  id: string;
  usuarioId?: string | null;
  emailUsuario?: string | null;
  accion: string;
  modulo: string;
  entidadId?: string | null;
  resultado: 'EXITOSO' | 'DENEGADO_SIN_PERMISO' | 'BLOQUEADO_SEGURIDAD' | 'ERROR_TRANSACCIONAL';
  ipOrigen: string;
  userAgent?: string | null;
  motivoRechazo?: string | null;
  payloadHash?: string | null;
  creadoEn: string;
}

export default function BitacoraPage() {
  const router = useRouter();
  const { user: currentUser, loading: loadingUser, isAdmin, roleLabel } = useCurrentUser();

  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [accion, setAccion] = useState('TODOS');
  const [modulo, setModulo] = useState('TODOS');
  const [resultado, setResultado] = useState('TODOS');

  // Modal de detalle forense
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);

  // Modal de exportación / impresión
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchBitacora = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (accion !== 'TODOS') params.set('accion', accion);
      if (modulo !== 'TODOS') params.set('modulo', modulo);
      if (resultado !== 'TODOS') params.set('resultado', resultado);
      params.set('limit', '100');

      const res = await fetch(`/api/proxy/auditoria?${params.toString()}`);
      if (res.status === 401) {
        router.push('/');
        return;
      }
      if (res.status === 403) {
        setError('Acceso denegado: solo el Administrador del Sistema puede consultar la bitácora forense.');
        setItems([]);
        return;
      }

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al consultar la bitácora');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBitacora();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, accion, modulo, resultado]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBitacora();
  };

  const formatFechaBolivia = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return new Intl.DateTimeFormat('es-BO', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return isoDate;
    }
  };

  const getResultadoTone = (res: string) => {
    switch (res) {
      case 'EXITOSO':
        return 'brand' as const;
      case 'DENEGADO_SIN_PERMISO':
      case 'BLOQUEADO_SEGURIDAD':
      case 'ERROR_TRANSACCIONAL':
        return 'danger' as const;
      default:
        return 'neutral' as const;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!loadingUser && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-xl mx-auto my-12 bg-paper-raised border border-border-soft rounded-2xl shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-danger-surface text-danger border border-danger/25 flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-ink tracking-tight mb-2">
          Acceso Restringido a Bitácora
        </h2>
        <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
          Su rol actual (<strong className="text-ink font-semibold">{roleLabel}</strong>) no tiene privilegios para consultar los registros de auditoría forense del sistema.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Inicio</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Bitácora del Sistema"
        description={`${total} eventos de seguridad y operaciones auditadas (Hora Oficial Bolivia UTC-4)`}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Exportar</span>
            </Button>
            <Button
              variant="ghost"
              onClick={fetchBitacora}
              className="p-2.5 text-ink-secondary hover:text-ink cursor-pointer"
              title="Refrescar registros"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {/* Barra de Filtros */}
      <Panel className="mb-6 p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1.5">
              Búsqueda por Usuario / Correo / IP
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Ej. admin@uagrm.edu.bo, 127.0.0.1..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
              <Search className="h-4 w-4 text-ink-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1.5">
              Acción
            </label>
            <Select value={accion} onChange={(e) => setAccion(e.target.value)} className="text-sm">
              <option value="TODOS">Todas las acciones</option>
              <option value="LOGIN">LOGIN (Autenticación)</option>
              <option value="CREAR_USUARIO">CREAR_USUARIO</option>
              <option value="ACTUALIZAR_USUARIO">ACTUALIZAR_USUARIO</option>
              <option value="CREAR_ROL">CREAR_ROL</option>
              <option value="ACTUALIZAR_ROL">ACTUALIZAR_ROL</option>
              <option value="ELIMINAR_ROL">ELIMINAR_ROL</option>
            </Select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1.5">
              Resultado
            </label>
            <Select value={resultado} onChange={(e) => setResultado(e.target.value)} className="text-sm">
              <option value="TODOS">Todos los resultados</option>
              <option value="EXITOSO">EXITOSO</option>
              <option value="DENEGADO_SIN_PERMISO">DENEGADO_SIN_PERMISO</option>
              <option value="BLOQUEADO_SEGURIDAD">BLOQUEADO_SEGURIDAD</option>
              <option value="ERROR_TRANSACCIONAL">ERROR_TRANSACCIONAL</option>
            </Select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1.5">
              Módulo
            </label>
            <Select value={modulo} onChange={(e) => setModulo(e.target.value)} className="text-sm">
              <option value="TODOS">Todos los módulos</option>
              <option value="IDENTIDAD_ACCESO">IDENTIDAD_ACCESO</option>
              <option value="PATRIMONIO">PATRIMONIO</option>
              <option value="TRAMITES">TRAMITES</option>
              <option value="INSPECCION">INSPECCION</option>
              <option value="SINCRONIZACION">SINCRONIZACION</option>
            </Select>
          </div>
        </form>
      </Panel>

      {/* Contenido de la Tabla */}
      {loading && items.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-brand" />
          Consultando registros de auditoría forense…
        </Panel>
      ) : error ? (
        <div className="rounded-xl border border-danger/25 bg-danger-surface p-5 text-sm text-danger flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : items.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          No se encontraron eventos en la bitácora con los criterios seleccionados.
        </Panel>
      ) : (
        <TableCard>
          <THead>
            <Th>Fecha y Hora (BO)</Th>
            <Th>Funcionario / Correo</Th>
            <Th>Acción / Operación</Th>
            <Th>Módulo</Th>
            <Th>Resultado</Th>
            <Th>IP Origen</Th>
            <Th className="text-center">Detalle</Th>
          </THead>
          <TBody>
            {items.map((item) => (
              <Tr key={item.id}>
                <Td className="font-mono text-xs text-ink-secondary whitespace-nowrap">
                  {formatFechaBolivia(item.creadoEn)}
                </Td>
                <Td className="text-ink font-medium">
                  {item.emailUsuario ? (
                    <span className="font-mono text-xs">{item.emailUsuario}</span>
                  ) : (
                    <span className="text-xs text-ink-tertiary italic">No autenticado</span>
                  )}
                </Td>
                <Td className="font-semibold text-xs text-ink">
                  {item.accion}
                </Td>
                <Td>
                  <span className="text-xs font-mono text-ink-secondary bg-paper px-2 py-0.5 rounded border border-border-soft">
                    {item.modulo}
                  </span>
                </Td>
                <Td>
                  <Badge tone={getResultadoTone(item.resultado)}>
                    {item.resultado}
                  </Badge>
                </Td>
                <Td className="font-mono text-xs text-ink-tertiary">
                  {item.ipOrigen}
                </Td>
                <Td className="text-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Ver</span>
                  </Button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </TableCard>
      )}

      {/* Modal de Detalle Forense */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              type="button"
              aria-label="Cerrar detalle"
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-border-soft pb-4">
              <div className="h-10 w-10 rounded-xl bg-brand-surface text-brand flex items-center justify-center shrink-0">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base tracking-tight font-serif">
                  Detalle de Auditoría Forense
                </h3>
                <p className="text-xs text-ink-tertiary font-mono">
                  Registro #{selectedItem.id}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-paper border border-border-soft">
                <div>
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                    Fecha y Hora Oficial
                  </span>
                  <span className="font-mono text-ink font-semibold">
                    {formatFechaBolivia(selectedItem.creadoEn)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                    Resultado
                  </span>
                  <Badge tone={getResultadoTone(selectedItem.resultado)}>
                    {selectedItem.resultado}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                    Usuario / Identificador
                  </span>
                  <p className="font-mono text-ink text-sm bg-paper p-2 rounded-lg border border-border-soft">
                    {selectedItem.emailUsuario || 'No especificado (Intento anónimo)'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                      Acción Auditada
                    </span>
                    <p className="font-semibold text-ink bg-paper p-2 rounded-lg border border-border-soft">
                      {selectedItem.accion}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                      Módulo
                    </span>
                    <p className="font-mono text-ink bg-paper p-2 rounded-lg border border-border-soft">
                      {selectedItem.modulo}
                    </p>
                  </div>
                </div>

                {selectedItem.motivoRechazo && (
                  <div>
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                      Motivo / Descripción de Operación
                    </span>
                    <p className="text-xs text-danger bg-danger-surface p-2.5 rounded-lg border border-danger/25 font-medium leading-relaxed">
                      {selectedItem.motivoRechazo}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                      Dirección IP de Conexión
                    </span>
                    <p className="font-mono text-ink-secondary bg-paper p-2 rounded-lg border border-border-soft">
                      {selectedItem.ipOrigen}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                      Entidad Afectada
                    </span>
                    <p className="font-mono text-ink-secondary bg-paper p-2 rounded-lg border border-border-soft truncate">
                      {selectedItem.entidadId || 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedItem.userAgent && (
                  <div>
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                      Cliente / User Agent
                    </span>
                    <p className="font-mono text-[11px] text-ink-tertiary bg-paper p-2 rounded-lg border border-border-soft break-all">
                      {selectedItem.userAgent}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border-soft flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedItem(null)} className="cursor-pointer">
                Cerrar Detalle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impresión / Exportación */}
      {showExportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowExportModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowExportModal(false)}
              type="button"
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-brand-surface text-brand flex items-center justify-center shrink-0">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base font-serif">
                  Imprimir / Exportar Bitácora
                </h3>
                <p className="text-xs text-ink-tertiary">
                  Reporte de auditoría forense institucional
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-ink-secondary leading-relaxed mb-6">
              <p>
                Se generará el reporte oficial con los <strong className="text-ink font-semibold">{items.length}</strong> registros actualmente filtrados en pantalla.
              </p>
              <div className="p-3 bg-paper rounded-xl border border-border-soft space-y-1.5 font-mono text-[11px]">
                <div>• Filtro Acción: <span className="font-bold text-ink">{accion}</span></div>
                <div>• Filtro Módulo: <span className="font-bold text-ink">{modulo}</span></div>
                <div>• Filtro Resultado: <span className="font-bold text-ink">{resultado}</span></div>
                {search.trim() && <div>• Criterio: <span className="font-bold text-ink">{search.trim()}</span></div>}
              </div>
              <p className="text-[11px] text-ink-tertiary">
                Haga clic en <strong>Imprimir Formato Oficial</strong> para abrir el diálogo de impresión del sistema o guardar como PDF institucional.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-soft">
              <Button variant="secondary" onClick={() => setShowExportModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  setShowExportModal(false);
                  setTimeout(handlePrint, 300);
                }}
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir Formato Oficial</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
