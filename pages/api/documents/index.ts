import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const documents = await Document.find({ userId: session.user.id }).sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, documents });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar documentos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, content } = req.body;
      const document = await Document.create({
        userId: session.user.id,
        title,
        content,
      });

      return res.status(201).json({ success: true, document });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro ao criar documento' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Método ${req.method} não permitido` });
  }
}