"use client"

import { useState } from "react"
import { LearningDashboard } from "@/components/learning/learning-dashboard"
import { SpacedRepetitionScheduler } from "@/components/learning/spaced-repetition-scheduler"
import { RecallSession } from "@/components/learning/recall-session"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Calendar, BarChart3, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface ScheduledNote {
  id: string
  title: string
  category: string
  nextReview: Date
  difficulty: number
  streak: number
  interval: number
}

export default function LearningPage() {
  const [activeSession, setActiveSession] = useState<ScheduledNote[] | null>(null)
  const router = useRouter()

  const handleStartSession = (notes: ScheduledNote[]) => {
    // Convert to the format expected by RecallSession
    const recallNotes = notes.map((note) => ({
      ...note,
      content: `This is the content for ${note.title}. Key concepts include fundamental principles, practical applications, and best practices.`,
      tags: ["tag1", "tag2"],
      lastReviewed: new Date(Date.now() - note.interval * 24 * 60 * 60 * 1000),
    }))
    setActiveSession(recallNotes)
  }

  const handleSessionComplete = (results: { noteId: string; difficulty: "easy" | "medium" | "hard" }[]) => {
    // TODO: Process results and update spaced repetition schedule
    console.log("Session results:", results)
    setActiveSession(null)
  }

  if (activeSession) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setActiveSession(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">Active Recall Session</h1>
              <p className="text-sm text-muted-foreground">Focus and try to recall without looking</p>
            </div>
          </div>
        </header>
        <main className="p-6">
          <RecallSession notes={activeSession} onComplete={handleSessionComplete} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-border px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary rounded-lg p-2">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">Learning Center</h1>
              <p className="text-muted-foreground text-pretty">
                Track your progress and optimize your learning with spaced repetition
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="session" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Quick Session
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <LearningDashboard />
            </TabsContent>

            <TabsContent value="schedule">
              <SpacedRepetitionScheduler onStartSession={handleStartSession} />
            </TabsContent>

            <TabsContent value="session">
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Quick Review Session</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-pretty">
                  Start a quick review session with a random selection of your notes to reinforce learning.
                </p>
                <Button
                  size="lg"
                  onClick={() =>
                    handleStartSession([
                      {
                        id: "quick-1",
                        title: "Quick Review Note 1",
                        category: "Mixed",
                        nextReview: new Date(),
                        difficulty: 2,
                        streak: 1,
                        interval: 1,
                      },
                      {
                        id: "quick-2",
                        title: "Quick Review Note 2",
                        category: "Mixed",
                        nextReview: new Date(),
                        difficulty: 3,
                        streak: 1,
                        interval: 1,
                      },
                    ])
                  }
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Quick Session
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
