import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './lib/session';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/activos',
  '/usuarios',
  '/roles',
  '/auditoria',
  '/asignaciones',
  '/formularios',
  '/inspecciones',
  '/gestion-documental',
  '/normativa',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  // Si intentan ingresar a la ruta obsoleta /login, redirigir a inicio
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    const homeWithLogin = new URL('/', request.url);
    homeWithLogin.searchParams.set('login', 'true');
    return NextResponse.redirect(homeWithLogin);
  }

  // Protección de rutas administrativas y operativas del dashboard
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isAuthenticated) {
    const homeWithLogin = new URL('/', request.url);
    homeWithLogin.searchParams.set('login', 'true');
    homeWithLogin.searchParams.set('from', pathname);
    return NextResponse.redirect(homeWithLogin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/activos/:path*',
    '/usuarios/:path*',
    '/roles/:path*',
    '/auditoria/:path*',
    '/asignaciones/:path*',
    '/formularios/:path*',
    '/inspecciones/:path*',
    '/gestion-documental/:path*',
    '/normativa/:path*',
    '/login',
  ],
};
