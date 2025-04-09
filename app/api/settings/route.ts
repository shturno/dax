import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// GET: Obter dados do perfil
export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const user = await User.findById(session.user.id).select("-password")
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        location: user.location || "",
        website: user.website || ""
      }
    })
  } catch (error: any) {
    console.error("Erro ao buscar perfil:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PUT: Atualizar dados do perfil
export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    const { fullName, bio, location, website } = data
    
    await dbConnect()
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          fullName, 
          bio, 
          location, 
          website 
        } 
      },
      { new: true }
    ).select("-password")
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName || "",
        bio: updatedUser.bio || "",
        avatarUrl: updatedUser.avatarUrl || "",
        location: updatedUser.location || "",
        website: updatedUser.website || ""
      }
    })
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST: Alterar senha do usuário
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    const { currentPassword, newPassword } = await request.json()
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }
    
    await dbConnect()
    
    // Buscar usuário com senha
    const user = await User.findById(session.user.id).select("+password")
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    // Verificar se a senha atual está correta
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Senha atual incorreta" },
        { status: 400 }
      )
    }
    
    // Gerar hash da nova senha
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    
    // Atualizar a senha
    await User.findByIdAndUpdate(
      session.user.id,
      { $set: { password: hashedPassword } }
    )
    
    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso"
    })
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}