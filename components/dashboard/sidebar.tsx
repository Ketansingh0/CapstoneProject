"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BookOpen,
  FileText,
  FolderOpen,
  Heart,
  Trash2,
  Globe,
  Lock,
  Brain,
  ChevronLeft,
  Settings,
  GraduationCap,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  activeView: string
  onViewChange: (view: string) => void
}

const navigationItems = [
  { id: "all-notes", label: "All Notes", icon: FileText },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "trash", label: "Trash", icon: Trash2 },
]

const noteTypes = [
  { id: "public-notes", label: "Public Notes", icon: Globe },
  { id: "private-notes", label: "Private Notes", icon: Lock },
]

const aiFeatures = [
  { id: "ai-quiz", label: "AI Quiz", icon: Brain },
  { id: "learning", label: "Learning Center", icon: GraduationCap },
]

export function Sidebar({ isOpen, onToggle, activeView, onViewChange }: SidebarProps) {
  const router = useRouter()

  const handleNewNote = () => {
    router.push("/dashboard/notes/new")
  }

  const handleNavigation = (viewId: string) => {
    if (viewId === "ai-quiz") {
      router.push("/dashboard/ai-quiz")
    } else if (viewId === "learning") {
      router.push("/dashboard/learning")
    } else {
      onViewChange(viewId)
    }
  }

  return (
    <div
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className="bg-sidebar-primary rounded-lg p-2">
                  <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <span className="font-bold text-sidebar-foreground">Journal</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", !isOpen && "rotate-180")} />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              {isOpen && (
                <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2 px-2">
                  Navigation
                </h3>
              )}
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sidebar-foreground",
                      activeView === item.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent",
                      !isOpen && "justify-center px-2",
                    )}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    {isOpen && <span>{item.label}</span>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Note Types */}
            <div>
              {isOpen && (
                <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2 px-2">
                  Note Types
                </h3>
              )}
              <div className="space-y-1">
                {noteTypes.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sidebar-foreground",
                      activeView === item.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "hover:bg-sidebar-accent",
                      !isOpen && "justify-center px-2",
                    )}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    {isOpen && <span>{item.label}</span>}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Features */}
            <div>
              {isOpen && (
                <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2 px-2">
                  AI & Learning
                </h3>
              )}
              <div className="space-y-1">
                {aiFeatures.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                      !isOpen && "justify-center px-2",
                    )}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    {isOpen && <span>{item.label}</span>}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
              !isOpen && "justify-center px-2",
            )}
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="h-4 w-4" />
            {isOpen && <span>Settings</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
