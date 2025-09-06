import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { z } from "zod"

const UpdateSchema = z.object({ name: z.string().min(1) })
const MoveSchema = z.object({ parentId: z.string().nullable() })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()

    if (typeof body?.name === "string") {
      const { name } = UpdateSchema.parse(body)
      const updated = await prisma.category.update({
        where: { id: params.id },
        data: { name },
      })
      return NextResponse.json({ id: updated.id, name: updated.name })
    }

    if (body && Object.prototype.hasOwnProperty.call(body, "parentId")) {
      const { parentId } = MoveSchema.parse(body)
      if (parentId) {
        const parent = await prisma.category.findFirst({ where: { id: parentId, userId: auth.id } })
        if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 })
        if (parentId === params.id) return NextResponse.json({ error: "Cannot move into itself" }, { status: 400 })
      }
      const updated = await prisma.category.update({ where: { id: params.id }, data: { parentId } })
      return NextResponse.json({ id: updated.id, parentId: updated.parentId })
    }

    return NextResponse.json({ error: "No valid operation" }, { status: 400 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Ensure category belongs to user
    const cat = await prisma.category.findFirst({ where: { id: params.id, userId: auth.id } })
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 })

    // Check for children
    const childCount = await prisma.category.count({ where: { parentId: params.id } })
    if (childCount > 0) {
      return NextResponse.json({ error: "Delete subcategories first or move them" }, { status: 400 })
    }

    // Ensure no notes remain (or you could choose to set categoryId null)
    const noteCount = await prisma.note.count({ where: { categoryId: params.id, isDeleted: false } })
    if (noteCount > 0) {
      return NextResponse.json({ error: "Move or delete notes before deleting this category" }, { status: 400 })
    }

    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}


