"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AIAPI } from "@/lib/api"

interface AISummaryProps {
  noteContent: string
  noteTitle: string
}

export function AISummary({ noteContent, noteTitle }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const generateSummary = async () => {
    setIsLoading(true)

    try {
      const data = await AIAPI.summary({ title: noteTitle, content: noteContent })
      setSummary(data.summary)
    } catch (error) {
      console.error("Failed to generate summary:", error)
      setSummary("Failed to generate summary. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copySummary = async () => {
    if (summary) {
      await navigator.clipboard.writeText(summary)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const regenerateSummary = () => {
    setSummary(null)
    generateSummary()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">AI Summary</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Generated
            </Badge>
          </div>
          {!summary && !isLoading && (
            <Button size="sm" onClick={generateSummary}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2 mt-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        )}

        {summary && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-sm text-muted-foreground">{summary}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={regenerateSummary}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copySummary}>
                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}

        {!summary && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Generate an AI-powered summary of your note to quickly understand key concepts and main points.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
