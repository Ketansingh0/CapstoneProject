"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Eye, Globe, Lock, Plus, X, Upload, Bold, Italic, List, Link2, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AISummary } from "@/components/ai/ai-summary"
import { AIQuiz } from "@/components/ai/ai-quiz"

interface EditNotePageProps {
  params: {
    id: string
  }
}

export default function EditNotePage({ params }: EditNotePageProps) {
  const router = useRouter()
  const [noteData, setNoteData] = useState({
    title: "",
    content: "",
    isPublic: false,
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Mock loading note data
  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      const mockNotes = {
        "1": {
          title: "React Hooks Deep Dive",
          content:
            "# React Hooks Deep Dive\n\nUnderstanding useState, useEffect, and custom hooks...\n\n## useState\n\nThe useState hook allows you to add state to functional components.",
          isPublic: true,
          tags: ["React", "JavaScript", "Frontend"],
        },
        "2": {
          title: "Personal Project Ideas",
          content:
            "# Personal Project Ideas\n\nSome private thoughts and ideas for future projects...\n\n## Web Apps\n\n- Personal finance tracker\n- Recipe organizer",
          isPublic: false,
          tags: ["Ideas", "Personal", "Projects"],
        },
        "3": {
          title: "Meeting Notes - Confidential",
          content:
            "# Team Meeting Notes\n\nConfidential discussion points...\n\n## Action Items\n\n- Review budget proposals\n- Schedule follow-up meetings",
          isPublic: false,
          tags: ["Meeting", "Confidential", "Work"],
        },
      }

      // Get note data based on ID, default to public note if ID not found
      const noteData = mockNotes[params.id as keyof typeof mockNotes] || mockNotes["1"]

      setNoteData(noteData)
      setIsLoading(false)
    }, 500)
  }, [params.id])

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Updating note:", noteData)
    router.push("/dashboard")
  }

  const handleDelete = () => {
    // TODO: Implement soft delete functionality
    console.log("Deleting note:", params.id)
    router.push("/dashboard")
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      </div>
    )
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
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Note</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this note? It will be moved to trash and can be recovered later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
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
                      {noteData.content.split("\n").map((line, index) => (
                        <p key={index} className="mb-2">
                          {line}
                        </p>
                      ))}
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

            {noteData.isPublic && (
              <div className="space-y-6">
                <AISummary noteContent={noteData.content} noteTitle={noteData.title} />
                <AIQuiz noteContent={noteData.content} noteTitle={noteData.title} />
              </div>
            )}
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
