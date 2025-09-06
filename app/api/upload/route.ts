import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    const noteId = formData.get("noteId") as string

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!noteId) return NextResponse.json({ error: "No note ID provided" }, { status: 400 })

    // Verify note belongs to user
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: auth.id, isDeleted: false }
    })
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 })

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    // Save attachment record to database
    const attachment = await prisma.noteAttachment.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        noteId,
      }
    })

    return NextResponse.json({ 
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      url: attachment.url,
      size: attachment.size,
      mimeType: attachment.mimeType
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const attachmentId = searchParams.get("id")

    if (!attachmentId) return NextResponse.json({ error: "No attachment ID provided" }, { status: 400 })

    // Verify attachment belongs to user's note
    const attachment = await prisma.noteAttachment.findFirst({
      where: {
        id: attachmentId,
        note: { userId: auth.id }
      }
    })

    if (!attachment) return NextResponse.json({ error: "Attachment not found" }, { status: 404 })

    // Delete from database
    await prisma.noteAttachment.delete({ where: { id: attachmentId } })

    // Delete file from filesystem
    const filepath = join(process.cwd(), "public", attachment.url)
    try {
      await import("fs/promises").then(fs => fs.unlink(filepath))
    } catch (fileError) {
      console.warn("Could not delete file:", fileError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
