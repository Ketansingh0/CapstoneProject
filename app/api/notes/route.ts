import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { z } from "zod"

const CreateNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  categoryId: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const view = searchParams.get("view") // all | public | private | byCategory
  const categoryId = searchParams.get("categoryId")

  const where: any = { userId: auth.id, isDeleted: false }
  if (view === "public") where.isPublic = true
  if (view === "private") where.isPublic = false
  if (view === "byCategory" && categoryId) where.categoryId = categoryId

  const notes = await prisma.note.findMany({
    where,
    include: { tags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  })

  const normalized = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    isPublic: n.isPublic,
    tags: n.tags.map((t) => t.tag.name),
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }))
  return NextResponse.json({ notes: normalized })
}

export async function POST(req: NextRequest) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { title, content, isPublic, tags, categoryId } = CreateNoteSchema.parse(body)

    const note = await prisma.$transaction(async (tx) => {
      const created = await tx.note.create({ data: { title, content, isPublic: !!isPublic, userId: auth.id, categoryId: categoryId ?? null } })
      if (tags && tags.length) {
        for (const tagName of tags) {
          const tag = await tx.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })
          await tx.noteTag.create({ data: { noteId: created.id, tagId: tag.id } })
        }
      }
      return created
    })

    return NextResponse.json({ id: note.id })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}


