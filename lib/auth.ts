import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
const JWT_EXPIRES_IN = "7d"
export const AUTH_COOKIE = "token"

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

export function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch {
    return null
  }
}

export function getUserFromRequest(req: NextRequest): { id: string } | null {
  const token = req.cookies.get(AUTH_COOKIE)?.value || cookies().get(AUTH_COOKIE)?.value
  if (!token) return null
  const decoded = verifyToken<{ id: string }>(token)
  return decoded
}


