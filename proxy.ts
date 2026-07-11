import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth/server"

const protectPage = auth.middleware({ loginUrl: "/auth/sign-in" })

export default function proxy(request: NextRequest) {
  // Server Actions and mutation APIs perform their own session checks. Redirecting
  // their POST payloads through a login page corrupts the action response.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next()
  }

  return protectPage(request)
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/projects/:path*",
    "/templates/:path*",
    "/account/:path*",
    "/onboarding/:path*",
    "/api/projects/:path*",
    "/api/upload/:path*",
    "/api/media/:path*",
    "/api/export/:path*",
  ],
}
