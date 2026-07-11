import Link from "next/link"
import { ArrowRight, AudioLines, Captions, Check, Film, Play, PlaySquare, ShieldCheck, Smartphone, Sparkles, Type, WandSparkles, Zap } from "lucide-react"
import { Badge, Button, Card, Logo } from "@/components/ui"
import { TEMPLATES } from "@/lib/constants"

const features = [
  { icon: Captions, title: "Lyrics that hit on cue", copy: "Trim every line directly on a multitrack timeline with frame-friendly controls." },
  { icon: Sparkles, title: "Motion made for words", copy: "Use polished entrance presets, keyframes, positioning, scale, and opacity." },
  { icon: AudioLines, title: "One soundtrack, fully in sync", copy: "Upload private audio, scrub precisely, and keep every lyric moment aligned." },
  { icon: Film, title: "Built for vertical feeds", copy: "Compose within platform safe zones and export a private, ready-to-post MP4." },
]

export default function Home() {
  return <>
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <Logo />
        <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"><a href="#workflow">Workflow</a><a href="#templates">Templates</a><a href="#features">Features</a></div>
        <div className="flex items-center gap-2"><Link href="/auth/sign-in" className="hidden min-h-10 items-center px-3 text-sm sm:flex">Sign in</Link><Link href="/auth/sign-up"><Button className="min-h-10">Create free</Button></Link></div>
      </nav>
    </header>

    <main id="main">
      <section className="relative overflow-hidden px-5 pb-20 pt-16 lg:pb-28 lg:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <div>
            <Badge className="border-primary/40 bg-primary/10 text-primary"><Zap /> Purpose-built for short-form lyric videos</Badge>
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-bold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">Make every word feel like the moment.</h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">Sync lyrics, shape motion, layer footage, and export a polished vertical video from one focused studio.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/auth/sign-up"><Button>Create your first video <ArrowRight /></Button></Link><a href="#workflow"><Button variant="secondary"><Play /> See how it works</Button></a></div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Check /> Start free</span><span className="flex items-center gap-2"><ShieldCheck /> Private uploads</span><span className="flex items-center gap-2"><Check /> Real MP4 export</span></div>
          </div>
          <HeroStudioVisual />
        </div>
      </section>

      <section aria-label="Supported platforms" className="px-5 pb-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-2xl bg-card px-6 py-6 sm:flex-row sm:justify-center sm:gap-10">
          <span className="font-mono text-xs text-muted-foreground">PUBLISH-READY FOR</span>
          <span className="flex items-center gap-2 font-semibold"><Smartphone className="text-primary" /> Instagram Reels</span>
          <span className="flex items-center gap-2 font-semibold"><PlaySquare className="text-primary" /> YouTube Shorts</span>
          <span className="flex items-center gap-2 font-semibold"><SpotlightMark /> Snapchat Spotlight</span>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="max-w-2xl"><p className="font-mono text-sm text-primary">A CLEANER CREATIVE FLOW</p><h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">From first beat to final cut, without the editing maze.</h2></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[{ n: "01", title: "Bring your sound", copy: "Upload audio and background footage privately into your project." }, { n: "02", title: "Time every line", copy: "Add lyrics, trim clips, split moments, and place keyframes on the timeline." }, { n: "03", title: "Export for the feed", copy: "Preview safe zones and render a ready-to-post H.264 MP4." }].map((item) => <Card key={item.n} className="group p-6 transition-transform hover:-translate-y-1"><span className="font-mono text-sm text-primary">{item.n}</span><h3 className="mt-10 text-2xl font-semibold">{item.title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{item.copy}</p><ArrowRight className="mt-6 text-primary transition-transform group-hover:translate-x-1" /></Card>)}
        </div>
      </section>

      <section id="features" className="bg-card px-5 py-24">
        <div className="mx-auto max-w-7xl lg:px-3"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><Badge>Inside the studio</Badge><h2 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">Serious controls. A calm workspace.</h2><p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">The essentials stay close: centered preview, contextual tool sheet, layer controls, keyframes, and a full timeline.</p></div><div className="grid gap-4 sm:grid-cols-2">{features.map(({ icon: Icon, title, copy }) => <div key={title} className="rounded-2xl bg-background p-6"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon /></span><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{copy}</p></div>)}</div></div></div>
      </section>

      <section id="templates" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-sm text-primary">START WITH A MOOD</p><h2 className="mt-2 text-4xl font-bold tracking-tight">Original looks, ready to shape.</h2></div><Link href="/templates" className="flex items-center gap-2 font-semibold">Browse templates <ArrowRight /></Link></div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{TEMPLATES.map((template, index) => <Card key={template.id} className="overflow-hidden"><div className="relative flex aspect-[9/14] items-center justify-center bg-secondary p-4 text-center"><span className={index % 2 ? "text-2xl font-bold" : "font-serif text-3xl"}>Your words<br /><span className="text-primary">in motion.</span></span><span className="absolute bottom-3 left-3 font-mono text-[10px] text-muted-foreground">{template.animation.toUpperCase()}</span></div><div className="p-4"><h3 className="font-semibold">{template.title}</h3><p className="mt-1 text-sm text-muted-foreground">{template.category}</p></div></Card>)}</div>
      </section>

      <section className="px-5 pb-24"><div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12"><div className="grid items-center gap-8 md:grid-cols-[1fr_auto]"><div><WandSparkles /><h2 className="mt-6 text-balance text-4xl font-bold tracking-tight">Your next lyric video starts with one line.</h2><p className="mt-3 max-w-xl text-pretty text-primary-foreground/75">Create a private project, choose your platform, and make the words move.</p></div><Link href="/auth/sign-up"><Button className="bg-background text-foreground hover:bg-card">Open your studio <ArrowRight /></Button></Link></div></div></section>
    </main>
    <footer className="bg-card px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row"><Logo /><p className="text-sm text-muted-foreground">Made for music creators who care about every word.</p></div></footer>
  </>
}

