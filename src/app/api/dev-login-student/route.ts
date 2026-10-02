import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSessionToken } from '@/lib/jwt';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/session';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint disabled in production' }, { status: 404 });
  }

  const user = await prisma.user.findFirst({
    where: { email: 'rohan.sharma@dpsdelhi.edu.in' },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const res = NextResponse.redirect(new URL('/portal', request.url));
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return res;
}
