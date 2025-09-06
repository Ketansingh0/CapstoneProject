import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken, sendPasswordResetEmail } from "@/lib/email"
import { z } from "zod"

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = ForgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        message: "If an account with that email exists, we've sent a password reset link." 
      })
    }

    const resetToken = generateVerificationToken()
    const resetExpires = new Date()
    resetExpires.setHours(resetExpires.getHours() + 1) // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken: resetToken,
        verifyExpires: resetExpires,
      }
    })

    try {
      await sendPasswordResetEmail(email, user.name, resetToken)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "If an account with that email exists, we've sent a password reset link." 
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Request failed" }, { status: 500 })
  }
}
