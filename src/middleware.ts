import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Use base config without Prisma adapter for Edge runtime compatibility
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: [
    // Only run middleware on protected routes
    "/dashboard/:path*",
    "/mastery/:path*",
    "/build/:path*",
    "/hunt/:path*",
    "/academy/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/achievements/:path*",
  ],
};
