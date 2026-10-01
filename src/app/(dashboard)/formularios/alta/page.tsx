'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FilePlus, 
  ShieldCheck, 
  Car, 
  Building2, 
  UserCheck, 
  Tag, 
  DollarSign, 
  Calendar, 
  FileText, 
  RotateCcw, 
  Sparkles, 
  Info, 
  Layers, 
  Check, 
  AlertCircle,
  Truck,
  Wrench,
  Hash,
  ShieldAlert,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { TwoFactorConfirmModal } from '@/components/ui/TwoFactorConfirmModal';
import { ModalActivar2faRequerido } from '@/components/ui/ModalActivar2faRequerido';
import { AltaExitoModal } from '@/components/ui/AltaExitoModal';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useStepUp } from '@/lib/hooks/useStepUp';

interface MetadataResponse {
  grupos: Array<{ codGrupo: number; desGrupo: string }>;
  marcas: Array<{ codMarca: number; desMarca: string }>;
  modelos: Array<{ codModelo: number; codMarca: number | null; desModelo: string }>;
  unidades: Array<{ codUnidad: number; desUnidad: string; abrev?: string | null }>;
  condiciones: Array<{ codCond: number; desCond: string }>;
  estados: Array<{ codEstado: number; desEstado: string }>;
  proveedores: Array<{ codProve: number; razonSocial: string; nit?: string | null }>;
  oficinas: Array<{ codOfic: number; desDpto: string }>;
  empleados: Array<{ codEmp: number; nombres: string; apellidos: string; cargo?: string | null; codOfic?: number | null }>;
  gestiones: Array<{ codGest: number; vigente: boolean }>;
  proximoNroActivo: number;
}

