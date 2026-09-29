import { NextResponse } from 'next/server';
import { setSession, getDesafioDosFactores, clearDesafioDosFactores } from '@/lib/session';
import { postCore } from '@/lib/core-client';
import type { SesionCore } from '@/lib/auth-types';

export async function POST(request: Request) {
  try {
    const desafioToken = await getDesafioDosFactores();
    if (!desafioToken) {
      return NextResponse.json({ message: 'La verificación expiró. Inicie sesión nuevamente.' }, { status: 401 });
    }

    const { codigo } = await request.json();
    const { ok, status, data } = await postCore<SesionCore>('/auth/2fa/verificar', { desafioToken, codigo }, request);

    if (!ok) {
      return NextResponse.json(data, { status });
    }

    await setSession(data.accessToken, data.refreshToken);
    await clearDesafioDosFactores();
    return NextResponse.json({ success: true, user: data.user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al verificar el código';
    return NextResponse.json({ message }, { status: 500 });
  }
}
