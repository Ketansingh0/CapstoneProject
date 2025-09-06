import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, AUTH_COOKIE, signToken } from "@/lib/auth"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { email, password } = LoginSchema.parse(body)
    email = email.trim().toLowerCase()
    password = password.trim()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = await comparePassword(password, user.password)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = signToken({ id: user.id })
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role })
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
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}


