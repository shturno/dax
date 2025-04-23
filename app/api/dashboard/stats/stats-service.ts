import { MongoClient } from "mongodb";
import { logger } from "@/utils/logger";

// Interfaces
export interface DashboardStats {
  totalUsers: number;
  activities: Activity[];
  // Outras estatísticas podem ser adicionadas aqui
}

export interface Activity {
  _id?: string;
  userEmail: string;
  action: string;
  target?: string;
  details?: any;
  createdAt: Date;
}

// Interface para uso interno com MongoDB
export interface MongoActivity extends Omit<Activity, '_id'> {
  _id?: any; // ObjectId do MongoDB
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  stats?: T;
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
 * Busca as estatísticas do dashboard para um usuário
 */
export async function getDashboardStats(email: string): Promise<ApiResponse<DashboardStats>> {
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
    
    logger.info(`Buscando estatísticas do dashboard para: ${email.toLowerCase()}`);
    
    // Exemplo: Contagem total de usuários
    const totalUsers = await db.collection("users").countDocuments();
    
    // Exemplo: Atividades recentes
    const activitiesResult = await db.collection("activities")
      .find({ userEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
      
    // Converter para o formato esperado
    const activities: Activity[] = activitiesResult.map(doc => ({
      _id: doc._id?.toString(),
      userEmail: doc.userEmail,
      action: doc.action,
      target: doc.target,
      details: doc.details,
      createdAt: doc.createdAt
    }));
    
    // Aqui você pode adicionar mais consultas para outras estatísticas
    // Por exemplo, contagem de projetos, tarefas, etc.
    
    return {
      success: true,
      stats: {
        totalUsers,
        activities
      },
      statusCode: 200
    };
  } catch (error) {
    logger.error("Erro ao buscar estatísticas do dashboard", { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      email
    });
    return {
      success: false,
      error: "Erro ao buscar estatísticas",
      statusCode: 500
    };
  } finally {
    if (client) await client.close();
  }
}

/**
 * Registra uma nova atividade para um usuário
 */
export async function recordActivity(activity: Omit<Activity, 'createdAt'>): Promise<ApiResponse> {
  if (!activity.userEmail) {
    return {
      success: false,
      error: "Email do usuário é obrigatório",
      statusCode: 400
    };
  }

  if (!activity.action) {
    return {
      success: false,
      error: "Ação é obrigatória",
      statusCode: 400
    };
  }

  let client = null;
  try {
    client = await connectToMongo();
    const db = client.db("saas-dashboard");
    
    // Preparar documento para inserção no MongoDB
    const newActivity: MongoActivity = {
      userEmail: activity.userEmail.toLowerCase(),
      action: activity.action,
      target: activity.target,
      details: activity.details,
      createdAt: new Date()
    };
    
    logger.info(`Registrando atividade para: ${newActivity.userEmail}`, { 
      action: newActivity.action,
      target: newActivity.target
    });
    
    await db.collection("activities").insertOne(newActivity);
    
    return {
      success: true,
      message: "Atividade registrada com sucesso",
      statusCode: 201
    };
  } catch (error) {
    logger.error("Erro ao registrar atividade", { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      activity
    });
    return {
      success: false,
      error: "Erro ao registrar atividade",
      statusCode: 500
    };
  } finally {
    if (client) await client.close();
  }
}
