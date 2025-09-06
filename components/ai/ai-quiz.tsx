"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { HelpCircle, CheckCircle, XCircle, RefreshCw, Trophy, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AIAPI } from "@/lib/api"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface AIQuizProps {
  noteContent: string
  noteTitle: string
}

export function AIQuiz({ noteContent, noteTitle }: AIQuizProps) {
  const router = useRouter()
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  const generateQuiz = async () => {
    setIsLoading(true)

    try {
      const data = await AIAPI.quiz({ title: noteTitle, content: noteContent })
      const quizQuestions: QuizQuestion[] = data.questions.map((q: any, index: number) => ({
        id: q.id.toString(),
        question: q.question,
        options: q.options,
        correctAnswer: q.answerIndex,
        explanation: `This question tests your understanding of the key concepts from "${noteTitle}".`,
      }))
      setQuiz(quizQuestions)
    } catch (error) {
      console.error("Failed to generate quiz:", error)
      // Fallback to a simple error quiz
      setQuiz([{
        id: "1",
        question: "Failed to generate quiz. Please try again.",
        options: ["Try again", "Check your connection", "Contact support"],
        correctAnswer: 0,
        explanation: "There was an error generating the quiz. Please try again.",
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < (quiz?.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    if (!quiz) return 0
    let correct = 0
    quiz.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quiz.length) * 100)
  }

  const resetQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(quizStarted || showResults) && (
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-base">AI Quiz</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <HelpCircle className="h-3 w-3" />
              Interactive
            </Badge>
          </div>
          {!quiz && !isLoading && (
            <Button size="sm" onClick={generateQuiz}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Generate Quiz
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        )}

        {quiz && !quizStarted && !showResults && (
          <div className="space-y-4">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quiz Ready!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test your knowledge with {quiz.length} questions generated from your note.
              </p>
              <Button onClick={startQuiz}>Start Quiz</Button>
            </div>
          </div>
        )}

        {quiz && quizStarted && !showResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Question {currentQuestion + 1} of {quiz.length}
              </span>
              <Progress value={((currentQuestion + 1) / quiz.length) * 100} className="w-24" />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-balance">{quiz[currentQuestion].question}</h3>

              <RadioGroup
                value={selectedAnswers[quiz[currentQuestion].id]?.toString()}
                onValueChange={(value) => handleAnswerSelect(quiz[currentQuestion].id, Number.parseInt(value))}
              >
                {quiz[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-sm cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={nextQuestion}
                disabled={selectedAnswers[quiz[currentQuestion].id] === undefined}
                className="w-full"
              >
                {currentQuestion === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
              </Button>
            </div>
          </div>
        )}

        {showResults && quiz && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{calculateScore()}%</div>
              <p className="text-muted-foreground mb-4">
                You got{" "}
                {Object.values(selectedAnswers).filter((answer, index) => answer === quiz[index].correctAnswer).length}{" "}
                out of {quiz.length} questions correct!
              </p>
            </div>

            <div className="space-y-3">
              {quiz.map((question, index) => {
                const userAnswer = selectedAnswers[question.id]
                const isCorrect = userAnswer === question.correctAnswer

                return (
                  <Card key={question.id} className="p-3">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-2">{question.question}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          Your answer: {question.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-green-600 mb-1">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{question.explanation}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetQuiz}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button onClick={generateQuiz}>Generate New Quiz</Button>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Note
              </Button>
            </div>
          </div>
        )}

        {!quiz && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Generate an interactive quiz based on your note content to test your understanding and reinforce learning.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
