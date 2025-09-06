import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const auth = getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { query = "", tags = [], isPublic, sortBy = "relevance", sortOrder = "desc" } = body || {}

  const notes = await prisma.note.findMany({
    where: {
      userId: auth.id,
      isDeleted: false,
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        typeof isPublic === "boolean" ? { isPublic } : {},
        tags && tags.length
          ? {
              tags: {
                some: {
                  tag: { name: { in: tags } },
                },
              },
            }
          : {},
      ],
    },
    include: { tags: { include: { tag: true } } },
  })

  let results = notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    isPublic: n.isPublic,
    tags: n.tags.map((t) => t.tag.name),
    createdAt: n.createdAt,
  }))

  if (sortBy === "title") {
    results.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy === "date") {
    results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } else {
    const q = (query as string).toLowerCase()
    results = results
      .map((r) => ({
        ...r,
        relevance:
          (r.title.toLowerCase().includes(q) ? 2 : 0) +
          (r.content.toLowerCase().includes(q) ? 1 : 0) +
          (r.tags.some((t) => t.toLowerCase().includes(q)) ? 1 : 0),
      }))
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
  }

  if (sortOrder === "desc") results.reverse()

  return NextResponse.json({ results })
}


