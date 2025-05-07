import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir rotas da API do middleware
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Verificar se o usuário está autenticado
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  // Protege a página inicial (que contém seu dashboard) e outras rotas
  const isProtectedRoute =
    pathname === '/' || pathname.startsWith('/features') || pathname.startsWith('/configuracoes');

  // Redirecionar usuários não autenticados para o login
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Redirecionar usuários autenticados da página de login para o dashboard
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/'; // Redireciona para a página inicial
    return NextResponse.redirect(url); // Estava incompleto aqui
  }
}
