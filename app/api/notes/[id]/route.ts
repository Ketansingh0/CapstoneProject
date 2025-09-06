import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { z } from "zod"

const UpdateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: auth.id, isDeleted: false },
    include: { tags: { include: { tag: true } } },
  })
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    id: note.id,
    title: note.title,
    content: note.content,
    isPublic: note.isPublic,
    tags: note.tags.map((t) => t.tag.name),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const parsed = UpdateNoteSchema.parse(body)

    await prisma.$transaction(async (tx) => {
      await tx.note.update({
        where: { id: params.id, userId: auth.id },
        data: {
          title: parsed.title,
          content: parsed.content,
          isPublic: parsed.isPublic,
        },
      })

      if (parsed.tags) {
        await tx.noteTag.deleteMany({ where: { noteId: params.id } })
        for (const tagName of parsed.tags) {
          const tag = await tx.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })
          await tx.noteTag.create({ data: { noteId: params.id, tagId: tag.id } })
        }
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.note.update({ where: { id: params.id, userId: auth.id }, data: { isDeleted: true } })
  return NextResponse.json({ ok: true })
}


