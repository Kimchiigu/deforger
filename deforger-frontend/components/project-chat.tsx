"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import type { ChatMessage } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

interface ProjectChatProps {
  projectId: number
  projectName: string
  teamMembers: string[]
}

export function ProjectChat({ projectId, projectName, teamMembers }: ProjectChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      projectId,
      sender: teamMembers[0],
      content: `Welcome to the ${projectName} team chat! Let's build something amazing together.`,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: 2,
      projectId,
      sender: teamMembers[1] || teamMembers[0],
      content: "Excited to be part of this project! What should we tackle first?",
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    },
    {
      id: 3,
      projectId,
      sender: teamMembers[0],
      content:
        "Great question! I think we should start with the core architecture and then move to the frontend. What do you all think?",
      timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isOnline, setIsOnline] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Simulate online status
    const onlineStatus: Record<string, boolean> = {}
    teamMembers.forEach((memberId) => {
      onlineStatus[memberId] = Math.random() > 0.3 // 70% chance of being online
    })
    setIsOnline(onlineStatus)
  }, [teamMembers])

  const handleSendMessage = () => {
    if (!inputValue.trim() || !user) return

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      projectId,
      sender: user.id,
      content: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate team member responses occasionally
    if (Math.random() > 0.7) {
      setTimeout(
        () => {
          const otherMembers = teamMembers.filter((id) => id !== user.id)
          if (otherMembers.length > 0) {
            const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)]
            const responses = [
              "Great point!",
              "I agree with that approach.",
              "Let me look into that.",
              "Sounds good to me!",
              "I can help with that part.",
              "Good idea, let's discuss this further.",
            ]

            const response: ChatMessage = {
              id: messages.length + 2,
              projectId,
              sender: randomMember,
              content: responses[Math.floor(Math.random() * responses.length)],
              timestamp: new Date().toISOString(),
            }

            setMessages((prev) => [...prev, response])
          }
        },
        1000 + Math.random() * 3000,
      )
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getUserInfo = (userId: string) => {
    return mockUsers.find((u) => u.id === userId)
  }

  if (!user || !teamMembers.includes(user.id)) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Team Members Only</h3>
        <p className="text-muted-foreground">Join the project team to access the chat</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h3 className="font-semibold text-foreground">Team Chat</h3>
          <p className="text-sm text-muted-foreground">{teamMembers.length} members</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 3).map((memberId) => {
              const member = getUserInfo(memberId)
              return (
                <div
                  key={memberId}
                  className="relative w-8 h-8 rounded-full gradient-primary flex items-center justify-center border-2 border-background"
                >
                  <span className="text-white text-xs font-medium">
                    {member?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("") || "?"}
                  </span>
                  {isOnline[memberId] && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
              )
            })}
          </div>
          {teamMembers.length > 3 && (
            <Badge variant="outline" className="text-xs border-white/20">
              +{teamMembers.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const sender = getUserInfo(message.sender)
          const isCurrentUser = message.sender === user.id

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${isCurrentUser ? "order-2" : ""}`}>
                {!isCurrentUser && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {sender?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "?"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{sender?.name}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                  </div>
                )}

                <div
                  className={`p-3 rounded-lg ${
                    isCurrentUser ? "gradient-primary text-white" : "bg-muted/40 text-foreground border border-white/10"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>

                {isCurrentUser && (
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            className="gradient-primary text-white hover:opacity-90 transition-opacity"
            disabled={!inputValue.trim()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