export default function AltaActivosPage() {
  const router = useRouter();
  const { show } = useToast();
  const { user: currentUser, loading: loadingUser, isAdmin, hasPermiso, roleLabel } = useCurrentUser();

  // Estados de carga de metadatos
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);

  // Estados del formulario
  const [nroActivo, setNroActivo] = useState<number>(1);
  const [codGest, setCodGest] = useState<number>(new Date().getFullYear());
  const [nroIngreso, setNroIngreso] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codGrupo, setCodGrupo] = useState<number | ''>('');
  const [codOfic, setCodOfic] = useState<number | ''>('');
  const [cSenape, setCSenape] = useState('');
  const [nInt, setNInt] = useState('');

  // Datos descriptivos
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState<string>('0.00');
  const [fecAdqui, setFecAdqui] = useState<string>(new Date().toISOString().split('T')[0] ?? '');
  const [codUnidad, setCodUnidad] = useState<number | ''>('');
  const [nroSerie, setNroSerie] = useState('');
  const [fecGarantia, setFecGarantia] = useState('');
  const [codMarca, setCodMarca] = useState<number | ''>('');
  const [codModelo, setCodModelo] = useState<number | ''>('');

  // Procedencia y estado
  const [codProve, setCodProve] = useState<number | ''>('');
  const [codCond, setCodCond] = useState<number | ''>(1);
  const [codEstado, setCodEstado] = useState<number | ''>(1);
  const [recur, setRecur] = useState('RECURSOS PROPIOS (RP)');
  const [tipoIng, setTipoIng] = useState('COMPRA DIRECTA');
  const [actaRecep, setActaRecep] = useState('');

  // Custodia inicial
  const [codEmp, setCodEmp] = useState<number | ''>('');

  // Vehiculares
  const [esVehiculo, setEsVehiculo] = useState(false);
  const [placa, setPlaca] = useState('');
  const [chasis, setChasis] = useState('');
  const [motor, setMotor] = useState('');
  const [ruat, setRuat] = useState('');
  const [poliza, setPoliza] = useState('');
  const [color, setColor] = useState('');
  const [anioFabricacion, setAnioFabricacion] = useState<string>(new Date().getFullYear().toString());
  const [cilindrada, setCilindrada] = useState('');

  // Modales de Seguridad y Confirmación
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [isActivar2faModalOpen, setIsActivar2faModalOpen] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdActivoData, setCreatedActivoData] = useState<any>(null);

  // Hook de Step-Up 2FA (Ventana de gracia de 5 minutos)
  const { activo: isStepUpActive, token: stepUpToken, tiempoFormateado } = useStepUp();

  // Carga inicial de metadatos desde el backend
  useEffect(() => {
    async function loadMetadata() {
      setLoadingMetadata(true);
      try {
        const res = await fetch('/api/proxy/activos/formulario-metadata');
        if (res.ok) {
          const data: MetadataResponse = await res.json();
          setMetadata(data);
          if (data.proximoNroActivo) {
            setNroActivo(data.proximoNroActivo);
          }
          if (data.gestiones && data.gestiones.length > 0) {
            const vigente = data.gestiones.find((g) => g.vigente) || data.gestiones[0];
            if (vigente) {
              setCodGest(vigente.codGest);
            }
          }
          if (data.condiciones && data.condiciones[0]) {
            setCodCond(data.condiciones[0].codCond);
          }
          if (data.estados && data.estados[0]) {
            setCodEstado(data.estados[0].codEstado);
          }
          if (data.unidades && data.unidades[0]) {
            setCodUnidad(data.unidades[0].codUnidad);
          }
        }
      } catch (err) {
        console.warn('Error al cargar metadatos de formulario:', err);
      } finally {
        setLoadingMetadata(false);
      }
    }
    loadMetadata();
  }, []);

  // Filtrado de modelos según la marca seleccionada
  const modelosFiltrados = useMemo(() => {
    if (!metadata?.modelos) return [];
    if (!codMarca) return metadata.modelos;
    return metadata.modelos.filter((m) => m.codMarca === Number(codMarca) || !m.codMarca);
  }, [metadata?.modelos, codMarca]);

  // Si cambia el grupo contable, verificar si es vehicular
  const handleGrupoChange = (selectedGrupoId: number) => {
    setCodGrupo(selectedGrupoId);
    const grupoObj = metadata?.grupos.find((g) => g.codGrupo === selectedGrupoId);
    if (grupoObj) {
      const nombre = grupoObj.desGrupo.toUpperCase();
      if (nombre.includes('VEHIC') || nombre.includes('AUTOMOT') || nombre.includes('TRANSPORTE') || selectedGrupoId === 12400) {
        setEsVehiculo(true);
      }
    }
  };

  // Generador de código sugerido según grupo y fecha
  const handleGenerarCodigoSugerido = () => {
    const prefix = 'UAGRM';
    const anio = codGest || new Date().getFullYear();
    const correlativo = String(nroActivo).padStart(5, '0');
    const sugerido = `${prefix}-${anio}-${correlativo}`;
    setCodigo(sugerido);
    show('Código sugerido generado', 'success');
  };

  // Validaciones del formulario
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      show('Debe ingresar o generar el Código de Activo', 'danger');
      return;
    }
    if (!descripcion.trim() || descripcion.trim().length < 3) {
      show('La descripción del bien debe tener al menos 3 caracteres', 'danger');
      return;
    }
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum < 0) {
      show('El monto debe ser un número válido mayor o igual a 0', 'danger');
      return;
    }
    if (esVehiculo && !placa.trim()) {
      show('Debe ingresar la Placa de Control para activos vehiculares', 'danger');
      return;
    }

    // 1. Si el usuario no tiene 2FA configurado en su cuenta (p. ej. lo omitió en el login):
    if (currentUser && currentUser.dosFactoresActivo === false) {
      setIsActivar2faModalOpen(true);
      return;
    }

    // 2. Si ya cuenta con firma Step-Up vigente (5 minutos de gracia sin interrupciones):
    if (isStepUpActive && stepUpToken) {
      handleEjecutarAlta(stepUpToken);
      return;
    }

    // 3. De lo contrario, abrir modal de seguridad TOTP 2FA
    setTwoFactorError(null);
    setIsTwoFactorModalOpen(true);
  };

  // Confirmación y envío con firma criptográfica Step-Up 2FA
  const handleEjecutarAlta = async (tokenParaStepUp: string) => {
    setIsSubmitting(true);
    setTwoFactorError(null);

    const grupoObj = metadata?.grupos.find((g) => g.codGrupo === Number(codGrupo));
    const oficinaObj = metadata?.oficinas.find((o) => o.codOfic === Number(codOfic));
    const empleadoObj = metadata?.empleados.find((e) => e.codEmp === Number(codEmp));
    const unidadObj = metadata?.unidades.find((u) => u.codUnidad === Number(codUnidad));
    const estadoObj = metadata?.estados.find((e) => e.codEstado === Number(codEstado));
    const condicionObj = metadata?.condiciones.find((c) => c.codCond === Number(codCond));

    const payload = {
      codigo: codigo.trim().toUpperCase(),
      descripcion: descripcion.trim(),
      monto: parseFloat(monto) || 0,
      valor: parseFloat(monto) || 0,
      nroActivo: Number(nroActivo) || undefined,
      codGest: Number(codGest) || undefined,
      nroIngreso: nroIngreso.trim() || undefined,
      codGrupo: codGrupo ? Number(codGrupo) : undefined,
      grupoContable: grupoObj?.desGrupo || 'GENERAL',
      codOfic: codOfic ? Number(codOfic) : undefined,
      ubicacion: oficinaObj?.desDpto || 'ALMACÉN CENTRAL',
      cSenape: cSenape.trim() || undefined,
      nInt: nInt.trim() || undefined,
      nroSerie: nroSerie.trim() || undefined,
      fecAdqui: fecAdqui || undefined,
      fecGarantia: fecGarantia || undefined,
      codUnidad: codUnidad ? Number(codUnidad) : undefined,
      unidad: unidadObj?.desUnidad || 'PIEZA',
      codMarca: codMarca ? Number(codMarca) : undefined,
      codModelo: codModelo ? Number(codModelo) : undefined,
      codProve: codProve ? Number(codProve) : undefined,
      codCond: codCond ? Number(codCond) : undefined,
      condicion: condicionObj?.desCond || 'BUENO',
      codEstado: codEstado ? Number(codEstado) : undefined,
      estado: estadoObj?.desEstado || 'EN USO',
      recur: recur.trim() || undefined,
      tipoIng: tipoIng.trim() || undefined,
      actaRecep: actaRecep.trim() || undefined,
      codEmp: codEmp ? Number(codEmp) : undefined,
      asignadoA: empleadoObj ? `${empleadoObj.nombres} ${empleadoObj.apellidos}` : undefined,
      esVehiculo,
      placa: esVehiculo ? placa.trim().toUpperCase() : undefined,
      chasis: esVehiculo ? chasis.trim() : undefined,
      motor: esVehiculo ? motor.trim() : undefined,
      ruat: esVehiculo ? ruat.trim() : undefined,
      poliza: esVehiculo ? poliza.trim() : undefined,
      color: esVehiculo ? color.trim() : undefined,
      anioFabricacion: esVehiculo && anioFabricacion ? parseInt(anioFabricacion, 10) : undefined,
      cilindrada: esVehiculo ? cilindrada.trim() : undefined,
      stepUpToken: tokenParaStepUp,
    };

    try {
      const res = await fetch('/api/proxy/activos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.message || 'Error al procesar el registro de activo';
        setTwoFactorError(errorMsg);
        show(errorMsg, 'danger');
        return;
      }

      // Éxito: Cerrar modal 2FA y abrir modal de éxito con QR
      setIsTwoFactorModalOpen(false);
      setCreatedActivoData({
        ...data.data,
        ubicacion: oficinaObj?.desDpto,
        responsable: empleadoObj ? `${empleadoObj.nombres} ${empleadoObj.apellidos}` : undefined,
      });
      setIsSuccessModalOpen(true);
      show('¡Activo registrado y firmado con éxito!', 'success');
    } catch (err: any) {
      setTwoFactorError(err?.message || 'Error de conexión con el servidor');
      show('Error de comunicación con el servidor institucional', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limpiar y resetear formulario para un nuevo registro
  const handleLimpiarFormulario = () => {
    setCodigo('');
    setDescripcion('');
    setMonto('0.00');
    setNroSerie('');
    setCSenape('');
    setNInt('');
    setNroIngreso('');
    setActaRecep('');
    setPlaca('');
    setChasis('');
    setMotor('');
    setRuat('');
    setPoliza('');
    setColor('');
    setCilindrada('');
    setEsVehiculo(false);
    if (metadata?.proximoNroActivo) {
      setNroActivo(metadata.proximoNroActivo + 1);
    }
    setIsSuccessModalOpen(false);
  };

  if (!loadingUser && !isAdmin && !hasPermiso('activos:crear')) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-xl mx-auto my-12 bg-paper-raised border border-border-soft rounded-2xl shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-danger-surface text-danger border border-danger/25 flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-ink tracking-tight mb-2">
          Acceso Restringido a Registro de Activos
        </h2>
        <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
          Su rol actual (<strong className="text-ink font-semibold">{roleLabel}</strong>) no tiene autorización para dar de alta nuevos bienes patrimoniales.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Inicio</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <PageHeader
        title="Alta de Activos"
        description="Formulario oficial para el registro e incorporación de nuevos bienes patrimoniales al inventario universitario."
      />

      <form onSubmit={handlePreSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* SECCIÓN 1: IDENTIFICACIÓN Y CLASIFICACIÓN */}
        {/* ========================================================================= */}
        <div className="bg-paper border border-border rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="p-1.5 rounded bg-brand/10 text-brand">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">1. Identificación y Clasificación</h3>
              <p className="text-xs text-ink-secondary">Código del activo, gestión fiscal y asignación de dependencia</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Nro. Activo Correlativo (Interno)" htmlFor="nroActivo">
              <div className="relative">
                <Input
                  id="nroActivo"
                  type="number"
                  value={nroActivo}
                  onChange={(e) => setNroActivo(parseInt(e.target.value, 10) || 1)}
                  className="font-mono font-bold text-brand"
                  required
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-tertiary">
                  Auto
                </span>
              </div>
            </Field>

            <Field label="Gestión Fiscal" htmlFor="codGest">
              <Select
                id="codGest"
                value={codGest}
                onChange={(e) => setCodGest(parseInt(e.target.value, 10))}
              >
                {metadata?.gestiones && metadata.gestiones.length > 0 ? (
                  metadata.gestiones.map((g) => (
                    <option key={g.codGest} value={g.codGest}>
                      Gestión {g.codGest} {g.vigente ? '(Vigente)' : ''}
                    </option>
                  ))
                ) : (
                  <option value={new Date().getFullYear()}>Gestión {new Date().getFullYear()}</option>
                )}
              </Select>
            </Field>

            <Field label="Nro. Comprobante / Ingreso" htmlFor="nroIngreso">
              <Input
                id="nroIngreso"
                placeholder="Ej. ING-2026-0042"
                value={nroIngreso}
                onChange={(e) => setNroIngreso(e.target.value)}
              />
            </Field>

            <Field label="Ubicación / Dependencia (Cod. Lugar)" htmlFor="codOfic">
              <Select
                id="codOfic"
                value={codOfic}
                onChange={(e) => setCodOfic(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- Seleccione Oficina / Depto --</option>
                {metadata?.oficinas?.map((o) => (
                  <option key={o.codOfic} value={o.codOfic}>
                    {o.desDpto}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="sm:col-span-2">
              <Field label="Código Oficial de Activo (Placa / Etiqueta)" htmlFor="codigo">
                <div className="flex gap-2">
                  <Input
                    id="codigo"
                    placeholder="Ej. UAGRM-2026-00104"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="font-mono font-bold tracking-wider uppercase text-brand"
                    required
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGenerarCodigoSugerido}
                    className="shrink-0 gap-1.5 text-xs"
                    title="Generar código sugerido con correlativo"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-brand" />
                    Sugerir
                  </Button>
                </div>
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Grupo Contable / Clasificación" htmlFor="codGrupo">
                <Select
                  id="codGrupo"
                  value={codGrupo}
                  onChange={(e) => handleGrupoChange(Number(e.target.value))}
                >
                  <option value="">-- Seleccionar Grupo Contable --</option>
                  {metadata?.grupos?.map((g) => (
                    <option key={g.codGrupo} value={g.codGrupo}>
                      {g.desGrupo}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Field label="Código SENAPE (Serv. Patrimonio del Estado)" htmlFor="cSenape">
              <Input
                id="cSenape"
                placeholder="Código asignado por SENAPE (si aplica)"
                value={cSenape}
                onChange={(e) => setCSenape(e.target.value)}
              />
            </Field>

            <Field label="Nro. Interno (N.Int.)" htmlFor="nInt">
              <Input
                id="nInt"
                placeholder="Identificador auxiliar interno del departamento"
                value={nInt}
                onChange={(e) => setNInt(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: DESCRIPCIÓN Y ESPECIFICACIONES TÉCNICAS */}
        {/* ========================================================================= */}
        <div className="bg-paper border border-border rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="p-1.5 rounded bg-brand/10 text-brand">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">2. Especificaciones Técnicas y Descriptivas</h3>
              <p className="text-xs text-ink-secondary">Detalle pormenorizado para individualización del bien</p>
            </div>
          </div>

          <Field label="Descripción Completa del Bien Patrimonial" htmlFor="descripcion">
            <textarea
              id="descripcion"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Computadora portátil de alto rendimiento, procesador Core i7 13va gen, 32GB RAM, 1TB SSD NVMe, pantalla 15.6 pulgadas..."
              className="w-full rounded-sm border border-border bg-paper p-3 text-sm text-ink placeholder:text-ink-muted outline-none transition-colors duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15"
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Marca" htmlFor="codMarca">
              <Select
                id="codMarca"
                value={codMarca}
                onChange={(e) => {
                  setCodMarca(e.target.value ? Number(e.target.value) : '');
                  setCodModelo('');
                }}
              >
                <option value="">-- Seleccionar Marca --</option>
                {metadata?.marcas?.map((m) => (
                  <option key={m.codMarca} value={m.codMarca}>
                    {m.desMarca}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Modelo" htmlFor="codModelo">
              <Select
                id="codModelo"
                value={codModelo}
                onChange={(e) => setCodModelo(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- Seleccionar Modelo --</option>
                {modelosFiltrados.map((mod) => (
                  <option key={mod.codModelo} value={mod.codModelo}>
                    {mod.desModelo}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Número de Serie de Fábrica" htmlFor="nroSerie">
              <Input
                id="nroSerie"
                placeholder="Ej. SN-89412048X"
                value={nroSerie}
                onChange={(e) => setNroSerie(e.target.value)}
              />
            </Field>

            <Field label="Unidad de Medida" htmlFor="codUnidad">
              <Select
                id="codUnidad"
                value={codUnidad}
                onChange={(e) => setCodUnidad(e.target.value ? Number(e.target.value) : '')}
              >
                {metadata?.unidades?.map((u) => (
                  <option key={u.codUnidad} value={u.codUnidad}>
                    {u.desUnidad} {u.abrev ? `(${u.abrev})` : ''}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Field label="Condición Física del Bien" htmlFor="codCond">
              <Select
                id="codCond"
                value={codCond}
                onChange={(e) => setCodCond(Number(e.target.value))}
              >
                {metadata?.condiciones?.map((c) => (
                  <option key={c.codCond} value={c.codCond}>
                    {c.desCond}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Estado Operativo Patrimonial" htmlFor="codEstado">
              <Select
                id="codEstado"
                value={codEstado}
                onChange={(e) => setCodEstado(Number(e.target.value))}
              >
                {metadata?.estados?.map((est) => (
                  <option key={est.codEstado} value={est.codEstado}>
                    {est.desEstado}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 3: VALORES ECONÓMICOS, PROCEDENCIA Y GARANTÍA */}
        {/* ========================================================================= */}
        <div className="bg-paper border border-border rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="p-1.5 rounded bg-brand/10 text-brand">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">3. Valores Económicos, Procedencia y Respaldo Legal</h3>
              <p className="text-xs text-ink-secondary">Datos de compra, comprobantes, garantías y fuente de financiamiento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Monto de Adquisición (BOB)" htmlFor="monto">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-secondary">
                  Bs.
                </span>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="pl-9 font-mono font-bold"
                  required
                />
              </div>
            </Field>

            <Field label="Fecha de Adquisición" htmlFor="fecAdqui">
              <Input
                id="fecAdqui"
                type="date"
                value={fecAdqui}
                onChange={(e) => setFecAdqui(e.target.value)}
                required
              />
            </Field>

            <Field label="Fecha Vencimiento Garantía" htmlFor="fecGarantia">
              <Input
                id="fecGarantia"
                type="date"
                value={fecGarantia}
                onChange={(e) => setFecGarantia(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <Field label="Proveedor / Contratista" htmlFor="codProve">
              <Select
                id="codProve"
                value={codProve}
                onChange={(e) => setCodProve(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- Seleccionar Proveedor --</option>
                {metadata?.proveedores?.map((p) => (
                  <option key={p.codProve} value={p.codProve}>
                    {p.razonSocial} {p.nit ? `(NIT: ${p.nit})` : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Tipo de Ingreso" htmlFor="tipoIng">
              <Select
                id="tipoIng"
                value={tipoIng}
                onChange={(e) => setTipoIng(e.target.value)}
              >
                <option value="COMPRA DIRECTA">COMPRA DIRECTA</option>
                <option value="LICITACIÓN PÚBLICA">LICITACIÓN PÚBLICA</option>
                <option value="DONACIÓN">DONACIÓN</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA INTERNA</option>
                <option value="REVALÚO">REVALÚO TÉCNICO</option>
              </Select>
            </Field>

            <Field label="Fuente de Financiamiento (Recur.)" htmlFor="recur">
              <Select
                id="recur"
                value={recur}
                onChange={(e) => setRecur(e.target.value)}
              >
                <option value="RECURSOS PROPIOS (RP)">RECURSOS PROPIOS (RP)</option>
                <option value="TESORO GENERAL DE LA NACIÓN (TGN)">TESORO GENERAL DE LA NACIÓN (TGN)</option>
                <option value="IMPUESTO DIRECTO A LOS HIDROCARBUROS (IDH)">IDH (FONDOS UNIVERSITARIOS)</option>
                <option value="DONACIÓN / COOPERACIÓN EXTERNA">COOPERACIÓN EXTERNA</option>
              </Select>
            </Field>

            <Field label="Acta de Recepción / Conforme" htmlFor="actaRecep">
              <Input
                id="actaRecep"
                placeholder="Ej. ACTA-REC-2026-104"
                value={actaRecep}
                onChange={(e) => setActaRecep(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 4: CUSTODIO Y ASIGNACIÓN INICIAL */}
        {/* ========================================================================= */}
        <div className="bg-paper border border-border rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border">
            <div className="p-1.5 rounded bg-brand/10 text-brand">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">4. Asignación y Custodia Institucional Inicial</h3>
              <p className="text-xs text-ink-secondary">Funcionario responsable que asume la salvaguarda inicial del bien</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Funcionario Responsable (Asignado a)" htmlFor="codEmp">
              <Select
                id="codEmp"
                value={codEmp}
                onChange={(e) => setCodEmp(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- Sin custodio asignado (En Depósito Central) --</option>
                {metadata?.empleados?.map((emp) => (
                  <option key={emp.codEmp} value={emp.codEmp}>
                    {emp.apellidos}, {emp.nombres} {emp.cargo ? `— ${emp.cargo}` : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="flex items-center gap-3 p-3 bg-subtle rounded-md border border-border text-xs text-ink-secondary">
              <Info className="h-5 w-5 text-brand shrink-0" />
              <span>
                Al asignar un custodio, se registrará el acta formal de asignación y entrega del activo al funcionario seleccionado.
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 5: ESPECIFICACIONES VEHICULARES (CONDICIONAL) */}
        {/* ========================================================================= */}
        <div className="bg-paper border border-border rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">5. Datos Específicos para Vehículos y Automotores</h3>
                <p className="text-xs text-ink-secondary">Información requerida para motorizados, vehículos institucionales y maquinaria rodante</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={esVehiculo}
                onChange={(e) => setEsVehiculo(e.target.checked)}
                className="rounded border-border text-brand focus:ring-brand h-4 w-4"
              />
              <span>¿Es activo vehicular?</span>
            </label>
          </div>

          {esVehiculo ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Placa de Control" htmlFor="placa">
                  <Input
                    id="placa"
                    placeholder="Ej. 3482-KPT"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="font-mono font-bold uppercase text-purple-700 dark:text-purple-400"
                    required={esVehiculo}
                  />
                </Field>

                <Field label="Número de Chasis / VIN" htmlFor="chasis">
                  <Input
                    id="chasis"
                    placeholder="Ej. 9BWAA05U0DP004812"
                    value={chasis}
                    onChange={(e) => setChasis(e.target.value)}
                    className="font-mono text-xs"
                  />
                </Field>

                <Field label="Número de Motor" htmlFor="motor">
                  <Input
                    id="motor"
                    placeholder="Ej. 4G63-T29481"
                    value={motor}
                    onChange={(e) => setMotor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </Field>

                <Field label="Nro. RUAT Municipal" htmlFor="ruat">
                  <Input
                    id="ruat"
                    placeholder="Ej. 1829401"
                    value={ruat}
                    onChange={(e) => setRuat(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <Field label="Póliza de Importación / Seguro" htmlFor="poliza">
                  <Input
                    id="poliza"
                    placeholder="Ej. POL-2026-9041"
                    value={poliza}
                    onChange={(e) => setPoliza(e.target.value)}
                  />
                </Field>

                <Field label="Color Predominante" htmlFor="color">
                  <Input
                    id="color"
                    placeholder="Ej. Blanco / Azul Institucional"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </Field>

                <Field label="Año de Fabricación" htmlFor="anioFabricacion">
                  <Input
                    id="anioFabricacion"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={anioFabricacion}
                    onChange={(e) => setAnioFabricacion(e.target.value)}
                  />
                </Field>

                <Field label="Cilindrada" htmlFor="cilindrada">
                  <Input
                    id="cilindrada"
                    placeholder="Ej. 2400 cc"
                    value={cilindrada}
                    onChange={(e) => setCilindrada(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted italic py-1">
              La sección vehicular se encuentra inactiva. Marque la casilla superior si este bien requiere placa, motor y chasis.
            </p>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BARRA DE ACCIONES INFERIOR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-paper border border-border rounded-lg shadow-sm">
          <Button
            type="button"
            variant="secondary"
            onClick={handleLimpiarFormulario}
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar Formulario
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isStepUpActive && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <Clock className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
                <span>Firma 2FA Activa ({tiempoFormateado})</span>
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/activos')}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="gap-2 px-6 shadow-sm cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              {isStepUpActive ? 'Firmar y Registrar Activo' : 'Verificar 2FA y Dar de Alta'}
            </Button>
          </div>
        </div>
      </form>

      {/* Modal de Firma de Seguridad TOTP 2FA (Step-up Security) */}
      <TwoFactorConfirmModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        onConfirm={handleEjecutarAlta}
        isLoading={isSubmitting}
        errorMessage={twoFactorError}
        assetSummary={{
          codigo: codigo || 'SIN CÓDIGO',
          descripcion: descripcion || 'Sin descripción',
          monto: parseFloat(monto) || 0,
          ubicacion: metadata?.oficinas?.find((o) => o.codOfic === Number(codOfic))?.desDpto,
          responsable: metadata?.empleados?.find((e) => e.codEmp === Number(codEmp))
            ? `${metadata.empleados.find((e) => e.codEmp === Number(codEmp))?.nombres} ${metadata.empleados.find((e) => e.codEmp === Number(codEmp))?.apellidos}`
            : undefined,
        }}
      />

      {/* Modal de Activación de 2FA requerida si el usuario omitió en el login */}
      <ModalActivar2faRequerido
        isOpen={isActivar2faModalOpen}
        onClose={() => setIsActivar2faModalOpen(false)}
        onSuccess={() => {
          setIsActivar2faModalOpen(false);
          setIsTwoFactorModalOpen(true);
        }}
      />

      {/* Modal de Éxito con Etiqueta QR imprimible */}
      {createdActivoData && (
        <AltaExitoModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          onRegisterAnother={handleLimpiarFormulario}
          activoData={createdActivoData}
        />
      )}
    </div>
  );
}
