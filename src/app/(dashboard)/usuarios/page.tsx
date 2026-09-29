'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, ShieldAlert, Unlock, ArrowLeft, Check, Edit3, KeyRound, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { FilterBar } from '@/components/ui/FilterBar';
import { FilterField } from '@/components/ui/FilterField';
import { FormSection } from '@/components/ui/FormSection';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { LoadingPanel } from '@/components/ui/LoadingPanel';
import { Panel } from '@/components/ui/Panel';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
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
  twoFactorHabilitado?: boolean;
  creadoEn?: string;
  createdAt?: string;
}

const PAGE_SIZE = 10;
const FILTRO_TODOS = 'TODOS';

const ESTADOS_FILTRO = [
  { id: 'ACTIVO', label: 'Activo' },
  { id: 'BLOQUEADO_INTENTOS', label: 'Bloqueado por intentos' },
  { id: 'SUSPENDIDO_AUDITORIA', label: 'Suspendido por auditoría' },
  { id: 'INACTIVO', label: 'Inactivo' },
];

function obtenerRolUsuario(item: UsuarioItem): string {
  return (item.roles && item.roles[0]) || item.rol || 'FUNCIONARIO';
}

function obtenerEstadoUsuario(item: UsuarioItem): string {
  return item.estado || (item.activo ? 'ACTIVO' : 'INACTIVO');
}

