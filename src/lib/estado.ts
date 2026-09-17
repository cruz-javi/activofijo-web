export type Tone = 'brand' | 'accent' | 'danger' | 'neutral';

// Estado de conservación de un activo físico.
export const ESTADO_ACTIVO_TONE: Record<string, Tone> = {
  EXCELENTE: 'brand',
  BUENO: 'brand',
  REGULAR: 'accent',
  MALO: 'danger',
  BAJA: 'neutral',
};

// Resultado de una corrida de sincronización con el sistema heredado.
export const ESTADO_SYNC_TONE: Record<string, Tone> = {
  COMPLETADA: 'brand',
  COMPLETADA_CON_ERRORES: 'accent',
  FALLIDA: 'danger',
};

// Rol de un usuario del sistema.
export const ROL_TONE: Record<string, Tone> = {
  ADMIN: 'brand',
  OFICINA: 'accent',
  CAMPO: 'neutral',
};
