'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ShieldAlert, Unlock, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FormSection } from '@/components/ui/FormSection';
import { Input } from '@/components/ui/Input';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Td, TBody, TableCard, Th, THead, Tr } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { getRoleLabel, ROLE_OPTIONS } from '@/lib/roles';
import { ROL_TONE, ESTADO_USUARIO_TONE } from '@/lib/estado';

interface UsuarioItem {
  id: string;
  email: string;
  nombreCompleto?: string;
  nombre?: string;
  cargoInstitucional?: string | null;
  codigoEmpleadoLegado?: number | null;
  rol?: string;
  roles?: string[];
  estado?: string;
  activo: boolean;
  intentosFallidos?: number;
  creadoEn?: string;
  createdAt?: string;
}

function extractErrorMessage(errData: any, fallback: string): string {
  if (Array.isArray(errData?.details) && errData.details.length > 0) {
    return errData.details.map((d: any) => d.message).join(' ');
  }
  return errData?.message || fallback;
}

export default function UsuariosPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser, loading: loadingUser, isAdmin, roleLabel } = useCurrentUser();

  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state (alta)
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargoInstitucional, setCargoInstitucional] = useState('');
  const [codigoEmpleadoLegado, setCodigoEmpleadoLegado] = useState<string>('');
  const [rol, setRol] = useState<string>('FUNCIONARIO');
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form state (edición)
  const [editingItem, setEditingItem] = useState<UsuarioItem | null>(null);
  const [editRol, setEditRol] = useState<string>('FUNCIONARIO');
  const [editActivo, setEditActivo] = useState(true);
  const [editEstado, setEditEstado] = useState<string>('ACTIVO');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [roleOptions, setRoleOptions] = useState<{ id: string; label: string }[]>(
    ROLE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))
  );

  const fetchRolesList = async () => {
    try {
      const res = await fetch('/api/proxy/roles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRoleOptions(
            data.map((r: any) => ({
              id: r.id,
              label: r.nombre || getRoleLabel(r.id),
            }))
          );
        }
      }
    } catch { }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/usuarios');
      if (res.status === 401) {
        router.push('/?login=true');
        return;
      }
      if (res.status === 403) {
        setError('No posee permisos de Administrador para gestionar usuarios.');
        setUsuarios([]);
        return;
      }
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsuarios();
      fetchRolesList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSaving(true);
    try {
      const payload: Record<string, any> = {
        nombre,
        email,
        password,
        rol,
      };
      if (cargoInstitucional.trim()) {
        payload.cargoInstitucional = cargoInstitucional.trim();
      }
      if (codigoEmpleadoLegado.trim()) {
        payload.codigoEmpleadoLegado = parseInt(codigoEmpleadoLegado.trim(), 10);
      }

      const res = await fetch('/api/proxy/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(extractErrorMessage(errData, 'Error al registrar el usuario institucional'));
      }

      setShowForm(false);
      setNombre('');
      setEmail('');
      setPassword('');
      setCargoInstitucional('');
      setCodigoEmpleadoLegado('');
      setRol('FUNCIONARIO');
      toast.show('Usuario institucional registrado correctamente.');
      await fetchUsuarios();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateSaving(false);
    }
  };

  const startEdit = (item: UsuarioItem) => {
    setShowForm(false);
    setEditingItem(item);
    setEditRol((item.roles && item.roles[0]) || item.rol || 'FUNCIONARIO');
    setEditActivo(item.activo);
    setEditEstado(item.estado || (item.activo ? 'ACTIVO' : 'INACTIVO'));
    setEditError(null);
  };

  const cancelEdit = () => setEditingItem(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/proxy/usuarios/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: editRol,
          activo: editActivo,
          estado: editEstado,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(extractErrorMessage(errData, 'Error al actualizar el usuario'));
      }

      setEditingItem(null);
      toast.show('Cambios de usuario guardados correctamente.');
      await fetchUsuarios();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDesbloquear = async (userToUnlock: UsuarioItem) => {
    try {
      const res = await fetch(`/api/proxy/usuarios/${userToUnlock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ACTIVO', activo: true }),
      });
      if (!res.ok) {
        throw new Error('No se pudo desbloquear la cuenta');
      }
      toast.show(`Cuenta de ${userToUnlock.email} desbloqueada y reactivada.`);
      await fetchUsuarios();
    } catch (err: any) {
      toast.show(err.message || 'Error al desbloquear cuenta');
    }
  };

  if (!loadingUser && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center max-w-xl mx-auto my-12 bg-paper-raised border border-border-soft rounded-2xl shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-danger-surface text-danger border border-danger/25 flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-ink tracking-tight mb-2">
          Acceso Exclusivo de Administración
        </h2>
        <p className="text-sm text-ink-secondary mb-4 leading-relaxed">
          Su rol actual (<strong className="text-ink font-semibold">{roleLabel}</strong>) no tiene autorización para gestionar usuarios, roles ni configuraciones de seguridad.
        </p>
        <p className="text-xs text-ink-tertiary mb-8">
          Si requiere permisos administrativos o modificaciones en su perfil, contacte directamente con el Administrador del Sistema.
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
        title="Gestión de Usuarios y Accesos"
        description={`${usuarios.length} cuentas institucionales registradas en el sistema`}
        action={
          <Button
            onClick={() => {
              setEditingItem(null);
              setCreateError(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </>
            )}
          </Button>
        }
      />

      {showForm && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center gap-2">
            <Badge tone="brand">Alta de Usuario Institucional</Badge>
          </div>
          {createError && (
            <div className="mb-4 rounded-lg border border-danger/25 bg-danger-surface px-4 py-3 text-sm text-danger">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <FormSection title="Datos de Identificación del Funcionario">
              <Field label="Nombre completo" htmlFor="nombre" className="md:col-span-2">
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Ing. Javier Cruz Rocha"
                  required
                  minLength={3}
                />
              </Field>
              <Field label="Cargo Institucional" htmlFor="cargoInstitucional">
                <Input
                  id="cargoInstitucional"
                  type="text"
                  value={cargoInstitucional}
                  onChange={(e) => setCargoInstitucional(e.target.value)}
                  placeholder="Ej. Encargado de Activos Fijos"
                />
              </Field>
              <Field label="Código de Funcionario Legado" htmlFor="codigoEmpleadoLegado">
                <Input
                  id="codigoEmpleadoLegado"
                  type="number"
                  value={codigoEmpleadoLegado}
                  onChange={(e) => setCodigoEmpleadoLegado(e.target.value)}
                  placeholder="Ej. 1001"
                />
              </Field>
              <Field label="Rol Institucional Asignado" htmlFor="rol" className="md:col-span-2">
                <Select id="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                  {roleOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </FormSection>

            <FormSection title="Credenciales Institucionales">
              <Field label="Correo Institucional UAGRM" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@uagrm.edu.bo"
                  required
                />
              </Field>
              <Field label="Contraseña Inicial" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                />
              </Field>
            </FormSection>

            <div>
              <Button type="submit" disabled={createSaving}>
                {createSaving ? 'Guardando…' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {editingItem && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center gap-3">
            <Badge tone={ROL_TONE[editRol] ?? 'neutral'}>{getRoleLabel(editRol)}</Badge>
            <span className="text-xs text-ink-tertiary">{editingItem.email}</span>
          </div>
          {editError && (
            <div className="mb-4 rounded-lg border border-danger/25 bg-danger-surface px-4 py-3 text-sm text-danger">
              {editError}
            </div>
          )}
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <FormSection title="Asignación de Rol y Estado de Seguridad">
              <Field label="Rol Institucional" htmlFor="edit-rol">
                <Select
                  id="edit-rol"
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Estado de Cuenta / Seguridad" htmlFor="edit-estado">
                <Select
                  id="edit-estado"
                  value={editEstado}
                  onChange={(e) => {
                    const st = e.target.value;
                    setEditEstado(st);
                    setEditActivo(st === 'ACTIVO');
                  }}
                  disabled={editingItem.id === currentUser?.id}
                >
                  <option value="ACTIVO">ACTIVO (Habilitado)</option>
                  <option value="BLOQUEADO_INTENTOS">BLOQUEADO_INTENTOS (Bloqueo Seguridad)</option>
                  <option value="SUSPENDIDO_AUDITORIA">SUSPENDIDO_AUDITORIA (Suspensión)</option>
                  <option value="INACTIVO">INACTIVO (Baja Lógica)</option>
                </Select>
              </Field>
            </FormSection>
            {editingItem.id === currentUser?.id && (
              <p className="text-xs text-ink-tertiary">
                No puede modificar el estado de su propia cuenta de Administrador.
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={editSaving}>
                {editSaving ? 'Guardando…' : 'Guardar Cambios'}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {loading ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">Cargando cuentas institucionales…</Panel>
      ) : error ? (
        <div className="rounded-lg border border-danger/25 bg-danger-surface p-4 text-sm text-danger">
          {error}
        </div>
      ) : usuarios.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          No hay usuarios registrados.
        </Panel>
      ) : (
        <TableCard>
          <THead>
            <Th>Funcionario / Cargo</Th>
            <Th>Identificador / Correo</Th>
            <Th>Rol Institucional</Th>
            <Th>Estado Seguridad</Th>
            <Th>Fecha Registro</Th>
            <Th className="text-center">Acciones</Th>
          </THead>
          <TBody>
            {usuarios.map((item) => {
              const itemRole = (item.roles && item.roles[0]) || item.rol || 'FUNCIONARIO';
              const isLocked = item.estado === 'BLOQUEADO_INTENTOS';
              const itemDate = item.creadoEn || item.createdAt;

              return (
                <Tr key={item.id}>
                  <Td className="text-ink">
                    <div className="font-semibold text-ink">
                      {item.nombreCompleto || item.nombre}
                      {item.id === currentUser?.id && (
                        <span className="ml-2 text-[10px] uppercase font-bold text-brand bg-brand-surface px-1.5 py-0.5 rounded">
                          (Su cuenta)
                        </span>
                      )}
                    </div>
                    {item.cargoInstitucional && (
                      <div className="text-xs text-ink-tertiary mt-0.5">
                        {item.cargoInstitucional}
                      </div>
                    )}
                  </Td>
                  <Td className="text-ink-secondary">
                    <div className="font-mono text-xs">{item.email}</div>
                    {item.codigoEmpleadoLegado && (
                      <div className="text-[11px] text-ink-tertiary mt-0.5">
                        Código: <strong className="font-mono text-ink-secondary">{item.codigoEmpleadoLegado}</strong>
                      </div>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={ROL_TONE[itemRole] ?? 'neutral'}>
                      {getRoleLabel(itemRole)}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={ESTADO_USUARIO_TONE[item.estado || (item.activo ? 'ACTIVO' : 'INACTIVO')] ?? 'neutral'}>
                      {item.estado || (item.activo ? 'ACTIVO' : 'INACTIVO')}
                    </Badge>
                  </Td>
                  <Td className="font-mono text-xs text-ink-tertiary">
                    {itemDate ? new Date(itemDate).toLocaleDateString('es-BO') : '-'}
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {isLocked && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDesbloquear(item)}
                          className="text-xs text-brand hover:text-brand-strong border-brand/30"
                          title="Desbloquear cuenta de usuario presencialmente"
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Desbloquear
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => startEdit(item)}>
                        Editar
                      </Button>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </TableCard>
      )}
    </>
  );
}
