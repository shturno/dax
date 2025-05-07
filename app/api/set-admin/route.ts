import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'shturno@proton.me';
  const secretKey = searchParams.get('key');

  if (secretKey !== 'suasenhasecreta123') {
    return NextResponse.json({ error: 'Chave inválida' }, { status: 401 });
  }

  const MONGODB_URI = process.env.MONGODB_URI!;
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('saas-dashboard');

    const result = await db.collection('users').updateOne({ email }, { $set: { role: 'admin' } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error: 'Usuário não encontrado',
        },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        message: 'Usuário já tem role admin',
        success: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Usuário com email ${email} agora é admin`,
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar usuário',
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
