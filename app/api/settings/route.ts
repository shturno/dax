import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserSettings, updateUserSettings, changeUserPassword } from "./settings-service";
import { logger } from "@/utils/logger";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    logger.warn("Tentativa de acesso não autenticada às configurações");
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const result = await getUserSettings(session.user.email);
    
    return NextResponse.json(
      { success: result.success, settings: result.settings, message: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    logger.error("Erro não tratado ao buscar configurações", { 
      error: error instanceof Error ? error.message : error 
    });
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    logger.warn("Tentativa de atualização não autenticada às configurações");
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const result = await updateUserSettings(session.user.email, data.settings);
    
    return NextResponse.json(
      { success: result.success, message: result.message || result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    logger.error("Erro não tratado ao atualizar configurações", { 
      error: error instanceof Error ? error.message : error 
    });
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    logger.warn("Tentativa de alteração de senha não autenticada");
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const passwordData = await request.json();
    const result = await changeUserPassword(session.user.email, passwordData);
    
    return NextResponse.json(
      { success: result.success, message: result.message || result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    logger.error("Erro não tratado ao alterar senha", { 
      error: error instanceof Error ? error.message : error 
    });
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


