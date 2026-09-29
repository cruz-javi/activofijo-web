export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'ai';

export type PageSize = 'letter' | 'a4' | 'legal';

export type PageOrientation = 'landscape' | 'portrait';

export interface ReportColumn<T = any> {
  key: keyof T | string;
  label: string;
  defaultVisible: boolean;
  format?: (value: any, row: T) => string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isNumeric?: boolean;
}

export interface ReportHeaderConfig {
  titulo: string;
  subtitulo: string;
  gestion: string;
  incluirFirmas: boolean;
  notas?: string;
}

export interface ReportPageConfig {
  tamano: PageSize;
  orientacion: PageOrientation;
  numerarFilas?: boolean;
}

export interface ReportFilterCriterion {
  label: string;
  value: string;
}

export interface ReportConfig<T = any> {
  formato: ReportFormat;
  alcance: 'page' | 'all';
  encabezado: ReportHeaderConfig;
  pagina: ReportPageConfig;
  columnasSeleccionadas: string[];
  columnasDisponibles: ReportColumn<T>[];
  criteriosFiltro: ReportFilterCriterion[];
}
