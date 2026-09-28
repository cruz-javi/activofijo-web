'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { ShieldAlert, X, ArrowLeft, Lock } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { getRoleLabel } from '@/lib/roles';

export interface AccessDeniedConfig {
  moduleName: string;
  reason?: string;
  requiredPermission?: string;
}

interface AccessControlContextValue {
  showAccessDenied: (config: AccessDeniedConfig) => void;
  closeAccessDenied: () => void;
}

const AccessControlContext = createContext<AccessControlContextValue | null>(null);

export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl debe utilizarse dentro de un AccessControlProvider');
  }
  return context;
}

export function AccessControlProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AccessDeniedConfig | null>(null);
  const { user } = useCurrentUser();

  const showAccessDenied = useCallback((cfg: AccessDeniedConfig) => {
    setConfig(cfg);
  }, []);

  const closeAccessDenied = useCallback(() => {
    setConfig(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && config) {
        closeAccessDenied();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, closeAccessDenied]);

  const value = useMemo(
    () => ({ showAccessDenied, closeAccessDenied }),
    [showAccessDenied, closeAccessDenied],
  );

  const primaryRole = user?.roles?.[0] || user?.rol || 'FUNCIONARIO';
  const roleDisplay = typeof getRoleLabel === 'function' ? getRoleLabel(primaryRole) : (primaryRole || 'Funcionario Universitario');

  return (
    <AccessControlContext.Provider value={value}>
      {children}
      {config && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          onClick={closeAccessDenied}
        >
          <div 
            className="relative w-full max-w-md bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAccessDenied}
              type="button"
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3.5 mb-5">
                <div className="h-12 w-12 rounded-xl bg-danger-surface text-danger border border-danger/25 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-base tracking-tight font-serif">
                    Acceso Restringido
                  </h3>
                  <span className="text-xs font-semibold text-danger uppercase tracking-wider">
                    Permiso Insuficiente
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-sm text-ink-secondary leading-relaxed mb-6">
                <p>
                  Su rol actual (<strong className="text-ink font-semibold">{roleDisplay}</strong>) no tiene habilitada la funcionalidad o módulo:{' '}
                  <strong className="text-ink font-semibold">{config.moduleName}</strong>.
                </p>

                {config.requiredPermission && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-paper border border-border-soft text-xs text-ink-secondary">
                    <Lock className="h-3.5 w-3.5 text-ink-tertiary shrink-0" />
                    <span>
                      Permiso requerido:{' '}
                      <code className="font-mono text-brand font-semibold px-1 py-0.5 rounded bg-brand-surface">
                        {config.requiredPermission}
                      </code>
                    </span>
                  </div>
                )}

                {config.reason && (
                  <p className="text-xs text-ink-tertiary bg-paper p-3 rounded-lg border border-border-soft">
                    {config.reason}
                  </p>
                )}

                <p className="text-xs text-ink-tertiary">
                  De acuerdo a la normativa institucional, para acceder a esta funcionalidad debe solicitar la asignación de permisos al <strong className="text-ink font-semibold">Administrador del Sistema</strong> en persona.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={closeAccessDenied}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-strong active:scale-95 shadow-xs transition-all duration-150 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Entendido, volver</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AccessControlContext.Provider>
  );
}
