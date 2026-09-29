import { NextResponse } from 'next/server';
import { getDesafioDosFactores } from '@/lib/session';
import { postCore } from '@/lib/core-client';
import type { ConfiguracionDosFactores } from '@/lib/auth-types';

export async function POST(request: Request) {
  try {
    const desafioToken = await getDesafioDosFactores();
    if (!desafioToken) {
      return NextResponse.json({ message: 'La verificación expiró. Inicie sesión nuevamente.' }, { status: 401 });
    }

    const { status, data } = await postCore<ConfiguracionDosFactores>(
      '/auth/2fa/inicial/configurar',
      { desafioToken },
      request,
    );
    return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al preparar la verificación';
    return NextResponse.json({ message }, { status: 500 });
  }
}
