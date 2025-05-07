import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import getUserModel from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const User = await getUserModel();

    // Verifica se a conexão está estabelecida e o objeto db existe
    if (!mongoose.connection || mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection not established' 
      });
    }

    // Coleta informações sobre a conexão sem modificar dados
    const dbInfo = {
      connected: mongoose.connection.readyState === 1,
      name: mongoose.connection.db.databaseName,
      collections: await mongoose.connection.db
        .collections()
        .then(cols => cols.map(c => c.collectionName)),
      userModelDb: User.db.name,
      // Apenas conta documentos sem retorná-los
      userCount: await User.countDocuments(),
    };

    return NextResponse.json({ success: true, dbInfo });
  } catch (error) {
    console.error('Erro ao verificar DB:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
