"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Eye, EyeOff, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react"
import { authClient } from "@/lib/auth/client"
import { Button, Input, Logo } from "@/components/ui"

function friendlyAuthError(message?: string) {
  const value = message?.toLowerCase() ?? ""
  if (value.includes("origin")) return "This preview URL is not approved for authentication yet. Refresh once and retry."
  if (value.includes("already exists")) return "An account already exists for this email. Try signing in instead."
  if (value.includes("password")) return "Check your password. It must be at least 8 characters."
  if (value.includes("invalid email")) return "Enter a valid email address."
  if (value.includes("invalid email or password")) return "The email or password does not match."
  return message || "We could not complete that request. Please retry."
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "").trim().toLowerCase()
    const password = String(form.get("password") ?? "")
    const name = String(form.get("name") ?? "").trim()

    try {
      const result = mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })
      if (result.error) throw new Error(result.error.message)
      router.replace("/dashboard")
      router.refresh()
    } catch (cause) {
      setError(friendlyAuthError(cause instanceof Error ? cause.message : undefined))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main" className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden border-r bg-card p-10 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label="LyricFlow home"><Logo /></Link>
        <div className="relative mx-auto w-full max-w-xl py-16">
          <div className="absolute inset-12 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto aspect-[9/16] w-52 overflow-hidden rounded-[2rem] border bg-background p-3 shadow-2xl">
            <div className="flex h-full flex-col justify-between rounded-[1.4rem] bg-secondary p-5">
              <span className="font-mono text-xs text-primary">00:08.24</span>
              <div className="flex flex-col gap-3 text-center">
                <span className="text-sm text-muted-foreground">I found the rhythm</span>
                <strong className="text-3xl leading-tight">between every word.</strong>
                <span className="mx-auto h-1 w-16 rounded-full bg-primary" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground"><span>9:16</span><span>30 FPS</span></div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-pretty text-3xl font-semibold">Turn lyrics into scroll-stopping short video.</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Check /> Private media</span>
            <span className="flex items-center gap-2"><Check /> Real MP4 exports</span>
            <span className="flex items-center gap-2"><Check /> Autosaved edits</span>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Link href="/"><Logo /></Link></div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {mode === "sign-in" ? <ShieldCheck /> : <Sparkles />}
          </div>
          <p className="mt-6 font-mono text-sm text-primary">{mode === "sign-in" ? "WELCOME BACK" : "YOUR STUDIO STARTS HERE"}</p>
          <h1 className="mt-2 text-balance text-4xl font-bold tracking-tight">{mode === "sign-in" ? "Sign in to keep creating." : "Create your LyricFlow account."}</h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">Your projects, uploads, and exports stay private and connected to this account.</p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
            {mode === "sign-up" && <label className="flex flex-col gap-2 text-sm font-medium">Name<Input name="name" required autoComplete="name" placeholder="Your name" /></label>}
            <label className="flex flex-col gap-2 text-sm font-medium">Email<Input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium">Password
              <span className="relative">
                <Input name="password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="pr-12" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-muted-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button>
              </span>
              {mode === "sign-up" && <span className="text-xs font-normal text-muted-foreground">Use 8 or more characters.</span>}
            </label>
            {error && <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground"><strong>Authentication could not continue.</strong><p className="mt-1 text-muted-foreground">{error}</p></div>}
            <Button type="submit" disabled={loading} className="w-full">{loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}{loading ? "Securing your session…" : mode === "sign-in" ? "Sign in" : "Create account"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">{mode === "sign-in" ? "New to LyricFlow?" : "Already have an account?"} <Link className="font-semibold text-foreground underline decoration-primary underline-offset-4" href={mode === "sign-in" ? "/auth/sign-up" : "/auth/sign-in"}>{mode === "sign-in" ? "Create an account" : "Sign in"}</Link></p>
          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">By continuing, you agree to use LyricFlow for media you own or are licensed to edit.</p>
        </div>
      </section>
    </main>
  )
}
