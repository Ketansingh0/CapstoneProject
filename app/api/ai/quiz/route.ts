import { NextRequest, NextResponse } from "next/server"
import { generateQuiz } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json()
    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 })

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simple quiz if no API key
      const sentences = content.split(/(?<=[.!?])\s+/).slice(0, 3)
      const questions = sentences.map((s: string, i: number) => ({
        id: i + 1,
        question: `What is a key idea in: "${s.slice(0, 80)}"?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answerIndex: 0,
      }))
      return NextResponse.json({ title: title || "Quiz", questions })
    }

    const quiz = await generateQuiz(title || "Untitled Note", content)
    return NextResponse.json(quiz)
  } catch (error: any) {
    console.error("Quiz generation error:", error)
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 })
  }
}


