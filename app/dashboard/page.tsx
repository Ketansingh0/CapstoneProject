"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNavigation } from "@/components/dashboard/top-navigation"
import { NotesGrid } from "@/components/dashboard/notes-grid"
import { AIAssistant } from "@/components/ai/ai-assistant"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, FolderPlus } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState("all-notes")
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const router = useRouter()

  const handleNewNote = () => {
    router.push("/dashboard/notes/new")
  }

  const handleNewCategory = () => {
    setCategoryDialogOpen(true)
  }

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      console.log("Creating category:", newCategoryName.trim())
      setNewCategoryName("")
      setCategoryDialogOpen(false)
    }
  }

  const handleCancelCategory = () => {
    setNewCategoryName("")
    setCategoryDialogOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation onMenuClick={() => setSidebarOpen(!sidebarOpen)} activeView={activeView} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-balance">
                  {activeView === "all-notes" && "All Notes"}
                  {activeView === "categories" && "Categories"}
                  {activeView === "favorites" && "Favorites"}
                  {activeView === "trash" && "Trash"}
                  {activeView === "public-notes" && "Public Notes"}
                  {activeView === "private-notes" && "Private Notes"}
                  {activeView === "ai-quiz" && "AI Quiz"}
                </h1>
                <p className="text-muted-foreground text-pretty">
                  {activeView === "categories"
                    ? "Organize your notes into categories and folders"
                    : "Manage and organize your smart notes"}
                </p>
              </div>
              {activeView === "categories" && !selectedCategory ? (
                <Button className="gap-2" onClick={handleNewCategory}>
                  <FolderPlus className="h-4 w-4" />
                  New Category
                </Button>
              ) : (
                activeView !== "trash" &&
                activeView !== "categories" && (
                  <Button className="gap-2" onClick={handleNewNote}>
                    <Plus className="h-4 w-4" />
                    New Note
                  </Button>
                )
              )}
            </div>

            <NotesGrid activeView={activeView} onCategorySelect={setSelectedCategory} />
          </div>
        </main>
      </div>

      <AIAssistant isOpen={aiAssistantOpen} onToggle={() => setAiAssistantOpen(!aiAssistantOpen)} />

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create New Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCategoryName.trim()) {
                    handleCreateCategory()
                  }
                }}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelCategory}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
