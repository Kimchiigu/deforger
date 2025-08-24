"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { v4 as uuidv4 } from "uuid";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/shadcn-io/ai/reasoning";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { ProjectCardAI } from "./project-card-ai"; 

interface ProjectRole {
  role: string;
  skills: string[];
}

interface ProjectData {
  id: string;
  name: string;
  description: string;
  owner: string;
  roles: ProjectRole[];
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  type: string;
  projects?: ProjectData[];
}

interface AICopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

function parseProjectsFromMarkdown(markdown: string): ProjectData[] {
  const projects: ProjectData[] = [];
  const projectBlocks = markdown
    .split("---")
    .filter((block) => block.trim() !== "");

  projectBlocks.forEach((block) => {
    const nameMatch = block.match(/\*\*Project Name\*\*:\s*(.*)/);
    const idMatch = block.match(/\*\*Project ID:\*\*\s*(.*)/);
    const descMatch = block.match(/\*\*Description\*\*:\s*(.*)/);
    const ownerMatch = block.match(/\*\*Owner\*\*:\s*(.*)/);
    const rolesMatch = block.match(/-\s+\*\*(.*?)\*\*\s+Skills:\s+(.*)/g);

    if (nameMatch && idMatch && descMatch && ownerMatch) {
      const roles: ProjectRole[] = [];
      if (rolesMatch) {
        rolesMatch.forEach((roleLine) => {
          const roleParts = roleLine.match(
            /-\s+\*\*(.*?)\*\*\s+Skills:\s+(.*)/
          );
          if (roleParts) {
            roles.push({
              role: roleParts[1],
              skills: roleParts[2].split(",").map((s) => s.trim()),
            });
          }
        });
      }
      projects.push({
        id: idMatch[1].trim(),
        name: nameMatch[1].trim().replace(/\*/g, ""),
        description: descMatch[1].trim(),
        owner: ownerMatch[1].trim(),
        roles: roles,
      });
    }
  });

  return projects;
}

export function AICopilotSidebar({ isOpen, onClose, onNavigate }: AICopilotSidebarProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
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
  const [reasoningContent, setReasoningContent] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const sessionMap = useRef(new Map<string, string>()).current;
  const convId = useRef<string>(uuidv4()).current;

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
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    const userMessage: Message = {
      id: uuidv4(),
      content: currentInput,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true); // Visually, we are still "streaming" or loading
    setReasoningContent("");

    // Add a placeholder AI message that we will update later
    const aiMessageId = uuidv4();
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      sender: "ai",
      timestamp: new Date().toISOString(),
      projects: [],
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const token = localStorage.getItem("sessionToken");
      let userContent = `Use @test-agent://agent1q2fz6srx3z6crus7a8tymcp40jph0237xv8m45f7wqt8tksfkte8m86dm2 to handle this query without including the @test-agent directive in the message to the agent: ${currentInput}`;
      if (token) userContent += ` (token: ${token})`;

      const chatMessages = [{ role: "user", content: userContent }];
      const response = await fetch("https://api.asi1.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ASI_ONE_API_KEY}`,
          "x-session-id": getSessionId(convId),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "asi1-fast-agentic",
          messages: chatMessages,
          stream: true,
        }),
      });

      if (!response.ok || !response.body)
        throw new Error(`API error: ${response.statusText}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = ""; // This will store the full response

      // STEP 1: Accumulate the entire stream content without updating the UI.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data.trim() === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              accumulatedContent += token;
            }
          } catch (e) {
            console.warn("Malformed stream event ignored:", e);
          }
        }
      }

      // STEP 2: Now that the stream is finished, parse the full response.
      const thinkMatch = accumulatedContent.match(/<think>([\s\S]*)<\/think>/);
      let finalContent = accumulatedContent;
      let projects: ProjectData[] = [];

      if (thinkMatch) {
        setReasoningContent(thinkMatch[1].trim());
        finalContent = accumulatedContent.replace(thinkMatch[0], "").trim();
      }

      if (finalContent.includes("### **Project Name**:")) {
        projects = parseProjectsFromMarkdown(finalContent);
        const introTextMatch = finalContent.match(/([\s\S]*?)---/);
        finalContent = introTextMatch
          ? introTextMatch[1].trim()
          : "Here are your projects:";
      }

      // STEP 3: Update the UI with the final, parsed content in a single step.
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: finalContent, projects: projects }
            : msg
        )
      );
    } catch (error) {
      console.error("Error during streaming or parsing:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: "Sorry, an error occurred." }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCardClick = (projectId: string) => {
    if (onNavigate) {
      onNavigate("project-detail", { projectId });
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
              {message.sender === "user" ? (
                <div className="p-3 rounded-lg gradient-primary text-white">
                  <p className="text-sm whitespace-pre-line">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="bg-muted/40 text-foreground rounded-lg">
                  {/* ✨ Render Reasoning and Response */}
                  {reasoningContent &&
                    message.id.includes(messages[messages.length - 1].id) && (
                      <Reasoning isStreaming={isStreaming} defaultOpen={true}>
                        <ReasoningTrigger />
                        <ReasoningContent>{reasoningContent}</ReasoningContent>
                      </Reasoning>
                    )}
                  <Response className="p-3">{message.content}</Response>

                  {/* ✨ Render Project Cards if they exist */}
                  {message.projects &&
                    message.projects.map((project) => (
                      <ProjectCardAI
                        key={project.id}
                        project={project}
                        onNavigate={() => handleCardClick(project.id)}
                      />
                    ))}
                </div>
              )}
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

      {/* Input */}
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
