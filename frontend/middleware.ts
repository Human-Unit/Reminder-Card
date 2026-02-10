import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ['/login', '/register', '/'];

  // ИЗМЕНЕНИЕ ЗДЕСЬ: Убрали /register из этого условия
  // Теперь, если есть токен, редиректит только с /login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Если пользователь НЕ авторизован и пытается зайти на защищённый маршрут
  if (!token && !publicRoutes.includes(pathname) && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};