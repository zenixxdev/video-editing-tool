import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Clock3, Copy, Film, FolderOpen, MoreHorizontal, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getUser } from "@/lib/auth/server"
import { archiveProjectAction, duplicateProjectAction, listProjects } from "@/app/actions/projects"
import { AppShell } from "@/components/app-shell"
import { Badge, Button, Card } from "@/components/ui"

export const dynamic = "force-dynamic"
export const metadata = { title: "Studio" }

export default async function Page() {
  const user = await getUser()
  if (!user) redirect("/auth/sign-in")
  const items = await listProjects()
  const recent = items[0]
  return <AppShell user={user}>
    <main id="main" className="mx-auto max-w-7xl px-5 pb-28 pt-8 md:px-8">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="font-mono text-sm text-primary">CREATOR STUDIO</p><h1 className="mt-2 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Make something worth replaying.</h1><p className="mt-3 text-muted-foreground">Welcome back, {user.name?.split(" ")[0] || "creator"}. Your latest edits are ready.</p></div>
        <Link href="/projects/new"><Button><Plus /> New video</Button></Link>
      </section>

      {recent && <section className="mt-9 overflow-hidden rounded-2xl bg-card"><div className="grid lg:grid-cols-[1.15fr_.85fr]"><div className="flex min-h-64 items-center justify-center bg-secondary p-7"><div className="relative aspect-[9/16] h-52 overflow-hidden rounded-xl bg-background shadow-xl"><svg aria-hidden="true" viewBox="0 0 180 320" className="absolute inset-0 size-full"><path d="M-20 260C35 218 103 210 202 88" stroke="currentColor" className="text-primary/25" strokeWidth="35" fill="none" /><circle cx="142" cy="62" r="38" fill="currentColor" className="text-primary/10" /></svg><div className="absolute inset-0 flex items-center justify-center p-5 text-center font-serif text-2xl">Make every<br /><span className="text-primary">word move.</span></div></div></div><div className="flex flex-col justify-center p-7"><Badge className="w-fit">Continue editing</Badge><h2 className="mt-5 text-3xl font-semibold">{recent.title}</h2><p className="mt-2 text-muted-foreground">Updated {formatDistanceToNow(recent.updatedAt, { addSuffix: true })} · {recent.width} × {recent.height}</p><div className="mt-7 flex flex-wrap gap-3"><Link href={`/editor/${recent.id}`}><Button>Open editor <ArrowRight /></Button></Link><form action={duplicateProjectAction}><input type="hidden" name="id" value={recent.id} /><Button variant="secondary" type="submit"><Copy /> Duplicate</Button></form></div></div></div></section>}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Active projects</span><FolderOpen className="text-primary" /></div><p className="mt-4 text-3xl font-bold">{items.length}</p><p className="mt-1 text-xs text-muted-foreground">Private drafts in your studio</p></Card>
        <Card className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Quick format</span><Film className="text-primary" /></div><p className="mt-4 text-3xl font-bold">9:16</p><p className="mt-1 text-xs text-muted-foreground">Reels, Shorts, and Spotlight ready</p></Card>
        <Card className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Autosave</span><Sparkles className="text-primary" /></div><p className="mt-4 text-3xl font-bold">On</p><p className="mt-1 text-xs text-muted-foreground">Revision-safe cloud saves</p></Card>
      </section>

      <section className="mt-12"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold">All projects</h2><p className="mt-1 text-sm text-muted-foreground">Open, duplicate, or archive your work.</p></div><label className="flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3"><Search /><input aria-label="Search projects" placeholder="Search projects" className="min-w-0 bg-transparent text-sm outline-none" /></label></div>
        {items.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((project, index) => <Card key={project.id} className="group overflow-hidden"><Link href={`/editor/${project.id}`} className="block"><div className="relative flex aspect-video items-center justify-center bg-secondary"><div className="aspect-[9/16] h-[80%] rounded-md bg-background p-3 text-center shadow-lg"><div className="flex h-full items-center justify-center text-sm font-semibold">{index % 2 ? "Find the rhythm" : "Every word matters"}</div></div><span className="absolute bottom-3 left-3 rounded bg-background/80 px-2 py-1 font-mono text-[10px]">{project.width === project.height ? "1:1" : project.height / project.width > 1.5 ? "9:16" : "4:5"}</span></div></Link><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/editor/${project.id}`} className="truncate font-semibold hover:text-primary">{project.title}</Link><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 /> {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</p></div><details className="relative"><summary aria-label={`Actions for ${project.title}`} className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-secondary"><MoreHorizontal /></summary><div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border bg-card p-1 shadow-xl"><form action={duplicateProjectAction}><input type="hidden" name="id" value={project.id} /><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"><Copy /> Duplicate</button></form><form action={archiveProjectAction}><input type="hidden" name="id" value={project.id} /><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-secondary"><Trash2 /> Archive</button></form></div></details></div></div></Card>)}</div> : <Card className="mt-6 flex flex-col items-center p-12 text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Upload /></span><h3 className="mt-5 text-2xl font-semibold">Your studio is ready.</h3><p className="mt-2 max-w-md text-muted-foreground">Create a project, upload your soundtrack, and time your first lyric line.</p><Link href="/projects/new" className="mt-6"><Button>Create your first video</Button></Link></Card>}
      </section>
    </main>
  </AppShell>
}
