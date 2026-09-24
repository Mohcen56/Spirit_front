import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/config/backend';

/**
 * GET /api/auth/check
 * 
 * Simple endpoint to check if user is authenticated.
 * Returns 200 if authToken cookie exists, 401 otherwise.
 * Used by client components to check auth state without exposing the token.
 */
export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;
  const apiBaseUrl = getBackendApiUrl();

  if (!authToken || !apiBaseUrl) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/profile/`, {
      headers: { Authorization: `Token ${authToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ authenticated: true, user: data.user });
    }
  } catch {
    // Treat unreachable/invalid sessions as unauthenticated below.
  }

  cookieStore.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
