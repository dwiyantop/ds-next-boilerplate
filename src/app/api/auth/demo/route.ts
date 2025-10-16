import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  cookies().set({
    name: 'demo-auth',
    value: 'demo-auth-token',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  const url = request.nextUrl.clone();
  url.pathname = '/dashboard';
  url.searchParams.delete('from');

  return NextResponse.redirect(url);
}
