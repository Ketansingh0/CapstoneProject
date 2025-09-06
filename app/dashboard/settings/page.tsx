"use client"

import { useState, useEffect } from "react"
import { AuthAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Lock, Edit, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const me = await AuthAPI.me()
        if (!ignore) setUser(me)
      } catch {
        if (!ignore) setUser(null)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-2">Manage your account settings and preferences.</p>
          </div>

          {/* Profile Settings */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <User className="h-5 w-5 text-cyan-600" />
                Profile Information
              </CardTitle>
              <CardDescription>View and manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <span className="text-slate-900">{user.name || "Not set"}</span>
                    <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <span className="text-slate-900">{user.email || "Not set"}</span>
                    <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Lock className="h-5 w-5 text-cyan-600" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">Password</p>
                      <p className="text-sm text-slate-600">Last updated 30 days ago</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 bg-transparent"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
