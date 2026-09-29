import { NextResponse } from 'next/server';
import { setSession, getDesafioDosFactores, clearDesafioDosFactores } from '@/lib/session';
import { postCore } from '@/lib/core-client';
import type { ActivacionDosFactores, SesionCore } from '@/lib/auth-types';

export async function POST(request: Request) {
  try {
    const desafioToken = await getDesafioDosFactores();
    if (!desafioToken) {
      return NextResponse.json({ message: 'La verificación expiró. Inicie sesión nuevamente.' }, { status: 401 });
    }

    const { codigo } = await request.json();
    const { ok, status, data } = await postCore<ActivacionDosFactores & { sesion: SesionCore }>(
      '/auth/2fa/inicial/activar',
      { desafioToken, codigo },
      request,
    );

    if (!ok) {
      return NextResponse.json(data, { status });
    }

    await setSession(data.sesion.accessToken, data.sesion.refreshToken);
    await clearDesafioDosFactores();
    return NextResponse.json(
      { success: true, codigosRespaldo: data.codigosRespaldo, user: data.sesion.user },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al activar la verificación';
    return NextResponse.json({ message }, { status: 500 });
  }
}
