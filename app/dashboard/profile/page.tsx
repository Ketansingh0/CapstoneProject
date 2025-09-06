"use client"

import { useState, useEffect } from "react"
import { AuthAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Calendar, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
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
          <p className="text-slate-600">Loading profile...</p>
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

        {/* Profile Header */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-white text-2xl font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">{user.name}</CardTitle>
            <CardDescription className="text-slate-600 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              {user.email}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Profile Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Information */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <User className="h-5 w-5 text-cyan-600" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="text-slate-900 font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email Address</label>
                <p className="text-slate-900 font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Role</label>
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                  {user.role || "User"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Member Since</label>
                <p className="text-slate-900 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Settings className="h-5 w-5 text-cyan-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push("/dashboard/settings")}
                className="w-full justify-start bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700 text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full justify-start border-slate-200 hover:bg-slate-50"
              >
                <User className="h-4 w-4 mr-2" />
                View My Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
