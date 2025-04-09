import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// GET: Obter dados do perfil
export async function GET() {
  try {
    const session = await getServerSession()
    
    // Verificação flexível da sessão
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email }).select("-password")
    
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
        username: user.username || session.user.email?.split('@')[0] || "Usuário",
        email: user.email,
        fullName: user.fullName || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatarUrl: user.avatarUrl || "",
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
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    const { fullName, bio, location, website } = data
    
    await dbConnect()
    
    // Encontrar e atualizar o usuário pelo email (mais confiável que o id no contexto do NextAuth)
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
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
        location: updatedUser.location || "",
        website: updatedUser.website || "",
        avatarUrl: updatedUser.avatarUrl || "",
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