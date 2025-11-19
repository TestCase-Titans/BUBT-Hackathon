// proxy.ts
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const protectedRoutes = [
    "/dashboard",
    "/inventory",
    "/scan",
    "/profile",
    "/resources",
  ];

  // 1. Define routes that logged-in users should NOT see
  const authRoutes = ["/login", "/register"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // 2. Redirect GUEST trying to access PROTECTED route -> Login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 3. Redirect MEMBER trying to access AUTH route -> Dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Matcher ignores api, static files, images, etc.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
