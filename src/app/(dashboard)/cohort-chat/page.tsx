"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Send, Users, ArrowRight, DollarSign, Award, FileCheck, Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const seedMessages = [
  { author_name: 'Arjun Mehta', author_initials: 'AM', message: 'Hey everyone! Just joined this cohort. Who else is targeting Fall 2026? 👋' },
  { author_name: 'Priya Sharma', author_initials: 'PS', message: 'Hi Arjun! I am also Fall 2026. Have you started working on your SOPs yet?' },
  { author_name: 'Rahul Nair', author_initials: 'RN', message: 'Just finished my GRE — got 321. Now starting applications. This platform has been super helpful for the comparison tool!' },
  { author_name: 'Ananya K', author_initials: 'AK', message: 'Has anyone heard back from UT Austin already? Their portal has been quiet for me.' },
  { author_name: 'Vikram S', author_initials: 'VS', message: 'UT Austin decisions usually come in February for Fall intake. The wait is real 😅 Hang in there everyone!' },
];

const quickReactions = [
  "👋 Just joined!",
  "🎉 Got an offer!",
  "❓ Need advice",
  "✅ Application submitted"
];

const suggestedCohorts = [
  { key: "Canada-Computer Science-2026", flag: "🇨🇦", name: "Canada", field: "CS" },
  { key: "UK-Data Science-2026", flag: "🇬🇧", name: "UK", field: "Data Science" },
  { key: "USA-MBA-2026", flag: "🇺🇸", name: "USA", field: "MBA" },
];

