import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  for (const cookie of allCookies) {
    if (cookie.name.includes('next-auth')) {
      cookies().delete(cookie.name);
    }
  }

  return NextResponse.json({
    message: 'Cookies de autenticação removidos. Faça logout e login novamente.',
    clearedCookies: allCookies.filter(c => c.name.includes('next-auth')).map(c => c.name),
  });
}
