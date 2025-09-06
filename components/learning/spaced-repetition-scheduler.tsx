"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, TrendingUp, Brain } from "lucide-react"

interface ScheduledNote {
  id: string
  title: string
  category: string
  nextReview: Date
  difficulty: number
  streak: number
  interval: number // days
}

interface SpacedRepetitionSchedulerProps {
  onStartSession: (notes: ScheduledNote[]) => void
}

export function SpacedRepetitionScheduler({ onStartSession }: SpacedRepetitionSchedulerProps) {
  const [scheduledNotes, setScheduledNotes] = useState<ScheduledNote[]>([])
  const [todayNotes, setTodayNotes] = useState<ScheduledNote[]>([])
  const [upcomingNotes, setUpcomingNotes] = useState<ScheduledNote[]>([])

  useEffect(() => {
    // Mock data for scheduled notes
    const mockNotes: ScheduledNote[] = [
      {
        id: "1",
        title: "React Hooks Deep Dive",
        category: "Development",
        nextReview: new Date(),
        difficulty: 2,
        streak: 3,
        interval: 7,
      },
      {
        id: "2",
        title: "Database Design Principles",
        category: "Backend",
        nextReview: new Date(),
        difficulty: 3,
        streak: 1,
        interval: 3,
      },
      {
        id: "3",
        title: "Machine Learning Basics",
        category: "AI/ML",
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        difficulty: 1,
        streak: 5,
        interval: 15,
      },
      {
        id: "4",
        title: "UI/UX Design Patterns",
        category: "Design",
        nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        difficulty: 2,
        streak: 2,
        interval: 7,
      },
    ]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaysDue = mockNotes.filter((note) => {
      const reviewDate = new Date(note.nextReview)
      reviewDate.setHours(0, 0, 0, 0)
      return reviewDate <= today
    })

    const upcoming = mockNotes.filter((note) => {
      const reviewDate = new Date(note.nextReview)
      reviewDate.setHours(0, 0, 0, 0)
      return reviewDate > today
    })

    setScheduledNotes(mockNotes)
    setTodayNotes(todaysDue)
    setUpcomingNotes(upcoming)
  }, [])

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-100 text-green-800"
    if (difficulty <= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return "Easy"
    if (difficulty <= 3) return "Medium"
    return "Hard"
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    return date.toLocaleDateString()
  }

  const getNextInterval = (currentInterval: number, difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy":
        return Math.min(currentInterval * 2, 30) // Max 30 days
      case "medium":
        return currentInterval
      case "hard":
        return Math.max(1, Math.floor(currentInterval / 2)) // Min 1 day
    }
  }

  return (
    <div className="space-y-6">
      {/* Today's Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Today's Reviews</CardTitle>
              <Badge variant="destructive">{todayNotes.length}</Badge>
            </div>
            {todayNotes.length > 0 && (
              <Button onClick={() => onStartSession(todayNotes)}>
                <Brain className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {todayNotes.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground text-pretty">No reviews scheduled for today. Great job!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-balance">{note.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {note.category}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(note.difficulty)}`}>
                        {getDifficultyLabel(note.difficulty)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Streak: {note.streak}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Due now</div>
                    <div className="text-xs text-muted-foreground">Interval: {note.interval}d</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingNotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No upcoming reviews scheduled</p>
          ) : (
            <div className="space-y-3">
              {upcomingNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-balance">{note.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {note.category}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(note.difficulty)}`}>
                        {getDifficultyLabel(note.difficulty)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Streak: {note.streak}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatDate(note.nextReview)}</div>
                    <div className="text-xs text-muted-foreground">Interval: {note.interval}d</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learning Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{scheduledNotes.length}</div>
              <div className="text-sm text-muted-foreground">Total Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayNotes.length}</div>
              <div className="text-sm text-muted-foreground">Due Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(scheduledNotes.reduce((acc, note) => acc + note.streak, 0) / scheduledNotes.length || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(scheduledNotes.reduce((acc, note) => acc + note.interval, 0) / scheduledNotes.length || 0)}d
              </div>
              <div className="text-sm text-muted-foreground">Avg Interval</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
