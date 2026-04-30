"use client";

import { useState, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useChat(studentProfile: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Namaste! 🙏 I'm Shikha, your personal study abroad mentor on GradX.\n\nI'm here to help you with everything — from choosing the right university and acing your GRE, to writing a killer SOP and figuring out your education loan. Think of me as your senior friend who's been through it all!\n\nWhat's on your mind today? You can ask me anything about studying abroad. 😊`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          studentProfile,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError("Shikha is unavailable right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, studentProfile]);

  const clearChat = useCallback(() => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `Namaste! 🙏 I'm Shikha, your personal study abroad mentor. What would you like to talk about today?`,
      timestamp: new Date(),
    }]);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}