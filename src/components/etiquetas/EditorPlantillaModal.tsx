'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Sparkles, 
  Sliders, 
  Eye, 
  Check, 
  AlertCircle,
  FileText,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Field } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { EtiquetaPatrimonial, PlantillaData, ActivoEtiquetaData } from './EtiquetaPatrimonial';

interface EditorPlantillaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  plantillaParaEditar?: PlantillaData | null;
}

const ACTIVO_MUESTRA: ActivoEtiquetaData = {
  codigo: 'UAGRM-2026-00042',
  descripcion: 'COMPUTADORA DE ESCRITORIO CORE I7 16GB RAM 512GB SSD',
  nroActivo: 42,
  ubicacion: 'FACULTAD DE COMPUTACIÓN - LAB 03',
  custodio: 'ING. CARLOS SUÁREZ',
  grupoContable: 'EQUIPOS DE COMPUTACIÓN',
  versionEtiqueta: 1,
  hashSeguridad: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  codigoVerificacionCorto: 'E3B0C44298',
  fechaEmision: new Date().toISOString(),
};

export function EditorPlantillaModal({
  isOpen,
  onClose,
  onSaveSuccess,
  plantillaParaEditar,
}: EditorPlantillaModalProps) {
  const { show } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoPapel, setTipoPapel] = useState('ROLLO_TERMICO');
  const [anchoMm, setAnchoMm] = useState<number>(70);
  const [altoMm, setAltoMm] = useState<number>(35);
  const [columnas, setColumnas] = useState<number>(1);
  const [filas, setFilas] = useState<number>(1);
  const [tipoCodigo, setTipoCodigo] = useState('HIBRIDO');
  const [esPredeterminada, setEsPredeterminada] = useState(false);

  // Configuración de elementos
  const [showLogo, setShowLogo] = useState(true);
  const [showInstitucion, setShowInstitucion] = useState(true);
  const [textoInstitucion, setTextoInstitucion] = useState('U.A.G.R.M. - ACTIVO FIJO');
  const [showCodigoTexto, setShowCodigoTexto] = useState(true);
  const [showDescripcion, setShowDescripcion] = useState(true);
  const [showCustodio, setShowCustodio] = useState(false);
  const [showOficina, setShowOficina] = useState(true);
  const [showFecha, setShowFecha] = useState(false);
  const [showHashSeguridad, setShowHashSeguridad] = useState(true);
  const [showBordeCorte, setShowBordeCorte] = useState(true);
  const [tamanoFuente, setTamanoFuente] = useState<'pequeno' | 'medio' | 'grande'>('medio');

  // Cargar datos de la plantilla a editar
  useEffect(() => {
    if (plantillaParaEditar) {
      setNombre(plantillaParaEditar.nombre || '');
      setDescripcion(plantillaParaEditar.descripcion || '');
      setTipoPapel(plantillaParaEditar.tipoPapel || 'ROLLO_TERMICO');
      setAnchoMm(plantillaParaEditar.anchoMm || 70);
      setAltoMm(plantillaParaEditar.altoMm || 35);
      setColumnas(plantillaParaEditar.columnas || 1);
      setFilas(plantillaParaEditar.filas || 1);
      setTipoCodigo(plantillaParaEditar.tipoCodigo || 'HIBRIDO');
      setEsPredeterminada(Boolean(plantillaParaEditar.esPredeterminada));

      const cfg = plantillaParaEditar.configuracion || {};
      setShowLogo(cfg.showLogo ?? true);
      setShowInstitucion(cfg.showInstitucion ?? true);
      setTextoInstitucion(cfg.textoInstitucion || 'U.A.G.R.M. - ACTIVO FIJO');
      setShowCodigoTexto(cfg.showCodigoTexto ?? true);
      setShowDescripcion(cfg.showDescripcion ?? true);
      setShowCustodio(cfg.showCustodio ?? false);
      setShowOficina(cfg.showOficina ?? true);
      setShowFecha(cfg.showFecha ?? false);
      setShowHashSeguridad(cfg.showHashSeguridad ?? true);
      setShowBordeCorte(cfg.showBordeCorte ?? true);
      setTamanoFuente(cfg.tamanoFuente || 'medio');
    } else {
      // Valores por defecto para nueva plantilla
      setNombre('');
      setDescripcion('');
      setTipoPapel('ROLLO_TERMICO');
      setAnchoMm(70);
      setAltoMm(35);
      setColumnas(1);
      setFilas(1);
      setTipoCodigo('HIBRIDO');
      setEsPredeterminada(false);
      setShowLogo(true);
      setShowInstitucion(true);
      setTextoInstitucion('U.A.G.R.M. - ACTIVO FIJO');
      setShowCodigoTexto(true);
      setShowDescripcion(true);
      setShowCustodio(false);
      setShowOficina(true);
      setShowFecha(false);
      setShowHashSeguridad(true);
      setShowBordeCorte(true);
      setTamanoFuente('medio');
    }
    setErrorMessage(null);
  }, [plantillaParaEditar, isOpen]);

  if (!isOpen) return null;

  // Plantilla en tiempo real para el previsualizador
  const plantillaPreview: PlantillaData = {
    nombre: nombre || 'Nueva Plantilla',
    tipoPapel,
    anchoMm: Number(anchoMm) || 50,
    altoMm: Number(altoMm) || 25,
    tipoCodigo,
    configuracion: {
      showLogo,
      showInstitucion,
      textoInstitucion,
      showCodigoTexto,
      showDescripcion,
      showCustodio,
      showOficina,
      showFecha,
      showHashSeguridad,
      showBordeCorte,
      tamanoFuente,
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMessage('Debe asignar un nombre a la plantilla');
      return;
    }
    if (anchoMm <= 10 || altoMm <= 10) {
      setErrorMessage('Las dimensiones físicas mínimas son 10 mm');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      tipoPapel,
      anchoMm: Number(anchoMm),
      altoMm: Number(altoMm),
      columnas: tipoPapel === 'HOJA_A4' ? Number(columnas) : 1,
      filas: tipoPapel === 'HOJA_A4' ? Number(filas) : 1,
      tipoCodigo,
      esPredeterminada,
      configuracion: {
        showLogo,
        showInstitucion,
        textoInstitucion: textoInstitucion.trim(),
        showCodigoTexto,
        showDescripcion,
        showCustodio,
        showOficina,
        showFecha,
        showHashSeguridad,
        showBordeCorte,
        tamanoFuente,
      },
    };

    try {
      const isEditing = Boolean(plantillaParaEditar?.id);
      const url = isEditing
        ? `/api/proxy/etiquetas/plantillas/${plantillaParaEditar!.id}`
        : '/api/proxy/etiquetas/plantillas';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || 'Error al guardar la plantilla';
        setErrorMessage(msg);
        show(msg, 'danger');
        return;
      }

      show(
        isEditing
          ? 'Plantilla de etiqueta actualizada con éxito'
          : 'Nueva plantilla creada exitosamente',
        'success',
      );
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Error de comunicación con el servidor';
      setErrorMessage(msg);
      show(msg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-paper border border-border rounded-lg shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-brand/10 text-brand">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {plantillaParaEditar ? 'Editar Formato de Etiqueta' : 'Diseñar Nuevo Formato de Etiqueta'}
              </h3>
              <p className="text-xs text-ink-secondary">
                Configure las dimensiones físicas, simbología y elementos institucionales impresos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-ink-tertiary hover:text-ink transition-colors p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo: Formulario (Izquierda) + Vista Previa WYSIWYG (Derecha) */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
            {/* COLUMNA IZQUIERDA: PARÁMETROS */}
            <div className="space-y-4 text-xs">
              <div className="space-y-3">
                <Field label="Nombre del Formato / Plantilla" htmlFor="nombrePlantilla">
                  <Input
                    id="nombrePlantilla"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Térmica Estándar Laboratorios 70x35"
                    required
                  />
                </Field>

                <Field label="Descripción de Uso" htmlFor="descPlantilla">
                  <Input
                    id="descPlantilla"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Uso previsto (ej. Equipos de cómputo, mobiliario)"
                  />
                </Field>
              </div>

              {/* Dimensiones Físicas */}
              <div className="p-3 rounded-lg border border-border bg-subtle/40 space-y-3">
                <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Printer className="h-3.5 w-3.5 text-brand" />
                  Dimensiones Físicas y Medio de Impresión
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo de Papel / Medio" htmlFor="tipoPapel">
                    <Select
                      id="tipoPapel"
                      value={tipoPapel}
                      onChange={(e) => setTipoPapel(e.target.value)}
                    >
                      <option value="ROLLO_TERMICO">Rollo Térmico Continuo</option>
                      <option value="HOJA_A4">Hoja A4 / Carta Adhesiva</option>
                      <option value="INDIVIDUAL">Placa / Ficha Individual</option>
                    </Select>
                  </Field>

                  <Field label="Simbología de Código" htmlFor="tipoCodigo">
                    <Select
                      id="tipoCodigo"
                      value={tipoCodigo}
                      onChange={(e) => setTipoCodigo(e.target.value)}
                    >
                      <option value="HIBRIDO">Híbrido (QR + Código de Barras)</option>
                      <option value="QR">Solo Código QR</option>
                      <option value="BARCODE_128">Solo Código de Barras (128)</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ancho (milímetros)" htmlFor="anchoMm">
                    <Input
                      id="anchoMm"
                      type="number"
                      min={15}
                      max={210}
                      step={1}
                      value={anchoMm}
                      onChange={(e) => setAnchoMm(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </Field>

                  <Field label="Alto (milímetros)" htmlFor="altoMm">
                    <Input
                      id="altoMm"
                      type="number"
                      min={10}
                      max={297}
                      step={1}
                      value={altoMm}
                      onChange={(e) => setAltoMm(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </Field>
                </div>

                {tipoPapel === 'HOJA_A4' && (
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/50">
                    <Field label="Columnas por Hoja" htmlFor="columnas">
                      <Input
                        id="columnas"
                        type="number"
                        min={1}
                        max={6}
                        value={columnas}
                        onChange={(e) => setColumnas(parseInt(e.target.value, 10) || 1)}
                      />
                    </Field>
                    <Field label="Filas por Hoja" htmlFor="filas">
                      <Input
                        id="filas"
                        type="number"
                        min={1}
                        max={15}
                        value={filas}
                        onChange={(e) => setFilas(parseInt(e.target.value, 10) || 1)}
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Elementos Visibles (Toggles) */}
              <div className="p-3 rounded-lg border border-border bg-subtle/40 space-y-2">
                <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                  Elementos Visibles en la Etiqueta
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Escudo Oficial UAGRM</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInstitucion}
                      onChange={(e) => setShowInstitucion(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Nombre Institucional</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCodigoTexto}
                      onChange={(e) => setShowCodigoTexto(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Código en Texto Grande</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDescripcion}
                      onChange={(e) => setShowDescripcion(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Descripción del Bien</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOficina}
                      onChange={(e) => setShowOficina(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Dependencia / Ubicación</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCustodio}
                      onChange={(e) => setShowCustodio(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Custodio Responsable</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHashSeguridad}
                      onChange={(e) => setShowHashSeguridad(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Hash / Sello de Seguridad</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBordeCorte}
                      onChange={(e) => setShowBordeCorte(e.target.checked)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span>Borde Guía de Corte</span>
                  </label>
                </div>

                {showInstitucion && (
                  <div className="pt-2">
                    <Field label="Texto del Membrete" htmlFor="textoInst">
                      <Input
                        id="textoInst"
                        value={textoInstitucion}
                        onChange={(e) => setTextoInstitucion(e.target.value)}
                        placeholder="U.A.G.R.M. - ACTIVO FIJO"
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Checkbox de predeterminada */}
              <label className="flex items-center gap-2.5 p-2 rounded-md bg-paper border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={esPredeterminada}
                  onChange={(e) => setEsPredeterminada(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                <div>
                  <span className="font-semibold text-ink block">Establecer como Formato Predeterminado</span>
                  <span className="text-[11px] text-ink-secondary">
                    Se utilizará automáticamente en las nuevas altas e impresiones
                  </span>
                </div>
              </label>

              {errorMessage && (
                <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: PREVISUALIZADOR WYSIWYG */}
            <div className="flex flex-col border border-border rounded-lg bg-subtle/30 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-subtle flex items-center justify-between">
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-brand" />
                  Previsualización en Vivo (Escala 1:1 Milimétrica)
                </span>
                <span className="text-[11px] font-mono text-ink-secondary">
                  {anchoMm} mm × {altoMm} mm
                </span>
              </div>

              <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-auto min-h-70 bg-paper-raised/40">
                <div className="p-4 bg-paper rounded-lg shadow-sm border border-border/80 flex flex-col items-center">
                  <EtiquetaPatrimonial
                    activo={ACTIVO_MUESTRA}
                    plantilla={plantillaPreview}
                  />
                  <span className="text-[10px] text-ink-tertiary mt-3 font-mono">
                    Tamaño físico real: {anchoMm}mm de ancho por {altoMm}mm de alto
                  </span>
                </div>
              </div>

              <div className="px-4 py-2.5 border-t border-border bg-subtle text-[11px] text-ink-secondary">
                💡 Los cambios que realice en las medidas o elementos se reflejan inmediatamente en esta vista previa.
              </div>
            </div>
          </div>

          {/* Pie de acciones */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-subtle">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Guardando Formato...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {plantillaParaEditar ? 'Guardar Cambios' : 'Crear y Guardar Plantilla'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
