import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { z } from "zod"

const CreateCategorySchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional().nullable(),
})

function buildTree(categories: any[], parentId: string | null = null) {
  return categories
    .filter((c) => (c.parentId ?? null) === parentId)
    .map((c) => ({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      children: buildTree(categories, c.id),
    }))
}

export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await prisma.category.findMany({
    where: { userId: auth.id },
    orderBy: { name: "asc" },
  })

  return NextResponse.json({ tree: buildTree(categories) })
}

export async function POST(req: NextRequest) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, parentId } = CreateCategorySchema.parse(body)

    if (parentId) {
      const parent = await prisma.category.findFirst({ where: { id: parentId, userId: auth.id } })
      if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 })
    }

    const cat = await prisma.category.create({
      data: { name, userId: auth.id, parentId: parentId ?? null },
    })

    return NextResponse.json({ id: cat.id, name: cat.name, parentId: cat.parentId })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}


