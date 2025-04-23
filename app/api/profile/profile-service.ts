import { MongoClient } from "mongodb";

async function connectToMongo() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  return client;
}

export interface User {
  _id: string;
  email: string;
  username?: string;
  password?: string;
  settings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileUpdateData {
  username?: string;
  email?: string; // Will be ignored during updates
  settings?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: T;
  statusCode: number;
}

export async function getUserProfile(email: string): Promise<ApiResponse<User>> {
  if (!email) {
    return {
      success: false,
      message: "Email é obrigatório",
      statusCode: 400
    };
  }

  let client = null;
  try {
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    
    const normalizedEmail = email.toLowerCase();
    console.log(`🔍 Buscando usuário: ${normalizedEmail}`);
    
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log("❌ Usuário não encontrado");
      return {
        success: false,
        message: "Usuário não encontrado",
        statusCode: 404
      };
    }
    
    // Remover senha e outras informações sensíveis
    const { password, ...userWithoutPassword } = user;
    
    // Ensure the user object conforms to the User interface
    const typedUser: User = {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return {
      success: true,
      user: typedUser,
      statusCode: 200
    };
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return {
      success: false,
      message: "Erro no servidor",
      statusCode: 500
    };
  } finally {
    if (client) await client.close();
  }
}

export async function updateUserProfile(email: string, data: ProfileUpdateData): Promise<ApiResponse> {
  if (!email) {
    return {
      success: false,
      message: "Email é obrigatório",
      statusCode: 400
    };
  }

  let client = null;
  try {
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    
    const normalizedEmail = email.toLowerCase();
    console.log(`🔄 Atualizando usuário: ${normalizedEmail}`);
    
    // Não permitir alteração do email
    const { email: newEmail, ...updateData } = data;
    
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
      return {
        success: false,
        message: "Usuário não encontrado",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      message: "Perfil atualizado com sucesso",
      statusCode: 200
    };
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    return {
      success: false,
      message: "Erro ao atualizar perfil",
      statusCode: 500
    };
  } finally {
    if (client) await client.close();
  }
}
