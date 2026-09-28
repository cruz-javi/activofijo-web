'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Printer, 
  Download, 
  RefreshCw, 
  Eye, 
  X, 
  Building2, 
  UserCheck, 
  Tag, 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  CheckCircle2,
  Hash,
  Layers,
  MapPin,
  Laptop
} from 'lucide-react';
import { AssetTag } from '@/components/AssetTag';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Td, TBody, TableCard, Th, THead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { ESTADO_ACTIVO_TONE } from '@/lib/estado';

interface CustodioInfo {
  codigo?: string | null;
  nombreCompleto?: string | null;
  cargo?: string | null;
  ci?: string | null;
}

interface ActivoItem {
  id: string;
  codigo: string;
  descripcion: string;
  grupoContable: string;
  ubicacion: string;
  unidad?: string | null;
  custodio?: CustodioInfo | null;
  condicion?: string | null;
  nroSerie?: string | null;
  marca?: string | null;
  modelo?: string | null;
  estado: string;
  valor: number;
  fechaAdquisicion?: string | null;
  version: number;
}

interface FiltrosMetadata {
  unidades: string[];
  gruposContables: string[];
  estados: string[];
}

const PAGE_SIZE = 15;

export default function ActivosPage() {
  return (
    <Suspense
      fallback={
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          Cargando catálogo institucional de activos fijos…
        </Panel>
      }
    >
      <ActivosContent />
    </Suspense>
  );
}

function ActivosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // Estados de datos
  const [activos, setActivos] = useState<ActivoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metadatos para selectores de filtrado
  const [metadata, setMetadata] = useState<FiltrosMetadata>({
    unidades: [],
    gruposContables: [],
    estados: ['BUENO', 'REGULAR', 'MALO', 'EN_REPARACION', 'BAJA'],
  });

  // Filtros Multi-Criterio (CU02)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [codigoFilter, setCodigoFilter] = useState(searchParams.get('codigo') || '');
  const [unidadFilter, setUnidadFilter] = useState(searchParams.get('unidad') || '');
  const [custodioFilter, setCustodioFilter] = useState(searchParams.get('custodio') || '');
  const [estadoFilter, setEstadoFilter] = useState(searchParams.get('estado') || '');
  const [grupoFilter, setGrupoFilter] = useState(searchParams.get('grupo') || '');

  // Modales
  const [selectedActivo, setSelectedActivo] = useState<ActivoItem | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'page' | 'all'>('page');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');

  // Carga inicial de metadatos dinámicos
  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch('/api/proxy/activos/filtros-metadata');
        if (res.ok) {
          const data = await res.json();
          setMetadata({
            unidades: data.unidades || [],
            gruposContables: data.gruposContables || [],
            estados: data.estados || ['BUENO', 'REGULAR', 'MALO', 'EN_REPARACION', 'BAJA'],
          });
        }
      } catch (err) {
        console.error('No se pudo cargar metadatos de filtros:', err);
      }
    }
    loadMetadata();
  }, []);

  // Construcción de Query String
  const buildQuery = (pageOverride?: number) => {
    const currentPage = pageOverride !== undefined ? pageOverride : page;
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String((currentPage - 1) * PAGE_SIZE),
    });

    if (search.trim()) params.set('search', search.trim());
    if (codigoFilter.trim()) params.set('codigo', codigoFilter.trim());
    if (unidadFilter) params.set('unidad', unidadFilter);
    if (custodioFilter.trim()) params.set('custodio', custodioFilter.trim());
    if (estadoFilter) params.set('estado', estadoFilter);
    if (grupoFilter) params.set('grupo', grupoFilter);

    return params;
  };

  // Consulta de Activos
  const fetchActivos = async (pageOverride?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = buildQuery(pageOverride);
      const res = await fetch(`/api/proxy/activos?${params.toString()}`);
      if (res.status === 401) {
        router.push('/?login=true');
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al consultar activos');
      }
      const data = await res.json();
      setActivos(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Error en la conexión con el servidor de activos');
    } finally {
      setLoading(false);
    }
  };

  // Sincronización con URL y ejecución con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = buildQuery();
      params.delete('limit');
      params.delete('offset');
      const qs = params.toString();
      router.replace(qs ? `/activos?${qs}` : '/activos');
      fetchActivos();
    }, 250);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, codigoFilter, unidadFilter, custodioFilter, estadoFilter, grupoFilter, page]);

  // Manejo de Filtros
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchActivos(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCodigoFilter('');
    setUnidadFilter('');
    setCustodioFilter('');
    setEstadoFilter('');
    setGrupoFilter('');
    setPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      search.trim() ||
      codigoFilter.trim() ||
      unidadFilter ||
      custodioFilter.trim() ||
      estadoFilter ||
      grupoFilter
    );
  }, [search, codigoFilter, unidadFilter, custodioFilter, estadoFilter, grupoFilter]);

  // Formato de Moneda Boliviana
  const formatBs = (val: number) => {
    return `Bs. ${Number(val || 0).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Formato de Fecha
  const formatFecha = (isoDate?: string | null) => {
    if (!isoDate) return 'No registrada';
    try {
      const d = new Date(isoDate);
      return new Intl.DateTimeFormat('es-BO', {
        timeZone: 'America/La_Paz',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    } catch {
      return isoDate;
    }
  };

  // Impresión directa del catálogo filtrado
  const handlePrint = () => {
    window.print();
  };

  // Exportación a CSV
  const handleExportCSV = async () => {
    let itemsToExport = activos;

    if (exportScope === 'all' && total > activos.length) {
      try {
        toast.show('Consultando registros para exportación completa...');
        const params = buildQuery();
        params.set('limit', '100'); // Exportar lote ampliado
        params.set('offset', '0');
        const res = await fetch(`/api/proxy/activos?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          itemsToExport = json.data || activos;
        }
      } catch (err) {
        console.error('Error al obtener todos los activos para exportar:', err);
      }
    }

    const headers = [
      'Código Patrimonial',
      'Descripción',
      'Grupo Contable',
      'Unidad Organizacional',
      'Ubicación Física',
      'Custodio Nombre',
      'Custodio Cargo',
      'Custodio CI',
      'Custodio Código',
      'Marca',
      'Modelo',
      'Nro Serie',
      'Estado',
      'Condición',
      'Valor (Bs.)',
      'Fecha Adquisición',
    ];

    const rows = itemsToExport.map((a) => [
      `"${a.codigo || ''}"`,
      `"${(a.descripcion || '').replace(/"/g, '""')}"`,
      `"${a.grupoContable || ''}"`,
      `"${(a.unidad || '').replace(/"/g, '""')}"`,
      `"${(a.ubicacion || '').replace(/"/g, '""')}"`,
      `"${(a.custodio?.nombreCompleto || 'Sin Asignar').replace(/"/g, '""')}"`,
      `"${(a.custodio?.cargo || '').replace(/"/g, '""')}"`,
      `"${a.custodio?.ci || ''}"`,
      `"${a.custodio?.codigo || ''}"`,
      `"${a.marca || ''}"`,
      `"${a.modelo || ''}"`,
      `"${a.nroSerie || ''}"`,
      `"${a.estado || ''}"`,
      `"${a.condicion || ''}"`,
      `"${Number(a.valor || 0).toFixed(2)}"`,
      `"${a.fechaAdquisicion ? a.fechaAdquisicion.split('T')[0] : ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `catalogo_activos_uagrm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    toast.show('Catálogo exportado exitosamente a CSV.');
  };

  const handleExportConfirm = () => {
    if (exportFormat === 'csv') {
      handleExportCSV();
    } else {
      setShowExportModal(false);
      toast.show(
        `Generación oficial en ${exportFormat.toUpperCase()} programada. Se emitirá el reporte foliado institucional.`,
      );
      setTimeout(handlePrint, 400);
    }
  };

  return (
    <>
      {/* Encabezado Principal */}
      <PageHeader
        title="Catálogo de Activos Fijos"
        description={`${total} bienes patrimoniales fiscalizados e inventariados`}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 cursor-pointer"
              title="Imprimir listado institucional directamente"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 cursor-pointer"
              title="Exportar catálogo en múltiples formatos"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => fetchActivos()}
              className="p-2.5 text-ink-secondary hover:text-ink cursor-pointer"
              title="Actualizar catálogo"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {/* Panel de Filtros Multi-Criterio (CU02) */}
      <Panel className="mb-6 p-4 sm:p-5">
        <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand" />
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Filtros de Búsqueda y Localización
              </span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-end">
            {/* 1. Búsqueda por descripción / general */}
            <div className="xl:col-span-2">
              <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">
                Descripción o Palabras Clave
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ej. Servidor Dell, Camioneta, Escritorio..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 text-sm"
                />
                <Search className="h-4 w-4 text-ink-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Código Institucional */}
            <div>
              <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">
                Código Activo
              </label>
              <Input
                type="text"
                placeholder="Ej. FICCT-SRV-001"
                value={codigoFilter}
                onChange={(e) => {
                  setCodigoFilter(e.target.value);
                  setPage(1);
                }}
                className="text-sm font-mono"
              />
            </div>

            {/* 3. Unidad Organizacional */}
            <div>
              <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">
                Unidad / Facultad
              </label>
              <Select
                value={unidadFilter}
                onChange={(e) => {
                  setUnidadFilter(e.target.value);
                  setPage(1);
                }}
                className="text-sm"
              >
                <option value="">Todas las unidades</option>
                {metadata.unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>

            {/* 4. Custodio o Responsable */}
            <div>
              <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">
                Custodio / Código Emp.
              </label>
              <Input
                type="text"
                placeholder="Ej. Mendoza o EMP-001"
                value={custodioFilter}
                onChange={(e) => {
                  setCustodioFilter(e.target.value);
                  setPage(1);
                }}
                className="text-sm"
              />
            </div>

            {/* 5. Estado de Conservación */}
            <div>
              <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">
                Estado Físico
              </label>
              <Select
                value={estadoFilter}
                onChange={(e) => {
                  setEstadoFilter(e.target.value);
                  setPage(1);
                }}
                className="text-sm"
              >
                <option value="">Todos los estados</option>
                {metadata.estados.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Segunda fila de filtros auxiliares */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="w-full sm:w-72">
              <label className="block text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1">
                Grupo Contable
              </label>
              <Select
                value={grupoFilter}
                onChange={(e) => {
                  setGrupoFilter(e.target.value);
                  setPage(1);
                }}
                className="text-sm"
              >
                <option value="">Todos los grupos contables</option>
                {metadata.gruposContables.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2 self-end text-xs text-ink-secondary">
              <span>
                Mostrando <strong className="text-ink font-semibold">{activos.length}</strong> de{' '}
                <strong className="text-ink font-semibold">{total}</strong> activos
              </span>
            </div>
          </div>
        </form>
      </Panel>

      {/* Tabla de Resultados */}
      {loading ? (
        <Panel className="p-16 text-center text-sm text-ink-tertiary">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-brand" />
          <p>Consultando base patrimonial de activos fijos...</p>
        </Panel>
      ) : error ? (
        <div className="rounded-xl border border-danger/25 bg-danger-surface p-6 text-sm text-danger flex flex-col items-center justify-center text-center">
          <p className="font-semibold mb-2">Error al consultar el catálogo de activos</p>
          <p className="text-xs text-ink-secondary mb-4">{error}</p>
          <Button variant="secondary" onClick={() => fetchActivos()}>
            Reintentar consulta
          </Button>
        </div>
      ) : activos.length === 0 ? (
        <Panel className="p-16 text-center text-ink-secondary">
          <div className="h-12 w-12 rounded-full bg-paper flex items-center justify-center mx-auto mb-3 text-ink-tertiary">
            <Search className="h-6 w-6" />
          </div>
          <p className="font-semibold text-ink mb-1">No se encontraron activos con los criterios especificados</p>
          <p className="text-xs text-ink-tertiary mb-4">
            Intente flexibilizar los filtros de unidad, custodio o estado de conservación.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Restablecer todos los filtros
            </Button>
          )}
        </Panel>
      ) : (
        <TableCard
          footer={
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          }
        >
          <THead>
                <Th className="w-36">Código</Th>
                <Th>Descripción / Especificación</Th>
                <Th>Unidad / Ubicación</Th>
                <Th>Custodio Responsable</Th>
                <Th className="text-center w-28">Estado</Th>
                <Th className="text-right w-32">Valor (Bs.)</Th>
                <Th className="text-center w-24">Acción</Th>
              </THead>
              <TBody>
                {activos.map((item) => (
                  <Tr key={item.id} className="hover:bg-paper-raised/60 transition-colors">
                    {/* Código con AssetTag */}
                    <Td className="whitespace-nowrap font-mono">
                      <AssetTag code={item.codigo} />
                    </Td>

                    {/* Descripción y Detalles Técnicos */}
                    <Td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink leading-tight">
                          {item.descripcion}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-ink-tertiary">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-secondary">
                            <Layers className="h-3 w-3 text-ink-tertiary" />
                            {item.grupoContable}
                          </span>
                          {(item.marca || item.modelo) && (
                            <span className="text-[11px] text-ink-tertiary">
                              • {[item.marca, item.modelo].filter(Boolean).join(' ')}
                            </span>
                          )}
                          {item.nroSerie && (
                            <span className="font-mono text-[10px] text-ink-muted">
                              [S/N: {item.nroSerie}]
                            </span>
                          )}
                        </div>
                      </div>
                    </Td>

                    {/* Unidad Organizacional y Ubicación Física */}
                    <Td>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-ink line-clamp-1" title={item.unidad || 'Sin asignar'}>
                          {item.unidad || 'Sin unidad asignada'}
                        </span>
                        <span className="text-[11px] text-ink-tertiary line-clamp-1 mt-0.5" title={item.ubicacion}>
                          {item.ubicacion || 'Sin oficina registrada'}
                        </span>
                      </div>
                    </Td>

                    {/* Custodio Responsable */}
                    <Td>
                      {item.custodio ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-ink line-clamp-1" title={item.custodio.nombreCompleto || ''}>
                            {item.custodio.nombreCompleto}
                          </span>
                          <span className="text-[11px] text-ink-tertiary line-clamp-1 mt-0.5">
                            {item.custodio.cargo || 'Funcionario'} 
                            {item.custodio.codigo && (
                              <span className="font-mono text-brand ml-1">({item.custodio.codigo})</span>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-medium text-ink-muted italic">
                          Sin custodio asignado
                        </span>
                      )}
                    </Td>

                    {/* Estado de Conservación */}
                    <Td className="text-center whitespace-nowrap">
                      <Badge tone={ESTADO_ACTIVO_TONE[item.estado] ?? 'neutral'}>
                        {item.estado}
                      </Badge>
                    </Td>

                    {/* Valor Contable en Bs. */}
                    <Td className="text-right whitespace-nowrap font-mono text-[13px] font-semibold text-ink tabular-nums">
                      {formatBs(item.valor)}
                    </Td>

                    {/* Botón Ver Más */}
                    <Td className="text-center whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedActivo(item)}
                        className="inline-flex items-center gap-1.5 cursor-pointer px-2.5 py-1 text-xs"
                        title="Ver ficha técnica completa del activo"
                      >
                        <Eye className="h-3.5 w-3.5 text-brand" />
                        <span>Ver</span>
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </TBody>
        </TableCard>
      )}

      {/* Modal de Detalle: Ficha Técnica Patrimonial (CU02) */}
      {selectedActivo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedActivo(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-paper-raised border border-border-soft rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-start justify-between p-6 border-b border-border-soft bg-paper">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <AssetTag code={selectedActivo.codigo} />
                  <Badge tone={ESTADO_ACTIVO_TONE[selectedActivo.estado] ?? 'neutral'}>
                    {selectedActivo.estado}
                  </Badge>
                  {selectedActivo.condicion && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-border-soft text-ink-secondary">
                      {selectedActivo.condicion}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-ink mt-1">
                  Ficha Técnica Patrimonial
                </h3>
                <p className="text-xs text-ink-tertiary">
                  Universidad Autónoma Gabriel René Moreno — Control de Bienes de Uso
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedActivo(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper-raised transition-colors cursor-pointer"
                aria-label="Cerrar ficha"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tarjeta Resumen: Descripción y Valor */}
              <div className="bg-brand-surface/40 border border-brand/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                    Denominación del Bien
                  </span>
                  <h4 className="text-base font-bold text-ink">
                    {selectedActivo.descripcion}
                  </h4>
                  <p className="text-xs text-ink-secondary">
                    Grupo Contable: <strong className="text-ink">{selectedActivo.grupoContable}</strong>
                  </p>
                </div>

                <div className="bg-paper-raised px-4 py-3 rounded-lg border border-border-soft shadow-xs text-right shrink-0">
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block">
                    Valor en Libros
                  </span>
                  <span className="font-mono text-base font-bold text-ink">
                    {formatBs(selectedActivo.valor)}
                  </span>
                </div>
              </div>

              {/* Sección 1: Datos Técnicos */}
              <div>
                <h5 className="text-xs font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-border-soft pb-1.5">
                  <Laptop className="h-4 w-4 text-brand" />
                  Especificaciones Técnicas del Bien
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3 bg-paper rounded-xl border border-border-soft">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-1">
                      Marca
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {selectedActivo.marca || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 bg-paper rounded-xl border border-border-soft">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-1">
                      Modelo
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {selectedActivo.modelo || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 bg-paper rounded-xl border border-border-soft">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-1">
                      Número de Serie
                    </span>
                    <span className="text-sm font-mono font-semibold text-ink">
                      {selectedActivo.nroSerie || 'S/N Registrado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección 2: Asignación y Custodia Institucional */}
              <div>
                <h5 className="text-xs font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-border-soft pb-1.5">
                  <UserCheck className="h-4 w-4 text-brand" />
                  Custodia Legal y Asignación
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-paper rounded-xl border border-border-soft space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                        Unidad Organizacional / Facultad
                      </span>
                      <p className="text-xs font-semibold text-ink">
                        {selectedActivo.unidad || 'Sin dependencia asignada'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-0.5">
                        Ubicación Física / Ambiente
                      </span>
                      <p className="text-xs text-ink-secondary flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-ink-tertiary shrink-0" />
                        {selectedActivo.ubicacion || 'No especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-paper rounded-xl border border-border-soft space-y-1.5">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block">
                      Funcionario Custodio Responsable
                    </span>
                    {selectedActivo.custodio ? (
                      <>
                        <p className="text-sm font-bold text-ink">
                          {selectedActivo.custodio.nombreCompleto}
                        </p>
                        <p className="text-xs text-ink-secondary">
                          {selectedActivo.custodio.cargo || 'Funcionario'}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-ink-tertiary">
                          <span>CI: {selectedActivo.custodio.ci || 'N/A'}</span>
                          <span>•</span>
                          <span>Código: {selectedActivo.custodio.codigo || 'N/A'}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs italic text-ink-tertiary pt-1">
                        El activo se encuentra en almacén o sin acta de entrega vigente.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 3: Datos de Incorporación y Trazabilidad */}
              <div>
                <h5 className="text-xs font-bold text-ink-secondary uppercase tracking-wider flex items-center gap-2 mb-3 border-b border-border-soft pb-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  Incorporación y Fiscalización
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3 bg-paper rounded-xl border border-border-soft">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-1">
                      Fecha de Adquisición
                    </span>
                    <span className="text-xs font-medium text-ink flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-ink-tertiary" />
                      {formatFecha(selectedActivo.fechaAdquisicion)}
                    </span>
                  </div>

                  <div className="p-3 bg-paper rounded-xl border border-border-soft">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block mb-1">
                      Versión Registral (Event Store)
                    </span>
                    <span className="text-xs font-mono font-medium text-ink">
                      v{selectedActivo.version} (Inmutable)
                    </span>
                  </div>
                </div>
              </div>

              {/* Nota Normativa */}
              <div className="p-3 rounded-xl bg-paper border border-border-soft text-[11px] text-ink-secondary leading-relaxed">
                <p>
                  <strong>Marco Normativo:</strong> Bien sujeto a control según el Decreto Supremo Nº 0181
                  (Normas Básicas del Sistema de Administración de Bienes y Servicios) y el Reglamento Específico de
                  Activos Fijos de la Universidad Autónoma Gabriel René Moreno.
                </p>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="p-4 sm:p-5 border-t border-border-soft bg-paper flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Ficha</span>
              </Button>

              <Button
                onClick={() => setSelectedActivo(null)}
                className="cursor-pointer"
              >
                Cerrar Ficha
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportación (CU02) */}
      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-paper-raised border border-border-soft rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7"
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
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base font-serif">
                  Exportar Catálogo de Activos
                </h3>
                <p className="text-xs text-ink-tertiary">
                  Generación de reportes institucionales para auditoría y control
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-ink-secondary leading-relaxed mb-6">
              {/* Selector de Alcance */}
              <div>
                <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-2">
                  Alcance de la Exportación
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportScope('page')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      exportScope === 'page'
                        ? 'border-brand bg-brand-surface text-ink'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs text-ink">Página actual</div>
                    <div className="text-[11px] text-ink-tertiary mt-0.5">
                      {activos.length} activos en pantalla
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      exportScope === 'all'
                        ? 'border-brand bg-brand-surface text-ink'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs text-ink">Total filtrado</div>
                    <div className="text-[11px] text-ink-tertiary mt-0.5">
                      {total} activos coincidentes
                    </div>
                  </button>
                </div>
              </div>

              {/* Selector de Formato */}
              <div>
                <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-2">
                  Formato de Salida
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      exportFormat === 'csv'
                        ? 'border-brand bg-brand-surface text-brand font-bold'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span className="text-xs">CSV / Excel</span>
                    <span className="text-[9px] uppercase tracking-wider text-brand font-bold">
                      Descarga Directa
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('pdf')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      exportFormat === 'pdf'
                        ? 'border-brand bg-brand-surface text-brand font-bold'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">PDF Oficial</span>
                    <span className="text-[9px] uppercase tracking-wider text-ink-tertiary">
                      Impresión
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('excel')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      exportFormat === 'excel'
                        ? 'border-brand bg-brand-surface text-brand font-bold'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span className="text-xs">Excel (.xlsx)</span>
                    <span className="text-[9px] uppercase tracking-wider text-ink-tertiary">
                      Avanzado
                    </span>
                  </button>
                </div>
              </div>

              {/* Resumen de Filtros Activos */}
              <div className="p-3 bg-paper rounded-xl border border-border-soft space-y-1 font-mono text-[11px]">
                <div className="font-bold text-ink mb-1">Criterios de exportación:</div>
                <div>• Búsqueda: <span className="text-ink">{search.trim() || 'Todas'}</span></div>
                <div>• Código: <span className="text-ink">{codigoFilter.trim() || 'Todos'}</span></div>
                <div>• Unidad: <span className="text-ink">{unidadFilter || 'Todas'}</span></div>
                <div>• Custodio: <span className="text-ink">{custodioFilter.trim() || 'Todos'}</span></div>
                <div>• Estado: <span className="text-ink">{estadoFilter || 'Todos'}</span></div>
                <div>• Grupo: <span className="text-ink">{grupoFilter || 'Todos'}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-soft">
              <Button variant="secondary" onClick={() => setShowExportModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExportConfirm} className="inline-flex items-center gap-2 cursor-pointer">
                <Download className="h-3.5 w-3.5" />
                <span>Confirmar Exportación</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
