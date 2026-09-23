import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'session_token';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'school-erp-super-secure-jwt-secret-min-32-chars-long';
  return new TextEncoder().encode(secret);
}

interface TokenPayload {
  sub: string;
  tenantId: string | null;
  role: string;
  email: string;
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return {
      sub: payload.sub as string,
      tenantId: (payload.tenantId as string) || null,
      role: payload.role as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || 'localhost:3000';
  const cleanHost = host.split(':')[0].toLowerCase();
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'schoolerp.in';

  const requestHeaders = new Headers(request.headers);

  // 1. Domain & Tenant derivation
  const isSuperAdminDomain =
    cleanHost === `app.${appDomain}` ||
    cleanHost === `admin.${appDomain}` ||
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1';

  if (isSuperAdminDomain) {
    requestHeaders.set('x-is-superadmin-domain', 'true');
  }

  let slug: string | null = null;
  if (cleanHost.endsWith(`.${appDomain}`)) {
    slug = cleanHost.replace(`.${appDomain}`, '');
  } else if (!isSuperAdminDomain) {
    requestHeaders.set('x-tenant-domain', cleanHost);
  }

  if (slug) {
    requestHeaders.set('x-tenant-slug', slug);
  }

  // 2. Auth Session Verification
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session: TokenPayload | null = null;

  if (sessionCookie) {
    session = await verifyToken(sessionCookie);
    if (session) {
      requestHeaders.set('x-user-id', session.sub);
      requestHeaders.set('x-user-role', session.role);
      requestHeaders.set('x-user-email', session.email);
      if (session.tenantId) {
        requestHeaders.set('x-user-tenant-id', session.tenantId);
        requestHeaders.set('x-tenant-id', session.tenantId);
      }
    }
  }

  // 3. Route Authorization Guard
  const isLoginPage = pathname === '/login';
  const isUnauthorizedPage = pathname === '/unauthorized';
  const isAuthApi = pathname.startsWith('/api/auth');

  // If already logged in and visiting /login, redirect to their home portal
  if (isLoginPage && session) {
    let target = '/';
    if (session.role === 'ADMIN') target = '/admin';
    else if (session.role === 'TEACHER') target = '/teacher';
    else if (session.role === 'SUPER_ADMIN') target = '/superadmin';
    else if (session.role === 'ACCOUNTANT') target = '/admin/fees';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Protected route prefixes
  const requiresAdmin = pathname.startsWith('/admin');
  const requiresTeacher = pathname.startsWith('/teacher');
  const requiresSuperAdmin = pathname.startsWith('/superadmin');
  const requiresPortal = pathname.startsWith('/portal');

  const isProtectedRoute = requiresAdmin || requiresTeacher || requiresSuperAdmin || requiresPortal;

  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    // Check specific role requirements
    if (requiresSuperAdmin && session.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (requiresAdmin && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACCOUNTANT') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (requiresTeacher && session.role !== 'TEACHER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Unified student & parent portal
    if (requiresPortal && !['STUDENT', 'PARENT', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
