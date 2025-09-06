import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateSummary(title: string, content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that creates concise, informative summaries of notes. Focus on key concepts, main points, and actionable insights. Keep summaries under 200 words and use bullet points for clarity."
        },
        {
          role: "user",
          content: `Please summarize this note titled "${title}":\n\n${content}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || "Unable to generate summary."
  } catch (error) {
    console.error("OpenAI API error:", error)
    throw new Error("Failed to generate summary")
  }
}

export async function generateQuiz(title: string, content: string): Promise<{
  title: string
  questions: Array<{
    id: number
    question: string
    options: string[]
    answerIndex: number
  }>
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that creates educational quizzes from notes. Generate 3-5 multiple choice questions that test understanding of key concepts. Each question should have 4 options with one correct answer. Return your response as a JSON object with this exact structure: { \"questions\": [{ \"id\": 1, \"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"answerIndex\": 0 }] }"
        },
        {
          role: "user",
          content: `Create a quiz based on this note titled "${title}":\n\n${content}`
        }
      ],
      max_tokens: 800,
      temperature: 0.8,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("No response from OpenAI")

    // Parse JSON response
    const quizData = JSON.parse(content)
    
    // Validate structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz format")
    }

    return {
      title: `Quiz: ${title}`,
      questions: quizData.questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        answerIndex: q.answerIndex
      }))
    }
  } catch (error) {
    console.error("OpenAI API error:", error)
    throw new Error("Failed to generate quiz")
  }
}
