import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        
        if (!credentials?.email || !credentials?.password) return null;

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string, 
          user.password
        );

        if (passwordsMatch) {
          return { 
            id: user._id.toString(), 
            name: user.name, 
            email: user.email 
          };
        }
        
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET, 
});