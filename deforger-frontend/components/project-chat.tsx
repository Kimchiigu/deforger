"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import type { ChatMessage, UserProfile } from "@/lib/types";
import { backendActor } from "@/utils/service/actor-locator";

interface ProjectChatProps {
  projectId: number;
  projectName: string;
  teamMembers: UserProfile[];
}

export function ProjectChat({
  projectId,
  projectName,
  teamMembers,
}: ProjectChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages from the canister
  const fetchMessages = async () => {
    try {
      const messagesResult = await backendActor.getProjectMessages(projectId);
      const formattedMessages = messagesResult.map((m: any) => ({
        ...m,
        id: Number(m.id),
        projectId: Number(m.projectId),
        timestamp: new Date(Number(m.timestamp / 1000000n)).toISOString(),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const token = localStorage.getItem("sessionToken");
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }

    setIsSending(true);
    try {
      const success = await backendActor.sendMessage(
        token,
        projectId,
        inputValue
      );
      if (success) {
        setInputValue("");
        await fetchMessages();
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUserInfo = (userId: string) => {
    return teamMembers.find((u) => u.id === userId);
  };

  if (!user || !teamMembers.some((member) => member.id === user.id)) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Team Members Only
        </h3>
        <p className="text-muted-foreground">
          Join the project team to access the chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold text-foreground">Team Chat</h3>
        <p className="text-sm text-muted-foreground">
          {teamMembers.length} members
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const sender = getUserInfo(message.sender);
          const isCurrentUser = message.sender === user.id;

          return (
            <div
              key={message.id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`max-w-[80%]`}>
                {!isCurrentUser && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground">
                      {sender?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg ${
                    isCurrentUser
                      ? "gradient-primary text-white"
                      : "bg-muted/40 text-foreground border border-white/10"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {isCurrentUser && (
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            className="gradient-primary text-white"
            disabled={!inputValue.trim() || isSending}
          >
            {isSending ? "..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
