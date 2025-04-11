import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  let client = null;
  
  try {
    const requestText = await request.text();
    console.log("🔍 Request bruto:", requestText);
    
    const { username, email, password } = JSON.parse(requestText);
    const normalizedEmail = email.toLowerCase();
    
    console.log("👤 Usuário:", username);
    console.log("📧 Email normalizado:", normalizedEmail);
    console.log("🔢 Comprimento da senha:", password.length);
    
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    console.log("✅ Conectado ao MongoDB");
    
    const db = client.db("saas-dashboard");
    
    const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
    
    if (existingUser) {
      console.log("❌ Email já cadastrado");
      return NextResponse.json(
        { success: false, message: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log("🔐 Senha que será hasheada:", password);
    console.log("🔐 Hash gerado:", hashedPassword);

    const result = await db.collection("users").insertOne({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      settings: {
        projectName: "Meu Projeto",
        projectDescription: "Minha descrição",
        notifications: true,
        autoSave: true,
        autoSaveInterval: 5,
        fontSize: 16,
        primaryColor: "default"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✅ Usuário registrado com sucesso:", normalizedEmail);
    
    return NextResponse.json(
      { success: true, userId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erro no registro:", error);
    return NextResponse.json(
      { success: false, message: "Erro no servidor" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}