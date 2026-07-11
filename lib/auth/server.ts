import "server-only"

import { createNeonAuth } from "@neondatabase/auth/next/server"
import { AUTH_BASE_URL } from "@/lib/constants"

const baseUrl = process.env.NEON_AUTH_BASE_URL ?? AUTH_BASE_URL
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET
if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error("NEON_AUTH_COOKIE_SECRET must contain at least 32 characters")
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
    sessionDataTtl: 300,
    sameSite: "lax",
  },
  logLevel: process.env.NODE_ENV === "production" ? "error" : "warn",
})

export async function getUser() {
  const { data } = await auth.getSession()
  return data?.user ?? null
}

export async function requireUser() {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}
