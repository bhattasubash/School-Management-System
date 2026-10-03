import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/jwt';
import type { JWTPayload } from '@/types';

const SESSION_COOKIE_NAME = 'session_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawHost = request.headers.get('host') || 'localhost:3000';
  const cleanHost = rawHost.split(':')[0].trim().toLowerCase();
  const rawAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'schoolerp.in';
  const appDomain = rawAppDomain.split(':')[0].toLowerCase();

  // Guard against malformed Host headers or header injection
  const isValidHost = /^[a-z0-9.-]+$/.test(cleanHost);
  if (!isValidHost) {
    return new NextResponse('Bad Request: Invalid Host header format', { status: 400 });
  }

  const requestHeaders = new Headers(request.headers);

  // Security: Strip internal headers to prevent client-side spoofing
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');
  requestHeaders.delete('x-user-email');
  requestHeaders.delete('x-user-tenant-id');
  requestHeaders.delete('x-tenant-id');
  requestHeaders.delete('x-tenant-slug');
  requestHeaders.delete('x-tenant-name');
  requestHeaders.delete('x-tenant-domain');
  requestHeaders.delete('x-is-superadmin-domain');

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
    const candidate = cleanHost.replace(`.${appDomain}`, '');
    if (/^[a-z0-9-]+$/.test(candidate) && candidate !== 'app' && candidate !== 'admin') {
      slug = candidate;
    }
  } else if (!isSuperAdminDomain) {
    requestHeaders.set('x-tenant-domain', cleanHost);
  }

  if (slug) {
    requestHeaders.set('x-tenant-slug', slug);
  }

  // 2. Auth Session Verification
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session: JWTPayload | null = null;

  if (sessionCookie) {
    session = await verifySessionToken(sessionCookie);
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
  const isForgotPasswordPage = pathname.startsWith('/login/forgot-password');
  const isChangePasswordPage = pathname === '/change-password';
  const isUnauthorizedPage = pathname === '/unauthorized';
  const isApiRoute = pathname.startsWith('/api/');

  // If user must change password, strictly enforce redirect for pages and 403 for API routes
  if (session && session.mustChangePassword && !isChangePasswordPage && !isLoginPage && !isForgotPasswordPage) {
    if (isApiRoute) {
      const isAllowedAuthApi = pathname === '/api/auth/change-password' || pathname === '/api/auth/logout';
      if (!isAllowedAuthApi) {
        return NextResponse.json(
          { success: false, error: 'Password change required: You must change your temporary password before accessing API endpoints.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }
  }

  // If already logged in and visiting /login (GET only), redirect to their home portal
  const isServerAction = request.method !== 'GET' || request.headers.has('next-action');
  if (isLoginPage && session && !isServerAction) {
    if (session.mustChangePassword) {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }
    let target = '/portal';
    if (session.role === 'ADMIN') target = '/admin';
    else if (session.role === 'TEACHER') target = '/teacher';
    else if (session.role === 'SUPER_ADMIN') target = '/superadmin';
    else if (session.role === 'ACCOUNTANT') target = '/admin/fees';
    else if (session.role === 'STUDENT' || session.role === 'PARENT') target = '/portal';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Protected route prefixes (covering both UI pages and API endpoints)
  const requiresAdmin = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const requiresTeacher = pathname.startsWith('/teacher') || pathname.startsWith('/api/teacher');
  const requiresSuperAdmin = pathname.startsWith('/superadmin') || pathname.startsWith('/api/superadmin');
  const requiresPortal = pathname.startsWith('/portal') || pathname.startsWith('/api/portal');

  const isProtectedRoute = requiresAdmin || requiresTeacher || requiresSuperAdmin || requiresPortal;

  if (isProtectedRoute && !session) {
    if (isApiRoute) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication session required.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    // Check specific role requirements
    if (requiresSuperAdmin && session.role !== 'SUPER_ADMIN') {
      if (isApiRoute) return NextResponse.json({ success: false, error: 'Forbidden: Super Admin privileges required.' }, { status: 403 });
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (requiresAdmin) {
      const isFeeRoute = pathname.startsWith('/admin/fees') || pathname.startsWith('/api/admin/fees');
      const isAllowedAdmin = session.role === 'ADMIN' || session.role === 'SUPER_ADMIN';
      const isAllowedAccountant = session.role === 'ACCOUNTANT' && isFeeRoute;

      if (!isAllowedAdmin && !isAllowedAccountant) {
        if (isApiRoute) {
          return NextResponse.json({ success: false, error: 'Forbidden: Insufficient privileges for this section.' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    if (requiresTeacher && session.role !== 'TEACHER' && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      if (isApiRoute) return NextResponse.json({ success: false, error: 'Forbidden: Teacher privileges required.' }, { status: 403 });
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Unified student & parent portal
    if (requiresPortal && !['STUDENT', 'PARENT', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      if (isApiRoute) return NextResponse.json({ success: false, error: 'Forbidden: Portal access not authorized for this role.' }, { status: 403 });
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
    '/admin/:path*',
    '/teacher/:path*',
    '/superadmin/:path*',
    '/portal/:path*',
    '/login',
    '/login/:path*',
    '/change-password',
    '/change-password/:path*',
    '/unauthorized',
    '/api/:path*',
  ],
};
