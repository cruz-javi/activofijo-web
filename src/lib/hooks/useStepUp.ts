'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_TOKEN = 'uagrm_step_up_token';
const STORAGE_KEY_EXPIRES = 'uagrm_step_up_expires_at';

// Funciones utilitarias directas
export function getStepUpToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const expiresStr = sessionStorage.getItem(STORAGE_KEY_EXPIRES);
    if (!token || !expiresStr) return null;

    const expiresAt = parseInt(expiresStr, 10);
    if (isNaN(expiresAt) || Date.now() >= expiresAt) {
      limpiarStepUpToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function hasActiveStepUp(): boolean {
  return Boolean(getStepUpToken());
}

export function guardarStepUpToken(token: string, expiraEnSegundos: number = 300): void {
  if (typeof window === 'undefined') return;
  try {
    const expiresAt = Date.now() + expiraEnSegundos * 1000;
    sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEY_EXPIRES, expiresAt.toString());
    window.dispatchEvent(new Event('stepup_storage_change'));
  } catch {
    // SessionStorage inaccesible o restringido
  }
}

export function limpiarStepUpToken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_EXPIRES);
    window.dispatchEvent(new Event('stepup_storage_change'));
  } catch {
    // SessionStorage inaccesible o restringido
  }
}

export function useStepUp() {
  const [activo, setActivo] = useState<boolean>(false);
  const [segundosRestantes, setSegundosRestantes] = useState<number>(0);

  const recalcularEstado = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const token = sessionStorage.getItem(STORAGE_KEY_TOKEN);
      const expiresStr = sessionStorage.getItem(STORAGE_KEY_EXPIRES);
      if (!token || !expiresStr) {
        setActivo(false);
        setSegundosRestantes(0);
        return;
      }

      const expiresAt = parseInt(expiresStr, 10);
      const diff = Math.floor((expiresAt - Date.now()) / 1000);
      if (diff <= 0) {
        limpiarStepUpToken();
        setActivo(false);
        setSegundosRestantes(0);
      } else {
        setActivo(true);
        setSegundosRestantes(diff);
      }
    } catch {
      setActivo(false);
      setSegundosRestantes(0);
    }
  }, []);

  useEffect(() => {
    recalcularEstado();

    const timer = setInterval(() => {
      recalcularEstado();
    }, 1000);

    const handleStorage = () => recalcularEstado();
    window.addEventListener('stepup_storage_change', handleStorage);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(timer);
      window.removeEventListener('stepup_storage_change', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, [recalcularEstado]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const tiempoFormateado = `${minutos}:${segundos.toString().padStart(2, '0')}`;

  return {
    activo,
    token: activo ? getStepUpToken() : null,
    segundosRestantes,
    tiempoFormateado,
    hasActiveStepUp,
    guardarStepUp: guardarStepUpToken,
    limpiarStepUp: limpiarStepUpToken,
    recalcularEstado,
  };
}
