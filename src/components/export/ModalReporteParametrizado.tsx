'use client';

import { useState, useId } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Sparkles, 
  Check, 
  Printer, 
  Settings2, 
  Sliders, 
  Layers, 
  RotateCcw,
  CheckSquare,
  Square,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { 
  ReportColumn, 
  ReportFormat, 
  PageSize, 
  PageOrientation, 
  ReportHeaderConfig, 
  ReportFilterCriterion,
  ReportConfig 
} from '@/lib/export/reportTypes';
import { executeReport } from '@/lib/export/reportEngine';
import { useToast } from '@/components/ui/Toast';

export interface ModalReporteParametrizadoProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  filenamePrefix: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultGestion?: string;
  columns: ReportColumn<T>[];
  pageData: T[];
  totalFilteredCount: number;
  fetchAllFilteredData?: () => Promise<T[]>;
  filters: ReportFilterCriterion[];
  userLabel?: string;
}

export function ModalReporteParametrizado<T>({
  isOpen,
  onClose,
  title,
  description = 'Generación de reportes institucionales para auditoría y control patrimonial',
  filenamePrefix,
  defaultTitle,
  defaultSubtitle,
  defaultGestion = `Gestión ${new Date().getFullYear()}`,
  columns,
  pageData,
  totalFilteredCount,
  fetchAllFilteredData,
  filters,
  userLabel,
}: ModalReporteParametrizadoProps<T>) {
  const { show } = useToast();
  const idPrefix = useId();

  // Estados de configuración
  const [alcance, setAlcance] = useState<'page' | 'all'>('page');
  const [formato, setFormato] = useState<ReportFormat>('pdf');
  
  // Encabezados editables
  const [reportTitle, setReportTitle] = useState(defaultTitle);
  const [reportSubtitle, setReportSubtitle] = useState(defaultSubtitle);
  const [gestion, setGestion] = useState(defaultGestion);
  const [incluirFirmas, setIncluirFirmas] = useState(true);

  // Configuración de hoja para PDF
  const [tamanoHoja, setTamanoHoja] = useState<PageSize>('a4');
  const [orientacion, setOrientacion] = useState<PageOrientation>('landscape');

  // Checklist de columnas seleccionadas
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(
    columns.filter((c) => c.defaultVisible).map((c) => String(c.key)),
  );

  // Pestaña activa del configurador (opcional para mantener orden visual limpio)
  const [activeTab, setActiveTab] = useState<'general' | 'columnas' | 'hoja'>('general');

  // Estado de carga
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const toggleColumn = (key: string) => {
    setSelectedColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const selectAllColumns = () => {
    setSelectedColumnKeys(columns.map((c) => String(c.key)));
  };

  const resetDefaultColumns = () => {
    setSelectedColumnKeys(columns.filter((c) => c.defaultVisible).map((c) => String(c.key)));
  };

  const handleExport = async () => {
    if (selectedColumnKeys.length === 0) {
      show('Debe seleccionar al menos una columna para incluir en el reporte.', 'danger');
      return;
    }

    setIsGenerating(true);
    try {
      const config: ReportConfig<T> = {
        formato,
        alcance,
        encabezado: {
          titulo: reportTitle.trim() || defaultTitle,
          subtitulo: reportSubtitle.trim() || defaultSubtitle,
          gestion: gestion.trim() || defaultGestion,
          incluirFirmas,
        },
        pagina: {
          tamano: tamanoHoja,
          orientacion,
        },
        columnasDisponibles: columns,
        columnasSeleccionadas: selectedColumnKeys,
        criteriosFiltro: filters,
      };

      const result = await executeReport<T>({
        config,
        pageData,
        fetchAllFilteredData,
        filenamePrefix,
        userLabel,
      });

      if (result.success) {
        show(result.message || 'Reporte generado exitosamente.', 'success');
        onClose();
      } else {
        show(result.message || 'No fue posible generar el reporte.', 'danger');
      }
    } catch (err: any) {
      console.error('Error al exportar reporte:', err);
      show('Ocurrió un error inesperado al procesar la exportación.', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-paper-raised border border-border-soft rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-border-soft bg-paper">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-ink text-base font-serif">
                {title}
              </h2>
              <p className="text-xs text-ink-tertiary">
                {description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-border-soft/60 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de Pestañas Internas */}
        <div className="flex items-center border-b border-border-soft px-5 bg-paper/50 gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'general'
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Formato y Alcance</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('columnas')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'columnas'
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Columnas ({selectedColumnKeys.length}/{columns.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hoja')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'hoja'
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Encabezados y Hoja</span>
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-ink">
          {activeTab === 'general' && (
            <>
              {/* Alcance de la Exportación */}
              <div>
                <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-2.5">
                  Alcance de los Datos a Exportar
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAlcance('page')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      alcance === 'page'
                        ? 'border-brand bg-brand-surface text-ink ring-1 ring-brand'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs text-ink">Página actual</div>
                    <div className="text-[11px] text-ink-tertiary mt-1">
                      {pageData.length} registros cargados en pantalla
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAlcance('all')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      alcance === 'all'
                        ? 'border-brand bg-brand-surface text-ink ring-1 ring-brand'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <div className="font-bold text-xs text-ink">Total filtrado</div>
                    <div className="text-[11px] text-ink-tertiary mt-1">
                      {totalFilteredCount} registros coincidentes en base de datos
                    </div>
                  </button>
                </div>
              </div>

              {/* Formato de Salida */}
              <div>
                <label className="block text-[11px] font-bold text-ink uppercase tracking-wider mb-2.5">
                  Formato de Salida
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* PDF Oficial */}
                  <button
                    type="button"
                    onClick={() => setFormato('pdf')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      formato === 'pdf'
                        ? 'border-brand bg-brand-surface text-brand font-bold ring-1 ring-brand'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-xs">PDF Oficial</span>
                    <span className="text-[9px] uppercase tracking-wider text-brand font-semibold">
                      Impresión Foliada
                    </span>
                  </button>

                  {/* Excel */}
                  <button
                    type="button"
                    onClick={() => setFormato('excel')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      formato === 'excel'
                        ? 'border-brand bg-brand-surface text-brand font-bold ring-1 ring-brand'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <FileSpreadsheet className="h-6 w-6" />
                    <span className="text-xs">Excel (.xlsx)</span>
                    <span className="text-[9px] uppercase tracking-wider text-ink-tertiary">
                      Estructurado
                    </span>
                  </button>

                  {/* CSV */}
                  <button
                    type="button"
                    onClick={() => setFormato('csv')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      formato === 'csv'
                        ? 'border-brand bg-brand-surface text-brand font-bold ring-1 ring-brand'
                        : 'border-border-soft bg-paper hover:bg-border-soft/50 text-ink-secondary'
                    }`}
                  >
                    <FileCode className="h-6 w-6" />
                    <span className="text-xs">CSV / Texto</span>
                    <span className="text-[9px] uppercase tracking-wider text-ink-tertiary">
                      UTF-8 Universal
                    </span>
                  </button>

                  {/* Asistido por IA */}
                  <div
                    className="p-3 rounded-xl border border-dashed border-border-soft bg-paper/50 flex flex-col items-center justify-center gap-2 text-ink-tertiary relative opacity-70"
                    title="Próximamente: Resumen Ejecutivo y Auditoría predictiva asistida por IA"
                  >
                    <Sparkles className="h-6 w-6 text-brand/60" />
                    <span className="text-xs font-medium">Resumen IA</span>
                    <span className="text-[9px] uppercase tracking-wider bg-border-soft px-1.5 py-0.5 rounded font-semibold text-ink-secondary">
                      Próxima Fase
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumen de Filtros Activos */}
              <div className="p-3.5 bg-paper rounded-xl border border-border-soft space-y-1.5 text-xs">
                <div className="font-bold text-ink text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Criterios de búsqueda activos</span>
                  <span className="text-[11px] font-normal text-ink-tertiary">
                    {filters.filter(f => f.value && f.value !== 'TODOS' && f.value !== 'Todas').length} filtros aplicados
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-ink-secondary font-mono text-[11px]">
                  {filters.map((f, i) => (
                    <div key={i} className="truncate">
                      • <span className="font-semibold text-ink">{f.label}:</span> {f.value || 'Todos'}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'columnas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-ink uppercase tracking-wider">
                    Campos a incluir en el reporte
                  </h3>
                  <p className="text-[11px] text-ink-tertiary">
                    Desmarque las columnas que no necesite mostrar en la exportación
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllColumns} className="text-xs">
                    Marcar todas
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetDefaultColumns} className="text-xs">
                    Restablecer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {columns.map((col) => {
                  const isChecked = selectedColumnKeys.includes(String(col.key));
                  return (
                    <label
                      key={String(col.key)}
                      onClick={() => toggleColumn(String(col.key))}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-brand/40 bg-brand-surface/50 text-ink'
                          : 'border-border-soft bg-paper text-ink-tertiary hover:bg-border-soft/40'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-brand text-white' : 'border border-border-soft bg-paper'
                      }`}>
                        {isChecked && <Check className="h-3 w-3 stroke-3" />}
                      </div>
                      <div className="flex-1 text-xs">
                        <span className={`font-medium ${isChecked ? 'text-ink font-semibold' : 'text-ink-secondary'}`}>
                          {col.label}
                        </span>
                        {col.isNumeric && (
                          <span className="ml-2 text-[10px] text-ink-tertiary font-mono">
                            (Numérico/Bs.)
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'hoja' && (
            <div className="space-y-5">
              {/* Edición de Encabezados */}
              <div>
                <h3 className="font-bold text-xs text-ink uppercase tracking-wider mb-1">
                  Personalización de Encabezados Institucionales
                </h3>
                <p className="text-[11px] text-ink-tertiary mb-3">
                  Puede ajustar los títulos y referencias oficiales que aparecerán en la cabecera
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-secondary mb-1">
                      Título Principal del Reporte
                    </label>
                    <Input
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="Ej. REPORTE DE ASIGNACIONES DE BIENES"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-secondary mb-1">
                        Subtítulo / Unidad o Dependencia
                      </label>
                      <Input
                        value={reportSubtitle}
                        onChange={(e) => setReportSubtitle(e.target.value)}
                        placeholder="Ej. DEPARTAMENTO DE ACTIVO FIJO"
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-secondary mb-1">
                        Gestión / Período
                      </label>
                      <Input
                        value={gestion}
                        onChange={(e) => setGestion(e.target.value)}
                        placeholder="Ej. Gestión 2026"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={incluirFirmas}
                      onChange={(e) => setIncluirFirmas(e.target.checked)}
                      className="rounded border-border-soft text-brand focus:ring-brand h-4 w-4 cursor-pointer"
                    />
                    <span className="text-xs text-ink">
                      Incluir pie con lugar, fecha (*Santa Cruz de la Sierra*) y casillas para firmas reglamentarias
                    </span>
                  </label>
                </div>
              </div>

              {/* Maquetación de Hoja (Solo para PDF) */}
              <div className="pt-4 border-t border-border-soft">
                <h3 className="font-bold text-xs text-ink uppercase tracking-wider mb-1">
                  Configuración de Hoja para Impresión (PDF)
                </h3>
                <p className="text-[11px] text-ink-tertiary mb-3">
                  Formato de página física para la visualización o guardado como PDF
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-secondary mb-1">
                      Tamaño de Papel
                    </label>
                    <Select
                      value={tamanoHoja}
                      onChange={(e) => setTamanoHoja(e.target.value as PageSize)}
                      className="text-xs"
                    >
                      <option value="a4">A4 (210 x 297 mm)</option>
                      <option value="letter">Carta / Letter (216 x 279 mm)</option>
                      <option value="legal">Oficio / Legal (216 x 356 mm)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-secondary mb-1">
                      Orientación
                    </label>
                    <Select
                      value={orientacion}
                      onChange={(e) => setOrientacion(e.target.value as PageOrientation)}
                      className="text-xs"
                    >
                      <option value="landscape">Horizontal / Landscape (Recomendada)</option>
                      <option value="portrait">Vertical / Portrait</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="flex items-center justify-between p-4 border-t border-border-soft bg-paper gap-3">
          <div className="text-xs text-ink-tertiary">
            {alcance === 'page' ? (
              <span>Exportando <strong>{pageData.length}</strong> registros actuales</span>
            ) : (
              <span>Exportando lote completo de <strong>{totalFilteredCount}</strong> registros</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" onClick={onClose} disabled={isGenerating}>
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando exportación...</span>
                </>
              ) : formato === 'pdf' ? (
                <>
                  <Printer className="h-4 w-4" />
                  <span>Generar e Imprimir PDF</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Descargar Archivo</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
