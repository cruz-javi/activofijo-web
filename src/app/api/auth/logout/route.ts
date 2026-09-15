import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/lib/session';

export async function POST() {
  const { refreshToken } = await getSession();
  const coreUrl = process.env.CORE_API_URL || 'http://localhost:3000';

  if (refreshToken) {
    try {
      await fetch(`${coreUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort remote revocation
    }
  }

  await clearSession();
  return NextResponse.json({ success: true });
}
