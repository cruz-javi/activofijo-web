import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const { accessToken } = await getSession();
  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const coreUrl = process.env.CORE_API_URL || 'http://localhost:3000';
  const res = await fetch(`${coreUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
