import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Session } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const session = await getSession({ req }) as Session | null;

  // Verificar se a sessão e o usuário existem
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ success: false, message: 'Não autorizado' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }
      
      return res.status(200).json({ success: true, settings: user.settings });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar configurações' });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { settings: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      return res.status(200).json({ success: true, settings: updatedUser.settings });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar configurações' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ success: false, message: `Método ${req.method} não permitido` });
  }
}