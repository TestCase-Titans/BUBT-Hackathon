import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

// 1. Assign the auth logic to a variable
const authMiddleware = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const protectedRoutes = [
    "/dashboard",
    "/inventory",
    "/scan",
    "/profile",
    "/resources",
  ];
  const authRoutes = ["/login", "/register"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// 2. Export it as 'proxy' instead of default
export const proxy = authMiddleware;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};