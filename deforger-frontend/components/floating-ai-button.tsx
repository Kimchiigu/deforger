"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"

interface FloatingAIButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function FloatingAIButton({ isOpen, onClick }: FloatingAIButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        isOpen
          ? "bg-red-600 hover:bg-red-700"
          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
      }`}
      size="icon"
    >
      {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      <span className="sr-only">{isOpen ? "Close AI Copilot" : "Open AI Copilot"}</span>
    </Button>
  )
}
