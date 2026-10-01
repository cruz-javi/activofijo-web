export interface DashboardKpis {
  totalActivos: number;
  valorTotal?: number;
  valorTotalInventario?: number;
  totalAsignados: number;
  porcentajeAsignados?: number;
  totalOperativos?: number;
  porcentajeOperativos?: number;
  porcentajeOperatividad?: number;
  totalEtiquetasVigentes: number;
}

export interface DashboardGrupoItem {
  codigo: number;
  nombre: string;
  cantidad: number;
  valor: number;
  porcentaje: number;
}

export interface DashboardEstadoItem {
  estado: string;
  cantidad: number;
  porcentaje: number;
  colorTone: 'brand' | 'accent' | 'danger' | 'neutral' | 'success';
}

export interface DashboardActivoReciente {
  id: string;
  codigo: string;
  descripcion: string;
  grupo: string;
  valor: number;
  estado: string;
  fechaAlta: string;
}

export interface DashboardResumenDto {
  kpis: DashboardKpis;
  grupos: DashboardGrupoItem[];
  estados: DashboardEstadoItem[];
  recientes: DashboardActivoReciente[];
}
