import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "./stats-service";
import { logger } from "@/utils/logger";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    logger.warn("Tentativa de acesso não autenticada às estatísticas");
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const result = await getDashboardStats(session.user.email);
    
    return NextResponse.json(
      { success: result.success, stats: result.stats, message: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    logger.error("Erro não tratado ao buscar estatísticas", { 
      error: error instanceof Error ? error.message : error 
    });
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  }
}