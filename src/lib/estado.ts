export type Tone = 'brand' | 'accent' | 'danger' | 'neutral';

// Estado de conservación de un activo físico.
export const ESTADO_ACTIVO_TONE: Record<string, Tone> = {
  EXCELENTE: 'brand',
  BUENO: 'brand',
  REGULAR: 'accent',
  EN_REPARACION: 'accent',
  MALO: 'danger',
  BAJA: 'neutral',
};

// Resultado de una corrida de sincronización con el sistema heredado.
export const ESTADO_SYNC_TONE: Record<string, Tone> = {
  COMPLETADA: 'brand',
  COMPLETADA_CON_ERRORES: 'accent',
  FALLIDA: 'danger',
};

// Rol institucional de un usuario del sistema (sin nombres abreviados).
export const ROL_TONE: Record<string, Tone> = {
  ADMINISTRADOR: 'brand',
  JEFE_ACTIVO_FIJO: 'accent',
  FUNCIONARIO: 'neutral',
  ENCARGADO_ACTIVO: 'accent',
  AUDITOR_INTERNO: 'brand',
  RESPONSABLE_UNIDAD: 'brand',
  ADMIN: 'brand',
  JEFE: 'accent',
};

// Estados de cuenta de usuario con auditoría de seguridad
export const ESTADO_USUARIO_TONE: Record<string, Tone> = {
  ACTIVO: 'brand',
  INACTIVO: 'neutral',
  BLOQUEADO_INTENTOS: 'danger',
  SUSPENDIDO_AUDITORIA: 'danger',
};
