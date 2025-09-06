"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Capture ideas, summarize with AI, and turn notes into quizzes.
          </p>
          <Button size="lg" className="px-8" onClick={() => router.push("/auth/login")}>Go to Login</Button>
        </CardContent>
      </Card>
    </div>
  )
}


