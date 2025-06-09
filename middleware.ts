import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a simplified middleware that doesn't actually check authentication
  // since Firebase auth is client-side. In a real app, you would use a server-side
  // session mechanism or Firebase Admin SDK to verify the session.

  // For now, we'll just redirect unauthenticated users to the login page
  // if they try to access protected routes directly.

  // Get the pathname
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path.startsWith("/auth/")

  // For this example, we'll assume all other paths require authentication
  // In a real app, you would check for a valid session cookie

  // If it's not a public path, redirect to login
  // This is just a placeholder - in a real app, you would check for a valid session
  if (!isPublicPath) {
    // In a real implementation, you would check for a valid session here
    // For now, we'll just let the client-side auth handle redirects
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
