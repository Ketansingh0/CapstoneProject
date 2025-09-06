"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Search, Clock, Trophy, Target, TrendingUp, ArrowLeft } from "lucide-react"

// Mock data for available quizzes
const mockQuizzes = [
  {
    id: "1",
    title: "React Hooks Fundamentals",
    noteTitle: "React Hooks Deep Dive",
    questionsCount: 5,
    lastScore: 85,
    attempts: 3,
    createdAt: "2024-01-15",
    difficulty: "Intermediate",
    category: "Development",
  },
  {
    id: "2",
    title: "Database Design Quiz",
    noteTitle: "Database Design Principles",
    questionsCount: 7,
    lastScore: 92,
    attempts: 2,
    createdAt: "2024-01-14",
    difficulty: "Advanced",
    category: "Backend",
  },
  {
    id: "3",
    title: "ML Basics Assessment",
    noteTitle: "Machine Learning Basics",
    questionsCount: 6,
    lastScore: 78,
    attempts: 4,
    createdAt: "2024-01-13",
    difficulty: "Beginner",
    category: "AI/ML",
  },
  {
    id: "4",
    title: "UX Design Patterns",
    noteTitle: "UI/UX Design Patterns",
    questionsCount: 4,
    lastScore: null,
    attempts: 0,
    createdAt: "2024-01-12",
    difficulty: "Intermediate",
    category: "Design",
  },
]

export default function AIQuizPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")

  const filteredQuizzes = mockQuizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.noteTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || quiz.category.toLowerCase() === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || quiz.difficulty.toLowerCase() === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const totalQuizzes = mockQuizzes.length
  const completedQuizzes = mockQuizzes.filter((q) => q.attempts > 0).length
  const averageScore =
    mockQuizzes.filter((q) => q.lastScore !== null).reduce((acc, q) => acc + (q.lastScore || 0), 0) /
    mockQuizzes.filter((q) => q.lastScore !== null).length

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Title and Description */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary rounded-lg p-2">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-balance">AI Quiz Center</h1>
              <p className="text-muted-foreground text-pretty">Test your knowledge with AI-generated quizzes</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">
                      {completedQuizzes}/{totalQuizzes}
                    </p>
                    <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(averageScore || 0)}%</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{mockQuizzes.reduce((acc, q) => acc + q.attempts, 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="ai/ml">AI/ML</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Quiz Grid */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2 text-balance">{quiz.title}</CardTitle>
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Based on: {quiz.noteTitle}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{quiz.questionsCount} questions</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{quiz.createdAt}</span>
                    </div>
                  </div>

                  {quiz.lastScore !== null ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Best Score:</span>
                        <span className={`font-semibold ${getScoreColor(quiz.lastScore)}`}>{quiz.lastScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Attempts:</span>
                        <span className="text-sm font-medium">{quiz.attempts}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">Not attempted yet</p>
                    </div>
                  )}

                  <Button className="w-full">{quiz.attempts > 0 ? "Retake Quiz" : "Start Quiz"}</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground text-pretty max-w-sm mx-auto">
                Try adjusting your search criteria or create some public notes to generate new quizzes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
