import { MongoClient, ObjectId } from "mongodb";
import { logger } from "@/utils/logger";
import { connectToDatabase } from "@/app/config/mongodb";

export interface Project {
  _id?: string | ObjectId;
  ownerId: string | ObjectId;
  name: string;
  description?: string;
  tasks?: any[];
  notes?: any[];
  roadmap?: any[];
  features?: any[];
  ideas?: any[];
  feedback?: any[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface para uso interno com MongoDB
export interface MongoProject extends Omit<Project, '_id' | 'ownerId'> {
  _id?: ObjectId;
  ownerId: ObjectId;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  tasks?: any[];
  notes?: any[];
  roadmap?: any[];
  features?: any[];
  ideas?: any[];
  feedback?: any[];
}

export interface ProjectUpdateData {
  _id: string;
  name?: string;
  description?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  project?: T;
  statusCode: number;
  error?: string;
}

// Interface para o objeto de projeto parcial retornado após atualização
export interface PartialProject extends Partial<Omit<Project, '_id'>> {
  _id: string;
}

/**
 * Busca o projeto mais recente de um usuário
 */
export async function getCurrentProject(userId: string): Promise<ApiResponse<Project>> {
  if (!userId) {
    return {
      success: false,
      error: "ID do usuário é obrigatório",
      statusCode: 400
    };
  }

  try {
    logger.info("Buscando projeto atual do usuário", { userId });

    const { db } = await connectToDatabase();
    
    const project = await db.collection("projects")
      .findOne(
        { ownerId: new ObjectId(userId) },
        { sort: { createdAt: -1 } }
      );

    if (!project) {
      logger.warn("Nenhum projeto encontrado para o usuário", { userId });
      return {
        success: false,
        error: "Nenhum projeto encontrado",
        statusCode: 404
      };
    }

    logger.info("Projeto encontrado com sucesso", { 
      projectId: project._id,
      name: project.name
    });

    // Converter ObjectId para string para facilitar serialização
    const formattedProject = {
      ...project,
      _id: project._id.toString(),
      ownerId: project.ownerId.toString()
    };

    return {
      success: true,
      project: formattedProject as Project,
      statusCode: 200
    };
  } catch (error) {
    logger.error("Erro ao buscar projeto atual", { 
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    });
    
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    return {
      success: false,
      error: errorMessage,
      statusCode: 500
    };
  }
}

/**
 * Cria um novo projeto para um usuário
 */
export async function createProject(userId: string, data: ProjectCreateData): Promise<ApiResponse<Project>> {
  if (!userId) {
    return {
      success: false,
      error: "ID do usuário é obrigatório",
      statusCode: 400
    };
  }

  if (!data.name) {
    logger.warn("Tentativa de criar projeto sem nome");
    return {
      success: false,
      error: "Nome do projeto é obrigatório",
      statusCode: 400
    };
  }

  try {
    logger.info("Iniciando criação de novo projeto", { userId });

    const { db } = await connectToDatabase();
    
    const project: MongoProject = {
      ownerId: new ObjectId(userId),
      name: data.name,
      description: data.description || "",
      tasks: data.tasks || [],
      notes: data.notes || [],
      roadmap: data.roadmap || [],
      features: data.features || [],
      ideas: data.ideas || [],
      feedback: data.feedback || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    logger.info("Criando novo projeto", { 
      userId,
      projectName: project.name
    });

    const result = await db.collection("projects").insertOne(project);
    
    logger.info("Projeto criado com sucesso", { 
      projectId: result.insertedId,
      projectName: project.name
    });

    // Converter ObjectId para string para facilitar serialização
    const createdProject = {
      ...project,
      _id: result.insertedId.toString(),
      ownerId: project.ownerId.toString()
    };

    return { 
      success: true,
      project: createdProject,
      statusCode: 201
    };
  } catch (error) {
    logger.error("Erro ao criar projeto", { 
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      error: "Erro ao criar projeto",
      statusCode: 500
    };
  }
}

/**
 * Atualiza um projeto existente
 */
export async function updateProject(userId: string, data: ProjectUpdateData): Promise<ApiResponse<PartialProject>> {
  if (!userId) {
    return {
      success: false,
      error: "ID do usuário é obrigatório",
      statusCode: 400
    };
  }
  
  if (!data._id) {
    return {
      success: false,
      error: "ID do projeto é obrigatório",
      statusCode: 400
    };
  }

  try {
    const { db } = await connectToDatabase();
    
    const updateData = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date()
    };

    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(data._id), ownerId: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Projeto não encontrado",
        statusCode: 404
      };
    }

    // Criar um objeto PartialProject para retornar
    const updatedProject: PartialProject = {
      _id: data._id,
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date()
    };
    
    return {
      success: true,
      project: updatedProject,
      statusCode: 200
    };
  } catch (error) {
    logger.error("Erro ao atualizar projeto", { 
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      error: "Erro ao atualizar projeto",
      statusCode: 500
    };
  }
}
