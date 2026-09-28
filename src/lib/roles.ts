export const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador del Sistema',
  JEFE_ACTIVO_FIJO: 'Jefe de Activo Fijo',
  FUNCIONARIO: 'Funcionario Universitario',
  ENCARGADO_ACTIVO: 'Encargada de Inventario',
  AUDITOR_INTERNO: 'Auditor Financiero',
  RESPONSABLE_UNIDAD: 'Responsable de Unidad',
  ADMIN: 'Administrador del Sistema',
  JEFE: 'Jefe de Activo Fijo',
};

export const ROLE_OPTIONS = [
  { id: 'ADMINISTRADOR', label: 'Administrador del Sistema (Acceso Global)' },
  { id: 'JEFE_ACTIVO_FIJO', label: 'Jefe de Activo Fijo (Supervisión y Aprobación)' },
  { id: 'FUNCIONARIO', label: 'Funcionario Universitario (Custodio de Bienes)' },
  { id: 'RESPONSABLE_UNIDAD', label: 'Responsable de Unidad / Decano' },
  { id: 'ENCARGADO_ACTIVO', label: 'Encargada de Inventario / Activo Fijo' },
  { id: 'AUDITOR_INTERNO', label: 'Auditor Financiero e Interno' },
];

export function getRoleLabel(role?: string): string {
  if (!role) return 'Funcionario Universitario';
  return ROLE_LABELS[role.toUpperCase()] || role;
}
