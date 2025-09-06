"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Clock, Brain, Flame, Award } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Mock data for charts
const weeklyProgress = [
  { day: "Mon", reviews: 5, accuracy: 85 },
  { day: "Tue", reviews: 8, accuracy: 92 },
  { day: "Wed", reviews: 3, accuracy: 78 },
  { day: "Thu", reviews: 12, accuracy: 88 },
  { day: "Fri", reviews: 7, accuracy: 95 },
  { day: "Sat", reviews: 4, accuracy: 82 },
  { day: "Sun", reviews: 6, accuracy: 90 },
]

const categoryPerformance = [
  { category: "Development", easy: 15, medium: 8, hard: 3 },
  { category: "Design", easy: 12, medium: 5, hard: 2 },
  { category: "AI/ML", easy: 8, medium: 12, hard: 6 },
  { category: "Backend", easy: 10, medium: 7, hard: 4 },
]

export function LearningDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  // Mock statistics
  const stats = {
    currentStreak: 7,
    longestStreak: 23,
    totalReviews: 156,
    averageAccuracy: 87,
    notesInRotation: 24,
    reviewsToday: 5,
    weeklyGoal: 35,
    weeklyProgress: 28,
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.longestStreak}</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {stats.weeklyProgress} / {stats.weeklyGoal} reviews
              </span>
              <Badge variant={stats.weeklyProgress >= stats.weeklyGoal ? "default" : "secondary"}>
                {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
              </Badge>
            </div>
            <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {stats.weeklyGoal - stats.weeklyProgress > 0
                ? `${stats.weeklyGoal - stats.weeklyProgress} more reviews to reach your weekly goal`
                : "Congratulations! You've reached your weekly goal"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reviews" stroke="#ea580c" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="easy" stackId="a" fill="#16a34a" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" />
                <Bar dataKey="hard" stackId="a" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                note: "React Hooks Deep Dive",
                action: "Reviewed",
                difficulty: "Easy",
                time: "2 hours ago",
                streak: 4,
              },
              {
                note: "Database Design Principles",
                action: "Reviewed",
                difficulty: "Medium",
                time: "5 hours ago",
                streak: 2,
              },
              {
                note: "Machine Learning Basics",
                action: "Reviewed",
                difficulty: "Hard",
                time: "1 day ago",
                streak: 1,
              },
              {
                note: "UI/UX Design Patterns",
                action: "Reviewed",
                difficulty: "Easy",
                time: "2 days ago",
                streak: 3,
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-balance">{activity.note}</h4>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} • {activity.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      activity.difficulty === "Easy"
                        ? "border-green-200 text-green-700"
                        : activity.difficulty === "Medium"
                          ? "border-yellow-200 text-yellow-700"
                          : "border-red-200 text-red-700"
                    }
                  >
                    {activity.difficulty}
                  </Badge>
                  <Badge variant="secondary">Streak: {activity.streak}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
