import { NextRequest, NextResponse } from "next/server"
import { generateSummary } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json()
    if (!content) return NextResponse.json({ error: "Missing content" }, { status: 400 })

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simple summary if no API key
      const summary = `Summary for ${title || "Note"}: ` +
        content.split(/\s+/).slice(0, 60).join(" ") + (content.length > 60 ? "..." : "")
      return NextResponse.json({ summary })
    }

    const summary = await generateSummary(title || "Untitled Note", content)
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error("Summary generation error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}


