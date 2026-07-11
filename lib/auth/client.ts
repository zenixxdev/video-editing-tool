"use client"

import { createAuthClient } from "@neondatabase/auth/next"

// Keep requests same-origin so the Next.js auth proxy owns cookies and origin checks.
export const authClient = createAuthClient()
