'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
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
import { ROL_TONE } from '@/lib/estado';

type Rol = 'ADMIN' | 'OFICINA' | 'CAMPO';

interface UsuarioItem {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
}

const ROL_OPTIONS: Rol[] = ['ADMIN', 'OFICINA', 'CAMPO'];

// El backend responde 400 con `details: [{ path, message }]` cuando falla
// la validación de Zod; el `message` genérico no dice qué campo está mal.
function extractErrorMessage(errData: any, fallback: string): string {
  if (Array.isArray(errData?.details) && errData.details.length > 0) {
    return errData.details.map((d: any) => d.message).join(' ');
  }
  return errData?.message || fallback;
}

export default function UsuariosPage() {
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser, loading: loadingUser } = useCurrentUser();

  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state (alta)
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>('CAMPO');
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Form state (edición)
  const [editingItem, setEditingItem] = useState<UsuarioItem | null>(null);
  const [editRol, setEditRol] = useState<Rol>('CAMPO');
  const [editActivo, setEditActivo] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/usuarios');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 403) {
        setError('No tenés permisos para gestionar usuarios.');
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
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solo un ADMIN puede estar en esta pantalla; a los demás roles se los redirige.
  useEffect(() => {
    if (!loadingUser && currentUser && currentUser.rol !== 'ADMIN') {
      router.push('/activos');
    }
  }, [loadingUser, currentUser, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSaving(true);
    try {
      const res = await fetch('/api/proxy/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rol }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(extractErrorMessage(errData, 'Error al registrar el usuario'));
      }

      setShowForm(false);
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('CAMPO');
      toast.show('Usuario registrado correctamente.');
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
    setEditRol(item.rol);
    setEditActivo(item.activo);
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
        body: JSON.stringify({ rol: editRol, activo: editActivo }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(extractErrorMessage(errData, 'Error al actualizar el usuario'));
      }

      setEditingItem(null);
      toast.show('Cambios guardados.');
      await fetchUsuarios();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Gestión de usuarios"
        description={`${usuarios.length} cuentas registradas`}
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
                Nuevo usuario
              </>
            )}
          </Button>
        }
      />

      {showForm && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center gap-2">
            <Badge tone="accent">Alta de usuario</Badge>
          </div>
          {createError && (
            <div className="mb-4 rounded-sm border border-danger/25 bg-danger-surface px-3 py-2 text-sm text-danger">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <FormSection title="Identificación">
              <Field label="Nombre completo" htmlFor="nombre" className="md:col-span-2">
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juana Pérez Rocha"
                  required
                  minLength={3}
                />
              </Field>
              <Field label="Rol" htmlFor="rol">
                <Select id="rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
                  {ROL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
            </FormSection>

            <FormSection title="Credenciales">
              <Field label="Correo institucional" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@uagrm.edu.bo"
                  required
                />
              </Field>
              <Field label="Contraseña" htmlFor="password">
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
                {createSaving ? 'Guardando…' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {editingItem && (
        <Panel className="mb-6">
          <div className="mb-5 flex items-center gap-2">
            <Badge tone={ROL_TONE[editingItem.rol] ?? 'neutral'}>{editingItem.rol}</Badge>
            <span className="text-xs text-ink-tertiary">{editingItem.email}</span>
          </div>
          {editError && (
            <div className="mb-4 rounded-sm border border-danger/25 bg-danger-surface px-3 py-2 text-sm text-danger">
              {editError}
            </div>
          )}
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <FormSection title="Rol y estado">
              <Field label="Rol" htmlFor="edit-rol">
                <Select
                  id="edit-rol"
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value as Rol)}
                >
                  {ROL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Estado de la cuenta" htmlFor="edit-activo">
                <Select
                  id="edit-activo"
                  value={editActivo ? 'true' : 'false'}
                  onChange={(e) => setEditActivo(e.target.value === 'true')}
                  disabled={editingItem.id === currentUser?.id}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </Select>
              </Field>
            </FormSection>
            {editingItem.id === currentUser?.id && (
              <p className="text-xs text-ink-tertiary">
                No podés desactivar tu propia cuenta desde acá.
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={editSaving}>
                {editSaving ? 'Guardando…' : 'Guardar cambios'}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      )}

      {loading ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">Cargando usuarios…</Panel>
      ) : error ? (
        <div className="rounded-md border border-danger/25 bg-danger-surface p-4 text-sm text-danger">
          {error}
        </div>
      ) : usuarios.length === 0 ? (
        <Panel className="p-12 text-center text-sm text-ink-tertiary">
          No hay usuarios registrados.
        </Panel>
      ) : (
        <TableCard>
          <THead>
            <Th>Nombre</Th>
            <Th>Correo</Th>
            <Th>Rol</Th>
            <Th>Estado</Th>
            <Th>Creado</Th>
            <Th className="text-center">Acciones</Th>
          </THead>
          <TBody>
            {usuarios.map((item) => (
              <Tr key={item.id}>
                <Td className="text-ink">
                  {item.nombre}
                  {item.id === currentUser?.id && (
                    <span className="ml-2 text-[11px] text-ink-tertiary">(vos)</span>
                  )}
                </Td>
                <Td className="text-ink-secondary">{item.email}</Td>
                <Td>
                  <Badge tone={ROL_TONE[item.rol] ?? 'neutral'}>{item.rol}</Badge>
                </Td>
                <Td>
                  <Badge tone={item.activo ? 'brand' : 'danger'}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </Td>
                <Td className="font-mono text-xs text-ink-tertiary">
                  {new Date(item.createdAt).toLocaleDateString('es-BO')}
                </Td>
                <Td className="text-center">
                  <Button variant="secondary" size="sm" onClick={() => startEdit(item)}>
                    Editar
                  </Button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </TableCard>
      )}
    </>
  );
}
