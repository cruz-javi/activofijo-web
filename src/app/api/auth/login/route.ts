import { NextResponse } from 'next/server';
import { setSession, setDesafioDosFactores } from '@/lib/session';
import { postCore } from '@/lib/core-client';
import { esDesafio, type RespuestaLoginCore } from '@/lib/auth-types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { ok, status, data } = await postCore<RespuestaLoginCore>(
      '/auth/login',
      {
        identificador: body.identificador || body.email,
        password: body.password,
        deviceId: 'web-dashboard',
      },
      request,
    );

    if (!ok) {
      return NextResponse.json(data, { status });
    }

    if (esDesafio(data)) {
      await setDesafioDosFactores(data.desafioToken);
      return NextResponse.json({
        success: true,
        requiere2fa: 'requiere2fa' in data,
        requiereConfiguracion2fa: 'requiereConfiguracion2fa' in data,
      });
    }

    await setSession(data.accessToken, data.refreshToken);
    return NextResponse.json({ success: true, user: data.user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al procesar el inicio de sesión';
    return NextResponse.json({ message }, { status: 500 });
  }
}
