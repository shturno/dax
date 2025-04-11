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
    
    const normalizedEmail = session.user.email.toLowerCase();
    console.log(`🔍 Buscando usuário: ${normalizedEmail}`);
    
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log("❌ Usuário não encontrado");
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    // Remover senha e outras informações sensíveis
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  let client = null;
  try {
    const data = await request.json();
    
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    
    const normalizedEmail = session.user.email.toLowerCase();
    console.log(`🔄 Atualizando usuário: ${normalizedEmail}`);
    
    // Não permitir alteração do email
    const { email, ...updateData } = data;
    
    const result = await db.collection("users").updateOne(
      { email: normalizedEmail },
      { $set: { 
        username: updateData.username,
        settings: updateData.settings,
        updatedAt: new Date() 
      } }
    );
    
    if (result.matchedCount === 0) {
      console.log("❌ Usuário não encontrado para atualização");
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso"
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}