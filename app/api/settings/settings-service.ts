import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { logger } from "@/utils/logger";

// Interfaces
export interface UserSettings {
  theme?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  [key: string]: any; // Para permitir configurações adicionais
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  settings?: T;
  statusCode: number;
  error?: string;
}

// Função auxiliar para conectar ao MongoDB
async function connectToMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

/**
 * Busca as configurações do usuário pelo email
 */
export async function getUserSettings(email: string): Promise<ApiResponse<UserSettings>> {
  if (!email) {
    return {
      success: false,
      error: "Email é obrigatório",
      statusCode: 400
    };
  }

  let client = null;
  try {
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    
    const normalizedEmail = email.toLowerCase();
    logger.info(`Buscando configurações para: ${normalizedEmail}`);
    
    const user = await db.collection("users").findOne({ email: normalizedEmail });
    
    if (!user) {
      logger.warn("Usuário não encontrado", { email: normalizedEmail });
      return {
        success: false,
        error: "Usuário não encontrado",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      settings: user.settings || {},
      statusCode: 200
    };
  } catch (error) {
    logger.error("Erro ao buscar configurações", { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: "Erro no servidor",
      statusCode: 500
    };
  } finally {
    if (client) await client.close();
  }
}

/**
 * Atualiza as configurações do usuário
 */
export async function updateUserSettings(email: string, settings: UserSettings): Promise<ApiResponse> {
  if (!email) {
    return {
      success: false,
      error: "Email é obrigatório",
      statusCode: 400
    };
  }

  if (!settings) {
    return {
      success: false,
      error: "Configurações são obrigatórias",
      statusCode: 400
    };
  }

  let client = null;
  try {
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    
    const normalizedEmail = email.toLowerCase();
    logger.info(`Atualizando configurações para: ${normalizedEmail}`);
    
    const result = await db.collection("users").updateOne(
      { email: normalizedEmail },
      { $set: { settings, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      logger.warn("Usuário não encontrado para atualização", { email: normalizedEmail });
      return {
        success: false,
        error: "Usuário não encontrado",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      message: "Configurações atualizadas com sucesso",
      statusCode: 200
    };
  } catch (error) {
    logger.error("Erro ao atualizar configurações", { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: "Erro no servidor",
      statusCode: 500
    };
  } finally {
    if (client) await client.close();
  }
}

/**
 * Altera a senha do usuário
 */
export async function changeUserPassword(email: string, data: PasswordChangeData): Promise<ApiResponse> {
  if (!email) {
    return {
      success: false,
      error: "Email é obrigatório",
      statusCode: 400
    };
  }

  if (!data.currentPassword || !data.newPassword) {
    return {
      success: false,
      error: "Todos os campos são obrigatórios",
      statusCode: 400
    };
  }
  
  if (data.newPassword.length < 6) {
    return {
      success: false,
      error: "A nova senha deve ter pelo menos 6 caracteres",
      statusCode: 400
    };
  }

  let client = null;
  try {
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    const users = db.collection("users");
    
    // Buscar usuário
    const normalizedEmail = email.toLowerCase();
    const user = await users.findOne({ email: normalizedEmail });
    
    if (!user) {
      logger.warn("Usuário não encontrado para alteração de senha", { email: normalizedEmail });
      return {
        success: false,
        error: "Usuário não encontrado",
        statusCode: 404
      };
    }
    
    // Verificar senha atual
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    
    if (!isMatch) {
      logger.warn("Tentativa de alteração de senha com senha atual incorreta", { email: normalizedEmail });
      return {
        success: false,
        error: "Senha atual incorreta",
        statusCode: 400
      };
    }
    
    // Hash nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);
    
    // Atualizar senha
    const result = await users.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    if (result.modifiedCount === 0) {
      logger.error("Falha ao atualizar senha", { email: normalizedEmail });
      return {
        success: false,
        error: "Falha ao atualizar senha",
        statusCode: 500
      };
    }
    
    logger.info("Senha alterada com sucesso", { email: normalizedEmail });
    return {
      success: true,
      message: "Senha alterada com sucesso",
      statusCode: 200
    };
  } catch (error) {
    logger.error("Erro ao alterar senha", { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro interno do servidor",
      statusCode: 500
    };
  } finally {
    if (client) await client.close();
  }
}
