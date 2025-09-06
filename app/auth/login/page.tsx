"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AuthAPI } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, BookOpen, Mail, Lock, Loader2, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkAuthStatus()
    if (searchParams?.get("registered") === "true") {
      setSuccessMessage("Account created successfully! Please sign in with your credentials.")
    }
  }, [searchParams])

  const checkAuthStatus = async () => {
    try {
      // Just check status to stop loading; do NOT auto-redirect
      await AuthAPI.me()
    } catch (error) {
      // Not authenticated, that's fine – stay on login
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields")
      }

      // Use real API authentication
      await AuthAPI.login({ email, password })
      
      setSuccessMessage("Login successful! Redirecting to dashboard...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-primary rounded-full p-4 shadow-lg">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-pretty text-muted-foreground">
              Sign in to continue your smart note-taking journey
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-input border-border focus:border-primary focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-input border-border focus:border-primary focus:ring-primary/20"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="#" className="text-sm text-accent hover:text-accent/80 font-medium">
              Forgot your password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">New to Journal?</span>
            </div>
          </div>

          <div className="text-center">
            <Link href="/auth/register" className="text-sm text-primary hover:text-primary/80 font-medium">
              Create your account →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
