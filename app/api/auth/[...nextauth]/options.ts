import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { DefaultUser } from "next-auth";
import prisma from "@/lib/prisma";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string
    credits?: number
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role: user.role,
          credits: user.credits,
        }
      };
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
};