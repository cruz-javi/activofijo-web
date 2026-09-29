'use client';

import { useState } from 'react';
import { Loader2, RotateCcw, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { ConfiguracionDosFactores } from '@/components/auth/ConfiguracionDosFactores';
import { CampoCodigoVerificacion, codigoCompleto } from '@/components/auth/CampoCodigoVerificacion';
import { refreshCurrentUser, useCurrentUser } from '@/lib/hooks/useCurrentUser';

const ENDPOINTS_CONFIGURACION = {
  configurar: '/api/proxy/auth/2fa/configurar',
  activar: '/api/proxy/auth/2fa/activar',
};

export default function SeguridadCuentaPage() {
  const toast = useToast();
  const { user, loading } = useCurrentUser();
  const [configurando, setConfigurando] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activo = user?.dosFactoresActivo === true;
  const obligatorio = user?.dosFactoresObligatorio === true;

  const alActivar = async () => {
    setConfigurando(false);
    await refreshCurrentUser();
    toast.show('Verificación en dos pasos activada correctamente.');
  };

  const cancelarDesactivacion = () => {
    setDesactivando(false);
    setPassword('');
    setCodigo('');
    setError(null);
  };

  const desactivar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      const res = await fetch('/api/proxy/auth/2fa/desactivar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, codigo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'No fue posible desactivar la verificación');
      }
      cancelarDesactivacion();
      await refreshCurrentUser();
      toast.show('Verificación en dos pasos desactivada.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible desactivar la verificación');
      setCodigo('');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Seguridad de la Cuenta"
        description="Proteja su acceso al sistema con una verificación adicional desde su celular"
      />

      <Panel className="max-w-2xl">
        {loading ? (
          <div className="animate-pulse space-y-4" aria-label="Cargando estado de la cuenta">
            <div className="h-5 w-56 rounded bg-border-soft" />
            <div className="h-4 w-full rounded bg-border-soft" />
            <div className="h-9 w-44 rounded bg-border-soft" />
          </div>
        ) : !user ? (
          <div role="alert" className="flex flex-col items-start gap-3 text-sm text-ink-secondary">
            <div className="flex items-center gap-2 text-danger font-semibold">
              <ShieldAlert className="h-4 w-4" />
              No fue posible consultar el estado de su cuenta.
            </div>
            <Button variant="secondary" onClick={() => refreshCurrentUser()}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    activo ? 'bg-brand-surface text-brand' : 'bg-border-soft text-ink-tertiary'
                  }`}
                >
                  {activo ? <ShieldCheck className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="font-bold text-ink text-base font-serif">Verificación en dos pasos</h2>
                  <p className="text-sm text-ink-secondary mt-1 leading-relaxed">
                    Además de su contraseña, el sistema pedirá un código de 6 dígitos de su aplicación autenticadora cada vez que inicie sesión.
                  </p>
                </div>
              </div>
              <Badge tone={activo ? 'brand' : 'neutral'}>{activo ? 'Activada' : 'No activada'}</Badge>
            </div>

            {obligatorio && (
              <p className="text-xs text-ink-tertiary leading-relaxed p-3 rounded-lg bg-paper border border-border-soft">
                Su rol institucional exige mantener esta verificación activa. Si perdió su celular, solicite el restablecimiento presencial al Administrador del Sistema.
              </p>
            )}

            {!activo && !configurando && (
              <Button onClick={() => setConfigurando(true)}>
                <ShieldCheck className="h-4 w-4" />
                Activar verificación en dos pasos
              </Button>
            )}

            {!activo && configurando && (
              <div className="pt-4 border-t border-border-soft">
                <ConfiguracionDosFactores
                  endpoints={ENDPOINTS_CONFIGURACION}
                  onCompletado={alActivar}
                  onCancelar={() => setConfigurando(false)}
                />
              </div>
            )}

            {activo && !obligatorio && !desactivando && (
              <Button variant="destructive" onClick={() => setDesactivando(true)}>
                <ShieldOff className="h-4 w-4" />
                Desactivar verificación
              </Button>
            )}

            {activo && !obligatorio && desactivando && (
              <form onSubmit={desactivar} autoComplete="off" className="pt-4 border-t border-border-soft space-y-4 max-w-sm">
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Para desactivarla, confirme con su contraseña y un código vigente de su aplicación.
                </p>
                {error && (
                  <div role="alert" className="p-3 rounded-xl border border-danger/25 bg-danger-surface text-danger text-xs leading-relaxed flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
                <Field label="Contraseña" htmlFor="password-desactivar">
                  <Input
                    id="password-desactivar"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={enviando}
                  />
                </Field>
                <Field label="Código de verificación" htmlFor="codigo-desactivar">
                  <CampoCodigoVerificacion id="codigo-desactivar" value={codigo} onChange={setCodigo} disabled={enviando} />
                </Field>
                <div className="flex items-center gap-2">
                  <Button type="submit" variant="destructive" disabled={enviando || !password || !codigoCompleto(codigo, 'app')}>
                    {enviando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Desactivando…
                      </>
                    ) : (
                      'Confirmar desactivación'
                    )}
                  </Button>
                  <Button type="button" variant="secondary" onClick={cancelarDesactivacion} disabled={enviando}>
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}
