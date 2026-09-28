'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Printer, 
  FilePlus, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Database, 
  Layers, 
  Lock 
} from 'lucide-react';
import { Button } from './Button';
import { AssetTag } from '../AssetTag';

interface AltaExitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAnother: () => void;
  activoData: {
    id: string;
    nroActivo: number;
    codigo: string;
    descripcion: string;
    monto: number;
    eventHash?: string;
    auditId?: string;
    payloadHash?: string;
    ubicacion?: string;
    responsable?: string;
  };
}

export function AltaExitoModal({
  isOpen,
  onClose,
  onRegisterAnother,
  activoData,
}: AltaExitoModalProps) {
  const router = useRouter();
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    if (activoData.eventHash) {
      navigator.clipboard.writeText(activoData.eventHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-paper border border-border rounded-lg shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header con tono de éxito */}
        <div className="px-6 py-5 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">¡Activo Registrado Exitosamente!</h2>
              <p className="text-xs text-white/80">
                El activo ha sido registrado e incorporado oficialmente al inventario universitario
              </p>
            </div>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/20 font-semibold">
            Nro. #{activoData.nroActivo}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Tarjeta de verificación institucional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border bg-subtle/50 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-ink-secondary mb-1">
                <Database className="h-4 w-4 text-brand" />
                <span className="text-xs font-semibold uppercase tracking-wider">Inventario Oficial</span>
              </div>
              <p className="text-xs text-ink font-mono font-bold truncate">Código: {activoData.codigo}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Registrado en base patrimonial</span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-subtle/50 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-ink-secondary mb-1">
                <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">Trazabilidad</span>
              </div>
              <p className="text-xs text-ink font-mono font-bold truncate">Alta Inicial Registrada</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Firma e historial vinculados</span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-subtle/50 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-ink-secondary mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider">Auditoría y Control</span>
              </div>
              <p className="text-xs text-ink font-mono font-bold truncate">Operación Autorizada</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Comprobante de alta emitido</span>
            </div>
          </div>

          {/* Bloque criptográfico inmutable */}
          {activoData.eventHash && (
            <div className="p-3 rounded-md bg-subtle border border-border text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary flex items-center gap-1.5 font-medium">
                  <Lock className="h-3.5 w-3.5 text-brand" />
                  Código de Seguridad de la Operación:
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[11px] text-brand hover:underline font-mono"
                >
                  {copiedHash ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar Código
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-[11px] text-ink break-all bg-paper p-2 rounded border border-border/60">
                {activoData.eventHash}
              </p>
            </div>
          )}

          {/* Vista previa de la Etiqueta Patrimonial Institucional (Printable) */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-ink-secondary tracking-wider">
              Vista Previa de Etiqueta Patrimonial Oficial (Código de Barras / QR):
            </h4>
            
            <div 
              id="printable-asset-tag"
              className="border-2 border-dashed border-border rounded-lg p-5 bg-paper shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between"
            >
              <div className="space-y-2 max-w-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-ink uppercase bg-subtle px-2 py-0.5 rounded border border-border">
                    UAGRM — ACTIVO FIJO
                  </span>
                  <span className="text-[10px] text-ink-tertiary">
                    {new Date().toLocaleDateString('es-BO')}
                  </span>
                </div>
                
                <h3 className="text-sm font-bold text-ink line-clamp-2 leading-snug">
                  {activoData.descripcion}
                </h3>
                
                <div className="flex items-center gap-2 pt-1">
                  <AssetTag code={activoData.codigo} className="text-sm py-1.5" />
                  <span className="text-xs font-mono text-ink-secondary">
                    Nro. Interno: #{activoData.nroActivo}
                  </span>
                </div>

                <div className="text-[11px] text-ink-secondary space-y-0.5 pt-1">
                  {activoData.ubicacion && (
                    <p className="truncate">📍 <span className="font-medium text-ink">{activoData.ubicacion}</span></p>
                  )}
                  {activoData.responsable && (
                    <p className="truncate">👤 Custodio: <span className="font-medium text-ink">{activoData.responsable}</span></p>
                  )}
                </div>
              </div>

              {/* QR Code Simulado SVG de Alta Definición */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-md border border-neutral-300 shadow-xs shrink-0">
                <svg
                  className="w-24 h-24"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Patrón de QR Code Institucional */}
                  <rect width="100" height="100" fill="white" />
                  {/* Esquinas buscadoras */}
                  <rect x="5" y="5" width="28" height="28" fill="black" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="black" />

                  <rect x="67" y="5" width="28" height="28" fill="black" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="black" />

                  <rect x="5" y="67" width="28" height="28" fill="black" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="black" />

                  {/* Datos binarios simulados */}
                  <rect x="38" y="10" width="6" height="6" fill="black" />
                  <rect x="48" y="14" width="6" height="6" fill="black" />
                  <rect x="56" y="8" width="6" height="6" fill="black" />
                  <rect x="38" y="24" width="6" height="6" fill="black" />
                  <rect x="48" y="28" width="6" height="6" fill="black" />
                  <rect x="10" y="38" width="6" height="6" fill="black" />
                  <rect x="22" y="44" width="6" height="6" fill="black" />
                  <rect x="38" y="40" width="8" height="8" fill="black" />
                  <rect x="50" y="44" width="6" height="6" fill="black" />
                  <rect x="60" y="38" width="8" height="8" fill="black" />
                  <rect x="72" y="44" width="6" height="6" fill="black" />
                  <rect x="84" y="38" width="8" height="8" fill="black" />
                  <rect x="40" y="56" width="6" height="6" fill="black" />
                  <rect x="54" y="58" width="8" height="8" fill="black" />
                  <rect x="66" y="56" width="6" height="6" fill="black" />
                  <rect x="80" y="58" width="6" height="6" fill="black" />
                  <rect x="38" y="72" width="6" height="6" fill="black" />
                  <rect x="48" y="78" width="8" height="8" fill="black" />
                  <rect x="60" y="72" width="6" height="6" fill="black" />
                  <rect x="74" y="78" width="6" height="6" fill="black" />
                  <rect x="84" y="72" width="8" height="8" fill="black" />
                  <rect x="42" y="88" width="6" height="6" fill="black" />
                  <rect x="56" y="86" width="6" height="6" fill="black" />
                  <rect x="70" y="88" width="8" height="8" fill="black" />
                </svg>
                <span className="text-[8px] font-mono text-neutral-600 mt-1 font-semibold uppercase tracking-wider">
                  UAGRM QR VALID
                </span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrint}
              className="w-full sm:w-auto gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir Etiqueta / Ficha
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={onRegisterAnother}
                className="w-full sm:w-auto gap-2"
              >
                <FilePlus className="h-4 w-4" />
                Registrar Otro Activo
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push('/activos')}
                className="w-full sm:w-auto gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ver en Catálogo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
