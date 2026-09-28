import { ReportConfig, ReportColumn } from './reportTypes';
import { generateCSV } from './csvGenerator';
import { generateExcel } from './excelGenerator';
import { openPrintReport } from './pdfPrintGenerator';

export interface ExecuteReportParams<T> {
  config: ReportConfig<T>;
  pageData: T[];
  fetchAllFilteredData?: () => Promise<T[]>;
  filenamePrefix?: string;
  userLabel?: string;
}

export async function executeReport<T>({
  config,
  pageData,
  fetchAllFilteredData,
  filenamePrefix = 'reporte_uagrm',
  userLabel,
}: ExecuteReportParams<T>): Promise<{ success: boolean; message?: string }> {
  // 1. Resolver el conjunto de datos según el alcance
  let dataToExport: T[] = pageData;

  if (config.alcance === 'all' && fetchAllFilteredData) {
    dataToExport = await fetchAllFilteredData();
  }

  if (!dataToExport || dataToExport.length === 0) {
    return {
      success: false,
      message: 'No existen registros para exportar con los criterios seleccionados.',
    };
  }

  // 2. Filtrar únicamente las columnas seleccionadas en el orden establecido
  const activeColumns: ReportColumn<T>[] = config.columnasDisponibles.filter((col) =>
    config.columnasSeleccionadas.includes(String(col.key)),
  );

  if (activeColumns.length === 0) {
    return {
      success: false,
      message: 'Debe seleccionar al menos una columna para incluir en el reporte.',
    };
  }

  // 3. Ejecutar el generador correspondiente
  switch (config.formato) {
    case 'csv':
      generateCSV(dataToExport, activeColumns, config.encabezado, config.criteriosFiltro, filenamePrefix);
      return { success: true, message: 'Reporte CSV generado exitosamente.' };

    case 'excel':
      generateExcel(dataToExport, activeColumns, config.encabezado, config.criteriosFiltro, filenamePrefix);
      return { success: true, message: 'Reporte Excel (.xlsx) estructurado generado exitosamente.' };

    case 'pdf':
      openPrintReport(
        dataToExport,
        activeColumns,
        config.encabezado,
        config.pagina,
        config.criteriosFiltro,
        userLabel,
      );
      return { success: true, message: 'Visualizador de reporte PDF institucional abierto para impresión.' };

    case 'ai':
      // Adaptador desacoplado para el futuro caso de uso de reportes asistidos por IA
      return {
        success: false,
        message: 'El módulo de generación de Resumen Ejecutivo y Diagnóstico con IA estará disponible en la siguiente fase.',
      };

    default:
      return { success: false, message: 'Formato de exportación no soportado.' };
  }
}
