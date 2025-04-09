"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    website: ""
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Buscar dados do perfil
  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true)
        console.log("Buscando dados do perfil...")
        const response = await fetch("/api/profile")
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Erro na API:", response.status, errorText)
          throw new Error(`Erro ${response.status}: ${errorText}`)
        }
        
        const data = await response.json()
        console.log("Dados recebidos:", data)
        
        if (data.success) {
          setUserData(data.user)
        } else {
          toast({
            title: "Erro",
            description: data.message || "Não foi possível carregar os dados do perfil",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error)
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor ou processar a resposta",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProfileData()
    }
  }, [session, toast])

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        bio: userData.bio || "",
        location: userData.location || "",
        website: userData.website || ""
      })
    }
  }, [userData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error("Erro ao salvar perfil")
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso"
        })
        
        // Atualizar o userData com os novos dados
        setUserData({
          ...userData,
          ...formData
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Adicione esta função para lidar com a alteração de senha
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao alterar senha")
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso"
        })
        
        // Limpar os campos de senha
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !userData) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-10">
          <h1 className="text-2xl font-bold mb-6">Seu Perfil</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-pulse h-8 w-32 bg-muted rounded mb-4 mx-auto"></div>
              <p className="text-muted-foreground">Carregando seu perfil...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-10">
        <h1 className="text-2xl font-bold mb-6">Seu Perfil</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={userData.username || "Usuário"} />
                  <AvatarFallback className="text-xl">
                    {userData.username?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle>{userData.username || userData.email.split('@')[0]}</CardTitle>
                  <CardDescription>{userData.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Atualize seus dados de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      placeholder="Seu nome completo"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea 
                      id="bio" 
                      name="bio"
                      placeholder="Conte um pouco sobre você"
                      value={formData.bio}
                      rows={4}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input 
                        id="location" 
                        name="location"
                        placeholder="Sua cidade, país"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        name="website"
                        placeholder="https://seusite.com"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>Gerencie sua senha e segurança da conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input 
                      id="currentPassword" 
                      name="currentPassword"
                      type="password"
                      placeholder="Sua senha atual"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword"
                      type="password"
                      placeholder="Nova senha"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirme sua nova senha"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}