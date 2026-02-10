import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const rawRole = request.cookies.get('role')?.value;
  const role = rawRole?.toLowerCase(); // Standardize to lowercase
  const { pathname } = request.nextUrl;

  // 1. PUBLIC PATHS - Don't do anything for these
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // 2. LOGGED IN & TRYING TO ACCESS LOGIN/REGISTER
  if (token && (pathname === '/login' || pathname === '/register')) {
    const target = role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. PROTECTING ADMIN ROUTE
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'admin') {
      // If they are a user trying to be an admin, send them to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If they are an admin, let them through
    return NextResponse.next();
  }

  // 4. PROTECTING DASHBOARD/PRIVATE ROUTES
  if (!token && pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
};