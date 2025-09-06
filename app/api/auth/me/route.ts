import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const authUser = getUserFromRequest(req)
  if (!authUser) return NextResponse.json({ user: null }, { status: 200 })
  const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { id: true, email: true, name: true, role: true } })
  return NextResponse.json({ user })
}


