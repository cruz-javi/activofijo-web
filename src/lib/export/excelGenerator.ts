import { ReportColumn, ReportHeaderConfig, ReportFilterCriterion } from './reportTypes';

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateExcel<T>(
  data: T[],
  columns: ReportColumn<T>[],
  headerConfig: ReportHeaderConfig,
  filters: ReportFilterCriterion[],
  filenamePrefix: string = 'reporte_uagrm',
) {
  const colCount = Math.max(columns.length, 6);

  // XML Spreadsheet 2003 template
  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <!-- Estilos de Encabezado Institucional -->
  <Style ss:ID="sHeaderUniv">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#8B0000"/>
  </Style>
  <Style ss:ID="sHeaderTitle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="sHeaderSub">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#475569"/>
  </Style>
  <Style ss:ID="sHeaderMeta">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <!-- Estilo de Filtros -->
  <Style ss:ID="sFilterLabel">
   <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#334155"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sFilterValue">
   <Font ss:FontName="Calibri" ss:Size="9" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <!-- Encabezados de Tabla -->
  <Style ss:ID="sTableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
  <!-- Celdas de Datos -->
  <Style ss:ID="sDataLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="sDataCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="sDataRight">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="sDataCurrency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
   <NumberFormat ss:Format="#,##0.00\ &quot;Bs.&quot;"/>
  </Style>
  <Style ss:ID="sTotalRow">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0.00\ &quot;Bs.&quot;"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Reporte">
  <Table ss:DefaultRowHeight="20">
`;

  // Anchos de columnas
  columns.forEach((col) => {
    const width = col.key === 'descripcion' ? 240 : col.key === 'codigo' ? 120 : col.key === 'custodio' ? 160 : 100;
    xml += `   <Column ss:AutoFitWidth="0" ss:Width="${width}"/>\n`;
  });

  // Fila 1: Título Universidad
  xml += `   <Row ss:Height="26">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="sHeaderUniv"><Data ss:Type="String">UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO</Data></Cell>
   </Row>\n`;

  // Fila 2: Título Reporte
  xml += `   <Row ss:Height="22">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="sHeaderTitle"><Data ss:Type="String">${escapeXml(headerConfig.titulo)}</Data></Cell>
   </Row>\n`;

  // Fila 3: Subtítulo y Gestión
  xml += `   <Row ss:Height="18">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="sHeaderSub"><Data ss:Type="String">${escapeXml(headerConfig.subtitulo)} • ${escapeXml(headerConfig.gestion)}</Data></Cell>
   </Row>\n`;

  // Fila 4: Fecha de emisión
  xml += `   <Row ss:Height="16">
    <Cell ss:MergeAcross="${colCount - 1}" ss:StyleID="sHeaderMeta"><Data ss:Type="String">Emitido el: ${escapeXml(new Date().toLocaleString('es-BO'))} • Total registros: ${data.length}</Data></Cell>
   </Row>\n`;

  // Fila 5: Espacio
  xml += `   <Row ss:Height="8"/>\n`;

  // Bloque de Filtros
  if (filters.length > 0) {
    xml += `   <Row ss:Height="18">
    <Cell ss:StyleID="sFilterLabel"><Data ss:Type="String">Filtros aplicados:</Data></Cell>
    <Cell ss:MergeAcross="${colCount - 2}" ss:StyleID="sFilterValue"><Data ss:Type="String">${escapeXml(filters.map((f) => `${f.label}: ${f.value || 'Todos'}`).join(' | '))}</Data></Cell>
   </Row>\n`;
    xml += `   <Row ss:Height="8"/>\n`;
  }

  // Fila de Encabezados de Tabla
  xml += `   <Row ss:Height="24">\n`;
  columns.forEach((col) => {
    xml += `    <Cell ss:StyleID="sTableHeader"><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  // Filas de Datos
  let sumNumeric: Record<string, number> = {};

  data.forEach((row) => {
    xml += `   <Row ss:Height="19">\n`;
    columns.forEach((col) => {
      const rawVal = (row as any)[col.key];
      const align = col.align || 'left';
      const isNumeric = col.isNumeric || false;

      if (isNumeric && typeof rawVal === 'number') {
        sumNumeric[col.key as string] = (sumNumeric[col.key as string] || 0) + rawVal;
        xml += `    <Cell ss:StyleID="sDataCurrency"><Data ss:Type="Number">${rawVal}</Data></Cell>\n`;
      } else {
        const styleId = align === 'center' ? 'sDataCenter' : align === 'right' ? 'sDataRight' : 'sDataLeft';
        const formatted = col.format ? col.format(rawVal, row) : rawVal ?? '';
        xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="String">${escapeXml(formatted)}</Data></Cell>\n`;
      }
    });
    xml += `   </Row>\n`;
  });

  // Fila de Totales si hay columnas numéricas
  const hasNumerics = Object.keys(sumNumeric).length > 0;
  if (hasNumerics) {
    xml += `   <Row ss:Height="24">\n`;
    columns.forEach((col, idx) => {
      const val = sumNumeric[col.key as string];
      if (idx === 0) {
        xml += `    <Cell ss:StyleID="sTotalRow"><Data ss:Type="String">TOTALES</Data></Cell>\n`;
      } else if (val !== undefined) {
        xml += `    <Cell ss:StyleID="sTotalRow"><Data ss:Type="Number">${val.toFixed(2)}</Data></Cell>\n`;
      } else {
        xml += `    <Cell ss:StyleID="sTotalRow"><Data ss:Type="String"></Data></Cell>\n`;
      }
    });
    xml += `   </Row>\n`;
  }

  // Cierre del Documento
  xml += `  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
   </PageSetup>
   <FitToPage/>
   <Print>
    <FitWidth>1</FitWidth>
    <FitHeight>0</FitHeight>
    <ValidPrinterInfo/>
    <PaperSizeIndex>9</PaperSizeIndex>
    <HorizontalResolution>600</HorizontalResolution>
    <VerticalResolution>600</VerticalResolution>
   </Print>
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>${filters.length > 0 ? 8 : 6}</SplitHorizontal>
   <TopRowBottomPane>${filters.length > 0 ? 8 : 6}</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  // Disparar descarga con MIME type oficial de Excel
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
