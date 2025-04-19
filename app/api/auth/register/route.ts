import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";

export async function POST(request: Request) {
  let client = null;
  
  try {
    const requestText = await request.text();
    console.log("🔍 Request bruto:", requestText);
    
    const body = JSON.parse(requestText);
    const normalizedEmail = body.email.toLowerCase();
    const username = body.username?.trim() || body.email.split("@")[0];
    
    console.log("👤 Usuário:", username);
    console.log("📧 Email normalizado:", normalizedEmail);
    console.log("🔢 Comprimento da senha:", body.password.length);
    
    if (!normalizedEmail || !body.password || !body.projectName) {
      return NextResponse.json(
        { success: false, message: "Email, senha e nome do projeto são obrigatórios" },
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
    const hashedPassword = await bcrypt.hash(body.password, salt);
    
    console.log("🔐 Senha que será hasheada:", body.password);
    console.log("🔐 Hash gerado:", hashedPassword);

    // Criar o usuário
    const userResult = await db.collection("users").insertOne({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const userId = userResult.insertedId;

    // Criar o projeto
    const projectResult = await db.collection("projects").insertOne({
      ownerId: new ObjectId(userId),
      name: body.projectName,
      description: body.projectDescription || "",
      objective: body.projectObjective || "",
      tasks: [],
      notes: [],
      roadmap: [],
      features: [],
      ideas: [],
      feedback: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✅ Usuário e projeto registrados com sucesso:", {
      userId: userId.toString(),
      projectId: projectResult.insertedId.toString(),
      projectName: body.projectName
    });
    
    return NextResponse.json(
      { 
        success: true, 
        userId: userId.toString(),
        projectId: projectResult.insertedId.toString()
      },
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