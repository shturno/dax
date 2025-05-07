import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { connectToDatabase } = await import('@/app/config/mongodb');
    const { db } = await connectToDatabase();
    const { ObjectId } = await import('mongodb');
    const projectId = params.id;
    const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
    }
    const formattedProject = {
      _id: project._id.toString(),
      name: project.name,
      description: project.description,
      ownerId: project.ownerId.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
    return NextResponse.json({ success: true, project: formattedProject });
  } catch (err: any) {
    console.error('Erro ao buscar projeto:', err);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
