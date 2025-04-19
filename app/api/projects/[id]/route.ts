import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/config/mongodb"
import { logger } from "@/utils/logger"
import { ObjectId } from "mongodb"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function isValidObjectId(id: string): boolean {
  try {
    new ObjectId(id)
    return true
  } catch (error) {
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  logger.info("Iniciando busca para projeto", { id })

  try {
    // Validar ID
    if (!id) {
      logger.warn("ID do projeto não fornecido")
      return NextResponse.json(
        { error: "ID do projeto é obrigatório" },
        { status: 400 }
      )
    }

    if (!isValidObjectId(id)) {
      logger.error("ID inválido", { id })
      return NextResponse.json(
        { error: "Formato de ID inválido" },
        { status: 400 }
      )
    }

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger.warn("Tentativa de acesso não autenticada")
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Conectar ao banco
    const db = await getDb()
    logger.debug("Conexão com banco estabelecida")

    // Buscar projeto
    const project = await db.collection("projects").findOne({
      _id: new ObjectId(id),
      ownerId: session.user.id
    })

    if (!project) {
      logger.warn("Projeto não encontrado ou não pertence ao usuário", { 
        id, 
        userId: session.user.id 
      })
      return NextResponse.json(
        { error: "Projeto não encontrado" },
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
    logger.error("Erro crítico ao buscar projeto", { 
      error: error instanceof Error ? error.stack : error,
      id,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  logger.info("Iniciando atualização do projeto", { id })

  try {
    // Validar ID
    if (!id) {
      logger.warn("ID do projeto não fornecido")
      return NextResponse.json(
        { error: "ID do projeto é obrigatório" },
        { status: 400 }
      )
    }

    if (!isValidObjectId(id)) {
      logger.error("ID inválido", { id })
      return NextResponse.json(
        { error: "Formato de ID inválido" },
        { status: 400 }
      )
    }

    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger.warn("Tentativa de acesso não autenticada")
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Validar corpo da requisição
    const body = await request.json()
    if (!body.name || typeof body.name !== 'string') {
      logger.warn("Nome do projeto inválido", { body })
      return NextResponse.json(
        { error: "Nome do projeto é obrigatório" },
        { status: 400 }
      )
    }

    // Conectar ao banco
    const db = await getDb()
    logger.debug("Conexão com banco estabelecida")

    // Verificar existência do projeto
    const existingProject = await db.collection("projects").findOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(session.user.id)
    })

    if (!existingProject) {
      logger.warn("Projeto não encontrado ou não pertence ao usuário", { 
        id, 
        userId: session.user.id 
      })
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar projeto
    const updateData = {
      name: body.name,
      description: body.description,
      updatedAt: new Date()
    }

    logger.info("Atualizando projeto", { id, updateData })

    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      logger.warn("Nenhuma modificação realizada", { id })
      return NextResponse.json(
        { error: "Nenhuma modificação realizada" },
        { status: 400 }
      )
    }

    // Buscar projeto atualizado
    const updatedProject = await db.collection("projects").findOne({ 
      _id: new ObjectId(id) 
    })

    if (!updatedProject) {
      logger.error("Projeto não encontrado após atualização", { id })
      return NextResponse.json(
        { error: "Erro ao buscar projeto atualizado" },
        { status: 500 }
      )
    }

    logger.info("Projeto atualizado com sucesso", { 
      projectId: updatedProject._id,
      name: updatedProject.name
    })

    return NextResponse.json({
      success: true,
      project: updatedProject
    })

  } catch (error) {
    logger.error("Erro crítico ao atualizar projeto", { 
      error: error instanceof Error ? error.stack : error,
      id,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}