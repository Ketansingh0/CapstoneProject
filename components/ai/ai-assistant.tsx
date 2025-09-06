"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Sparkles, X, MessageCircle, FileText, HelpCircle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

const quickActions = [
  { id: "summarize", label: "Summarize Note", icon: FileText },
  { id: "quiz", label: "Create Quiz", icon: HelpCircle },
  { id: "improve", label: "Improve Writing", icon: Lightbulb },
  { id: "explain", label: "Explain Concept", icon: MessageCircle },
]

export function AIAssistant({ isOpen, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI assistant. I can help you summarize notes, create quizzes, improve your writing, and answer questions about your content. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to the newest message while keeping history scrollable
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `I understand you want to "${inputValue}". Here's what I can help you with: I can analyze your notes, generate summaries, create quiz questions, and provide writing suggestions. Would you like me to work with your current note?`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickAction = (actionId: string) => {
    const actionMessages = {
      summarize: "Please summarize my current note",
      quiz: "Create a quiz based on my current note",
      improve: "Help me improve the writing in my current note",
      explain: "Explain the key concepts in my current note",
    }

    setInputValue(actionMessages[actionId as keyof typeof actionMessages])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
      >
        <Brain className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-full p-2">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <CardTitle className="text-base">AI Assistant</CardTitle>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Quick Actions */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-8 text-xs bg-transparent"
                onClick={() => handleQuickAction(action.id)}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-3 pr-1">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm break-words whitespace-pre-wrap overflow-hidden",
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {/* Anchor to auto-scroll into view on new messages */}
            <div ref={endRef} />
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    AI is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
