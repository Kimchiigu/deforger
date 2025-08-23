"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { v4 as uuidv4 } from "uuid";

// Define the structure for a chat message
interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  type?: "text" | "suggestion" | "match";
  data?: any;
}

interface AICopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function AICopilotSidebar({
  isOpen,
  onClose,
  onNavigate,
}: AICopilotSidebarProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: user
        ? `Welcome back, ${
            user.name.split(" ")[0]
          }! I'm your DeForger AI Agent. How can I help you today?`
        : "Welcome! I'm the DeForger AI Agent. I can help you find projects, manage your profile, and more. Sign in for personalized assistance.",
      sender: "ai",
      timestamp: new Date().toISOString(),
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session management
  const sessionMap = new Map<string, string>();
  const convId = useRef<string>(uuidv4()).current; // Persistent conversation ID

  function getSessionId(convId: string): string {
    let sessionId = sessionMap.get(convId);
    if (!sessionId) {
      sessionId = uuidv4();
      sessionMap.set(convId, sessionId);
    }
    return sessionId;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToApi = async (
    chatMessages: { role: string; content: string }[]
  ) => {
    const apiKey = process.env.NEXT_PUBLIC_ASI_ONE_API_KEY;
    if (!apiKey) throw new Error("NEXT_PUBLIC_ASI_ONE_API_KEY is not set.");

    const endpoint = "https://api.asi1.ai/v1/chat/completions";
    const model = "asi1-fast-agentic";
    const sessionId = getSessionId(convId);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "x-session-id": sessionId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: chatMessages,
        stream: false,
      }),
    });

    if (!response.ok)
      throw new Error(`API request failed: ${response.statusText}`);

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const pollForUpdate = async (
    history: { role: string; content: string }[]
  ) => {
    let attempt = 0;
    const maxAttempts = 24; // ~2 minutes
    const waitSec = 5 * 1000; // 5 seconds

    while (attempt < maxAttempts) {
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, waitSec));

      const updateMessages = [
        ...history,
        { role: "user", content: "Any update?" },
      ];
      const latest = await sendToApi(updateMessages);

      if (
        latest &&
        latest.trim() &&
        latest.trim() !== "No update." &&
        latest.trim() !== history[history.length - 1].content.trim()
      ) {
        return latest;
      }
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("sessionToken");
      let userContent = `Use @test-agent://agent1q2fz6srx3z6crus7a8tymcp40jph0237xv8m45f7wqt8tksfkte85m86dm2 to handle this query without including the @test-agent directive in the message to the agent: ${currentInput}`;
      if (token) userContent += ` (token: ${token})`;

      let chatMessages = [
        {
          role: "user",
          content: userContent,
        },
      ];

      let aiText = await sendToApi(chatMessages);

      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiText,
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Check if the response indicates delegation or processing
      if (
        aiText.includes("I've sent the message") ||
        aiText.includes("processing")
      ) {
        chatMessages = [
          ...chatMessages,
          { role: "assistant", content: aiText },
        ];
        const finalReply = await pollForUpdate(chatMessages);

        if (finalReply) {
          const pollMessage: Message = {
            id: Date.now() + 2,
            content: finalReply,
            sender: "ai",
            timestamp: new Date().toISOString(),
            type: "text",
          };
          setMessages((prev) => [...prev, pollMessage]);
        } else {
          const timeoutMessage: Message = {
            id: Date.now() + 2,
            content:
              "No update received after polling. Please try again later.",
            sender: "ai",
            timestamp: new Date().toISOString(),
            type: "text",
          };
          setMessages((prev) => [...prev, timeoutMessage]);
        }
      }
    } catch (error) {
      console.error("Error communicating with AI agent:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        content:
          "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false); // Ensure loading stops regardless of outcome
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-80 glass-strong border-l border-white/20 z-40 flex flex-col animate-in slide-in-from-right duration-300 rounded-tl-2xl rounded-bl-2xl">
      {/* Header and Messages JSX remains the same */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold gradient-text">AI Copilot</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-[85%]">
              <div
                className={`p-3 rounded-lg ${
                  message.sender === "user"
                    ? "gradient-primary text-white"
                    : "bg-muted/40 text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
              <div
                className={`text-xs text-muted-foreground mt-1 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted/40 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-accent rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-accent rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your AI agent..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            className="gradient-primary text-white"
            disabled={isTyping || !inputValue.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
