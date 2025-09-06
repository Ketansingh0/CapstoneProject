"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Eye, CheckCircle } from "lucide-react"

interface RecallNote {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  lastReviewed: Date
  nextReview: Date
  difficulty: number // 1-5 scale
  streak: number
}

interface RecallSessionProps {
  notes: RecallNote[]
  onComplete: (results: { noteId: string; difficulty: "easy" | "medium" | "hard" }[]) => void
}

export function RecallSession({ notes, onComplete }: RecallSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [results, setResults] = useState<{ noteId: string; difficulty: "easy" | "medium" | "hard" }[]>([])
  const [sessionComplete, setSessionComplete] = useState(false)

  const currentNote = notes[currentIndex]
  const progress = ((currentIndex + (showAnswer ? 0.5 : 0)) / notes.length) * 100

  const handleReveal = () => {
    setShowAnswer(true)
  }

  const handleDifficultySelect = (difficulty: "easy" | "medium" | "hard") => {
    const newResult = { noteId: currentNote.id, difficulty }
    const newResults = [...results, newResult]
    setResults(newResults)

    if (currentIndex < notes.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    } else {
      setSessionComplete(true)
      onComplete(newResults)
    }
  }

  const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500 hover:bg-green-600"
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "hard":
        return "bg-red-500 hover:bg-red-600"
    }
  }

  const getSessionStats = () => {
    const easy = results.filter((r) => r.difficulty === "easy").length
    const medium = results.filter((r) => r.difficulty === "medium").length
    const hard = results.filter((r) => r.difficulty === "hard").length
    return { easy, medium, hard }
  }

  if (sessionComplete) {
    const stats = getSessionStats()
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="bg-primary rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Session Complete!</CardTitle>
          <p className="text-muted-foreground">Great job on completing your recall session</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.easy}</div>
              <div className="text-sm text-muted-foreground">Easy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-sm text-muted-foreground">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.hard}</div>
              <div className="text-sm text-muted-foreground">Hard</div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your next review sessions have been scheduled based on your performance
            </p>
            <Button onClick={() => window.location.reload()}>Return to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium">Recall Session</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {notes.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Current Note */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-balance">{currentNote.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentNote.category}</Badge>
              <Badge variant="secondary">Streak: {currentNote.streak}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showAnswer ? (
            <div className="text-center py-12">
              <div className="bg-muted rounded-full p-6 w-24 h-24 mx-auto mb-6">
                <Brain className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-balance">Try to recall this note</h3>
              <p className="text-muted-foreground mb-6 text-pretty max-w-md mx-auto">
                Think about the key concepts, main points, and important details from "{currentNote.title}"
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {currentNote.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button onClick={handleReveal} size="lg">
                <Eye className="h-4 w-4 mr-2" />
                Reveal Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line">{currentNote.content}</div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">How well did you recall this?</h3>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => handleDifficultySelect("hard")}
                    className={getDifficultyColor("hard")}
                    size="lg"
                  >
                    Hard
                    <br />
                    <span className="text-xs opacity-80">Couldn't recall</span>
                  </Button>
                  <Button
                    onClick={() => handleDifficultySelect("medium")}
                    className={getDifficultyColor("medium")}
                    size="lg"
                  >
                    Medium
                    <br />
                    <span className="text-xs opacity-80">Partial recall</span>
                  </Button>
                  <Button
                    onClick={() => handleDifficultySelect("easy")}
                    className={getDifficultyColor("easy")}
                    size="lg"
                  >
                    Easy
                    <br />
                    <span className="text-xs opacity-80">Perfect recall</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
