"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ShareAPI } from "@/lib/api"
import { Eye, Edit, Save, X, User, Calendar, Tag } from "lucide-react"

interface SharedNote {
  note: {
    id: string
    title: string
    content: string
    isPublic: boolean
    createdAt: string
    updatedAt: string
    author: {
      id: string
      name: string
      email: string
    }
    tags: string[]
    attachments: Array<{
      id: string
      filename: string
      originalName: string
      url: string
      mimeType: string
      size: number
    }>
    comments: Array<{
      id: string
      content: string
      author: {
        id: string
        name: string
        email: string
      }
      createdAt: string
    }>
  }
  share: {
    id: string
    permissions: string
    sharedBy: {
      id: string
      name: string
      email: string
    }
    createdAt: string
  }
}

export default function SharedNotePage() {
  const token = (useParams<{ token: string }>() as { token: string }).token
  
  const [sharedNote, setSharedNote] = useState<SharedNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadSharedNote()
  }, [token])

  const loadSharedNote = async () => {
    try {
      const data = await ShareAPI.getShared(token)
      setSharedNote(data)
      setEditedContent(data.note.content)
    } catch (err: any) {
      setError(err.message || "Failed to load shared note")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!sharedNote) return
    
    setIsSaving(true)
    try {
      await ShareAPI.updateShared(token, editedContent)
      setSharedNote(prev => prev ? {
        ...prev,
        note: { ...prev.note, content: editedContent }
      } : null)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading shared note...</p>
        </div>
      </div>
    )
  }

  if (error || !sharedNote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Note Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || "This shared note may have been removed or the link is invalid."}
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEdit = sharedNote.share.permissions !== "read"

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{sharedNote.note.title}</CardTitle>
                  <Badge variant="secondary">
                    {sharedNote.share.permissions}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {sharedNote.note.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(sharedNote.note.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {sharedNote.note.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-1 flex-wrap">
                      {sharedNote.note.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditedContent(sharedNote.note.content)
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Note content..."
              />
            ) : (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                  {sharedNote.note.content}
                </pre>
              </div>
            )}

            {sharedNote.note.attachments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sharedNote.note.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{attachment.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(attachment.url, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sharedNote.note.comments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Comments</h3>
                <div className="space-y-3">
                  {sharedNote.note.comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
