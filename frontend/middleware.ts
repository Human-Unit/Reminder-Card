import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const rawRole = request.cookies.get('role')?.value;
  const role = rawRole?.toLowerCase();
  const { pathname } = request.nextUrl;

  // 1. Static Files
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // 2. Already Logged In? Prevent accessing Login/Register
  if (token && (pathname === '/login' || pathname === '/register')) {
    const target = role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Admin Route Protection
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    if (role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  // 4. Dashboard Route Protection (FIXED: StartsWith)
  // This ensures /dashboard, /dashboard/entries, etc., are all safe
  if (pathname.startsWith('/dashboard')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Ensure we match all sub-paths for both dashboard and admin
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
};