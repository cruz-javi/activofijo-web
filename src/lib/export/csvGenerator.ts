import { ReportColumn, ReportHeaderConfig, ReportFilterCriterion } from './reportTypes';
import { neutralizarFormula } from './sanitizar';

function celdaCsv(valor: unknown): string {
  if (typeof valor === 'number') {
    return `"${valor}"`;
  }
  const texto = neutralizarFormula(String(valor ?? ''));
  return `"${texto.replace(/"/g, '""')}"`;
}

export function construirCsv<T>(
  data: T[],
  columns: ReportColumn<T>[],
  headerConfig: ReportHeaderConfig,
  filters: ReportFilterCriterion[],
  ahora: Date = new Date(),
): string {
  const lines: string[] = [];

  // 1. Bloque de Encabezado Institucional
  lines.push(celdaCsv('UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO'));
  lines.push(celdaCsv(headerConfig.titulo));
  lines.push(celdaCsv(`${headerConfig.subtitulo} - ${headerConfig.gestion}`));
  lines.push(celdaCsv(`Fecha de emisión: ${ahora.toLocaleString('es-BO')}`));
  lines.push('');

  // 2. Criterios de Filtrado
  if (filters.length > 0) {
    lines.push(celdaCsv('CRITERIOS DE FILTRADO APLICADOS:'));
    for (const f of filters) {
      lines.push(`${celdaCsv(`${f.label}:`)},${celdaCsv(f.value || 'Todos')}`);
    }
    lines.push('');
  }

  // 3. Fila de Encabezados de Columnas
  lines.push(columns.map((col) => celdaCsv(col.label)).join(','));

  // 4. Filas de Datos
  for (const row of data) {
    const rowValues = columns.map((col) => {
      const rawVal = (row as any)[col.key];
      return celdaCsv(col.format ? col.format(rawVal, row) : rawVal);
    });
    lines.push(rowValues.join(','));
  }

  // 5. Pie de firmas si está habilitado
  if (headerConfig.incluirFirmas) {
    lines.push('');
    lines.push(
      celdaCsv(
        `Lugar y Fecha: Santa Cruz de la Sierra, ${ahora.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      ),
    );
  }

  return '﻿' + lines.join('\r\n');
}

export function generateCSV<T>(
  data: T[],
  columns: ReportColumn<T>[],
  headerConfig: ReportHeaderConfig,
  filters: ReportFilterCriterion[],
  filenamePrefix: string = 'reporte_uagrm',
) {
  const csvContent = construirCsv(data, columns, headerConfig, filters);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
