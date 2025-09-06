"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal,
  Heart,
  Globe,
  Lock,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Copy,
  Share,
  FolderOpen,
  FileText,
  Plus,
  ArrowLeft,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { NotesAPI, CategoriesAPI } from "@/lib/api"

interface NotesGridProps {
  activeView: string
  onCategorySelect?: (category: string | null) => void
}

type UiNote = {
  id: string
  title: string
  content: string
  isPublic: boolean
  isFavorite: boolean
  createdAt: string
  tags: string[]
  category: string | null
}

export function NotesGrid({ activeView, onCategorySelect }: NotesGridProps) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<"title" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [notes, setNotes] = useState<UiNote[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [categories, setCategories] = useState<any[]>([])
  const [catLoading, setCatLoading] = useState<boolean>(false)

  useEffect(() => {
    if (onCategorySelect) {
      onCategorySelect(selectedCategory)
    }
  }, [selectedCategory, onCategorySelect])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        setError("")
        const viewParam =
          activeView === "public-notes" ? "public" : activeView === "private-notes" ? "private" : activeView === "categories" && selectedCategory ? "byCategory" : "all"

        const categoryId = selectedCategory ?? undefined
        const data = await NotesAPI.list({ view: viewParam as any, categoryId })

        const fetched: UiNote[] = (data.notes || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          isPublic: !!n.isPublic,
          isFavorite: false,
          createdAt:
            typeof n.createdAt === "string" ? n.createdAt : new Date(n.createdAt).toISOString().slice(0, 10),
          tags: (n.tags || []).map((t: any) => t.name || t.tag?.name).filter(Boolean),
          category: n.categoryId ?? null,
        }))
        if (!ignore) setNotes(fetched)
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load notes")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [activeView, selectedCategory])

  useEffect(() => {
    let ignore = false
    async function loadCategories() {
      try {
        setCatLoading(true)
        const resp = await CategoriesAPI.list()
        if (!ignore) setCategories(resp.tree || [])
      } catch {
        // ignore
      } finally {
        if (!ignore) setCatLoading(false)
      }
    }
    if (activeView === "categories") {
      loadCategories()
    }
    return () => {
      ignore = true
    }
  }, [activeView])

  async function refreshNotesAndCategories() {
    if (activeView === "categories") {
      try {
        const resp = await CategoriesAPI.list()
        setCategories(resp.tree || [])
      } catch {}
    }
    try {
      setLoading(true)
      const viewParam =
        activeView === "public-notes" ? "public" : activeView === "private-notes" ? "private" : activeView === "categories" && selectedCategory ? "byCategory" : "all"
      const categoryId = selectedCategory ?? undefined
      const data = await NotesAPI.list({ view: viewParam as any, categoryId })
      const fetched: UiNote[] = (data.notes || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        isPublic: !!n.isPublic,
        isFavorite: false,
        createdAt:
          typeof n.createdAt === "string" ? n.createdAt : new Date(n.createdAt).toISOString().slice(0, 10),
        tags: (n.tags || []).map((t: any) => t.name || t.tag?.name).filter(Boolean),
        category: n.categoryId ?? null,
      }))
      setNotes(fetched)
    } catch (e: any) {
      setError(e?.message || "Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    const name = window.prompt("New category name")?.trim()
    if (!name) return
    await CategoriesAPI.create({ name })
    await refreshNotesAndCategories()
  }

  const handleRenameCategory = async (cat: any) => {
    const name = window.prompt("Rename category", cat.name)?.trim()
    if (!name || name === cat.name) return
    await CategoriesAPI.rename(cat.id, name)
    await refreshNotesAndCategories()
  }

  const handleDeleteCategory = async (cat: any) => {
    if (!window.confirm(`Delete category "${cat.name}"? Make sure it's empty.`)) return
    try {
      await CategoriesAPI.delete(cat.id)
      if (selectedCategory === cat.id) setSelectedCategory(null)
      await refreshNotesAndCategories()
    } catch (e: any) {
      setError(e?.message || "Failed to delete category")
    }
  }

  const filteredNotes = notes // already filtered by backend

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }
    return sortOrder === "desc" ? -comparison : comparison
  })

  const handleNoteClick = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`)
  }

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
  }

  const handleNewNoteInCategory = () => {
    const categoryParam = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ""
    router.push(`/dashboard/notes/new${categoryParam}`)
  }

  const handleEditNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Editing note:", noteId)
  }

  const handleDuplicateNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Duplicating note:", noteId)
  }

  const handleShareNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Sharing note:", noteId)
  }

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Deleting note:", noteId)
  }

  const handleNewSubcategory = () => {
    console.log("Creating new subcategory")
    // TODO: Implement subcategory creation logic
  }

  if (activeView === "categories") {
    // Show specific category notes view
    if (selectedCategory) {
      const categoryNotes = filteredNotes

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToCategories} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Categories
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedCategory}</h2>
                  <p className="text-sm text-muted-foreground">
                    {categoryNotes.length} note{categoryNotes.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  const name = window.prompt("New subcategory name")?.trim()
                  if (!name) return
                  await CategoriesAPI.create({ name, parentId: selectedCategory })
                  await refreshNotesAndCategories()
                }}
                className="flex items-center gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                New Subcategory
              </Button>
              <Button onClick={handleNewNoteInCategory} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>

          {categoryNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-6 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notes in {selectedCategory}</h3>
              <p className="text-muted-foreground text-pretty max-w-sm mb-4">
                This category is empty. Create your first note to get started.
              </p>
              <Button onClick={handleNewNoteInCategory} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryNotes.map((note) => (
                <Card
                  key={note.id}
                  className="group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleNoteClick(note.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-2 text-balance">{note.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleEditNote(note.id, e)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDuplicateNote(note.id, e)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleShareNote(note.id, e)}>
                            <Share className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteNote(note.id, e)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3 text-pretty">{note.content}</p>

                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {note.createdAt}
                      </div>
                      <div className="flex items-center gap-1">
                        {note.isFavorite && <Heart className="h-3 w-3 text-red-500 fill-current" />}
                        {note.isPublic ? (
                          <Globe className="h-3 w-3 text-green-500" />
                        ) : (
                          <Lock className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )
    }

    // Show categories overview
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-sm text-muted-foreground">Categories</div>
          <Button size="sm" onClick={handleCreateCategory}>New Category</Button>
          {catLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(categories || []).map((cat: any) => {
            const notesInCategory = notes.filter((note) => note.category === cat.id).length
            return (
              <Card
                key={cat.id}
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRenameCategory(cat)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            const categoryParam = `?category=${encodeURIComponent(cat.id)}`
                            router.push(`/dashboard/notes/new${categoryParam}`)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCategory(cat)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-balance">{cat.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{notesInCategory} notes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">Loading notes...</div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    )
  }

  if (sortedNotes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Select value={sortBy} onValueChange={(value: "title" | "date") => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">No notes found</div>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted rounded-full p-6 mb-4">
            <Tag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notes found</h3>
          <p className="text-muted-foreground text-pretty max-w-sm">
            {activeView === "trash"
              ? "Your trash is empty. Deleted notes will appear here."
              : "Create your first note to get started with your smart note-taking journey."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Select value={sortBy} onValueChange={(value: "title" | "date") => setSortBy(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {sortedNotes.length} note{sortedNotes.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedNotes.map((note) => (
          <Card
            key={note.id}
            className="group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleNoteClick(note.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base line-clamp-2 text-balance">{note.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleEditNote(note.id, e)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDuplicateNote(note.id, e)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleShareNote(note.id, e)}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteNote(note.id, e)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3 text-pretty">{note.content}</p>

              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {note.createdAt}
                </div>
                <div className="flex items-center gap-1">
                  {note.isFavorite && <Heart className="h-3 w-3 text-red-500 fill-current" />}
                  {note.isPublic ? (
                    <Globe className="h-3 w-3 text-green-500" />
                  ) : (
                    <Lock className="h-3 w-3 text-amber-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
