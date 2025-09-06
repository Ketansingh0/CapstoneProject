import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const share = await prisma.noteShare.findFirst({
      where: {
        shareToken: params.token,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        note: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            tags: {
              include: {
                tag: true
              }
            },
            attachments: true,
            comments: {
              include: {
                author: {
                  select: { id: true, name: true, email: true }
                }
              },
              orderBy: { createdAt: "asc" }
            }
          }
        },
        sharedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!share) {
      return NextResponse.json({ error: "Share not found or expired" }, { status: 404 })
    }

    // Check if user is authenticated and has access
    const auth = getUserFromRequest(req)
    if (auth && share.sharedWithId && share.sharedWithId !== auth.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({
      note: {
        id: share.note.id,
        title: share.note.title,
        content: share.note.content,
        isPublic: share.note.isPublic,
        createdAt: share.note.createdAt,
        updatedAt: share.note.updatedAt,
        author: share.note.user,
        tags: share.note.tags.map(nt => nt.tag.name),
        attachments: share.note.attachments,
        comments: share.note.comments
      },
      share: {
        id: share.id,
        permissions: share.permissions,
        sharedBy: share.sharedBy,
        createdAt: share.createdAt
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to get shared note" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const share = await prisma.noteShare.findFirst({
      where: {
        shareToken: params.token,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    if (!share) {
      return NextResponse.json({ error: "Share not found or expired" }, { status: 404 })
    }

    // Check permissions
    if (share.permissions === "read") {
      return NextResponse.json({ error: "Read-only access" }, { status: 403 })
    }

    const { content } = await req.json()
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 })

    // Update note content
    const updatedNote = await prisma.note.update({
      where: { id: share.noteId },
      data: { content },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ 
      message: "Note updated successfully",
      note: updatedNote 
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}
