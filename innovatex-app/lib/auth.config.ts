import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // 1. Define protected routes
      const protectedRoutes = [
        "/dashboard", 
        "/inventory", 
        "/scan", 
        "/profile", 
        "/resources"
      ];

      const isProtectedRoute = protectedRoutes.some(route => 
        nextUrl.pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      }
      
      if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
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
} satisfies NextAuthConfig;