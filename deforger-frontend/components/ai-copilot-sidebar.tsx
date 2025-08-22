"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { mockProjects } from "@/lib/mock-data";

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
          }! I'm your AI Copilot, ready to help you navigate DeForger. I can help you find projects, suggest matches based on your skills, or answer questions about the platform.`
        : "Welcome to DeForger AI Copilot! I'm here to help you find the perfect projects and team members. Sign in to get personalized recommendations, or ask me anything about the platform!",
      sender: "ai",
      timestamp: new Date().toISOString(),
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): Message[] => {
    const lowerMessage = userMessage.toLowerCase();
    const responses: Message[] = [];

    // Project recommendations based on user skills
    if (
      lowerMessage.includes("project") ||
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("find")
    ) {
      if (user) {
        const matchingProjects = mockProjects.filter((project) =>
          project.openRoles.some((role) =>
            role.requiredSkills.some((skill) => user.skills.includes(skill))
          )
        );

        if (matchingProjects.length > 0) {
          responses.push({
            id: Date.now(),
            content: `Based on your skills (${user.skills
              .slice(0, 3)
              .join(", ")}), I found ${
              matchingProjects.length
            } projects that might interest you:`,
            sender: "ai",
            timestamp: new Date().toISOString(),
            type: "text",
          });

          matchingProjects.slice(0, 2).forEach((project, index) => {
            responses.push({
              id: Date.now() + index + 1,
              content: `${project.name} - ${project.vision.slice(0, 100)}...`,
              sender: "ai",
              timestamp: new Date().toISOString(),
              type: "suggestion",
              data: { type: "project", projectId: project.id },
            });
          });
        } else {
          responses.push({
            id: Date.now(),
            content:
              "I couldn't find projects matching your exact skills, but let me show you some exciting opportunities that might help you grow:",
            sender: "ai",
            timestamp: new Date().toISOString(),
            type: "text",
          });
        }
      } else {
        responses.push({
          id: Date.now(),
          content:
            "I'd love to recommend projects for you! Please sign in so I can analyze your skills and suggest the best matches.",
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        });
      }
    }
    // Skills and matching queries
    else if (
      lowerMessage.includes("skill") ||
      lowerMessage.includes("match") ||
      lowerMessage.includes("talent")
    ) {
      if (user) {
        responses.push({
          id: Date.now(),
          content: `Your current skills are: ${user.skills.join(
            ", "
          )}. These skills are in high demand! Here are some trending skills that complement yours:`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        });

        const trendingSkills = [
          "AI/ML",
          "Web3",
          "Blockchain",
          "React",
          "TypeScript",
          "Smart Contracts",
        ];
        const suggestedSkills = trendingSkills
          .filter((skill) => !user.skills.includes(skill))
          .slice(0, 3);

        responses.push({
          id: Date.now() + 1,
          content: `Consider learning: ${suggestedSkills.join(
            ", "
          )} to increase your project matches by up to 40%!`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "suggestion",
          data: { type: "skills", skills: suggestedSkills },
        });
      } else {
        responses.push({
          id: Date.now(),
          content:
            "I can help you discover which skills are most in-demand and suggest learning paths. Sign in to get personalized skill recommendations!",
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        });
      }
    }
    // Dashboard and navigation help
    else if (
      lowerMessage.includes("dashboard") ||
      lowerMessage.includes("navigate") ||
      lowerMessage.includes("how")
    ) {
      responses.push({
        id: Date.now(),
        content: user
          ? "I can help you navigate DeForger! Your dashboard shows your projects, applications, and shareholdings. Would you like me to take you there?"
          : "DeForger has several key areas: Projects (discover opportunities), Dashboard (your personal hub), and Profile (manage your information). Sign in to access your personalized dashboard!",
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: user ? "suggestion" : "text",
        data: user ? { type: "navigation", target: "dashboard" } : undefined,
      });
    }
    // Tokenization and investment queries
    else if (
      lowerMessage.includes("token") ||
      lowerMessage.includes("invest") ||
      lowerMessage.includes("share")
    ) {
      const tokenizedProjects = mockProjects.filter((p) => p.isTokenized);
      responses.push({
        id: Date.now(),
        content: `DeForger allows project tokenization for shared ownership and investment. Currently ${
          tokenizedProjects.length
        } projects are tokenized with a total market cap of ${tokenizedProjects
          .reduce((sum, p) => sum + p.totalShares * p.pricePerShare, 0)
          .toFixed(1)} ETH.`,
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: "text",
      });

      if (tokenizedProjects.length > 0) {
        responses.push({
          id: Date.now() + 1,
          content: `Top investment opportunity: ${tokenizedProjects[0].name} at ${tokenizedProjects[0].pricePerShare} ETH per share`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "suggestion",
          data: { type: "project", projectId: tokenizedProjects[0].id },
        });
      }
    }
    // General help and platform info
    else if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("what") ||
      lowerMessage.includes("about")
    ) {
      responses.push({
        id: Date.now(),
        content:
          "DeForger is an AI-powered platform for decentralized talent matching. I can help you with:\n\n• Finding projects that match your skills\n• Understanding tokenization and investments\n• Navigating the platform\n• Skill development recommendations\n• Team building strategies\n\nWhat would you like to explore?",
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: "text",
      });
    }
    // Default response with personalized suggestions
    else {
      if (user) {
        responses.push({
          id: Date.now(),
          content: `I understand you're interested in "${userMessage}". Let me help you with that! Based on your profile, I can suggest relevant projects, skills to develop, or help you navigate the platform. What specific aspect would you like to explore?`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        });
      } else {
        responses.push({
          id: Date.now(),
          content: `That's an interesting question about "${userMessage}"! I'd love to provide more personalized assistance. Sign in to get tailored recommendations, or ask me about DeForger's features, project discovery, or how our AI matching works.`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        });
      }
    }

    return responses;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponses = generateAIResponse(inputValue);
      setMessages((prev) => [...prev, ...aiResponses]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: Message) => {
    if (suggestion.data?.type === "project" && onNavigate) {
      onNavigate("project-detail", { projectId: suggestion.data.projectId });
      onClose();
    } else if (suggestion.data?.type === "navigation" && onNavigate) {
      onNavigate(suggestion.data.target);
      onClose();
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
      {/* Header */}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-white/10"
        >
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-[85%]">
              {message.sender === "ai" && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
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
                  <span className="text-xs text-muted-foreground">
                    AI Copilot
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              )}

              <div
                className={`p-3 rounded-lg ${
                  message.sender === "user"
                    ? "gradient-primary text-white"
                    : message.type === "suggestion"
                    ? "bg-accent/20 border border-accent/30 cursor-pointer hover:bg-accent/30 transition-colors"
                    : "bg-muted/40 text-foreground"
                }`}
                onClick={
                  message.type === "suggestion"
                    ? () => handleSuggestionClick(message)
                    : undefined
                }
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                {message.type === "suggestion" && (
                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs border-accent/50 text-accent"
                    >
                      Click to view
                    </Badge>
                    <svg
                      className="w-4 h-4 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {message.sender === "user" && (
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
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
                <span className="text-xs text-muted-foreground">
                  AI Copilot is thinking...
                </span>
              </div>
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
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-transparent"
              onClick={() => {
                setInputValue("Find projects for me");
                handleSendMessage();
              }}
            >
              Find Projects
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-transparent"
              onClick={() => {
                setInputValue("Show me trending skills");
                handleSendMessage();
              }}
            >
              Trending Skills
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-transparent"
              onClick={() => {
                setInputValue("Help me navigate");
                handleSendMessage();
              }}
            >
              Help
            </Button>
          </div>
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            className="gradient-primary text-white hover:opacity-90 transition-opacity"
            disabled={isTyping || !inputValue.trim()}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
