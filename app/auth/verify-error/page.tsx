"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function VerifyErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Verification Failed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            The verification link is invalid or has expired. Please request a new verification email.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/auth/register")}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Register Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
