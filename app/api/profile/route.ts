import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "./profile-service";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  const result = await getUserProfile(session.user.email);
  
  return NextResponse.json(
    { success: result.success, message: result.message, user: result.user },
    { status: result.statusCode }
  );
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { updateUserProfile } = await import("./profile-service");
    
    const result = await updateUserProfile(session.user.email, data);
    
    return NextResponse.json(
      { success: result.success, message: result.message },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}