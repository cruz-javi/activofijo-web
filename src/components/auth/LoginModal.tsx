'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIdentificador('');
      setPassword('');
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identificador: identificador.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Credenciales inválidas');
      }

      onClose();
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el inicio de sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = error?.includes('bloqueado') || error?.includes('sospechosa');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200">
      <div 
        className="relative w-full max-w-md bg-paper-raised border border-border-soft rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-paper transition-colors duration-150"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 p-1 bg-white rounded-lg border border-border-soft shadow-xs flex items-center justify-center shrink-0">
              <Image 
                src="/logo_uagrm_activo_fijo.svg" 
                alt="Logo UAGRM" 
                width={32} 
                height={32} 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <h2 id="modal-title" className="font-bold text-ink text-base tracking-tight leading-none">
                Acceso al Sistema
              </h2>
              <span className="text-xs text-ink-secondary mt-1">
                Departamento de Activo Fijo • UAGRM
              </span>
            </div>
          </div>

          {error && (
            <div 
              className={`mb-5 p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                isBlocked
                  ? 'bg-danger-surface text-danger border-danger/30'
                  : 'bg-danger-surface text-danger border-danger/20'
              }`}
            >
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">{isBlocked ? 'Seguridad Institucional' : 'Error de autenticación'}</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label 
                htmlFor="modal-identificador" 
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Correo institucional o Código de funcionario
              </label>
              <input
                ref={inputRef}
                id="modal-identificador"
                name="identificador"
                type="text"
                autoComplete="off"
                required
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="ej. funcionario@uagrm.edu.bo o 10425"
                className="w-full h-10 px-3 rounded-lg border border-border-soft bg-paper text-ink text-sm placeholder:text-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors duration-150"
              />
            </div>

            <div>
              <label 
                htmlFor="modal-password" 
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="modal-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full h-10 pl-3 pr-10 rounded-lg border border-border-soft bg-paper text-ink text-sm placeholder:text-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors duration-150"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-strong disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validando credenciales…</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border-soft text-center">
            <span className="text-xs text-ink-tertiary">
              ¿Olvidó su contraseña o requiere desbloqueo? Consulte de forma presencial con el Administrador de Activo Fijo.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
