import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

interface UserWithPassword extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  username: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        // Verificar se as credenciais foram fornecidas
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais incompletas");
        }

        await dbConnect();

        // Verificar email e senha
        const user = await User.findOne({ email: credentials.email }).select("+password") as UserWithPassword;

        if (!user) {
          throw new Error("Email ou senha inválidos");
        }

        // Verificar se a senha coincide
        const isMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isMatch) {
          throw new Error("Email ou senha inválidos");
        }

        // Retornar os dados do usuário em um formato compatível com o NextAuth
        return {
          id: user._id.toString(), // Convertendo para string para garantir compatibilidade
          email: user.email,
          name: user.username, // NextAuth espera 'name', não 'username'
          username: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);