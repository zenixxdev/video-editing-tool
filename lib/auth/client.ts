"use client"

import { createAuthClient } from "@neondatabase/auth/next"

// Same-origin requests let the Next.js auth proxy handle cookies and CSRF protection.
// Works with any preview URL (*.vusercontent.net) without per-domain whitelisting.
export const authClient = createAuthClient()
