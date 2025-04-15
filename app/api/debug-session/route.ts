import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Obter cookies para debug de forma segura
  const cookieStore = cookies();
  const cookieNames = cookieStore.getAll().map((c) => ({
    name: c.name,
    hasValue: !!c.value
  }));

  return NextResponse.json({
    session,
    hasSession: !!session,
    cookiesFound: cookieNames.length,
    cookieNames,
    sessionHasRole: session?.user?.role !== undefined,
    roleValue: session?.user?.role || "não encontrado"
  });
}