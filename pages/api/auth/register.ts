import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { username, email, password } = req.body;

      // Verificar se o usuário já existe
      const userExists = await User.findOne({ email });

      if (userExists) {
        return res.status(400).json({ success: false, message: 'Usuário já existe' });
      }

      // Criar novo usuário
      const user = await User.create({
        username,
        email,
        password,
      });

      return res.status(201).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Método ${req.method} não permitido` });
  }
}