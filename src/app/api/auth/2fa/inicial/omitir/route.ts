import { NextResponse } from 'next/server';
import { setSession, getDesafioDosFactores, clearDesafioDosFactores } from '@/lib/session';
import { postCore } from '@/lib/core-client';
import type { SesionCore } from '@/lib/auth-types';

export async function POST(request: Request) {
  try {
    const desafioToken = await getDesafioDosFactores();
    if (!desafioToken) {
      return NextResponse.json({ message: 'La sesión expiró. Inicie sesión nuevamente.' }, { status: 401 });
    }

    const { ok, status, data } = await postCore<{ sesion: SesionCore }>(
      '/auth/2fa/inicial/omitir',
      { desafioToken },
      request,
    );

    if (!ok) {
      return NextResponse.json(data, { status });
    }

    await setSession(data.sesion.accessToken, data.sesion.refreshToken);
    await clearDesafioDosFactores();

    return NextResponse.json(
      { success: true, user: data.sesion.user },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al omitir la verificación';
    return NextResponse.json({ message }, { status: 500 });
  }
}
