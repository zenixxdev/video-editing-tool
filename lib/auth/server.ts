import { createNeonAuth } from "@neondatabase/auth/next/server";
import { AUTH_BASE_URL } from "@/lib/constants";
const secret=process.env.NEON_AUTH_COOKIE_SECRET;
if(!secret || secret.length<32) throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters");
export const auth=createNeonAuth({baseUrl:process.env.NEON_AUTH_BASE_URL ?? AUTH_BASE_URL,cookies:{secret,sessionDataTtl:300,sameSite:process.env.NODE_ENV==="development"?"none":"lax"}});
export async function getUser(){const {data}=await auth.getSession(); return data?.user ?? null;}
export async function requireUser(){const user=await getUser();if(!user) throw new Error("Unauthorized");return user;}
