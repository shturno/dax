import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/utils/logger"
import { getCurrentProject } from "./projects-service"

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

    const result = await getCurrentProject(session.user.id)

    return NextResponse.json(
      { success: result.success, project: result.project, error: result.error },
      { status: result.statusCode }
    )

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

    const body = await req.json()
    const { createProject } = await import("./projects-service")
    
    const result = await createProject(session.user.id, body)

    return NextResponse.json(
      { success: result.success, project: result.project, error: result.error },
      { status: result.statusCode }
    )
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
    
    const body = await req.json()
    const { updateProject } = await import("./projects-service")
    
    const result = await updateProject(session.user.id, body)

    return NextResponse.json(
      { success: result.success, project: result.project, error: result.error },
      { status: result.statusCode }
    )
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