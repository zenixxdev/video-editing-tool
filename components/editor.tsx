"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, AudioLines, Captions, ChevronDown, Diamond, Download, Eye, EyeOff,
  Film, ImageIcon, Layers3, Lock, Maximize2, Minus, MoreHorizontal, Music2,
  Pause, Play, Plus, Redo2, Scissors, Settings2, Sparkles, Type, Undo2,
  Unlock, Upload, Volume2, VolumeX, X, ZoomIn, ZoomOut,
} from "lucide-react"
import { toast } from "sonner"
import { Badge, Button, Input, Logo } from "@/components/ui"
import { cn, formatTime } from "@/lib/utils"

type Line = { id: string; text: string; start: number; end: number }
type Layer = { id: string; name: string; type: "video" | "audio" | "lyrics" | "overlay"; visible: boolean; locked: boolean; muted?: boolean }
type Keyframe = { id: string; time: number; property: "position" | "scale" | "opacity" }
type State = {
  version: number
  media: { audio: null | { id: string; name: string; url: string }; video: null | { id: string; name: string; url: string } }
  lyrics: Line[]
  style: { font: string; size: number; color: string; align: string; x: number; y: number; shadow: boolean; animation: string; opacity: number; scale: number }
  safeZone: string
  template?: string
  layers: Layer[]
  keyframes: Keyframe[]
}
type Project = { id: string; title: string; width: number; height: number; duration: number; revision: number; editorState: unknown; createdAt: string; updatedAt: string }
type Tool = "media" | "lyrics" | "text" | "motion" | "audio" | "canvas"

const defaultLayers: Layer[] = [
  { id: "video", name: "Background video", type: "video", visible: true, locked: false, muted: true },
  { id: "lyrics", name: "Timed lyrics", type: "lyrics", visible: true, locked: false },
  { id: "audio", name: "Main audio", type: "audio", visible: true, locked: false, muted: false },
]
const fallback: State = { version: 2, media: { audio: null, video: null }, lyrics: [], style: { font: "serif", size: 56, color: "#f5f4ef", align: "center", x: 50, y: 55, shadow: true, animation: "fade-up", opacity: 100, scale: 100 }, safeZone: "instagram", layers: defaultLayers, keyframes: [] }
const toolItems: { id: Tool; label: string; icon: typeof Film }[] = [
  { id: "media", label: "Media", icon: Film }, { id: "lyrics", label: "Lyrics", icon: Captions },
  { id: "text", label: "Text", icon: Type }, { id: "motion", label: "Motion", icon: Sparkles },
  { id: "audio", label: "Audio", icon: Music2 }, { id: "canvas", label: "Canvas", icon: Settings2 },
]

