import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/session';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = '/' + path.join('/');
  const coreUrl = process.env.CORE_API_URL || 'http://localhost:3000';
  let { accessToken, refreshToken } = await getSession();

  const url = new URL(req.url);
  const forwardUrl = `${coreUrl}${targetPath}${url.search}`;

  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  let response = await fetch(forwardUrl, {
    method: req.method,
    headers,
    body,
  });

  // Handle transparent refresh if 401 Unauthorized
  if (response.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${coreUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, deviceId: 'web-dashboard' }),
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      await setSession(refreshData.accessToken, refreshData.refreshToken);
      headers['Authorization'] = `Bearer ${refreshData.accessToken}`;

      response = await fetch(forwardUrl, {
        method: req.method,
        headers,
        body,
      });
    }
  }

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
    },
  });
}

export { handleProxy as GET, handleProxy as POST, handleProxy as PATCH, handleProxy as DELETE };
