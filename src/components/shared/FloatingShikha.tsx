"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, Zap, TrendingUp, BookOpen, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export function FloatingShikha() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (pathname === "/mentor") return;
    
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
        
        const newSuggestions = [];
        if (!data?.gre_score) newSuggestions.push("How should I prepare for GRE?");
        if (!data?.target_universities?.length) newSuggestions.push("Which universities should I target?");
        if (!data?.loan_readiness_score) newSuggestions.push("Am I eligible for an education loan?");
        newSuggestions.push("What should I do next?");
        setSuggestions(newSuggestions);
      }
    };
    loadProfile();
  }, [pathname]);

  const handleSuggestionClick = (question: string) => {
    router.push(`/mentor?q=${encodeURIComponent(question)}`);
    setOpen(false);
  };

  if (pathname === "/mentor") return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center z-50 group"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          3
        </span>
      </button>

      {/* Slide-up Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-xl shadow-2xl border z-50 animate-slideUp overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold">Ask Shikha</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-3">Quick questions based on your profile:</p>
            
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}

            <div className="pt-2 border-t">
              <input
                type="text"
                placeholder="Type your question..."
                className="w-full p-2 text-sm border rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSuggestionClick(e.currentTarget.value);
                  }
                }}
              />
            </div>
          </CardContent>

          <div className="p-3 border-t bg-gray-50">
            <Link href="/mentor" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
              Open Full Chat <Send className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}