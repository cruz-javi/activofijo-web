import { ReportColumn, ReportHeaderConfig, ReportPageConfig, ReportFilterCriterion } from './reportTypes';

export function openPrintReport<T>(
  data: T[],
  columns: ReportColumn<T>[],
  headerConfig: ReportHeaderConfig,
  pageConfig: ReportPageConfig,
  filters: ReportFilterCriterion[],
  userLabel?: string,
) {
  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Por favor habilite las ventanas emergentes (popups) para generar el reporte de impresión oficial.');
    return;
  }

  const paperSizeMap = {
    letter: 'letter',
    a4: 'a4',
    legal: 'legal',
  };

  const cssPaperSize = `${paperSizeMap[pageConfig.tamano] || 'a4'} ${pageConfig.orientacion || 'landscape'}`;

  // Sumatorias para columnas numéricas
  const sums: Record<string, number> = {};
  data.forEach((row) => {
    columns.forEach((col) => {
      if (col.isNumeric) {
        const val = (row as any)[col.key];
        if (typeof val === 'number') {
          sums[col.key as string] = (sums[col.key as string] || 0) + val;
        }
      }
    });
  });

  const now = new Date();
  const fechaEmision = now.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const horaEmision = now.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const filterBadgesHtml = filters
    .filter((f) => f.value && f.value !== 'TODOS' && f.value !== 'Todas')
    .map(
      (f) => `
      <span class="filter-item"><strong>${f.label}:</strong> ${f.value}</span>
    `,
    )
    .join(' ');

  const headersHtml = columns
    .map(
      (col) => `
      <th style="text-align: ${col.align || 'left'}; width: ${col.width || 'auto'};">
        ${col.label}
      </th>
    `,
    )
    .join('');

  const rowsHtml = data
    .map((row, index) => {
      const cells = columns
        .map((col) => {
          const rawVal = (row as any)[col.key];
          let formatted = col.format ? col.format(rawVal, row) : (rawVal ?? '-');
          if (col.isNumeric && typeof rawVal === 'number') {
            formatted = `Bs. ${rawVal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
          return `
          <td style="text-align: ${col.align || 'left'};">
            ${formatted}
          </td>
        `;
        })
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');

  const hasSums = Object.keys(sums).length > 0;
  let totalsRowHtml = '';
  if (hasSums) {
    totalsRowHtml = `
      <tr class="totals-row">
        ${columns
          .map((col, idx) => {
            if (idx === 0) {
              return `<td style="font-weight: bold; text-align: left;">TOTAL REGISTROS: ${data.length}</td>`;
            }
            const sumVal = sums[col.key as string];
            if (sumVal !== undefined) {
              return `<td style="font-weight: bold; text-align: ${col.align || 'right'};">Bs. ${sumVal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`;
            }
            return `<td></td>`;
          })
          .join('')}
      </tr>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${headerConfig.titulo} - UAGRM</title>
  <style>
    @page {
      size: ${cssPaperSize};
      margin: 12mm 15mm 15mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 8.5pt;
      line-height: 1.35;
      color: #0f172a;
      background: #ffffff;
      padding: 10px;
    }

    /* Membrete Oficial Superior */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border-bottom: 1.5pt solid #8B0000;
      padding-bottom: 8px;
    }

    .header-left {
      width: 25%;
      vertical-align: top;
      font-size: 8pt;
      font-weight: 600;
      color: #334155;
      line-height: 1.25;
    }

    .header-left .univ-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #8B0000;
      letter-spacing: 0.5px;
    }

    .header-center {
      width: 50%;
      text-align: center;
      vertical-align: middle;
    }

    .header-center h1 {
      font-size: 13pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .header-center h2 {
      font-size: 9.5pt;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
    }

    .header-center .gestion-tag {
      display: inline-block;
      font-size: 8pt;
      font-weight: 700;
      color: #8B0000;
      margin-top: 2px;
    }

    .header-right {
      width: 25%;
      text-align: right;
      vertical-align: top;
      font-size: 7.5pt;
      color: #64748B;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* Barra de Criterios y Filtros */
    .meta-bar {
      margin-bottom: 10px;
      padding: 5px 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 7.5pt;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .meta-bar .meta-title {
      font-weight: 700;
      color: #334155;
    }

    .filter-item {
      background: #ffffff;
      padding: 2px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      color: #1e293b;
    }

    /* Tabla de Datos Principal */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }

    table.data-table thead {
      display: table-header-group;
    }

    table.data-table th {
      background: #1e293b;
      color: #ffffff;
      font-weight: 700;
      font-size: 7.8pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      padding: 5px 6px;
      border: 0.5pt solid #334155;
    }

    table.data-table td {
      font-size: 8pt;
      padding: 4.5px 6px;
      border: 0.5pt solid #cbd5e1;
      vertical-align: middle;
    }

    table.data-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    table.data-table tbody tr {
      page-break-inside: avoid;
    }

    table.data-table tr.totals-row td {
      background: #f1f5f9;
      font-size: 8.5pt;
      font-weight: 800;
      border-top: 1.5pt solid #0f172a;
      border-bottom: 2pt double #0f172a;
      padding: 6px;
    }

    /* Pie Institucional y Firmas */
    .signatures-block {
      page-break-inside: avoid;
      margin-top: 28px;
      padding-top: 10px;
    }

    .location-date {
      font-size: 8pt;
      color: #334155;
      margin-bottom: 30px;
      font-style: italic;
    }

    .sign-grid {
      display: flex;
      justify-content: space-around;
      text-align: center;
      margin-top: 40px;
    }

    .sign-box {
      width: 32%;
      border-top: 1pt solid #475569;
      padding-top: 5px;
      font-size: 8pt;
      color: #1e293b;
    }

    .sign-box .sign-name {
      font-weight: 700;
    }

    .sign-box .sign-role {
      font-size: 7.5pt;
      color: #64748B;
    }

    /* Barra de Acciones (Solo en Pantalla, Oculta en Impresión) */
    .action-toolbar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 8px 16px;
      margin: -10px -10px 14px -10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .action-toolbar button {
      background: #8B0000;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
      font-size: 9pt;
      transition: background 0.2s;
    }

    .action-toolbar button:hover {
      background: #b91c1c;
    }

    @media print {
      .action-toolbar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <!-- Barra flotante de control para pantalla -->
  <div class="action-toolbar">
    <div>
      <strong>Previsualización de Reporte Oficial U.A.G.R.M.</strong> (${data.length} registros • Papel: ${pageConfig.tamano.toUpperCase()} • ${pageConfig.orientacion.toUpperCase()})
    </div>
    <div>
      <button onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
      <button onclick="window.close()" style="background: #334155; margin-left: 8px;">Cerrar</button>
    </div>
  </div>

  <!-- Encabezado Oficial -->
  <table class="header-table">
    <tr>
      <td class="header-left">
        <div class="univ-title">U.A.G.R.M.</div>
        <div>DEPARTAMENTO DE ACTIVO FIJO</div>
        <div>SANTA CRUZ - BOLIVIA</div>
      </td>
      <td class="header-center">
        <h1>${headerConfig.titulo}</h1>
        <h2>${headerConfig.subtitulo}</h2>
        <div class="gestion-tag">${headerConfig.gestion}</div>
      </td>
      <td class="header-right">
        <div>Emisión: ${fechaEmision} ${horaEmision}</div>
        <div>Folio Oficial: UAGRM-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}</div>
        ${userLabel ? `<div>Operador: ${userLabel}</div>` : ''}
      </td>
    </tr>
  </table>

  <!-- Barra de Filtros Aplicados -->
  <div class="meta-bar">
    <span class="meta-title">Criterios de Selección:</span>
    ${filterBadgesHtml || '<span>Todos los registros institucionales vigentes</span>'}
    <span style="margin-left: auto; color: #475569;"><strong>Total ítems:</strong> ${data.length}</span>
  </div>

  <!-- Tabla de Datos -->
  <table class="data-table">
    <thead>
      <tr>
        ${headersHtml}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
      ${totalsRowHtml}
    </tbody>
  </table>

  <!-- Bloque de Firmas Institucionales -->
  ${
    headerConfig.incluirFirmas
      ? `
    <div class="signatures-block">
      <div class="location-date">
        Lugar y Fecha: Santa Cruz de la Sierra, ${now.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
      <div class="sign-grid">
        <div class="sign-box">
          <div class="sign-name">RESPONSABLE DE ACTIVO FIJO</div>
          <div class="sign-role">Departamento de Activo Fijo - U.A.G.R.M.</div>
        </div>
        <div class="sign-box">
          <div class="sign-name">FISCALIZADOR / CUSTODIO</div>
          <div class="sign-role">Unidad Académica / Administrativa</div>
        </div>
        <div class="sign-box">
          <div class="sign-name">AUDITORÍA INTERNA</div>
          <div class="sign-role">Control Gubernamental y Patrimonial</div>
        </div>
      </div>
    </div>
  `
      : ''
  }

  <script>
    // Disparar diálogo de impresión automáticamente al abrir si el usuario lo desea
    window.onload = function() {
      // Dejar que renderice y luego auto-abrir print
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
