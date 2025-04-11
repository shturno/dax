import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

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
    console.log(`🔍 Buscando configurações para: ${normalizedEmail}`);
    
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log("❌ Usuário não encontrado");
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      settings: user.settings || {}
    });
  } catch (error) {
    console.error("❌ Erro ao buscar configurações:", error);
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
    console.log(`🔄 Atualizando configurações para: ${normalizedEmail}`);
    
    const result = await db.collection("users").updateOne(
      { email: normalizedEmail },
      { $set: { settings: data.settings, updatedAt: new Date() } }
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
      message: "Configurações atualizadas com sucesso"
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Não autorizado" },
      { status: 401 }
    );
  }

  let client = null;
  try {
    const { currentPassword, newPassword } = await request.json();
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }
    
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    const users = db.collection("users");
    
    // Buscar usuário
    const normalizedEmail = session.user.email.toLowerCase();
    const user = await users.findOne({ email: normalizedEmail });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar senha atual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Senha atual incorreta" },
        { status: 400 }
      );
    }
    
    // Hash nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Atualizar senha (método correto do MongoDB nativo)
    const result = await users.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Falha ao atualizar senha" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso"
    });
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

async function dbConnect() {
  const client = await connectToMongo();
  return client.db("saas-dashboard");
}

// You'll also need to import bcrypt and create the getUserModel function:

async function getUserModel() {
  const client = await connectToMongo();
  const db = client.db("saas-dashboard");
  return db.collection("users");
}
