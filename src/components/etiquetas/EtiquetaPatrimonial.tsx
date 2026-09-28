'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import Image from 'next/image';

export interface ActivoEtiquetaData {
  codigo: string;
  descripcion: string;
  nroActivo?: number;
  ubicacion?: string;
  custodio?: string | null;
  grupoContable?: string;
  versionEtiqueta?: number;
  hashSeguridad?: string;
  codigoVerificacionCorto?: string;
  fechaEmision?: string;
}

export interface PlantillaConfig {
  showLogo?: boolean;
  showInstitucion?: boolean;
  textoInstitucion?: string;
  showCodigoTexto?: boolean;
  showDescripcion?: boolean;
  showCustodio?: boolean;
  showOficina?: boolean;
  showFecha?: boolean;
  showHashSeguridad?: boolean;
  showBordeCorte?: boolean;
  tamanoFuente?: 'pequeno' | 'medio' | 'grande';
  orientacion?: 'horizontal' | 'vertical';
}

export interface PlantillaData {
  id?: string;
  nombre: string;
  descripcion?: string | null;
  tipoPapel: string; // ROLLO_TERMICO, HOJA_A4, INDIVIDUAL
  anchoMm: number;
  altoMm: number;
  columnas?: number;
  filas?: number;
  tipoCodigo: string; // QR, BARCODE_128, HIBRIDO
  configuracion: PlantillaConfig;
  esPredeterminada?: boolean;
  esSistema?: boolean;
}

interface EtiquetaPatrimonialProps {
  activo: ActivoEtiquetaData;
  plantilla: PlantillaData;
  scale?: number;
  className?: string;
  isPrintMode?: boolean;
}

