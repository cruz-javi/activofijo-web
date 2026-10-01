'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  ShieldCheck, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  Users, 
  Key, 
  Lock, 
  Check, 
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Td, TBody, TableCard, Th, THead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { getRoleLabel } from '@/lib/roles';

interface PermisoItem {
  id: string;
  modulo: string;
  descripcion: string;
}

interface RoleItem {
  id: string;
  nombre: string;
  descripcion: string;
  esSistema: boolean;
  requiereDosPasos?: boolean;
  totalUsuarios: number;
  permisos: PermisoItem[];
  permisosIds: string[];
  creadoEn: string;
}

const MODULO_TITLES: Record<string, string> = {
  IDENTIDAD_ACCESO: 'Seguridad, Identidad y Accesos',
  PATRIMONIO: 'Gestión Patrimonial de Activos',
  CODIFICACION: 'Codificación e Impresión de Etiquetas',
};

export default function RolesPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser, loading: loadingUser, isAdmin, hasPermiso, roleLabel } = useCurrentUser();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permisosCatalogo, setPermisosCatalogo] = useState<Record<string, PermisoItem[]>>({});
  const [totalPermisos, setTotalPermisos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Crear Rol
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newRequiereDosPasos, setNewRequiereDosPasos] = useState(false);
  const [newSelectedPermisos, setNewSelectedPermisos] = useState<string[]>([]);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form Editar Permisos de Rol
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editRequiereDosPasos, setEditRequiereDosPasos] = useState(false);
  const [editSelectedPermisos, setEditSelectedPermisos] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchRolesData = async () => {
    setLoading(true);
    try {
      const [resRoles, resPermisos] = await Promise.all([
        fetch('/api/proxy/roles'),
        fetch('/api/proxy/permisos'),
      ]);

      if (resRoles.status === 401 || resPermisos.status === 401) {
        router.push('/');
        return;
      }
      if (resRoles.status === 403 || resPermisos.status === 403) {
        setError('Acceso denegado: solo usuarios con permiso de gestión de roles pueden consultar esta sección.');
        setRoles([]);
        return;
      }

      const rolesData = await resRoles.json();
      const permisosData = await resPermisos.json();

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermisosCatalogo(permisosData.porModulo || {});
      setTotalPermisos(permisosData.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar roles y permisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || hasPermiso('roles:gestionar')) {
      fetchRolesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUser]);

  const togglePermisoSelection = (pId: string, isCreate: boolean) => {
    if (isCreate) {
      setNewSelectedPermisos((prev) =>
        prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId],
      );
    } else {
      setEditSelectedPermisos((prev) =>
        prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId],
      );
    }
  };

  const toggleModuloPermisos = (modulo: string, isCreate: boolean) => {
    const moduloPermisos = permisosCatalogo[modulo] || [];
    const moduloIds = moduloPermisos.map((p) => p.id);

    if (isCreate) {
      const allSelected = moduloIds.every((id) => newSelectedPermisos.includes(id));
      if (allSelected) {
        setNewSelectedPermisos((prev) => prev.filter((id) => !moduloIds.includes(id)));
      } else {
        const toAdd = moduloIds.filter((id) => !newSelectedPermisos.includes(id));
        setNewSelectedPermisos((prev) => [...prev, ...toAdd]);
      }
    } else {
      const allSelected = moduloIds.every((id) => editSelectedPermisos.includes(id));
      if (allSelected) {
        setEditSelectedPermisos((prev) => prev.filter((id) => !moduloIds.includes(id)));
      } else {
        const toAdd = moduloIds.filter((id) => !editSelectedPermisos.includes(id));
        setEditSelectedPermisos((prev) => [...prev, ...toAdd]);
      }
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSaving(true);
    try {
      const res = await fetch('/api/proxy/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId.trim().toUpperCase(),
          nombre: newNombre.trim(),
          descripcion: newDescripcion.trim(),
          requiereDosPasos: newRequiereDosPasos,
          permisos: newSelectedPermisos,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear el rol');
      }

      setShowCreateModal(false);
      setNewId('');
      setNewNombre('');
      setNewDescripcion('');
      setNewRequiereDosPasos(false);
      setNewSelectedPermisos([]);
      toast.show('Nuevo rol institucional creado exitosamente.');
      await fetchRolesData();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateSaving(false);
    }
  };

  const startEditRole = (role: RoleItem) => {
    setEditingRole(role);
    setEditNombre(role.nombre);
    setEditDescripcion(role.descripcion || '');
    setEditRequiereDosPasos(Boolean(role.requiereDosPasos));
    setEditSelectedPermisos(role.permisosIds || []);
    setEditError(null);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/proxy/roles/${editingRole.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          descripcion: editDescripcion.trim(),
          requiereDosPasos: editRequiereDosPasos,
          permisos: editSelectedPermisos,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al actualizar los permisos del rol');
      }

      setEditingRole(null);
      toast.show(`Permisos del rol ${editingRole.id} actualizados correctamente.`);
      await fetchRolesData();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.esSistema) {
      toast.show('No se puede eliminar un rol primordial del sistema.');
      return;
    }
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el rol ${role.id}? Se removerá de todos los funcionarios asignados.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/proxy/roles/${role.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al eliminar el rol');
      }
      toast.show(`Rol ${role.id} eliminado correctamente.`);
      await fetchRolesData();
    } catch (err: any) {
      toast.show(err.message || 'No se pudo eliminar el rol');
    }
  };

  if (!loadingUser && !isAdmin && !hasPermiso('roles:gestionar')) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-xl mx-auto my-12 bg-paper-raised border border-border-soft rounded-2xl shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-danger-surface text-danger border border-danger/25 flex items-center justify-center mb-6">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-ink tracking-tight mb-2">
          Acceso Restringido a Gestión de Roles
        </h2>
        <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
          Su rol actual (<strong className="text-ink font-semibold">{roleLabel}</strong>) no tiene autorización para manipular roles ni permisos del sistema.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Inicio</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Roles y Permisos Dinámicos"
        description={`${roles.length} roles configurados con catálogo de ${totalPermisos} permisos granulares`}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => {
                setShowCreateModal(true);
                setCreateError(null);
              }}
              className="inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Rol</span>
            </Button>
            <Button
              variant="ghost"
              onClick={fetchRolesData}
              className="p-2.5 text-ink-secondary hover:text-ink cursor-pointer"
              title="Refrescar catálogo"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {loading && roles.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-brand" />
          Cargando catálogo de roles y permisos…
        </Panel>
      ) : error ? (
        <div className="rounded-xl border border-danger/25 bg-danger-surface p-5 text-sm text-danger flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-6">
          <TableCard>
            <THead>
              <Th>Identificador del Rol</Th>
              <Th>Nombre Oficial / Descripción</Th>
              <Th>Tipo</Th>
              <Th>Seguridad 2FA</Th>
              <Th>Funcionarios</Th>
              <Th>Permisos Asignados</Th>
              <Th className="text-center">Acciones</Th>
            </THead>
            <TBody>
              {roles.map((item) => (
                <Tr key={item.id}>
                  <Td className="font-mono text-xs font-bold text-ink whitespace-nowrap">
                    {item.id}
                  </Td>
                  <Td>
                    <div className="font-semibold text-ink text-sm">{item.nombre}</div>
                    {item.descripcion && (
                      <div className="text-xs text-ink-tertiary mt-0.5 line-clamp-1">
                        {item.descripcion}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={item.esSistema ? 'brand' : 'accent'}>
                      {item.esSistema ? 'Primordial (Sistema)' : 'Personalizado'}
                    </Badge>
                  </Td>
                  <Td>
                    {item.requiereDosPasos ? (
                      <Badge tone="success" className="text-[11px] gap-1 inline-flex items-center">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Obligatorio</span>
                      </Badge>
                    ) : (
                      <Badge tone="neutral" className="text-[11px] text-ink-tertiary">
                        Opcional
                      </Badge>
                    )}
                  </Td>
                  <Td className="font-mono text-xs text-ink-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-ink-tertiary" />
                      {item.totalUsuarios}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {item.permisos.slice(0, 3).map((p) => (
                        <span
                          key={p.id}
                          className="font-mono text-[10px] bg-paper px-1.5 py-0.5 rounded border border-border-soft text-ink-secondary"
                        >
                          {p.id}
                        </span>
                      ))}
                      {item.permisos.length > 3 && (
                        <span className="text-[10px] font-semibold text-brand px-1 py-0.5">
                          +{item.permisos.length - 3} más
                        </span>
                      )}
                      {item.permisos.length === 0 && (
                        <span className="text-xs text-ink-tertiary italic">Sin permisos</span>
                      )}
                    </div>
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEditRole(item)}
                        className="inline-flex items-center gap-1 text-xs cursor-pointer"
                        title="Modificar permisos y detalles"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Permisos</span>
                      </Button>
                      {!item.esSistema && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(item)}
                          className="text-xs text-danger hover:bg-danger-surface p-1.5 cursor-pointer"
                          title="Eliminar rol personalizado"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </TableCard>
        </div>
      )}

      {/* Modal Crear Rol */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="relative w-full max-w-2xl bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCreateModal(false)}
              type="button"
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-soft">
              <div className="h-10 w-10 rounded-xl bg-brand-surface text-brand flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base font-serif">
                  Crear Nuevo Rol Institucional
                </h3>
                <p className="text-xs text-ink-tertiary">
                  Defina el identificador único y asigne permisos por módulo
                </p>
              </div>
            </div>

            {createError && (
              <div className="mb-4 rounded-lg border border-danger/25 bg-danger-surface p-3 text-xs text-danger">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Identificador (Código Único) *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej. RESPONSABLE_LABORATORIO"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    required
                    className="font-mono text-sm uppercase"
                  />
                  <span className="text-[10px] text-ink-tertiary mt-1 block">
                    Mayúsculas sin espacios (se utilizará en validaciones)
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Nombre Descriptivo *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej. Responsable de Laboratorio de Cómputo"
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Descripción Institucional
                </label>
                <Input
                  type="text"
                  placeholder="Detalle de funciones o alcance patrimonial del rol"
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Opción de Verificación en 2 pasos (2FA) */}
              <div className="p-3.5 rounded-xl bg-paper border border-border-soft flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-surface text-brand shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <label htmlFor="new-requiere-2fa" className="text-xs font-bold text-ink cursor-pointer block">
                      Verificación en 2 pasos obligatoria
                    </label>
                    <p className="text-[11px] text-ink-tertiary">
                      Requerida desde el primer acceso para todos los usuarios asignados a este rol.
                    </p>
                  </div>
                </div>
                <input
                  id="new-requiere-2fa"
                  type="checkbox"
                  checked={newRequiereDosPasos}
                  onChange={(e) => setNewRequiereDosPasos(e.target.checked)}
                  className="h-4 w-4 rounded border-border-soft text-brand focus:ring-brand cursor-pointer shrink-0"
                />
              </div>

              {/* Matriz de Permisos */}
              <div className="pt-3 border-t border-border-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Matriz de Permisos ({newSelectedPermisos.length} seleccionados)
                  </span>
                </div>

                <div className="space-y-4">
                  {Object.entries(permisosCatalogo).map(([modulo, permisos]) => {
                    const allInModulo = permisos.every((p) => newSelectedPermisos.includes(p.id));
                    return (
                      <div key={modulo} className="p-3.5 rounded-xl bg-paper border border-border-soft">
                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border-soft">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-ink">{MODULO_TITLES[modulo] || modulo}</span>
                            <span className="text-[10px] font-mono text-ink-tertiary">{modulo}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleModuloPermisos(modulo, true)}
                            className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                          >
                            {allInModulo ? 'Desmarcar todos' : 'Marcar todos'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {permisos.map((p) => {
                            const isChecked = newSelectedPermisos.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-brand-surface/40 border-brand/40 text-ink'
                                    : 'bg-paper-raised border-border-soft text-ink-secondary hover:border-border'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermisoSelection(p.id, true)}
                                  className="mt-0.5 rounded text-brand focus:ring-brand"
                                />
                                <div className="flex flex-col">
                                  <span className="font-mono font-semibold text-[11px] text-ink">{p.id}</span>
                                  <span className="text-[10px] text-ink-tertiary leading-tight">{p.descripcion}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border-soft flex items-center justify-end gap-2.5 sticky bottom-0 bg-paper-raised py-2">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createSaving} className="cursor-pointer">
                  {createSaving ? 'Creando rol…' : 'Crear Rol'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Permisos */}
      {editingRole && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditingRole(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden p-6 sm:p-7 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingRole(null)}
              type="button"
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border-soft">
              <div className="h-10 w-10 rounded-xl bg-brand-surface text-brand flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-base font-serif">
                  Configurar Permisos: {editingRole.id}
                </h3>
                <p className="text-xs text-ink-tertiary">
                  {editingRole.nombre} {editingRole.esSistema ? '(Rol Primordial)' : ''}
                </p>
              </div>
            </div>

            {editError && (
              <div className="mb-4 rounded-lg border border-danger/25 bg-danger-surface p-3 text-xs text-danger">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Nombre del Rol
                  </label>
                  <Input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Descripción
                  </label>
                  <Input
                    type="text"
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Opción de Verificación en 2 pasos (2FA) */}
              <div className="p-3.5 rounded-xl bg-paper border border-border-soft flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-surface text-brand shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <label htmlFor="edit-requiere-2fa" className="text-xs font-bold text-ink cursor-pointer block">
                      Verificación en 2 pasos obligatoria
                    </label>
                    <p className="text-[11px] text-ink-tertiary">
                      Requerida desde el primer acceso para todos los usuarios asignados a este rol.
                    </p>
                  </div>
                </div>
                <input
                  id="edit-requiere-2fa"
                  type="checkbox"
                  checked={editRequiereDosPasos}
                  onChange={(e) => setEditRequiereDosPasos(e.target.checked)}
                  className="h-4 w-4 rounded border-border-soft text-brand focus:ring-brand cursor-pointer shrink-0"
                />
              </div>

              {/* Matriz de Permisos */}
              <div className="pt-3 border-t border-border-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">
                    Permisos Asignados ({editSelectedPermisos.length} seleccionados)
                  </span>
                </div>

                <div className="space-y-4">
                  {Object.entries(permisosCatalogo).map(([modulo, permisos]) => {
                    const allInModulo = permisos.every((p) => editSelectedPermisos.includes(p.id));
                    return (
                      <div key={modulo} className="p-3.5 rounded-xl bg-paper border border-border-soft">
                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border-soft">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-ink">{MODULO_TITLES[modulo] || modulo}</span>
                            <span className="text-[10px] font-mono text-ink-tertiary">{modulo}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleModuloPermisos(modulo, false)}
                            className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                          >
                            {allInModulo ? 'Desmarcar todos' : 'Marcar todos'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {permisos.map((p) => {
                            const isChecked = editSelectedPermisos.includes(p.id);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-brand-surface/40 border-brand/40 text-ink'
                                    : 'bg-paper-raised border-border-soft text-ink-secondary hover:border-border'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermisoSelection(p.id, false)}
                                  className="mt-0.5 rounded text-brand focus:ring-brand"
                                />
                                <div className="flex flex-col">
                                  <span className="font-mono font-semibold text-[11px] text-ink">{p.id}</span>
                                  <span className="text-[10px] text-ink-tertiary leading-tight">{p.descripcion}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border-soft flex items-center justify-end gap-2.5 sticky bottom-0 bg-paper-raised py-2">
                <Button variant="secondary" onClick={() => setEditingRole(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editSaving} className="cursor-pointer">
                  {editSaving ? 'Guardando cambios…' : 'Guardar Permisos'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
