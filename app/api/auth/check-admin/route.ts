import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Lista de emails admin em variável de ambiente
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

  const isAdmin =
    session?.user?.role === 'admin' ||
    (session?.user?.email && adminEmails.includes(session.user.email));

  return NextResponse.json({ isAdmin });
}
