import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, AUTH_COOKIE, signToken } from "@/lib/auth"
import { generateVerificationToken, getVerificationExpiry, sendVerificationEmail } from "@/lib/email"
import { z } from "zod"

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { name, email, password } = RegisterSchema.parse(body)
    // Normalize inputs
    email = email.trim().toLowerCase()
    password = password.trim()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const verifyToken = generateVerificationToken()
    const verifyExpires = getVerificationExpiry()

    const user = await prisma.user.create({ 
      data: { 
        name, 
        email, 
        password: passwordHash,
        verifyToken,
        verifyExpires
      } 
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verifyToken)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Continue with registration even if email fails
    }

    const token = signToken({ id: user.id })
    const res = NextResponse.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role,
      isVerified: user.isVerified,
      message: "Account created! Please check your email to verify your account."
    })
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
    return res
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 })
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}


