import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coreUrl = process.env.CORE_API_URL || 'http://localhost:3000';

    const res = await fetch(`${coreUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        deviceId: 'web-dashboard',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    await setSession(data.accessToken, data.refreshToken);
    return NextResponse.json({ success: true, user: data.user });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
