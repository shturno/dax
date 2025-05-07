import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/utils/logger';
import { getCurrentProject } from './projects-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Remover a validação redundante do token
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn('Tentativa de acesso não autenticada');
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Log para depuração
    console.log('Sessão válida para o usuário:', session.user.id);

    const { db } = await (await import('@/app/config/mongodb')).connectToDatabase();
    const { ObjectId } = await import('mongodb');
    const ownerId = new ObjectId(session.user.id);
    const projects = await db
      .collection('projects')
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Projetos encontrados no banco de dados:', projects);

    const formattedProjects = projects.map((project: any) => ({
      _id: project._id.toString(),
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        projects: formattedProjects,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Erro ao buscar projetos do usuário', {
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Remover a validação redundante do token
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn('Tentativa de criar projeto sem autenticação');
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Log para depuração
    console.log('Sessão válida para o usuário:', session.user.id);

    const body = await req.json();
    const { createProject } = await import('./projects-service');

    const result = await createProject(session.user.id, body);

    return new Response(
      JSON.stringify({ success: result.success, project: result.project, error: result.error }),
      { status: result.statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Erro ao criar projeto', {
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ error: 'Erro ao criar projeto' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Remover a validação redundante do token
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Log para depuração
    console.log('Sessão válida para o usuário:', session.user.id);

    const body = await req.json();
    const { updateProject } = await import('./projects-service');

    const result = await updateProject(session.user.id, body);

    return new Response(
      JSON.stringify({ success: result.success, project: result.project, error: result.error }),
      { status: result.statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Erro ao atualizar projeto', {
      error: error instanceof Error ? error.stack : error,
      timestamp: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ error: 'Erro ao atualizar projeto' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
