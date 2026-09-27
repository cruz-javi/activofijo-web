'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Stamp } from '@/components/Stamp';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@uagrm.edu.bo');
  const [password, setPassword] = useState('Uagrm2026*');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Stamp rotate={-6} className="h-12 w-12 border-brand/45 text-sm text-brand-strong">
            AF
          </Stamp>
          <h1 className="mt-4 text-balance font-serif text-xl font-semibold text-ink">
            Sistema de Activo Fijo
          </h1>
          <p className="mt-1 text-sm text-ink-tertiary">
            Universidad Autónoma Gabriel René Moreno
          </p>
        </div>

        <div className="rounded-md border border-border bg-paper-raised p-7">
          <p className="mb-5 text-xs font-medium tracking-wide text-ink-secondary">
            Ingreso al panel de administración
          </p>

          {error && (
            <div className="mb-4 rounded-sm border border-danger/25 bg-danger-surface px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Correo institucional" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Contraseña" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Validando…' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
