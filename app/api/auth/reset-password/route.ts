import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = ResetPasswordSchema.parse(body)

    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        verifyToken: null,
        verifyExpires: null,
      }
    })

    return NextResponse.json({ 
      message: "Password reset successfully! You can now log in with your new password." 
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 })
  }
}
