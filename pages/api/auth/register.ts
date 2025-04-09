import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceitar requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    // Conectar ao banco de dados
    await dbConnect()

    const { username, email, password } = req.body

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    })

    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário ou email já estão em uso' 
      })
    }

    // Criar o usuário
    const user = await User.create({
      username,
      email,
      password, // O hash da senha será criado pelo hook pre-save no modelo
    })

    return res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor',
    })
  }
}