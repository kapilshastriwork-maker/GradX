"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Trash2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useChat } from "@/hooks/useChat";
import { formatMessage } from "@/lib/formatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const suggestedQuestions = [
  "Which universities should I target for MS in CS in USA?",
  "How do I improve my GRE score above 320?",
  "What should my SOP include?",
  "How much education loan can I get?",
  "What are the visa requirements for Canada?",
  "How do I manage anxiety during applications?",
];

export default function MentorPage() {
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage, clearChat } = useChat(studentProfile);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setStudentProfile(profile);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const content = inputValue;
    setInputValue("");
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedClick = async (question: string) => {
    setInputValue(question);
    await sendMessage(question);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4">
      {/* Left Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-72 flex-col bg-white rounded-xl border p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-purple-600">S</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Shikha</h2>
            <p className="text-xs text-gray-500">Your AI Study Abroad Mentor</p>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Questions</h3>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedClick(question)}
                className="text-left text-xs p-2 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors line-clamp-2"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Your Profile Summary</h4>
            {studentProfile ? (
              <div className="space-y-1 text-xs text-gray-600">
                <p>Target: {studentProfile.target_country || "Not set"}</p>
                <p>Degree: {studentProfile.target_degree || "Not set"}</p>
                <p>CGPA: {studentProfile.cgpa || "Not set"}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Complete your profile for personalized advice!</p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Powered by Llama 3.3 via Groq</p>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Shikha</h2>
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-gray-900"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-600">S</span>
                    </div>
                  </div>
                )}
                <div
                  className="text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: message.role === "assistant"
                      ? formatMessage(message.content)
                      : message.content,
                  }}
                />
                <p className={`text-xs mt-2 ${message.role === "user" ? "text-purple-200" : "text-gray-400"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Shikha anything about studying abroad..."
              className="resize-none min-h-[44px]"
              disabled={isLoading}
              maxLength={500}
            />
            <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{inputValue.length}/500</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Shikha can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}