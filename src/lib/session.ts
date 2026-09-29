import { cookies } from 'next/headers';

export const ACCESS_TOKEN_COOKIE = 'af_access_token';
export const REFRESH_TOKEN_COOKIE = 'af_refresh_token';
export const DESAFIO_2FA_COOKIE = 'af_desafio_2fa';

const RUTA_DESAFIO_2FA = '/api/auth/2fa';
const VIGENCIA_DESAFIO_SEGUNDOS = 5 * 60;

export async function setSession(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<{ accessToken?: string; refreshToken?: string }> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  return { accessToken, refreshToken };
}

// El desafío vive en una cookie HttpOnly limitada a /api/auth/2fa: el navegador nunca lo ve ni puede enviarlo a otras rutas.
export async function setDesafioDosFactores(desafioToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DESAFIO_2FA_COOKIE, desafioToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: VIGENCIA_DESAFIO_SEGUNDOS,
    path: RUTA_DESAFIO_2FA,
  });
}

export async function getDesafioDosFactores(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(DESAFIO_2FA_COOKIE)?.value;
}

export async function clearDesafioDosFactores(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DESAFIO_2FA_COOKIE, '', { maxAge: 0, path: RUTA_DESAFIO_2FA });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
