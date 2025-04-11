import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getMongoClient() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET deve ser definido");
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
          console.log("❌ Credenciais incompletas");
          return null;
        }
      
        let client;
        try {
          client = await getMongoClient();
          const db = client.db("saas-dashboard");
          
          console.log(`🔍 Buscando usuário: ${credentials.email}`);
          const user = await db.collection("users").findOne({ email: credentials.email });
          
          if (!user) {
            console.log("❌ Usuário não encontrado");
            return null;
          }
          
          console.log("📝 Senha fornecida:", credentials.password);
          console.log("🔐 Hash no banco:", user.password);
          
          const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
          console.log("🔑 Resultado da comparação:", isPasswordMatch);
          
          if (!isPasswordMatch) {
            console.log("❌ Senha incorreta");
            return null;
          }
          
          console.log("✅ Autenticação bem-sucedida");
          return {
            id: user._id.toString(),
            name: user.username || user.email.split("@")[0],
            email: user.email
          };
        } catch (error) {
          console.error("❌ Erro na autenticação:", error);
          return null;
        } finally {
          if (client) await client.close();
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };