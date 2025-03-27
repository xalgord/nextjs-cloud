import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: Request) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Define protected routes
  const protectedPaths = ["/dashboard", "/api/drive"];

  // Check if the current path is a protected path
  const isProtectedPath = protectedPaths.some((path) =>
    request.url.includes(path)
  );

  if (isProtectedPath && !isAuthenticated) {
    // Redirect to login page if trying to access protected route without authentication
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", new URL(request.url).pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/drive/:path*"], // Protect dashboard and API routes
};
