import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserProfile {
  _id: ObjectId;
  username: string;
  email: string;
  password?: string;
  settings?: {
    projectName?: string;
    projectDescription?: string;
    notifications?: boolean;
    autoSave?: boolean;
    fontSize?: number;
    primaryColor?: string;
  };
}

async function fetchProfileData(): Promise<UserProfile | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  let client = null;
  try {
    client = await new MongoClient(process.env.MONGODB_URI!).connect();
    const db = client.db("saas-dashboard");
    const user = await db.collection("users").findOne({ email: session.user.email.toLowerCase() });
    return user ? { ...user, password: undefined } as UserProfile : null;
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  } finally {
    if (client) await client.close();
  }
}

export default async function ProfilePage() {
  const profileData = await fetchProfileData();
  if (!profileData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-destructive/10 rounded-full">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground text-center">Você precisa estar logado para ver esta página.</p>
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                Fazer Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/profile/edit"
              className="inline-flex items-center px-4 py-2 border border-border rounded-md text-sm font-medium bg-muted hover:bg-muted/80"
            >
              Editar Perfil
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Usuário</dt>
                    <dd className="mt-1 text-sm">{profileData.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="mt-1 text-sm">{profileData.email}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Notificações</dt>
                    <dd className="mt-1 flex items-center">
                      <span className={`inline-block h-4 w-4 rounded-full ${profileData.settings?.notifications ? "bg-green-400" : "bg-gray-600"}`}></span>
                      <span className="ml-2 text-sm">
                        {profileData.settings?.notifications ? "Ativadas" : "Desativadas"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Auto Save</dt>
                    <dd className="mt-1 flex items-center">
                      <span className={`inline-block h-4 w-4 rounded-full ${profileData.settings?.autoSave ? "bg-green-400" : "bg-gray-600"}`}></span>
                      <span className="ml-2 text-sm">
                        {profileData.settings?.autoSave ? "Ativado" : "Desativado"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Tamanho da Fonte</dt>
                    <dd className="mt-1 text-sm">{profileData.settings?.fontSize || 16}px</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Cor Primária</dt>
                    <dd className="mt-1 text-sm flex items-center">
                      <span
                        className="inline-block h-4 w-4 rounded-full mr-2"
                        style={{ backgroundColor:
                          profileData.settings?.primaryColor === "red" ? "#ef4444" :
                          profileData.settings?.primaryColor === "green" ? "#10b981" :
                          profileData.settings?.primaryColor === "purple" ? "#8b5cf6" :
                          profileData.settings?.primaryColor === "amber" ? "#f59e0b" :
                          "#3b82f6"
                        }}
                      ></span>
                      {profileData.settings?.primaryColor === "default"
                        ? "Padrão (Azul)"
                        : profileData.settings?.primaryColor
                        ? profileData.settings.primaryColor.charAt(0).toUpperCase() + profileData.settings.primaryColor.slice(1)
                        : "Padrão (Azul)"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Configurações do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="text-base font-medium">{profileData.settings?.projectName || "Meu Projeto"}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {profileData.settings?.projectDescription || "Nenhuma descrição fornecida."}
                  </p>
                </div>
                <div className="border-t border-border pt-5">
                  <div className="flex justify-end">
                    <Link
                      href="/"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Ir para Dashboard
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}