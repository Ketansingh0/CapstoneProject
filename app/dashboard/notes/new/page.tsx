"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Eye, Globe, Lock, Plus, X, Upload, Bold, Italic, List, Link2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { NotesAPI } from "@/lib/api"

export default function NewNotePage() {
  const router = useRouter()
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
  const categoryFromUrl = searchParams?.get("category") || null

  const [noteData, setNoteData] = useState({
    title: "",
    content: "",
    isPublic: false,
    tags: [] as string[],
    category: categoryFromUrl, // Assign category if created from category directory
  })
  const [newTag, setNewTag] = useState("")
  const [isPreview, setIsPreview] = useState(false)

  const handleSave = async () => {
    const payload = {
      title: noteData.title,
      content: noteData.content,
      isPublic: noteData.isPublic,
      tags: noteData.tags,
      categoryId: noteData.category || null,
    }
    await NotesAPI.create(payload)
    router.push(noteData.category ? "/dashboard?view=categories" : "/dashboard")
  }

  const addTag = () => {
    if (newTag.trim() && !noteData.tags.includes(newTag.trim())) {
      setNoteData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNoteData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {noteData.isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {noteData.isPublic ? "Public Note" : "Private Note"}
                {noteData.category && ` • ${noteData.category}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Editor */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Title */}
            <div>
              <Input
                placeholder="Note title..."
                value={noteData.title}
                onChange={(e) => setNoteData((prev) => ({ ...prev, title: e.target.value }))}
                className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
              />
            </div>

            {/* Editor Toolbar */}
            {!isPreview && (
              <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                <Button variant="ghost" size="sm">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Link2 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm">
                  <Upload className="h-4 w-4" />
                  Attach
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="min-h-[400px]">
              {isPreview ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      {noteData.content || <p className="text-muted-foreground italic">No content to preview</p>}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Textarea
                  placeholder="Start writing your note... (Markdown supported)"
                  value={noteData.content}
                  onChange={(e) => setNoteData((prev) => ({ ...prev, content: e.target.value }))}
                  className="min-h-[400px] resize-none border-0 px-0 focus-visible:ring-0 text-base"
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border p-6 bg-muted/20">
          <div className="space-y-6">
            {/* Note Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Note Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Privacy Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Public Note</Label>
                    <p className="text-xs text-muted-foreground">
                      {noteData.isPublic ? "Visible to all users with AI features" : "Private to you, no AI features"}
                    </p>
                  </div>
                  <Switch
                    checked={noteData.isPublic}
                    onCheckedChange={(checked) => setNoteData((prev) => ({ ...prev, isPublic: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {noteData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Features Preview */}
            {noteData.isPublic && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Features Available</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Auto-summary generation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Quiz creation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Spaced repetition
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
