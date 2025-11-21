import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
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

      // [NEW] Protect Admin Route
      if (nextUrl.pathname.startsWith('/admin')) {
        if (auth?.user && (auth.user as any).isAdmin) return true;
        return false; // Redirect if not admin
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).isAdmin = token.isAdmin; // [NEW] Pass to client
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.isAdmin = (user as any).isAdmin; // [NEW] Persist in token
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;