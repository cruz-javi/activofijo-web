'use client';

import { useEffect, useState } from 'react';
import { getRoleLabel, ROLE_LABELS } from '@/lib/roles';

export { getRoleLabel, ROLE_LABELS };

export interface CurrentUser {
  id: string;
  email: string;
  nombre: string;
  cargoInstitucional?: string | null;
  codigoEmpleadoLegado?: number | null;
  rol?: string;
  roles: string[];
  permisos: string[];
  activo: boolean;
  dosFactoresActivo?: boolean;
  dosFactoresObligatorio?: boolean;
}

// Cache global en memoria y coalescencia de promesas para evitar inundar la API
let cachedUser: CurrentUser | null = null;
let inflightPromise: Promise<CurrentUser | null> | null = null;
const listeners = new Set<(user: CurrentUser | null) => void>();

export function clearUserCache() {
  cachedUser = null;
  inflightPromise = null;
  listeners.forEach((fn) => fn(null));
}

export function refreshCurrentUser(): Promise<CurrentUser | null> {
  cachedUser = null;
  inflightPromise = null;
  return fetchUserData();
}

function fetchUserData(): Promise<CurrentUser | null> {
  if (cachedUser) {
    return Promise.resolve(cachedUser);
  }
  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = fetch('/api/auth/me')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data) {
        const primaryRol = (data.roles && data.roles[0]) || data.rol || 'FUNCIONARIO';
        const formatted: CurrentUser = {
          ...data,
          rol: primaryRol,
          roles: data.roles || [primaryRol],
          permisos: data.permisos || [],
        };
        cachedUser = formatted;
        listeners.forEach((fn) => fn(formatted));
        return formatted;
      }
      cachedUser = null;
      listeners.forEach((fn) => fn(null));
      return null;
    })
    .catch(() => {
      cachedUser = null;
      return null;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(cachedUser);
  const [loading, setLoading] = useState<boolean>(!cachedUser);

  useEffect(() => {
    const listener = (updatedUser: CurrentUser | null) => {
      setUser(updatedUser);
      setLoading(false);
    };

    listeners.add(listener);

    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
    } else {
      fetchUserData().finally(() => {
        setLoading(false);
      });
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const roles = user?.roles || [];
  const permisos = user?.permisos || [];

  const isAdmin = roles.some((r) => ['ADMINISTRADOR', 'ADMIN', 'SUPER_ADMIN'].includes(r.toUpperCase()));
  const isJefe = roles.some((r) => ['JEFE_ACTIVO_FIJO', 'JEFE'].includes(r.toUpperCase()));
  const isFuncionario = roles.some((r) => ['FUNCIONARIO', 'CUSTODIO'].includes(r.toUpperCase()));

  const hasPermiso = (permiso: string) => isAdmin || permisos.includes(permiso);
  const hasRole = (role: string) => roles.map((r) => r.toUpperCase()).includes(role.toUpperCase());

  return { 
    user, 
    loading, 
    isAdmin, 
    isJefe, 
    isFuncionario, 
    hasPermiso, 
    hasRole,
    roleLabel: getRoleLabel(roles[0] || user?.rol),
  };
}