function coincideBusqueda(item: UsuarioItem, termino: string): boolean {
  const texto = [
    item.nombreCompleto,
    item.nombre,
    item.email,
    item.cargoInstitucional,
    item.codigoEmpleadoLegado?.toString(),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return texto.includes(termino.toLowerCase());
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
  const [page, setPage] = useState(1);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState(FILTRO_TODOS);
  const [filtroEstado, setFiltroEstado] = useState(FILTRO_TODOS);
  const [filtroDosPasos, setFiltroDosPasos] = useState(FILTRO_TODOS);

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
    } catch {}
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

  const [reinicioPendienteId, setReinicioPendienteId] = useState<string | null>(null);

  const handleReiniciarDosFactores = async (usuario: UsuarioItem) => {
    if (reinicioPendienteId !== usuario.id) {
      setReinicioPendienteId(usuario.id);
      return;
    }
    setReinicioPendienteId(null);
    try {
      const res = await fetch(`/api/proxy/usuarios/${usuario.id}/reiniciar-2fa`, { method: 'POST' });
      if (!res.ok) {
        throw new Error('No se pudo restablecer la verificación en dos pasos');
      }
      toast.show(`Verificación en dos pasos de ${usuario.email} restablecida.`);
      await fetchUsuarios();
    } catch (err: unknown) {
      toast.show(err instanceof Error ? err.message : 'Error al restablecer la verificación');
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

  const usuariosFiltrados = usuarios.filter(
    (item) =>
      (!busqueda.trim() || coincideBusqueda(item, busqueda.trim())) &&
      (filtroRol === FILTRO_TODOS || obtenerRolUsuario(item) === filtroRol) &&
      (filtroEstado === FILTRO_TODOS || obtenerEstadoUsuario(item) === filtroEstado) &&
      (filtroDosPasos === FILTRO_TODOS ||
        Boolean(item.twoFactorHabilitado) === (filtroDosPasos === 'ACTIVA')),
  );
  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    filtroRol !== FILTRO_TODOS ||
    filtroEstado !== FILTRO_TODOS ||
    filtroDosPasos !== FILTRO_TODOS;

  const cambiarFiltro = (setter: (valor: string) => void) => (valor: string) => {
    setter(valor);
    setPage(1);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroRol(FILTRO_TODOS);
    setFiltroEstado(FILTRO_TODOS);
    setFiltroDosPasos(FILTRO_TODOS);
    setPage(1);
  };

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(page, totalPaginas);
  const usuariosPagina = usuariosFiltrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

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
        description={
          hayFiltrosActivos
            ? `${usuariosFiltrados.length} de ${usuarios.length} cuentas institucionales`
            : `${usuarios.length} cuentas institucionales registradas en el sistema`
        }
        action={
          <div className="flex items-center gap-2.5">
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
            <Button
              variant="ghost"
              onClick={fetchUsuarios}
              className="p-2.5 text-ink-secondary hover:text-ink cursor-pointer"
              title="Refrescar cuentas"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
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

      <FilterBar>
        <FilterField label="Búsqueda por nombre / correo / cargo" className="lg:col-span-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ej. Javier Cruz, admin@uagrm.edu.bo, 1001..."
              value={busqueda}
              onChange={(e) => cambiarFiltro(setBusqueda)(e.target.value)}
              className="pl-9 text-sm"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          </div>
        </FilterField>
        <FilterField label="Rol">
          <Select
            value={filtroRol}
            onChange={(e) => cambiarFiltro(setFiltroRol)(e.target.value)}
            className="text-sm"
          >
            <option value={FILTRO_TODOS}>Todos los roles</option>
            {roleOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Estado">
          <Select
            value={filtroEstado}
            onChange={(e) => cambiarFiltro(setFiltroEstado)(e.target.value)}
            className="text-sm"
          >
            <option value={FILTRO_TODOS}>Todos los estados</option>
            {ESTADOS_FILTRO.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Verificación en dos pasos">
          <Select
            value={filtroDosPasos}
            onChange={(e) => cambiarFiltro(setFiltroDosPasos)(e.target.value)}
            className="text-sm"
          >
            <option value={FILTRO_TODOS}>Todas</option>
            <option value="ACTIVA">Activa</option>
            <option value="NO_ACTIVADA">No activada</option>
          </Select>
        </FilterField>
      </FilterBar>

      {loading && usuarios.length === 0 ? (
        <LoadingPanel message="Cargando cuentas institucionales…" />
      ) : error ? (
        <div className="rounded-lg border border-danger/25 bg-danger-surface p-4 text-sm text-danger">
          {error}
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          <p>
            {hayFiltrosActivos
              ? 'Ninguna cuenta coincide con los filtros seleccionados.'
              : 'No hay usuarios registrados.'}
          </p>
          {hayFiltrosActivos && (
            <Button variant="secondary" onClick={limpiarFiltros} className="mt-4">
              Limpiar filtros
            </Button>
          )}
        </Panel>
      ) : (
        <TableCard
          footer={
            <Pagination
              page={paginaActual}
              pageSize={PAGE_SIZE}
              total={usuariosFiltrados.length}
              onPageChange={setPage}
            />
          }
        >
          <THead>
            <Th>Funcionario / Cargo</Th>
            <Th>Identificador / Correo</Th>
            <Th>Rol Institucional</Th>
            <Th>Estado Seguridad</Th>
            <Th>Fecha Registro</Th>
            <Th className="text-center">Acciones</Th>
          </THead>
          <TBody>
            {usuariosPagina.map((item) => {
              const itemRole = obtenerRolUsuario(item);
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
                    <Badge tone={ESTADO_USUARIO_TONE[obtenerEstadoUsuario(item)] ?? 'neutral'}>
                      {obtenerEstadoUsuario(item)}
                    </Badge>
                    <div className="text-[11px] text-ink-tertiary mt-1">
                      Verificación en dos pasos: {item.twoFactorHabilitado ? 'activa' : 'no activada'}
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-ink-tertiary">
                    {itemDate ? new Date(itemDate).toLocaleDateString('es-BO') : '-'}
                  </Td>
                  <Td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {isLocked && (
                        <IconButton
                          label="Desbloquear cuenta"
                          icon={<Unlock className="h-3.5 w-3.5" />}
                          onClick={() => handleDesbloquear(item)}
                          className="text-brand border-brand/30"
                        />
                      )}
                      {item.twoFactorHabilitado && item.id !== currentUser?.id && (
                        <IconButton
                          label={
                            reinicioPendienteId === item.id
                              ? 'Confirmar restablecimiento de verificación'
                              : 'Restablecer verificación en dos pasos'
                          }
                          icon={
                            reinicioPendienteId === item.id ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <KeyRound className="h-3.5 w-3.5" />
                            )
                          }
                          variant={reinicioPendienteId === item.id ? 'destructive' : 'secondary'}
                          onClick={() => handleReiniciarDosFactores(item)}
                          onBlur={() => setReinicioPendienteId(null)}
                        />
                      )}
                      <IconButton
                        label="Editar usuario"
                        icon={<Edit3 className="h-3.5 w-3.5" />}
                        onClick={() => startEdit(item)}
                      />
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
