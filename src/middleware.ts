import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || 'localhost:3000';
  const cleanHost = host.split(':')[0].toLowerCase();
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'schoolerp.in';

  const requestHeaders = new Headers(request.headers);

  // 1. Super Admin domain or root app domain
  const isSuperAdminDomain =
    cleanHost === `app.${appDomain}` ||
    cleanHost === `admin.${appDomain}` ||
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1';

  if (isSuperAdminDomain) {
    requestHeaders.set('x-is-superadmin-domain', 'true');
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. Derive Tenant from Subdomain or Custom Domain
  let slug: string | null = null;
  if (cleanHost.endsWith(`.${appDomain}`)) {
    slug = cleanHost.replace(`.${appDomain}`, '');
  } else {
    // Custom domain (e.g. dpsdelhi.edu.in)
    requestHeaders.set('x-tenant-domain', cleanHost);
  }

  if (slug) {
    requestHeaders.set('x-tenant-slug', slug);
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
