import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

async function connectToMongo() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  cachedClient = client;
  return client;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
      
        try {
          const client = await connectToMongo();
          const db = client.db('saas-dashboard');
          
          const normalizedEmail = credentials.email.toLowerCase();
          console.log(`🔍 Buscando usuário: ${normalizedEmail}`);
          
          const user = await db.collection('users').findOne({ 
            email: normalizedEmail 
          });
          
          if (!user) {
            console.log("❌ Usuário não encontrado");
            return null;
          }
          
          console.log("✅ Usuário encontrado:", user._id);
          console.log("📝 Senha fornecida:", credentials.password);
          console.log("🔐 Hash no banco:", user.password);
          
          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
          console.log("🔑 Resultado da comparação:", isPasswordMatch);
          
          if (!isPasswordMatch) {
            console.log("❌ Senha incorreta");
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.username || user.email.split('@')[0],
            email: user.email
          };
        } catch (error) {
          console.error("❌ Erro na autenticação:", error);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};