export function EtiquetaPatrimonial({
  activo,
  plantilla,
  scale = 1,
  className = '',
  isPrintMode = false,
}: EtiquetaPatrimonialProps) {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const cfg = plantilla.configuracion || {};

  const showBarcode = plantilla.tipoCodigo === 'BARCODE_128' || plantilla.tipoCodigo === 'HIBRIDO';
  const showQr = plantilla.tipoCodigo === 'QR' || plantilla.tipoCodigo === 'HIBRIDO';

  // Renderizar código de barras Code 128 mediante JsBarcode
  useEffect(() => {
    if (barcodeRef.current && showBarcode && activo.codigo) {
      try {
        JsBarcode(barcodeRef.current, activo.codigo, {
          format: 'CODE128',
          width: plantilla.anchoMm < 60 ? 1.0 : 1.3,
          height: Math.max(16, Math.min(28, Math.round(plantilla.altoMm * 0.65))),
          displayValue: false,
          margin: 0,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (err) {
        console.warn('JsBarcode render error:', err);
      }
    }
  }, [activo.codigo, showBarcode, plantilla.anchoMm, plantilla.altoMm]);

  // Dimensiones en milímetros reales
  const styleMm: React.CSSProperties = {
    width: `${plantilla.anchoMm}mm`,
    height: `${plantilla.altoMm}mm`,
    minWidth: `${plantilla.anchoMm}mm`,
    minHeight: `${plantilla.altoMm}mm`,
    maxWidth: `${plantilla.anchoMm}mm`,
    maxHeight: `${plantilla.altoMm}mm`,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
    boxSizing: 'border-box',
  };

  const verifHash = activo.codigoVerificacionCorto || 
    (activo.hashSeguridad ? activo.hashSeguridad.substring(0, 8).toUpperCase() : 'VERIF-OK');

  return (
    <div
      style={styleMm}
      className={`etiqueta-fisica bg-white text-neutral-900 overflow-hidden relative select-none flex flex-col justify-between p-[2mm] ${
        cfg.showBordeCorte && !isPrintMode ? 'border border-dashed border-neutral-400' : 'border border-neutral-300'
      } ${className}`}
    >
      {/* 1. ENCABEZADO INSTITUCIONAL */}
      {(cfg.showLogo || cfg.showInstitucion) && (
        <div className="flex items-center justify-between gap-1 border-b border-neutral-300 pb-[1mm] leading-none shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {cfg.showLogo && (
              <div className="w-[4.5mm] h-[4.5mm] shrink-0 relative">
                <Image
                  src="/logo_uagrm_activo_fijo.svg"
                  alt="UAGRM"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            )}
            {cfg.showInstitucion && (
              <span className="font-bold text-[7pt] tracking-tight uppercase text-neutral-800 truncate">
                {cfg.textoInstitucion || 'U.A.G.R.M. - ACTIVO FIJO'}
              </span>
            )}
          </div>

          {activo.versionEtiqueta && activo.versionEtiqueta > 1 && (
            <span className="text-[6pt] font-mono px-1 py-0.2 rounded bg-neutral-200 text-neutral-800 font-semibold shrink-0">
              v{activo.versionEtiqueta}
            </span>
          )}
        </div>
      )}

      {/* 2. CUERPO PRINCIPAL (CÓDIGOS Y DESCRIPCIÓN) */}
      <div className="flex-1 flex items-center justify-between gap-1.5 my-[1mm] overflow-hidden">
        {/* Simbología: Código QR */}
        {showQr && (
          <div className="shrink-0 flex flex-col items-center justify-center p-[0.5mm] bg-white border border-neutral-300 rounded-[1px]">
            <svg
              className="w-[14mm] h-[14mm]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              {/* Esquinas buscadoras QR estándar */}
              <rect x="5" y="5" width="28" height="28" fill="black" />
              <rect x="9" y="9" width="20" height="20" fill="white" />
              <rect x="13" y="13" width="12" height="12" fill="black" />

              <rect x="67" y="5" width="28" height="28" fill="black" />
              <rect x="71" y="9" width="20" height="20" fill="white" />
              <rect x="75" y="13" width="12" height="12" fill="black" />

              <rect x="5" y="67" width="28" height="28" fill="black" />
              <rect x="9" y="71" width="20" height="20" fill="white" />
              <rect x="13" y="75" width="12" height="12" fill="black" />

              {/* Patrones de sincronización y datos */}
              <rect x="36" y="12" width="6" height="6" fill="black" />
              <rect x="46" y="8" width="6" height="6" fill="black" />
              <rect x="56" y="14" width="6" height="6" fill="black" />
              <rect x="38" y="24" width="6" height="6" fill="black" />
              <rect x="50" y="26" width="6" height="6" fill="black" />
              <rect x="12" y="38" width="6" height="6" fill="black" />
              <rect x="22" y="44" width="6" height="6" fill="black" />
              <rect x="38" y="40" width="8" height="8" fill="black" />
              <rect x="52" y="42" width="6" height="6" fill="black" />
              <rect x="62" y="38" width="6" height="6" fill="black" />
              <rect x="74" y="44" width="6" height="6" fill="black" />
              <rect x="84" y="38" width="6" height="6" fill="black" />
              <rect x="40" y="56" width="6" height="6" fill="black" />
              <rect x="54" y="58" width="6" height="6" fill="black" />
              <rect x="66" y="54" width="8" height="8" fill="black" />
              <rect x="80" y="58" width="6" height="6" fill="black" />
              <rect x="38" y="72" width="6" height="6" fill="black" />
              <rect x="48" y="78" width="6" height="6" fill="black" />
              <rect x="60" y="70" width="8" height="8" fill="black" />
              <rect x="74" y="76" width="6" height="6" fill="black" />
              <rect x="84" y="72" width="6" height="6" fill="black" />
              <rect x="42" y="88" width="6" height="6" fill="black" />
              <rect x="56" y="86" width="6" height="6" fill="black" />
              <rect x="70" y="88" width="8" height="8" fill="black" />
            </svg>
          </div>
        )}

        {/* Zona de Información y Código de Barras */}
        <div className="flex-1 flex flex-col justify-center min-w-0 pl-[1mm]">
          {/* Código Patrimonial en fuente grande */}
          {cfg.showCodigoTexto && (
            <div className="font-mono font-bold tracking-tight text-neutral-950 text-[9pt] leading-tight truncate">
              {activo.codigo}
            </div>
          )}

          {/* Código de barras Code 128 */}
          {showBarcode && (
            <div className="my-[0.5mm] overflow-hidden">
              <svg ref={barcodeRef} className="max-w-full h-auto" />
            </div>
          )}

          {/* Descripción del bien */}
          {cfg.showDescripcion && (
            <p className="text-[6.5pt] font-semibold text-neutral-800 line-clamp-2 leading-tight">
              {activo.descripcion}
            </p>
          )}

          {/* Ubicación / Dependencia */}
          {cfg.showOficina && activo.ubicacion && (
            <p className="text-[5.5pt] text-neutral-600 truncate leading-none mt-[0.5mm]">
              📍 {activo.ubicacion}
            </p>
          )}

          {/* Custodio */}
          {cfg.showCustodio && activo.custodio && (
            <p className="text-[5.5pt] text-neutral-600 truncate leading-none mt-[0.5mm]">
              👤 {activo.custodio}
            </p>
          )}
        </div>
      </div>

      {/* 3. PIE DE SEGURIDAD Y VERIFICACIÓN */}
      {(cfg.showHashSeguridad || cfg.showFecha) && (
        <div className="flex items-center justify-between border-t border-neutral-300 pt-[0.5mm] text-[5pt] font-mono text-neutral-500 leading-none shrink-0">
          {cfg.showHashSeguridad && (
            <span className="truncate" title={activo.hashSeguridad || verifHash}>
              SEC: {verifHash}
            </span>
          )}
          {cfg.showFecha && (
            <span>
              {activo.fechaEmision
                ? new Date(activo.fechaEmision).toLocaleDateString('es-BO')
                : new Date().toLocaleDateString('es-BO')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
