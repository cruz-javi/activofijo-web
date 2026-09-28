import { ReportColumn, ReportHeaderConfig, ReportFilterCriterion } from './reportTypes';

export function generateCSV<T>(
  data: T[],
  columns: ReportColumn<T>[],
  headerConfig: ReportHeaderConfig,
  filters: ReportFilterCriterion[],
  filenamePrefix: string = 'reporte_uagrm',
) {
  const lines: string[] = [];

  // 1. Bloque de Encabezado Institucional
  lines.push(`"UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO"`);
  lines.push(`"${headerConfig.titulo.replace(/"/g, '""')}"`);
  lines.push(`"${headerConfig.subtitulo.replace(/"/g, '""')} - ${headerConfig.gestion}"`);
  lines.push(`"Fecha de emisión: ${new Date().toLocaleString('es-BO')}"`);
  lines.push('');

  // 2. Criterios de Filtrado
  if (filters.length > 0) {
    lines.push('"CRITERIOS DE FILTRADO APLICADOS:"');
    for (const f of filters) {
      lines.push(`"${f.label}:","${(f.value || 'Todos').replace(/"/g, '""')}"`);
    }
    lines.push('');
  }

  // 3. Fila de Encabezados de Columnas
  const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');
  lines.push(headerRow);

  // 4. Filas de Datos
  for (const row of data) {
    const rowValues = columns.map((col) => {
      const rawVal = (row as any)[col.key];
      const formatted = col.format ? col.format(rawVal, row) : (rawVal ?? '');
      return `"${String(formatted).replace(/"/g, '""')}"`;
    });
    lines.push(rowValues.join(','));
  }

  // 5. Pie de firmas si está habilitado
  if (headerConfig.incluirFirmas) {
    lines.push('');
    lines.push(`"Lugar y Fecha: Santa Cruz de la Sierra, ${new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}"`);
  }

  // 6. Generar Blob con UTF-8 BOM y disparar descarga
  const csvContent = '\uFEFF' + lines.join('\r\n');
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
