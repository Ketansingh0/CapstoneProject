"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { Search, Bell, Menu, Sun, Moon, User, Settings, LogOut, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface TopNavigationProps {
  onMenuClick: () => void
  activeView?: string // Added activeView prop to conditionally show New Note button
}

export function TopNavigation({ onMenuClick, activeView }: TopNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleNewNote = () => {
    router.push("/dashboard/notes/new")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any)
    }
  }

  const handleProfile = () => {
    router.push("/dashboard/profile")
  }

  const handleSettings = () => {
    router.push("/dashboard/settings")
  }

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem("authToken")
    sessionStorage.clear()
    // Redirect to login page
    router.push("/auth/login")
  }

  const showNewNoteButton = !["all-notes", "categories", "favorites", "public-notes", "private-notes"].includes(
    activeView || "",
  )
  const isTrashView = activeView === "trash"

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>

          <form
            onSubmit={handleSearch}
            className={`relative ${showNewNoteButton ? "w-96 max-w-sm" : "w-full max-w-2xl"}`}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {showNewNoteButton && !isTrashView && (
            <Button onClick={handleNewNote} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          )}

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div className="p-2 rounded-lg bg-muted">
                  <p className="text-sm font-medium leading-none">Recall Reminder</p>
                  <p className="text-xs leading-none text-muted-foreground">Time to review "React Hooks" notes</p>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <p className="text-sm font-medium leading-none">AI Summary Ready</p>
                  <p className="text-xs leading-none text-muted-foreground">Summary generated for "Database Design"</p>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <p className="text-sm font-medium leading-none">Quiz Available</p>
                  <p className="text-xs leading-none text-muted-foreground">New quiz created from your recent notes</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/diverse-user-avatars.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
