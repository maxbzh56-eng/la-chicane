import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rediriger les liens de vérification d'email vers le bon port Supabase
  if (request.nextUrl.pathname === '/auth/v1/verify') {
    const url = new URL(request.url);

    // Rediriger vers Supabase API sur le port 54321
    return NextResponse.redirect(
      `http://localhost:54321${url.pathname}${url.search}`
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/auth/v1/verify'
};