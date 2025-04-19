import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/utils/logger"
import { MongoClient, ObjectId } from "mongodb"
import { connectToDatabase } from "@/app/config/mongodb"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      logger.warn("Tentativa de acesso não autenticada")
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    logger.info("Buscando projeto atual do usuário", { userId: session.user.id })

    const { db } = await connectToDatabase()
    
    const project = await db.collection("projects")
      .findOne(
        { ownerId: new ObjectId(session.user.id) },
        { sort: { createdAt: -1 } }
      )

    if (!project) {
      logger.warn("Nenhum projeto encontrado para o usuário", { userId: session.user.id })
      return NextResponse.json(
        { error: "Nenhum projeto encontrado" },
        { status: 404 }
      )
    }

    logger.info("Projeto encontrado com sucesso", { 
      projectId: project._id,
      name: project.name
    })

    return NextResponse.json({
      success: true,
      project
    })

  } catch (error) {
    logger.error("Erro ao buscar projeto atual", { 
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    })
    
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger.warn("Tentativa de criar projeto sem autenticação")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    logger.info("Iniciando criação de novo projeto", { userId: session.user.id })

    const { db } = await connectToDatabase()
    const body = await req.json()
    
    if (!body.name) {
      logger.warn("Tentativa de criar projeto sem nome")
      return NextResponse.json(
        { error: "Nome do projeto é obrigatório" },
        { status: 400 }
      )
    }

    const project = {
      ownerId: new ObjectId(session.user.id),
      name: body.name,
      description: body.description || "",
      tasks: body.tasks || [],
      notes: body.notes || [],
      roadmap: body.roadmap || [],
      features: body.features || [],
      ideas: body.ideas || [],
      feedback: body.feedback || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    logger.info("Criando novo projeto", { 
      userId: session.user.id,
      projectName: project.name
    })

    const result = await db.collection("projects").insertOne(project)
    
    logger.info("Projeto criado com sucesso", { 
      projectId: result.insertedId,
      projectName: project.name
    })

    return NextResponse.json({ 
      success: true,
      project: { ...project, _id: result.insertedId } 
    })
  } catch (error) {
    logger.error("Erro ao criar projeto", { 
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { error: "Erro ao criar projeto" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    const { db } = await connectToDatabase()
    const body = await req.json()
    
    if (!body._id) {
      return NextResponse.json({ error: "ID do projeto é obrigatório" }, { status: 400 })
    }

    const updateData = {
      name: body.name,
      description: body.description,
      updatedAt: new Date()
    }

    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(body._id), ownerId: new ObjectId(session.user.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, project: { ...updateData, _id: body._id } })
  } catch (error) {
    logger.error("Erro ao atualizar projeto", { 
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { error: "Erro ao atualizar projeto" },
      { status: 500 }
    )
  }
}