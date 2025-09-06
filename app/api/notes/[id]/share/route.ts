import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"
import { z } from "zod"
import crypto from "crypto"

const ShareNoteSchema = z.object({
  sharedWithEmail: z.string().email().optional(),
  permissions: z.enum(["read", "write", "admin"]).default("read"),
  expiresInDays: z.number().min(1).max(365).optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { sharedWithEmail, permissions, expiresInDays } = ShareNoteSchema.parse(body)

    // Verify note belongs to user
    const note = await prisma.note.findFirst({
      where: { id: params.id, userId: auth.id, isDeleted: false }
    })
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 })

    // Generate share token
    const shareToken = crypto.randomBytes(32).toString("hex")
    
    // Calculate expiry date
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    // Find shared user if email provided
    let sharedWithId: string | undefined
    if (sharedWithEmail) {
      const sharedUser = await prisma.user.findUnique({ 
        where: { email: sharedWithEmail } 
      })
      if (sharedUser) {
        sharedWithId = sharedUser.id
      }
    }

    // Create share record
    const share = await prisma.noteShare.create({
      data: {
        noteId: params.id,
        sharedById: auth.id,
        sharedWithId,
        shareToken,
        permissions,
        expiresAt,
      },
      include: {
        sharedWith: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      id: share.id,
      shareToken: share.shareToken,
      permissions: share.permissions,
      expiresAt: share.expiresAt,
      sharedWith: share.sharedWith,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/shared/${share.shareToken}`
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to share note" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get all shares for this note
    const shares = await prisma.noteShare.findMany({
      where: { noteId: params.id, sharedById: auth.id },
      include: {
        sharedWith: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ shares })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to get shares" }, { status: 500 })
  }
}