export default function CohortChatPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingName, setTypingName] = useState<string | null>(null);
  const [cohortKey, setCohortKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
        if (data?.target_country && data?.field_of_study && data?.intake_year) {
          setCohortKey(`${data.target_country}-${data.field_of_study}-${data.intake_year}`);
        } else {
          setCohortKey("USA-Computer Science-2026");
        }
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (cohortKey) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      const typingInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          setTypingName(seedMessages[Math.floor(Math.random() * seedMessages.length)].author_name);
          setTimeout(() => setTypingName(null), 2000);
        }
      }, 30000);
      return () => { clearInterval(interval); clearInterval(typingInterval); };
    }
  }, [cohortKey]);

  const fetchMessages = async () => {
    if (!cohortKey) return;
    
    const { data } = await supabase
      .from("cohort_messages")
      .select("*")
      .eq("cohort_key", cohortKey)
      .order("created_at", { ascending: true });
    
    if ((data?.length || 0) === 0 && messages.length === 0) {
      await seedCohort();
    }
    setMessages(data || []);
    setLoading(false);
    scrollToBottom();
  };

  const seedCohort = async () => {
    for (const msg of seedMessages) {
      await supabase.from("cohort_messages").insert({
        user_id: "00000000-0000-0000-0000-000000000001",
        cohort_key: cohortKey,
        author_name: msg.author_name,
        author_initials: msg.author_initials,
        message: msg.message,
      });
    }
    const { data } = await supabase
      .from("cohort_messages")
      .select("*")
      .eq("cohort_key", cohortKey)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!messageText.trim() || !user) return;
    setSending(true);

    const initials = profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

    await supabase.from("cohort_messages").insert({
      user_id: user.id,
      cohort_key: cohortKey,
      author_name: profile?.full_name || user.email?.split("@")[0],
      author_initials: initials,
      message: messageText,
    });

    setMessageText("");
    await fetchMessages();
    setSending(false);
    earnBadge('cohort_joined');
  };

  const handleQuickReply = async (text: string) => {
    if (!user) return;
    
    const initials = profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

    await supabase.from("cohort_messages").insert({
      user_id: user.id,
      cohort_key: cohortKey,
      author_name: profile?.full_name || user.email?.split("@")[0],
      author_initials: initials,
      message: text,
    });

    await fetchMessages();
    earnBadge('cohort_joined');
  };

  const getCohortInfo = () => {
    const parts = cohortKey.split("-");
    return {
      country: parts[0] || "USA",
      field: parts[1] || "CS",
      year: parts[2] || "2026",
      season: "Fall"
    };
  };

  const cohortInfo = getCohortInfo();
  const countryFlag = cohortInfo.country === "USA" ? "🇺🇸" : 
                   cohortInfo.country === "UK" ? "🇬🇧" : 
                   cohortInfo.country === "Canada" ? "🇨🇦" : "🌍";

  const members = [...new Set(messages.map(m => m.author_name))].slice(0, 10);

  if (!profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 mb-4">
              To join your cohort, please complete your student profile first.
            </p>
            <Link href="/profile">
              <Button className="bg-purple-600">Complete Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Panel */}
      <div className="w-64 shrink-0 space-y-4 hidden md:block">
        <Card className="h-full">
          <CardContent className="pt-4">
            <h2 className="font-semibold mb-3">Your Cohort</h2>
            <div className="px-3 py-2 bg-purple-100 rounded-lg mb-4">
              <span className="text-lg">{countryFlag}</span> <span className="font-medium">{cohortInfo.country}</span> • {cohortInfo.field} • {cohortInfo.season} {cohortInfo.year}
            </div>
            <p className="text-sm text-gray-500 mb-3">{members.length} students in this cohort</p>
            
            <div className="space-y-2 mb-4">
              {members.slice(0, 8).map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">{name.split(" ").map((n: string) => n[0]).join("")}</span>
                  </div>
                  <span className="text-sm">{name.split(" ")[0]}</span>
                </div>
              ))}
              {members.length > 8 && (
                <p className="text-xs text-gray-500">+{members.length - 8} more</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Other Cohorts</h3>
              <div className="space-y-2">
                {suggestedCohorts.map((cohort) => (
                  <button
                    key={cohort.key}
                    onClick={() => setCohortKey(cohort.key)}
                    className={`block w-full text-left px-2 py-1.5 rounded text-sm ${
                      cohortKey === cohort.key ? "bg-purple-100" : "hover:bg-gray-50"
                    }`}
                  >
                    {cohort.flag} {cohort.name} • {cohort.field}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Cohort Resources</h3>
              <div className="space-y-2">
                <Link href="/visa-guide" className="flex items-center gap-2 text-sm text-purple-600 hover:underline">
                  <FileCheck className="w-4 h-4" /> Visa Guide
                </Link>
                <Link href="/cost-of-living" className="flex items-center gap-2 text-sm text-purple-600 hover:underline">
                  <DollarSign className="w-4 h-4" /> Cost of Living
                </Link>
                <Link href="/scholarships" className="flex items-center gap-2 text-sm text-purple-600 hover:underline">
                  <Award className="w-4 h-4" /> Scholarships
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold">
              {countryFlag} {cohortInfo.country} • {cohortInfo.field} • {cohortInfo.season} {cohortInfo.year}
            </h2>
            <span className="text-sm text-gray-500">{members.length} members online</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-600 mx-auto"></div>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isCurrentUser = msg.author_name === profile?.full_name || msg.author_name === user?.email?.split("@")[0];
                const prevMsg = messages[i - 1];
                const showHeader = !prevMsg || 
                  prevMsg.author_name !== msg.author_name ||
                  (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) > 120000;
                
                return (
                  <div key={msg.id} className={`flex gap-2 ${isCurrentUser ? "justify-end" : ""}`}>
                    {!isCurrentUser && showHeader && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0 self-end">
                        <span className="text-xs font-semibold">{msg.author_initials}</span>
                      </div>
                    )}
                    {!isCurrentUser && !showHeader && <div className="w-8 shrink-0" />}
                    <div className={`max-w-[70%] ${isCurrentUser ? "order-1" : ""}`}>
                      {showHeader && !isCurrentUser && (
                        <p className="text-xs text-gray-500 mb-1">{msg.author_name}</p>
                      )}
                      <div className={`px-3 py-2 rounded-lg ${
                        isCurrentUser 
                          ? "bg-purple-600 text-white" 
                          : "bg-gray-100"
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? "text-right" : ""}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {typingName && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span className="animate-pulse">{typingName} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reactions */}
          <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto">
            {quickReactions.map((reaction, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(reaction)}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs whitespace-nowrap hover:bg-gray-200"
              >
                {reaction}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t flex gap-2">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message your cohort..."
              className="flex-1 px-3 py-2 border rounded-lg resize-none text-sm"
              rows={1}
            />
            <Button 
              onClick={handleSend} 
              disabled={sending || !messageText.trim()}
              className="bg-purple-600 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}