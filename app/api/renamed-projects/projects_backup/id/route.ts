import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/config/mongodb';
import { logger } from '@/utils/logger';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'ID do projeto não fornecido' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const project = await db
      .collection('projects')
      .findOne({ _id: new ObjectId(projectId) });
      
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }
    
    // Converter ObjectId para string para serialização
    const formattedProject = {
      ...project,
      _id: project._id.toString(),
      ownerId: project.ownerId.toString(),
    };
    
    return NextResponse.json(
      { success: true, project: formattedProject },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const body = await request.json();
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'ID do projeto não fornecido' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const updateData = {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      updatedAt: new Date(),
    };
    
    const result = await db
      .collection('projects')
      .updateOne(
        { _id: new ObjectId(projectId) },
        { $set: updateData }
      );
      
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }
    
    // Objeto de projeto parcial para retornar
    const updatedProject = {
      _id: projectId,
      ...updateData,
    };
    
    return NextResponse.json(
      { success: true, project: updatedProject },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'ID do projeto não fornecido' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db
      .collection('projects')
      .deleteOne({ _id: new ObjectId(projectId) });
      
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado ou já foi removido' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true },
      { status: 204 }
    );
  } catch (error) {
    logger.error('Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 