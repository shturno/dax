import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import sanitizeHtml from 'sanitize-html';

// Interface para representar a estrutura do documento
interface DocSection {
  id: string;
  title: string;
  content: string;
  isFolder?: boolean;
  parentId?: string | null;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(req: Request) {
  try {
    const sections = await req.json();

    // Validar os dados recebidos
    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    // Sanitizar e validar cada seção
    const sanitizedSections = sections.map(section => ({
      id: section.id,
      title: sanitizeHtml(section.title, { allowedTags: [] }),
      content: section.isFolder ? '' : sanitizeHtml(section.content),
      isFolder: Boolean(section.isFolder),
      parentId: section.parentId || null,
      order: section.order || 0,
      createdAt: section.createdAt ? new Date(section.createdAt) : new Date(),
      updatedAt: new Date(),
    }));

    // Salvar no MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI!);
    const db = client.db('saas-dashboard');

    // Remover documentos antigos e inserir os novos
    await db.collection('documentation').deleteMany({});
    await db.collection('documentation').insertMany(sanitizedSections);

    await client.close();

    return NextResponse.json({ success: true, count: sanitizedSections.length });
  } catch (error) {
    console.error('Erro ao salvar documentação:', error);
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 });
  }
}