export function Editor({ project }: { project: Project }) {
  const stored = project.editorState as Partial<State>
  const initial: State = { ...fallback, ...stored, media: { ...fallback.media, ...stored.media }, style: { ...fallback.style, ...stored.style }, layers: stored.layers?.length ? stored.layers : defaultLayers, keyframes: stored.keyframes ?? [] }
  const [state, setState] = useState(initial)
  const [title, setTitle] = useState(project.title)
  const [revision, setRevision] = useState(project.revision)
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving…" | "Offline changes">("Saved")
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [tool, setTool] = useState<Tool>("lyrics")
  const [panelOpen, setPanelOpen] = useState(true)
  const [selectedLine, setSelectedLine] = useState(initial.lyrics[0]?.id ?? "")
  const [selectedLayer, setSelectedLayer] = useState("lyrics")
  const [history, setHistory] = useState<State[]>([])
  const [future, setFuture] = useState<State[]>([])
  const [uploading, setUploading] = useState("")
  const [showExport, setShowExport] = useState(false)
  const [timelineZoom, setTimelineZoom] = useState(1)
  const mediaRef = useRef<HTMLMediaElement>(null)
  const dirty = useRef(false)

  const change = useCallback((update: (value: State) => State) => {
    setState((current) => { setHistory((items) => [...items.slice(-29), current]); setFuture([]); dirty.current = true; return update(current) })
    setSaveStatus("Saving…")
  }, [])

  useEffect(() => {
    if (saveStatus !== "Saving…") return
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, editorState: state, duration: project.duration, revision }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setRevision(data.revision); dirty.current = false; setSaveStatus("Saved")
      } catch (cause) {
        setSaveStatus("Offline changes")
        toast.error(cause instanceof Error ? cause.message : "Autosave is delayed. Your changes remain in this tab.")
      }
    }, 900)
    return () => window.clearTimeout(timer)
  }, [project.duration, project.id, revision, saveStatus, state, title])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current || uploading) event.preventDefault() }
    addEventListener("beforeunload", warn); return () => removeEventListener("beforeunload", warn)
  }, [uploading])

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return
      if (event.code === "Space") { event.preventDefault(); togglePlayback() }
      if (event.key === "ArrowLeft") setTime((value) => Math.max(0, value - (event.shiftKey ? 1 : 0.1)))
      if (event.key === "ArrowRight") setTime((value) => Math.min(project.duration, value + (event.shiftKey ? 1 : 0.1)))
    }
    addEventListener("keydown", keyboard); return () => removeEventListener("keydown", keyboard)
  })

  const activeLine = useMemo(() => state.lyrics.find((line) => time >= line.start && time < line.end), [state.lyrics, time])
  const visibleLyrics = state.layers.find((layer) => layer.id === "lyrics")?.visible !== false

  function togglePlayback() {
    const media = mediaRef.current
    if (media) { if (media.paused) void media.play(); else media.pause() }
    else setPlaying((value) => !value)
  }
  function undo() { const previous = history.at(-1); if (!previous) return; setFuture((items) => [state, ...items]); setState(previous); setHistory((items) => items.slice(0, -1)); setSaveStatus("Saving…") }
  function redo() { const next = future[0]; if (!next) return; setHistory((items) => [...items, state]); setState(next); setFuture((items) => items.slice(1)); setSaveStatus("Saving…") }
  function chooseTool(next: Tool) { setTool(next); setPanelOpen(true) }
  function addLine() { const previous = state.lyrics.at(-1); const start = previous?.end ?? time; const line = { id: crypto.randomUUID(), text: "New lyric line", start, end: Math.min(project.duration, start + 2) }; change((value) => ({ ...value, lyrics: [...value.lyrics, line] })); setSelectedLine(line.id) }
  function updateLine(id: string, patch: Partial<Line>) { change((value) => ({ ...value, lyrics: value.lyrics.map((line) => line.id === id ? { ...line, ...patch } : line) })) }
  function removeLine(id: string) { change((value) => ({ ...value, lyrics: value.lyrics.filter((line) => line.id !== id) })); setSelectedLine("") }
  function splitLine() { const line = state.lyrics.find((item) => item.id === selectedLine); if (!line || time <= line.start + .2 || time >= line.end - .2) return toast.error("Move the playhead inside the selected lyric clip."); const second = { ...line, id: crypto.randomUUID(), start: time, text: `${line.text} (cont.)` }; change((value) => ({ ...value, lyrics: value.lyrics.flatMap((item) => item.id === line.id ? [{ ...item, end: time }, second] : item) })); setSelectedLine(second.id) }
  function addKeyframe(property: Keyframe["property"]) { const existing = state.keyframes.some((frame) => frame.property === property && Math.abs(frame.time - time) < .05); if (existing) return toast.message("A keyframe already exists here."); change((value) => ({ ...value, keyframes: [...value.keyframes, { id: crypto.randomUUID(), time, property }].sort((a, b) => a.time - b.time) })); toast.success(`${property} keyframe added`) }
  function updateLayer(id: string, patch: Partial<Layer>) { change((value) => ({ ...value, layers: value.layers.map((layer) => layer.id === id ? { ...layer, ...patch } : layer) })) }
  async function upload(file: File, type: "audio" | "video") { setUploading(type); const form = new FormData(); form.append("file", file); form.append("projectId", project.id); try { const response = await fetch("/api/upload", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error); change((value) => ({ ...value, media: { ...value.media, [type]: { id: data.id, name: data.fileName, url: data.url } } })); toast.success(`${type === "audio" ? "Audio" : "Video"} added`) } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Upload failed") } finally { setUploading("") } }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex min-h-14 items-center gap-1 border-b bg-card px-2 sm:gap-2 sm:px-4">
        <Link href="/dashboard" aria-label="Back to dashboard" className="flex size-10 items-center justify-center rounded-lg hover:bg-secondary"><ArrowLeft /></Link>
        <span className="hidden lg:block"><Logo /></span>
        <input aria-label="Project title" value={title} onChange={(event) => { setTitle(event.target.value); setSaveStatus("Saving…") }} className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold outline-none sm:max-w-64 sm:text-base" />
        <Badge className={cn("hidden sm:inline-flex", saveStatus === "Offline changes" && "border-destructive text-destructive")}>{saveStatus}</Badge>
        <div className="ml-auto flex items-center gap-1">
          <button aria-label="Undo" disabled={!history.length} onClick={undo} className="flex size-10 items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30"><Undo2 /></button>
          <button aria-label="Redo" disabled={!future.length} onClick={redo} className="flex size-10 items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30"><Redo2 /></button>
          <Button className="min-h-10 px-3" onClick={() => setShowExport(true)}><Download /><span className="hidden sm:inline">Export</span></Button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,var(--secondary)_0,transparent_65%)] p-4 sm:p-6">
          <div className="absolute left-3 top-3 hidden items-center gap-2 rounded-lg border bg-card/90 px-3 py-2 text-xs text-muted-foreground md:flex"><span>{project.width} × {project.height}</span><span>•</span><span>30 FPS</span></div>
          <button aria-label="Fullscreen preview" className="absolute right-3 top-3 hidden size-10 items-center justify-center rounded-lg border bg-card/90 md:flex"><Maximize2 /></button>
          <Stage state={state} active={visibleLyrics ? activeLine : undefined} change={change} />
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-card/95 px-3 py-2 shadow-xl">
            <button onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"} className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">{playing ? <Pause /> : <Play />}</button>
            <span className="min-w-20 font-mono text-xs">{formatTime(time)} / {formatTime(project.duration)}</span>
            <input aria-label="Preview position" type="range" min="0" max={project.duration} step=".01" value={time} onChange={(event) => setTime(+event.target.value)} className="hidden w-36 sm:block" />
          </div>
        </section>

        <section className="shrink-0 border-t bg-card">
          <nav aria-label="Editing tools" className="flex items-stretch overflow-x-auto px-2 py-2 sm:justify-center sm:gap-1">
            {toolItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => chooseTool(id)} aria-pressed={tool === id && panelOpen} className={cn("flex min-w-16 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", tool === id && panelOpen && "bg-secondary text-primary")}><Icon /><span>{label}</span></button>)}
          </nav>
          {panelOpen && <div className="relative max-h-56 overflow-y-auto border-t bg-background/60 p-3 sm:p-4"><button aria-label="Close tool settings" onClick={() => setPanelOpen(false)} className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-lg hover:bg-secondary"><X /></button><ToolPanel tool={tool} state={state} selectedLine={selectedLine} setSelectedLine={setSelectedLine} change={change} updateLine={updateLine} removeLine={removeLine} addLine={addLine} upload={upload} uploading={uploading} /></div>}
        </section>

        <KeyframeBar state={state} time={time} duration={project.duration} setTime={setTime} addKeyframe={addKeyframe} />
        <LayerBar layers={state.layers} selected={selectedLayer} setSelected={setSelectedLayer} updateLayer={updateLayer} />
        <Timeline state={state} duration={project.duration} time={time} setTime={setTime} selected={selectedLine} setSelected={setSelectedLine} zoom={timelineZoom} setZoom={setTimelineZoom} splitLine={splitLine} />
      </main>
      {state.media.audio && <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={state.media.audio.url} onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
      {showExport && <ExportDialog projectId={project.id} onClose={() => setShowExport(false)} />}
    </div>
  )
}

