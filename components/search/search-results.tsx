"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Heart, Globe, Lock, Calendar, Edit, Trash2, Copy, Share, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: number
  title: string
  content: string
  category: string
  isPublic: boolean
  isFavorite: boolean
  createdAt: string
  tags: string[]
  relevanceScore?: number
  matchedContent?: string
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  totalResults: number
}

export function SearchResults({ results, query, totalResults }: SearchResultsProps) {
  const router = useRouter()

  const handleNoteClick = (noteId: number) => {
    router.push(`/dashboard/notes/${noteId}`)
  }

  const handleEditNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/dashboard/notes/${noteId}`)
  }

  const handleDeleteNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Deleting note:", noteId)
  }

  const handleDuplicateNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Duplicating note:", noteId)
  }

  const handleShareNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Sharing note:", noteId)
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted rounded-full p-6 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground text-pretty max-w-sm">
          {query
            ? `No notes found matching "${query}". Try adjusting your search terms or filters.`
            : "Enter a search query to find your notes."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </h2>
          {query && (
            <p className="text-sm text-muted-foreground">
              Showing results for "<span className="font-medium">{query}</span>"
            </p>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <Card
            key={result.id}
            className="group hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleNoteClick(result.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base line-clamp-2 text-balance">
                  {highlightText(result.title, query)}
                </CardTitle>
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
                    <DropdownMenuItem onClick={(e) => handleEditNote(result.id, e)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDuplicateNote(result.id, e)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleShareNote(result.id, e)}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteNote(result.id, e)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Matched Content Preview */}
              {result.matchedContent && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {highlightText(result.matchedContent, query)}
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground line-clamp-3 text-pretty">
                {highlightText(result.content, query)}
              </p>

              <div className="flex flex-wrap gap-1">
                {result.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {highlightText(tag, query)}
                  </Badge>
                ))}
                {result.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{result.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {result.createdAt}
                </div>
                <div className="flex items-center gap-1">
                  {result.isFavorite && <Heart className="h-3 w-3 text-red-500 fill-current" />}
                  {result.isPublic ? (
                    <Globe className="h-3 w-3 text-green-500" />
                  ) : (
                    <Lock className="h-3 w-3 text-amber-500" />
                  )}
                  {result.relevanceScore && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(result.relevanceScore * 100)}% match
                    </Badge>
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
