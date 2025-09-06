import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const VerifySchema = z.object({
  token: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = VerifySchema.parse(body)

    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyExpires: null,
      }
    })

    return NextResponse.json({ 
      message: "Email verified successfully!",
      isVerified: true 
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "No verification token provided" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyExpires: null,
      }
    })

    // Redirect to success page
    return NextResponse.redirect(new URL("/auth/verify-success", req.url))
  } catch (error: any) {
    return NextResponse.redirect(new URL("/auth/verify-error", req.url))
  }
}
