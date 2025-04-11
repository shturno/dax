import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";

async function connectToMongo() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  return client;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  let client = null;
  try {
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    
    // Buscar todas as estatísticas que o usuário precisa
    // Este é apenas um exemplo - substitua pelos dados reais
    
    // Exemplo: Contagem total de usuários
    const totalUsers = await db.collection("users").countDocuments();
    
    // Exemplo: Atividades recentes
    const activities = await db.collection("activities")
      .find({ userEmail: session.user.email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activities,
        // Adicione outras estatísticas relevantes aqui
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}