function Stage({ state, active, change }: { state: State; active?: Line; change: (update: (value: State) => State) => void }) {
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)
  return <div className="relative h-full max-h-[52vh] aspect-[9/16] overflow-hidden rounded-xl border bg-secondary shadow-2xl sm:max-h-[56vh]">
    {state.media.video ? <video className="size-full object-cover" src={state.media.video.url} muted loop autoPlay playsInline /> : <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(160deg,var(--secondary),var(--card))] text-muted-foreground"><ImageIcon /><span className="mt-2 text-sm">Add video or use a solid canvas</span></div>}
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] bottom-[18%] top-[8%] rounded border border-dashed border-primary/40" />
    {active && <div className="absolute cursor-move select-none p-4 text-center touch-none" style={{ left: `${state.style.x}%`, top: `${state.style.y}%`, transform: `translate(-50%,-50%) scale(${state.style.scale / 100})`, width: "90%", opacity: state.style.opacity / 100, fontFamily: state.style.font === "serif" ? "var(--font-newsreader)" : state.style.font === "mono" ? "var(--font-geist-mono)" : "var(--font-geist)", fontSize: `clamp(20px, ${state.style.size / 12}vw, ${state.style.size}px)`, color: state.style.color, textShadow: state.style.shadow ? "0 2px 14px #090b0d" : "none" }} onPointerDown={(event) => { drag.current = { x: event.clientX, y: event.clientY, startX: state.style.x, startY: state.style.y }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={(event) => { if (!drag.current) return; const rect = event.currentTarget.parentElement!.getBoundingClientRect(); const x = Math.max(8, Math.min(92, drag.current.startX + (event.clientX - drag.current.x) / rect.width * 100)); const y = Math.max(10, Math.min(82, drag.current.startY + (event.clientY - drag.current.y) / rect.height * 100)); change((value) => ({ ...value, style: { ...value.style, x, y } })) }} onPointerUp={() => { drag.current = null }}><p key={active.id} className="lyric-animate text-balance leading-tight">{active.text}</p></div>}
    <span className="absolute right-3 top-3 rounded bg-background/60 px-2 py-1 text-[10px] text-foreground/70">{state.safeZone === "youtube" ? "SHORTS" : state.safeZone === "snapchat" ? "SPOTLIGHT" : "REELS"}</span>
  </div>
}

function ToolPanel({ tool, state, selectedLine, setSelectedLine, change, updateLine, removeLine, addLine, upload, uploading }: { tool: Tool; state: State; selectedLine: string; setSelectedLine: (id: string) => void; change: (update: (value: State) => State) => void; updateLine: (id: string, patch: Partial<Line>) => void; removeLine: (id: string) => void; addLine: () => void; upload: (file: File, type: "audio" | "video") => void; uploading: string }) {
  const setStyle = (patch: Partial<State["style"]>) => change((value) => ({ ...value, style: { ...value.style, ...patch } }))
  if (tool === "media" || tool === "audio") { const type = tool === "audio" ? "audio" : "video" as const; const asset = state.media[type]; return <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 pr-10"><div className="min-w-44"><h2 className="font-semibold">{tool === "audio" ? "Sound" : "Project media"}</h2><p className="text-xs text-muted-foreground">Private MP3, WAV, MP4, MOV, or WebM.</p></div><label className="flex min-h-20 min-w-44 cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 hover:border-primary"><Upload /><span className="text-sm">{uploading === type ? "Uploading…" : asset ? "Replace file" : `Upload ${type}`}<small className="block max-w-40 truncate text-muted-foreground">{asset?.name ?? "Up to 100 MB"}</small></span><input type="file" className="sr-only" accept={type === "audio" ? "audio/*" : "video/mp4,video/webm,video/quicktime"} disabled={!!uploading} onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], type)} /></label>{type === "audio" && <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3"><AudioLines /><div><strong className="text-sm">Main soundtrack</strong><p className="text-xs text-muted-foreground">Timeline sync enabled</p></div></div>}</div> }
  if (tool === "lyrics") return <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto pr-10"><button onClick={addLine} className="flex min-h-20 min-w-28 flex-col items-center justify-center rounded-xl border border-dashed text-sm hover:border-primary"><Plus /><span>Add line</span></button>{state.lyrics.map((line, index) => <div key={line.id} className={cn("min-w-64 rounded-xl border p-3", selectedLine === line.id && "border-primary bg-secondary")} onClick={() => setSelectedLine(line.id)}><div className="flex items-center gap-2"><span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span><Input aria-label={`Lyric line ${index + 1}`} value={line.text} onChange={(event) => updateLine(line.id, { text: event.target.value })} className="min-h-9 border-0 bg-transparent px-1" /><button aria-label="Delete lyric" onClick={() => removeLine(line.id)} className="text-muted-foreground hover:text-destructive"><X /></button></div><div className="mt-2 flex gap-2"><input aria-label="Start time" type="number" min="0" step=".1" value={line.start} onChange={(event) => updateLine(line.id, { start: +event.target.value })} className="w-20 rounded border bg-background px-2 py-1 text-xs" /><span className="text-muted-foreground">→</span><input aria-label="End time" type="number" min={line.start + .1} step=".1" value={line.end} onChange={(event) => updateLine(line.id, { end: +event.target.value })} className="w-20 rounded border bg-background px-2 py-1 text-xs" /></div></div>)}</div>
  if (tool === "text") return <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-4 pr-10"><label className="flex min-w-44 flex-col gap-2 text-sm">Font<select value={state.style.font} onChange={(event) => setStyle({ font: event.target.value })} className="min-h-11 rounded-lg border bg-background px-3"><option value="serif">Editorial Serif</option><option value="sans">Modern Sans</option><option value="mono">Studio Mono</option></select></label><label className="flex min-w-48 flex-col gap-2 text-sm">Size · {state.style.size}px<input type="range" min="24" max="96" value={state.style.size} onChange={(event) => setStyle({ size: +event.target.value })} /></label><label className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">Color<input type="color" value={state.style.color} onChange={(event) => setStyle({ color: event.target.value })} className="size-8" /></label><label className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">Shadow<input type="checkbox" checked={state.style.shadow} onChange={(event) => setStyle({ shadow: event.target.checked })} /></label></div>
  if (tool === "motion") return <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-4 pr-10"><label className="flex min-w-44 flex-col gap-2 text-sm">Entrance<select value={state.style.animation} onChange={(event) => setStyle({ animation: event.target.value })} className="min-h-11 rounded-lg border bg-background px-3"><option value="fade">Soft fade</option><option value="fade-up">Cinematic rise</option><option value="scale">Beat scale</option><option value="karaoke">Karaoke focus</option></select></label><label className="flex min-w-44 flex-col gap-2 text-sm">Scale · {state.style.scale}%<input type="range" min="50" max="160" value={state.style.scale} onChange={(event) => setStyle({ scale: +event.target.value })} /></label><label className="flex min-w-44 flex-col gap-2 text-sm">Opacity · {state.style.opacity}%<input type="range" min="0" max="100" value={state.style.opacity} onChange={(event) => setStyle({ opacity: +event.target.value })} /></label></div>
  return <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 pr-10"><span className="text-sm font-semibold">Platform safe zone</span>{[{ id: "instagram", label: "Instagram Reels" }, { id: "youtube", label: "YouTube Shorts" }, { id: "snapchat", label: "Snapchat Spotlight" }].map((item) => <button key={item.id} onClick={() => change((value) => ({ ...value, safeZone: item.id }))} className={cn("rounded-lg border px-4 py-3 text-sm", state.safeZone === item.id && "border-primary bg-secondary text-primary")}>{item.label}</button>)}</div>
}

function KeyframeBar({ state, time, duration, setTime, addKeyframe }: { state: State; time: number; duration: number; setTime: (value: number) => void; addKeyframe: (property: Keyframe["property"]) => void }) { return <section aria-label="Keyframes" className="flex min-h-12 items-center gap-2 overflow-x-auto border-t bg-card px-3"><span className="flex items-center gap-2 pr-2 text-xs font-semibold"><Diamond /> KEYFRAMES</span>{(["position", "scale", "opacity"] as const).map((property) => <button key={property} onClick={() => addKeyframe(property)} className="rounded-md border px-2 py-1 text-xs capitalize hover:border-primary">+ {property}</button>)}<div className="relative ml-2 h-6 min-w-56 flex-1 rounded bg-secondary">{state.keyframes.map((frame) => <button key={frame.id} aria-label={`${frame.property} keyframe at ${formatTime(frame.time)}`} onClick={() => setTime(frame.time)} className="absolute top-1 size-4 -translate-x-1/2 rotate-45 border border-primary bg-background" style={{ left: `${frame.time / duration * 100}%` }} />)}<span className="absolute inset-y-0 w-px bg-primary" style={{ left: `${time / duration * 100}%` }} /></div></section> }

function LayerBar({ layers, selected, setSelected, updateLayer }: { layers: Layer[]; selected: string; setSelected: (id: string) => void; updateLayer: (id: string, patch: Partial<Layer>) => void }) { return <section aria-label="Layers" className="flex min-h-12 items-center gap-2 overflow-x-auto border-t bg-card px-3"><span className="flex items-center gap-2 pr-2 text-xs font-semibold"><Layers3 /> LAYERS</span>{layers.map((layer) => <div key={layer.id} className={cn("flex items-center rounded-lg border", selected === layer.id && "border-primary bg-secondary")}><button onClick={() => setSelected(layer.id)} className="px-3 py-2 text-xs font-medium">{layer.name}</button><button aria-label={`${layer.visible ? "Hide" : "Show"} ${layer.name}`} onClick={() => updateLayer(layer.id, { visible: !layer.visible })} className="p-2 text-muted-foreground">{layer.visible ? <Eye /> : <EyeOff />}</button><button aria-label={`${layer.locked ? "Unlock" : "Lock"} ${layer.name}`} onClick={() => updateLayer(layer.id, { locked: !layer.locked })} className="p-2 text-muted-foreground">{layer.locked ? <Lock /> : <Unlock />}</button>{layer.muted !== undefined && <button aria-label={`${layer.muted ? "Unmute" : "Mute"} ${layer.name}`} onClick={() => updateLayer(layer.id, { muted: !layer.muted })} className="p-2 text-muted-foreground">{layer.muted ? <VolumeX /> : <Volume2 />}</button>}</div>)}</section> }

function Timeline({ state, duration, time, setTime, selected, setSelected, zoom, setZoom, splitLine }: { state: State; duration: number; time: number; setTime: (value: number) => void; selected: string; setSelected: (id: string) => void; zoom: number; setZoom: (value: number) => void; splitLine: () => void }) {
  const width = Math.max(720, duration * 38 * zoom)
  return <section aria-label="Timeline" className="h-52 shrink-0 border-t bg-card sm:h-64"><div className="flex h-11 items-center gap-2 border-b px-3"><strong className="text-sm">Timeline</strong><button onClick={splitLine} className="ml-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-secondary"><Scissors /> Split</button><span className="ml-auto font-mono text-xs text-muted-foreground">{formatTime(time)}</span><button aria-label="Zoom out timeline" onClick={() => setZoom(Math.max(.6, zoom - .2))} className="p-1"><ZoomOut /></button><button aria-label="Zoom in timeline" onClick={() => setZoom(Math.min(2, zoom + .2))} className="p-1"><ZoomIn /></button></div><div className="h-[calc(100%-2.75rem)] overflow-auto"><div className="relative min-h-full p-3" style={{ width }}><div className="mb-2 flex h-5 justify-between font-mono text-[10px] text-muted-foreground">{Array.from({ length: 7 }, (_, index) => <span key={index}>{formatTime(duration * index / 6)}</span>)}</div><div className="absolute bottom-3 top-8 w-px bg-primary" style={{ left: `${12 + time / duration * (width - 24)}px` }} /><button aria-label="Timeline playhead" onPointerDown={(event) => { const element = event.currentTarget.parentElement!; const move = (moveEvent: PointerEvent) => { const rect = element.getBoundingClientRect(); setTime(Math.max(0, Math.min(duration, (moveEvent.clientX - rect.left - 12) / (width - 24) * duration))) }; move(event.nativeEvent); const stop = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", stop) }; addEventListener("pointermove", move); addEventListener("pointerup", stop) }} className="absolute top-7 z-10 size-3 -translate-x-1/2 rounded-full bg-primary" style={{ left: `${12 + time / duration * (width - 24)}px` }} /><Track label="V1" icon={<Film />}><div className="h-full rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs">{state.media.video?.name ?? "Background canvas"}</div></Track><Track label="T1" icon={<Captions />}>{state.lyrics.map((line) => <button key={line.id} onClick={() => { setSelected(line.id); setTime(line.start) }} className={cn("absolute inset-y-1 truncate rounded-md border bg-secondary px-2 text-left text-xs", selected === line.id && "border-primary bg-primary/15")} style={{ left: `${line.start / duration * 100}%`, width: `${Math.max(2, (line.end - line.start) / duration * 100)}%` }}>{line.text}</button>)}</Track><Track label="A1" icon={<AudioLines />}><div className="flex h-full items-center overflow-hidden rounded-md bg-secondary px-3 text-xs text-muted-foreground"><span className="truncate">{state.media.audio?.name ?? "Add your soundtrack"}</span><span className="ml-auto hidden tracking-[.2em] sm:inline">▂▄▆▃▇▄▂▅▇▃▄▆▂▄▇▅▂▆</span></div></Track></div></div></section>
}
function Track({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) { return <div className="mb-2 grid h-10 grid-cols-[44px_1fr] gap-2"><div className="flex items-center justify-center gap-1 rounded bg-secondary text-[10px] text-muted-foreground">{icon}{label}</div><div className="relative min-w-0">{children}</div></div> }

function ExportDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [resolution, setResolution] = useState("720p")
  const [job, setJob] = useState<{ id: string; status: string; stage: string; progress: number; downloadUrl?: string } | null>(null)
  useEffect(() => { if (!job || ["complete", "failed"].includes(job.status)) return; const timer = setInterval(async () => { const response = await fetch(`/api/export/${job.id}`); if (response.ok) setJob(await response.json()) }, 1200); return () => clearInterval(timer) }, [job])
  async function start() { const response = await fetch("/api/export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, resolution, frameRate: 30 }) }); const data = await response.json(); if (response.ok) setJob(data); else toast.error(data.error) }
  return <div role="dialog" aria-modal="true" aria-labelledby="export-title" className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="font-mono text-sm text-primary">FINAL CUT</p><h2 id="export-title" className="mt-1 text-2xl font-bold">Export your video</h2></div><button aria-label="Close export dialog" onClick={onClose} className="flex size-10 items-center justify-center"><X /></button></div>{!job ? <><label className="mt-6 flex flex-col gap-2 text-sm">Resolution<select value={resolution} onChange={(event) => setResolution(event.target.value)} className="min-h-11 rounded-lg border bg-background px-3"><option>720p</option><option>1080p</option></select></label><div className="mt-4 rounded-xl bg-secondary p-4 text-sm"><strong>MP4 · H.264 · 30 FPS</strong><p className="mt-1 text-muted-foreground">Rendered privately and ready for Reels, Shorts, and Spotlight.</p></div><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={start}>Start export</Button></div></> : <div className="mt-7" aria-live="polite"><div className="flex justify-between"><strong>{job.stage}</strong><span>{job.progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${job.progress}%` }} /></div>{job.downloadUrl && <a href={job.downloadUrl} className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground">Download MP4</a>}</div>}</div></div>
}
