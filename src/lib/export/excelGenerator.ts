import * as XLSX from 'xlsx';
import { ReportColumn, ReportHeaderConfig, ReportFilterCriterion } from './reportTypes';
import { neutralizarFormula } from './sanitizar';

type CeldaExcel = string | number;

export interface FilasExcel {
  filas: CeldaExcel[][];
  conFiltros: boolean;
}

export function construirFilasExcel<T>(
  data: T[],
  columns: ReportColumn<T>[],
  headerConfig: ReportHeaderConfig,
  filters: ReportFilterCriterion[],
  ahora: Date = new Date(),
): FilasExcel {
  const fechaEmision = ahora.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const horaEmision = ahora.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const activeFilters = filters
    .filter((f) => f.value && f.value !== 'TODOS' && f.value !== 'Todas')
    .map((f) => `${f.label}: ${f.value}`)
    .join('  |  ');

  // Construcción de matriz de filas (AOA: Array of Arrays)
  const rows: CeldaExcel[][] = [];

  // 1. Membrete Institucional
  rows.push(['UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO']);
  rows.push([headerConfig.subtitulo ? headerConfig.subtitulo.toUpperCase() : 'DEPARTAMENTO DE ACTIVO FIJO - SANTA CRUZ, BOLIVIA']);
  rows.push([headerConfig.titulo.toUpperCase()]);
  rows.push([`${headerConfig.gestion}   •   Fecha de Emisión: ${fechaEmision} ${horaEmision}   •   Folio: UAGRM-${ahora.getFullYear()}`]);
  rows.push([]); // Fila vacía

  // 2. Filtros aplicados
  if (activeFilters) {
    rows.push([`Criterios de Filtro: ${activeFilters}`]);
    rows.push([]);
  }

  // 3. Encabezados de Columnas
  rows.push(columns.map((c) => c.label));

  // Sumatorias para columnas numéricas
  const sums: Record<string, number> = {};
  const hasNumerics = columns.some((c) => c.isNumeric);

  // 4. Filas de Datos
  data.forEach((item) => {
    const rowValues = columns.map((col): CeldaExcel => {
      const rawVal = (item as any)[col.key];

      if (col.isNumeric) {
        const num = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal) || 0;
        sums[col.key as string] = (sums[col.key as string] || 0) + num;
        return Number(num.toFixed(2));
      }

      if (col.format) {
        return col.format(rawVal, item);
      }

      return rawVal !== null && rawVal !== undefined ? String(rawVal) : '';
    });

    rows.push(rowValues);
  });

  // 5. Fila de Totales
  if (hasNumerics) {
    const totalsRow = columns.map((col, idx): CeldaExcel => {
      if (idx === 0) {
        return `TOTAL (${data.length} registros)`;
      }
      const val = sums[col.key as string];
      if (val !== undefined) {
        return Number(val.toFixed(2));
      }
      return '';
    });
    rows.push(totalsRow);
  }

  const filas = rows.map((fila) => fila.map((celda) => (typeof celda === 'string' ? neutralizarFormula(celda) : celda)));
  return { filas, conFiltros: Boolean(activeFilters) };
}

export function generateExcel<T>(
  data: T[],
  columns: ReportColumn<T>[],
  headerConfig: ReportHeaderConfig,
  filters: ReportFilterCriterion[],
  filenamePrefix: string = 'reporte_uagrm',
) {
  const now = new Date();
  const { filas: rows, conFiltros } = construirFilasExcel(data, columns, headerConfig, filters, now);

  // 6. Conversión a Hoja de Cálculo
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // 7. Configuración de Ancho de Columnas
  const colWidths = columns.map((col) => {
    let maxLen = col.label.length;
    data.slice(0, 100).forEach((row) => {
      const rawVal = (row as any)[col.key];
      const strVal = rawVal !== null && rawVal !== undefined ? String(rawVal) : '';
      if (strVal.length > maxLen) maxLen = strVal.length;
    });
    return { wch: Math.min(Math.max(maxLen + 4, 12), 45) };
  });
  ws['!cols'] = colWidths;

  // 8. Fusión de Celdas para el Encabezado Institucional
  const lastColIndex = Math.max(columns.length - 1, 0);
  const merges: XLSX.Range[] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIndex } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColIndex } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastColIndex } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: lastColIndex } },
  ];

  if (conFiltros) {
    merges.push({ s: { r: 5, c: 0 }, e: { r: 5, c: lastColIndex } });
  }

  ws['!merges'] = merges;

  // 9. Creación del Libro y Exportación Binaria Real (.xlsx)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Oficial');

  const safeTitle = headerConfig.titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const dateStr = now.toISOString().split('T')[0];
  const finalFilename = `${filenamePrefix}_${safeTitle}_${dateStr}.xlsx`;

  // Escribir archivo nativo .xlsx (ZIP PK OpenXML)
  XLSX.writeFile(wb, finalFilename, { bookType: 'xlsx', compression: true });
}