function HeroStudioVisual() {
  return <div className="hero-studio-enter relative mx-auto w-full max-w-2xl">
    <div className="rounded-3xl border bg-card p-3 shadow-2xl sm:p-4">
      <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /><span className="text-sm font-medium">Midnight drive</span></div><Badge>Saved</Badge></div>
      <div className="mt-3 grid min-h-[430px] grid-cols-[1fr_3fr] gap-3 sm:grid-cols-[1fr_2.5fr_1fr]">
        <div className="hidden rounded-xl bg-background p-3 sm:block"><span className="font-mono text-[10px] text-muted-foreground">TOOLS</span>{[Captions, Type, Sparkles, AudioLines].map((Icon, index) => <span key={index} className={cnVisual(index === 0)}><Icon /></span>)}</div>
        <div className="flex items-center justify-center rounded-xl bg-background p-4"><div className="relative aspect-[9/16] h-80 overflow-hidden rounded-2xl bg-secondary"><CinematicLines /><div className="absolute inset-0 flex items-center justify-center p-5 text-center"><p className="font-serif text-3xl leading-tight">We were made<br /><span className="text-primary">for this moment.</span></p></div><span className="absolute right-3 top-3 rounded bg-background/70 px-2 py-1 font-mono text-[9px]">REELS SAFE</span></div></div>
        <div className="hidden rounded-xl bg-background p-3 sm:block"><span className="font-mono text-[10px] text-muted-foreground">MOTION</span><div className="mt-3 rounded-lg border border-primary bg-primary/10 p-3 text-xs text-primary">Cinematic rise</div><div className="mt-2 rounded-lg bg-secondary p-3 text-xs">Scale · 108%</div><div className="mt-2 rounded-lg bg-secondary p-3 text-xs">Opacity · 100%</div></div>
      </div>
      <div className="mt-3 rounded-xl bg-background p-3"><div className="flex h-5 items-center gap-1">{Array.from({ length: 32 }, (_, index) => <span key={index} className="w-1 rounded bg-primary/70" style={{ height: `${6 + (index * 7) % 16}px` }} />)}</div><div className="mt-2 flex h-7 gap-1"><span className="w-[30%] rounded bg-primary/20" /><span className="w-[24%] rounded bg-primary/30" /><span className="flex-1 rounded bg-secondary" /></div></div>
    </div>
  </div>
}
function cnVisual(active: boolean) { return `mt-3 flex size-10 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}` }
function CinematicLines() { return <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 180 320" fill="none"><path d="M-20 246C36 204 80 205 200 105" stroke="currentColor" className="text-primary/25" strokeWidth="28" /><path d="M-40 278C35 228 97 195 222 72" stroke="currentColor" className="text-foreground/10" strokeWidth="2" /><circle cx="145" cy="55" r="34" fill="currentColor" className="text-primary/10" /></svg> }
function SpotlightMark() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 text-primary" fill="none"><path d="M12 3.5c2.4 0 4.4 1.9 4.4 4.3 0 .9-.3 1.7-.7 2.4.3.4.9.8 1.8 1.1.7.2 1 .9.7 1.5-.4.8-1.4 1.3-2.7 1.5-.4 2.7-1.8 5.2-3.5 6.2-1.7-1-3.1-3.5-3.5-6.2-1.3-.2-2.3-.7-2.7-1.5-.3-.6 0-1.3.7-1.5.9-.3 1.5-.7 1.8-1.1-.4-.7-.7-1.5-.7-2.4 0-2.4 2-4.3 4.4-4.3Z" stroke="currentColor" strokeWidth="1.7" /></svg> }
