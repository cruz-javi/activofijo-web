'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Printer, 
  Tag, 
  RotateCcw, 
  Layers, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Copy,
  ExternalLink,
  FileText,
  Info
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { 
  EtiquetaPatrimonial, 
  PlantillaData, 
  ActivoEtiquetaData 
} from '@/components/etiquetas/EtiquetaPatrimonial';
import { EditorPlantillaModal } from '@/components/etiquetas/EditorPlantillaModal';

function EtiquetasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();
  const { isAdmin, hasRole } = useCurrentUser();

  // Permiso para administrar plantillas
  const canManageTemplates = isAdmin || hasRole('JEFE_ACTIVO_FIJO') || hasRole('ADMINISTRADOR');

  // Pestaña activa: 'lotes' | 'reponer' | 'plantillas'
  const [activeTab, setActiveTab] = useState<'lotes' | 'reponer' | 'plantillas'>('lotes');

  // Metadatos y plantillas
  const [plantillas, setPlantillas] = useState<PlantillaData[]>([]);
  const [selectedPlantillaId, setSelectedPlantillaId] = useState<string>('');
  const [loadingPlantillas, setLoadingPlantillas] = useState(true);

  // Modal de edición de plantilla
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [plantillaAEditar, setPlantillaAEditar] = useState<PlantillaData | null>(null);

  // =========================================================================
  // ESTADOS: PESTAÑA 1 - IMPRESIÓN POR LOTES
  // =========================================================================
  const [codigosInput, setCodigosInput] = useState('');
  const [activosGenerados, setActivosGenerados] = useState<ActivoEtiquetaData[]>([]);
  const [loadingGeneracion, setLoadingGeneracion] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // =========================================================================
  // ESTADOS: PESTAÑA 2 - REPOSICIÓN FORMAL (HU3-18)
  // =========================================================================
  const [codigoReponer, setCodigoReponer] = useState('');
  const [motivoReposicion, setMotivoReposicion] = useState('DETERIORO_FISICO');
  const [observacionReposicion, setObservacionReposicion] = useState('');
  const [historialActivo, setHistorialActivo] = useState<any[]>([]);
  const [activoAReponer, setActivoAReponer] = useState<any | null>(null);
  const [loadingBuscarActivo, setLoadingBuscarActivo] = useState(false);
  const [loadingReponer, setLoadingReponer] = useState(false);
  const [reposicionExitosa, setReposicionExitosa] = useState<any | null>(null);

  // Cargar lista de plantillas disponibles
  const loadPlantillas = async () => {
    try {
      setLoadingPlantillas(true);
      const res = await fetch('/api/proxy/etiquetas/plantillas');
      if (res.ok) {
        const data: PlantillaData[] = await res.json();
        setPlantillas(data);
        const defaultPl = data.find((p) => p.esPredeterminada) || data[0];
        if (defaultPl?.id) {
          setSelectedPlantillaId(defaultPl.id);
        }
      }
    } catch (err) {
      console.error('Error cargando plantillas:', err);
    } finally {
      setLoadingPlantillas(false);
    }
  };

  useEffect(() => {
    loadPlantillas();
  }, []);

  // Detectar parámetros de URL (ej. ?codigos=UAGRM-001,UAGRM-002 o ?reponer=UAGRM-001)
  useEffect(() => {
    const codsParam = searchParams.get('codigos');
    const reponerParam = searchParams.get('reponer');

    if (codsParam) {
      setCodigosInput(codsParam);
      setActiveTab('lotes');
    } else if (reponerParam) {
      setCodigoReponer(reponerParam);
      setActiveTab('reponer');
      buscarActivoParaReponer(reponerParam);
    }
  }, [searchParams]);

  const plantillaActual = useMemo(() => {
    return (
      plantillas.find((p) => p.id === selectedPlantillaId) ||
      plantillas[0] || {
        nombre: 'Estándar',
        tipoPapel: 'ROLLO_TERMICO',
        anchoMm: 70,
        altoMm: 35,
        tipoCodigo: 'HIBRIDO',
        configuracion: {},
      }
    );
  }, [plantillas, selectedPlantillaId]);

  // =========================================================================
  // HANDLERS: IMPRESIÓN POR LOTES
  // =========================================================================
  const handleGenerarLote = async () => {
    const list = codigosInput
      .split(/[\n,;]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (list.length === 0) {
      show('Ingrese al menos un código de activo patrimonial', 'danger');
      return;
    }

    setLoadingGeneracion(true);
    try {
      const res = await fetch('/api/proxy/etiquetas/generar-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigos: list,
          plantillaId: selectedPlantillaId,
          motivo: 'ALTA',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        show(data?.message || 'Error al generar las etiquetas en lote', 'danger');
        return;
      }

      setActivosGenerados(data.etiquetas || []);
      show(`Se procesaron ${data.totalProcesados} etiquetas para impresión`, 'success');
    } catch (err: any) {
      show('Error de comunicación con el servidor', 'danger');
    } finally {
      setLoadingGeneracion(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // =========================================================================
  // HANDLERS: REPOSICIÓN FORMAL
  // =========================================================================
  const buscarActivoParaReponer = async (codigoABuscar?: string) => {
    const cod = (codigoABuscar || codigoReponer).trim();
    if (!cod) {
      show('Ingrese un código de activo a consultar', 'danger');
      return;
    }

    setLoadingBuscarActivo(true);
    setActivoAReponer(null);
    setHistorialActivo([]);
    setReposicionExitosa(null);

    try {
      // 1. Consultar historial de etiquetas
      const resHist = await fetch(`/api/proxy/etiquetas/historial/${encodeURIComponent(cod)}`);
      if (resHist.ok) {
        const histData = await resHist.json();
        setHistorialActivo(histData.historial || []);
      }

      // 2. Consultar activo en catálogo
      const resActivo = await fetch(`/api/proxy/activos?codigo=${encodeURIComponent(cod)}&limit=1`);
      if (resActivo.ok) {
        const data = await resActivo.json();
        if (data.data && data.data.length > 0) {
          setActivoAReponer(data.data[0]);
        } else {
          show('No se encontró ningún activo con ese código', 'danger');
        }
      }
    } catch (err) {
      show('Error al consultar datos del activo', 'danger');
    } finally {
      setLoadingBuscarActivo(false);
    }
  };

  const handleEjecutarReposicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activoAReponer) {
      show('Primero debe buscar y confirmar el activo a reponer', 'danger');
      return;
    }

    setLoadingReponer(true);
    try {
      const res = await fetch('/api/proxy/etiquetas/reponer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codActivo: activoAReponer.codigo,
          motivo: motivoReposicion,
          observacion: observacionReposicion.trim() || undefined,
          plantillaId: selectedPlantillaId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        show(data?.message || 'Error al reponer la etiqueta', 'danger');
        return;
      }

      setReposicionExitosa(data.data);
      show(`¡Etiqueta repuesta con éxito! (Versión ${data.data.versionEtiqueta})`, 'success');
      // Recargar historial
      buscarActivoParaReponer(activoAReponer.codigo);
    } catch (err) {
      show('Error de comunicación con el servidor', 'danger');
    } finally {
      setLoadingReponer(false);
    }
  };

  // =========================================================================
  // HANDLERS: GESTIÓN DE PLANTILLAS
  // =========================================================================
  const handleEstablecerPredeterminada = async (id: string) => {
    try {
      const res = await fetch(`/api/proxy/etiquetas/plantillas/${id}/predeterminada`, {
        method: 'PATCH',
      });
      if (res.ok) {
        show('Plantilla establecida como predeterminada', 'success');
        loadPlantillas();
      } else {
        const data = await res.json();
        show(data?.message || 'Error al actualizar', 'danger');
      }
    } catch (err) {
      show('Error al establecer plantilla predeterminada', 'danger');
    }
  };

  const handleEliminarPlantilla = async (id: string, nombreP: string) => {
    if (!confirm(`¿Está seguro de eliminar la plantilla personalizada "${nombreP}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/proxy/etiquetas/plantillas/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        show('Plantilla eliminada exitosamente', 'success');
        loadPlantillas();
      } else {
        const data = await res.json();
        show(data?.message || 'No se puede eliminar esta plantilla', 'danger');
      }
    } catch (err) {
      show('Error al eliminar plantilla', 'danger');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="no-print">
        <PageHeader
          title="Gestión de Identificadores y Etiquetas"
          description="Emisión de etiquetas patrimoniales, reposición formal por deterioro e impresión masiva por lotes."
        />

        {/* Barra de Pestañas */}
        <div className="flex border-b border-border mt-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('lotes')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'lotes'
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-ink-secondary hover:text-ink hover:border-border'
            }`}
          >
            <Printer className="h-4 w-4" />
            Emisión e Impresión por Lotes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reponer')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'reponer'
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-ink-secondary hover:text-ink hover:border-border'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            Reponer Etiqueta Deteriorada
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plantillas')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'plantillas'
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-ink-secondary hover:text-ink hover:border-border'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Formatos y Diseños de Etiqueta
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: EMISIÓN E IMPRESIÓN POR LOTES */}
      {/* ========================================================================= */}
      {activeTab === 'lotes' && (
        <div className="space-y-6">
          {/* Panel de Configuración de Lote */}
          <div className="p-6 bg-paper border border-border rounded-lg shadow-xs space-y-4 no-print">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Field
                  label="Códigos de Activos Patrimoniales (separados por coma o salto de línea)"
                  htmlFor="codigosInput"
                >
                  <textarea
                    id="codigosInput"
                    rows={3}
                    value={codigosInput}
                    onChange={(e) => setCodigosInput(e.target.value)}
                    placeholder="Ej. UAGRM-2026-00001, UAGRM-2026-00002, UAGRM-2026-00042&#10;O pegue una lista de códigos..."
                    className="w-full p-2.5 text-xs font-mono bg-subtle border border-border rounded-md text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                </Field>
                <div className="flex items-center justify-between text-[11px] text-ink-tertiary">
                  <span>💡 Puede enviar a imprimir lotes de 50, 100 o más activos simultáneamente.</span>
                  <button
                    type="button"
                    onClick={() => router.push('/activos')}
                    className="text-brand hover:underline font-medium flex items-center gap-1"
                  >
                    <Search className="h-3 w-3" />
                    Seleccionar desde el Catálogo
                  </button>
                </div>
              </div>

              {/* Selector de Plantilla y Acciones */}
              <div className="space-y-3 flex flex-col justify-between">
                <Field label="Formato Físico de Etiqueta" htmlFor="selectPlantilla">
                  <Select
                    id="selectPlantilla"
                    value={selectedPlantillaId}
                    onChange={(e) => setSelectedPlantillaId(e.target.value)}
                  >
                    {plantillas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.anchoMm}×{p.altoMm}mm) {p.esPredeterminada ? '★ Predeterminada' : ''}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleGenerarLote}
                    disabled={loadingGeneracion}
                    className="flex-1 gap-2"
                  >
                    {loadingGeneracion ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Procesando Lote...
                      </>
                    ) : (
                      <>
                        <Layers className="h-4 w-4" />
                        Generar Vista Previa
                      </>
                    )}
                  </Button>

                  {activosGenerados.length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handlePrint}
                      className="gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Imprimir ({activosGenerados.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Área de Previsualización e Impresión */}
          {activosGenerados.length > 0 ? (
            <div className="space-y-4">
              {/* Barra de control de vista previa */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-subtle/50 no-print">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-ink">
                    Lote listo para imprimir: <span className="text-brand font-bold">{activosGenerados.length} etiquetas</span>
                  </span>
                  <span className="text-ink-tertiary">|</span>
                  <span className="text-ink-secondary font-mono">
                    Formato: {plantillaActual.nombre} ({plantillaActual.anchoMm}×{plantillaActual.altoMm} mm)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                    <span>Zoom pantalla:</span>
                    <button
                      type="button"
                      onClick={() => setZoomScale(1)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        zoomScale === 1 ? 'bg-brand text-white' : 'bg-paper border border-border'
                      }`}
                    >
                      100% Real
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomScale(1.3)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        zoomScale === 1.3 ? 'bg-brand text-white' : 'bg-paper border border-border'
                      }`}
                    >
                      130%
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handlePrint}
                    className="gap-2 text-xs"
                  >
                    <Printer className="h-4 w-4" />
                    Mandar a Impresión
                  </Button>
                </div>
              </div>

              {/* Contenedor imprimible de etiquetas */}
              <div id="etiquetas-print-area" className="p-6 bg-paper border border-border rounded-lg shadow-sm overflow-auto">
                {/* Cuadrícula o tira de etiquetas */}
                <div 
                  className={`etiquetas-container flex flex-wrap gap-4 justify-start ${
                    plantillaActual.tipoPapel === 'HOJA_A4' ? 'a4-sheet-layout' : 'roll-layout'
                  }`}
                >
                  {activosGenerados.map((activo, idx) => (
                    <div key={`${activo.codigo}-${idx}`} className="etiqueta-wrapper">
                      <EtiquetaPatrimonial
                        activo={activo}
                        plantilla={plantillaActual}
                        scale={zoomScale}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-border rounded-lg bg-paper/50 space-y-3 no-print">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-ink">Ningún lote cargado aún</h3>
              <p className="text-xs text-ink-secondary max-w-md mx-auto">
                Ingrese los códigos de los bienes patrimoniales en el recuadro superior o selecciónelos directamente desde el Catálogo de Activos para generar sus etiquetas oficiales.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: REPOSICIÓN FORMAL POR DETERIORO (HU3-18) */}
      {/* ========================================================================= */}
      {activeTab === 'reponer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel Izquierdo: Formulario de Reposición */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-paper border border-border rounded-lg shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <div className="p-1.5 rounded bg-brand/10 text-brand">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Búsqueda y Verificación del Bien a Reponer</h3>
                  <p className="text-xs text-ink-secondary">
                    Localice el activo con etiqueta deteriorada o ilegible para emitir su versión sucesiva
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  id="buscarReponerInput"
                  value={codigoReponer}
                  onChange={(e) => setCodigoReponer(e.target.value.toUpperCase())}
                  placeholder="Ingrese el código patrimonial (ej. UAGRM-2026-00042)..."
                  className="font-mono uppercase font-bold text-brand"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => buscarActivoParaReponer()}
                  disabled={loadingBuscarActivo}
                  className="gap-2"
                >
                  {loadingBuscarActivo ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Buscar
                </Button>
              </div>

              {/* Ficha del Activo Encontrado */}
              {activoAReponer && (
                <div className="p-4 rounded-lg border border-border bg-subtle/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-brand">{activoAReponer.codigo}</span>
                      <h4 className="text-sm font-bold text-ink leading-tight">{activoAReponer.descripcion}</h4>
                    </div>
                    <Badge tone="brand">Activo Localizado</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-ink-secondary block">Ubicación Actual:</span>
                      <span className="text-ink font-medium">{activoAReponer.ubicacion || 'Sin oficina asignada'}</span>
                    </div>
                    <div>
                      <span className="text-ink-secondary block">Custodio Actual:</span>
                      <span className="text-ink font-medium">{activoAReponer.custodio?.nombreCompleto || 'Sin custodio'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario formal de reposición */}
              {activoAReponer && (
                <form onSubmit={handleEjecutarReposicion} className="space-y-4 pt-2">
                  <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Aviso de Trazabilidad Institucional</p>
                      <p>
                        La etiqueta anterior quedará oficialmente invalidada en la bitácora. La nueva etiqueta se emitirá con un incremento correlativo de versión e integrará un nuevo sello criptográfico verificable.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Motivo de Reposición *" htmlFor="motivoRepo">
                      <Select
                        id="motivoRepo"
                        value={motivoReposicion}
                        onChange={(e) => setMotivoReposicion(e.target.value)}
                        required
                      >
                        <option value="DETERIORO_FISICO">Deterioro Físico / Desgaste Natural</option>
                        <option value="CODIGO_ILEGIBLE">Código Ilegible / No Escanea</option>
                        <option value="DESPRENDIMIENTO">Desprendimiento o Pérdida de Etiqueta</option>
                        <option value="REEMPLAZO_PREVENTIVO">Reemplazo Preventivo por Mantenimiento</option>
                        <option value="ACTUALIZACION_FORMATO">Actualización al Nuevo Formato Oficial</option>
                        <option value="OTRO">Otro Motivo Justificado</option>
                      </Select>
                    </Field>

                    <Field label="Formato de la Nueva Etiqueta" htmlFor="selectPlantillaRepo">
                      <Select
                        id="selectPlantillaRepo"
                        value={selectedPlantillaId}
                        onChange={(e) => setSelectedPlantillaId(e.target.value)}
                      >
                        {plantillas.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ({p.anchoMm}×{p.altoMm}mm)
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field label="Observación o Justificación Institucional" htmlFor="obsRepo">
                    <Input
                      id="obsRepo"
                      value={observacionReposicion}
                      onChange={(e) => setObservacionReposicion(e.target.value)}
                      placeholder="Indique detalles adicionales de la reposición (ej. inspección en aula 10)..."
                    />
                  </Field>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loadingReponer}
                      className="gap-2 shadow-sm"
                    >
                      {loadingReponer ? (
                        <>
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Firmando y Reponiendo Etiqueta...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Autorizar y Emitir Nueva Etiqueta
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Resultado de reposición exitosa */}
            {reposicionExitosa && (
              <div className="p-6 bg-paper border-2 border-emerald-500/40 rounded-lg shadow-sm space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">¡Nueva Etiqueta Emitida con Éxito!</h4>
                      <p className="text-xs text-ink-secondary">
                        Se ha emitido la versión {reposicionExitosa.versionEtiqueta} del código {reposicionExitosa.codigo}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      setActivosGenerados([
                        {
                          codigo: reposicionExitosa.codigo,
                          descripcion: reposicionExitosa.descripcion,
                          ubicacion: reposicionExitosa.ubicacion,
                          versionEtiqueta: reposicionExitosa.versionEtiqueta,
                          hashSeguridad: reposicionExitosa.hashSeguridad,
                          codigoVerificacionCorto: reposicionExitosa.codigoVerificacionCorto,
                          fechaEmision: reposicionExitosa.fechaEmision,
                        },
                      ]);
                      setTimeout(() => window.print(), 200);
                    }}
                    className="gap-2 text-xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir Esta Etiqueta
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg bg-subtle/40 border border-border">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-mono text-brand font-bold">Código: {reposicionExitosa.codigo}</p>
                    <p className="text-ink">Versión Anterior: v{reposicionExitosa.versionPrevia} → <span className="font-bold text-emerald-600">Nueva Versión: v{reposicionExitosa.versionEtiqueta}</span></p>
                    <p className="text-ink-secondary font-mono text-[11px] truncate max-w-sm">
                      Sello de Seguridad: {reposicionExitosa.hashSeguridad}
                    </p>
                  </div>

                  <div className="shrink-0 p-2 bg-white rounded border border-border shadow-xs">
                    <EtiquetaPatrimonial
                      activo={{
                        codigo: reposicionExitosa.codigo,
                        descripcion: reposicionExitosa.descripcion,
                        ubicacion: reposicionExitosa.ubicacion,
                        versionEtiqueta: reposicionExitosa.versionEtiqueta,
                        hashSeguridad: reposicionExitosa.hashSeguridad,
                        codigoVerificacionCorto: reposicionExitosa.codigoVerificacionCorto,
                        fechaEmision: reposicionExitosa.fechaEmision,
                      }}
                      plantilla={plantillaActual}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Derecho: Historial de Versiones del Activo */}
          <div className="space-y-4">
            <div className="p-6 bg-paper border border-border rounded-lg shadow-xs space-y-4">
              <h4 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-brand" />
                Historial de Etiquetas Emitidas
              </h4>

              {historialActivo.length > 0 ? (
                <div className="space-y-3">
                  {historialActivo.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        item.vigente
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border bg-subtle/50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink">Versión {item.version}</span>
                        {item.vigente ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            Vigente
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            Invalidada
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-ink-secondary space-y-0.5 pt-1">
                        <p>Motivo: <span className="font-medium text-ink">{item.motivo}</span></p>
                        <p>Emitida: {new Date(item.generadoEn).toLocaleString('es-BO')}</p>
                        {item.invalidadaEn && (
                          <p className="text-red-500">
                            Dada de baja: {new Date(item.invalidadaEn).toLocaleString('es-BO')}
                          </p>
                        )}
                        {item.observacion && (
                          <p className="italic text-ink-muted">Nota: {item.observacion}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-tertiary text-center py-6">
                  {activoAReponer
                    ? 'No se registran emisiones previas en el sistema moderno.'
                    : 'Busque un activo para visualizar su historial de versiones.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: GESTOR Y DISEÑADOR DE FORMATOS DE ETIQUETA */}
      {/* ========================================================================= */}
      {activeTab === 'plantillas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-paper border border-border shadow-xs">
            <div>
              <h3 className="text-sm font-semibold text-ink">Formatos y Diseños Oficiales del Sistema</h3>
              <p className="text-xs text-ink-secondary">
                Configure las dimensiones milimétricas, tipos de código y elementos visibles de cada medio de impresión
              </p>
            </div>

            {canManageTemplates && (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setPlantillaAEditar(null);
                  setIsEditorModalOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Diseñar Nuevo Formato
              </Button>
            )}
          </div>

          {/* Cuadrícula de formatos disponibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plantillas.map((p) => (
              <div
                key={p.id}
                className={`p-6 rounded-lg border bg-paper shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                  p.esPredeterminada ? 'border-brand/40 ring-1 ring-brand/20' : 'border-border'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{p.nombre}</span>
                      {p.esPredeterminada && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Star className="h-3 w-3 fill-amber-500" />
                          Predeterminada
                        </span>
                      )}
                    </div>
                    {p.esSistema ? (
                      <span className="text-[10px] text-ink-tertiary bg-subtle px-2 py-0.5 rounded border border-border">
                        Oficial UAGRM
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                        Personalizada
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-ink-secondary line-clamp-2">
                    {p.descripcion || 'Sin descripción adicional'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-ink-secondary">
                    <span>📐 {p.anchoMm} mm × {p.altoMm} mm</span>
                    <span>📄 {p.tipoPapel.replace('_', ' ')}</span>
                    <span>🔲 {p.tipoCodigo}</span>
                  </div>

                  {/* Previsualización miniatura */}
                  <div className="p-3 rounded-lg border border-border bg-subtle/30 flex items-center justify-center overflow-hidden min-h-25">
                    <EtiquetaPatrimonial
                      activo={{
                        codigo: 'UAGRM-MUESTRA',
                        descripcion: 'BIEN PATRIMONIAL INSTITUCIONAL',
                        ubicacion: 'RECTORADO',
                      }}
                      plantilla={p}
                      scale={0.85}
                    />
                  </div>
                </div>

                {/* Acciones de la plantilla */}
                {canManageTemplates && (
                  <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                    {!p.esPredeterminada && (
                      <button
                        type="button"
                        onClick={() => p.id && handleEstablecerPredeterminada(p.id)}
                        className="text-xs text-brand hover:underline font-medium"
                      >
                        Establecer Predeterminada
                      </button>
                    )}
                    {p.esPredeterminada && <div />}

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPlantillaAEditar(p);
                          setIsEditorModalOpen(true);
                        }}
                        className="gap-1 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </Button>

                      {!p.esSistema && p.id && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEliminarPlantilla(p.id!, p.nombre)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal del Diseñador / Editor de Plantillas */}
      <EditorPlantillaModal
        isOpen={isEditorModalOpen}
        onClose={() => {
          setIsEditorModalOpen(false);
          setPlantillaAEditar(null);
        }}
        onSaveSuccess={loadPlantillas}
        plantillaParaEditar={plantillaAEditar}
      />

      {/* Estilos CSS Nativos para @media print */}
      <style jsx global>{`
        @media print {
          /* Ocultar elementos no imprimibles */
          .no-print,
          nav,
          header,
          aside,
          footer,
          button {
            display: none !important;
          }

          body,
          main,
          #etiquetas-print-area {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Contenedor de impresión */
          .etiquetas-container {
            gap: 2mm !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .etiqueta-wrapper {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 2mm !important;
          }

          .etiqueta-fisica {
            border: 1px solid #000 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

export default function EtiquetasPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-ink-tertiary">
          Cargando módulo de identificadores y etiquetas patrimoniales...
        </div>
      }
    >
      <EtiquetasContent />
    </Suspense>
  );
}
