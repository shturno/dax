import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar se o usuário está autenticado
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token

  // Rotas que exigem autenticação
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                         pathname.startsWith('/settings') ||
                         pathname.startsWith('/editor')
  
  // Redirecionar usuários não autenticados das rotas protegidas para o login
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Redirecionar usuários autenticados de páginas de autenticação para o dashboard
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/editor/:path*',
    '/login',
    '/register',
  ],
}