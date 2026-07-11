"use server"

import { and, desc, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { db } from "@/lib/db"
import { projects } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/server"

const baseState = { version: 2, playhead: 0, media: { audio: null, video: null }, lyrics: [{ id: "line-1", text: "Your first lyric line", start: 0, end: 3 }, { id: "line-2", text: "Make every word move", start: 3, end: 6 }], style: { font: "serif", size: 56, color: "#f5f4ef", align: "center", x: 50, y: 55, shadow: true, animation: "fade-up", opacity: 100, scale: 100 }, safeZone: "instagram", layers: [{ id: "video", name: "Background video", type: "video", visible: true, locked: false, muted: true }, { id: "lyrics", name: "Timed lyrics", type: "lyrics", visible: true, locked: false }, { id: "audio", name: "Main audio", type: "audio", visible: true, locked: false, muted: false }], keyframes: [] }

export async function listProjects() { const user = await requireUser(); return db.select().from(projects).where(and(eq(projects.userId, user.id), isNull(projects.archivedAt))).orderBy(desc(projects.updatedAt)) }
export async function createProject(formData: FormData) { const user = await requireUser(); const schema = z.object({ title: z.string().trim().min(1).max(80), aspect: z.enum(["reel", "portrait", "square"]), template: z.string().max(40) }); const data = schema.parse(Object.fromEntries(formData)); const dimensions = { reel: [1080, 1920], portrait: [1080, 1350], square: [1080, 1080] }[data.aspect]; const [project] = await db.insert(projects).values({ userId: user.id, title: data.title, status: "draft", width: dimensions[0], height: dimensions[1], frameRate: 30, duration: 15, editorState: { ...baseState, template: data.template }, revision: 1 }).returning(); redirect(`/editor/${project.id}`) }
export async function renameProject(id: string, title: string) { const user = await requireUser(); await db.update(projects).set({ title: z.string().min(1).max(80).parse(title), updatedAt: new Date() }).where(and(eq(projects.id, z.string().uuid().parse(id)), eq(projects.userId, user.id))); revalidatePath("/dashboard") }
export async function archiveProject(id: string) { const user = await requireUser(); await db.update(projects).set({ archivedAt: new Date() }).where(and(eq(projects.id, z.string().uuid().parse(id)), eq(projects.userId, user.id))); revalidatePath("/dashboard") }
export async function archiveProjectAction(formData: FormData) { await archiveProject(z.string().uuid().parse(formData.get("id"))) }
export async function duplicateProjectAction(formData: FormData) { const user = await requireUser(); const id = z.string().uuid().parse(formData.get("id")); const [source] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, user.id))).limit(1); if (!source) return; const [copy] = await db.insert(projects).values({ userId: user.id, title: `${source.title} copy`.slice(0, 80), status: "draft", width: source.width, height: source.height, frameRate: source.frameRate, duration: source.duration, editorState: source.editorState, revision: 1 }).returning(); redirect(`/editor/${copy.id}`) }
export async function getProject(id: string) { const user = await requireUser(); const [project] = await db.select().from(projects).where(and(eq(projects.id, z.string().uuid().parse(id)), eq(projects.userId, user.id))).limit(1); return project ?? null }
