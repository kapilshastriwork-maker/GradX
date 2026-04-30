"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Compass, TrendingUp, Target, Star, PenLine, 
  MessageCircle, IndianRupee, Calendar, CheckCircle, Zap, Database, 
  Globe, Award, Sparkles, ArrowRight, Trophy, GitCompare, DollarSign,
  Plane, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { step: 1, name: "Dashboard & Profile", desc: "See how a student's journey is tracked end-to-end", href: "/dashboard", time: "~1 min" },
  { step: 2, name: "AI Career Navigator", desc: "Watch AI match a student to 6 universities in 30 seconds", href: "/career-navigator", time: "~2 min" },
  { step: 3, name: "University Compare", desc: "Compare up to 3 universities side by side with AI recommendations", href: "/compare", time: "~2 min" },
  { step: 4, name: "Scholarship Finder", desc: "Find scholarships matched to your profile — $150K+ potential value", href: "/scholarships", time: "~2 min" },
  { step: 5, name: "ROI Calculator", desc: "See the 10-year financial projection with interactive chart", href: "/roi-calculator", time: "~2 min" },
  { step: 6, name: "Admission Predictor", desc: "Get AI-powered chances for 5 universities with improvement plan", href: "/admit-predictor", time: "~2 min" },
  { step: 7, name: "Readiness Score", desc: "Instantly calculated from profile — no manual input needed", href: "/readiness-score", time: "~1 min" },
  { step: 8, name: "SOP Co-Pilot", desc: "Generate a full 1000-word SOP in under 30 seconds", href: "/sop-copilot", time: "~2 min" },
  { step: 9, name: "Application Timeline", desc: "AI builds a week-by-week plan from today to intake day", href: "/timeline", time: "~1 min" },
  { step: 10, name: "AI Mentor Shikha", desc: "Live conversation with Llama 3.3 — ask anything", href: "/mentor", time: "~2 min" },
  { step: 11, name: "Education Loan", desc: "Full loan funnel with Poonawalla Fincorp integration", href: "/loan", time: "~2 min" },
  { step: 12, name: "Pre-Departure Checklist", desc: "AI generates your countdown and first month expenses guide", href: "/post-admit", time: "~2 min" },
  { step: 13, name: "GradX Score Card", desc: "Shareable LinkedIn-worthy achievement card with html2canvas", href: "/score-card", time: "~1 min" },
];

export default function DemoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-amber-500" />
            <h1 className="text-4xl font-bold text-gray-900">GradX</h1>
          </div>
          <p className="text-xl text-purple-600 font-medium mb-2">Platform walkthrough for Poonawalla Fincorp judges</p>
          <div className="flex justify-center gap-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">🏆 Built for TenzorX 2026</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">⚡ Powered by Groq Llama 3.3</span>
          </div>
        </div>

        {/* Demo Journey */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">🚀 Demo Journey</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Card key={feature.step} className="hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold shrink-0">
                      {feature.step}
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">{feature.time}</span>
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" /> Live & Working
                        </span>
                      </div>
                      <Link href={feature.href}>
                        <Button className="w-full mt-3 bg-purple-600 group-hover:bg-purple-700">
                          Try This → <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <Card className="bg-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-center">💻 Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-purple-400 mb-3">AI Layer</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>🤖 Groq API</li>
                  <li>🦙 Llama 3.3 70B</li>
                  <li>📝 6 specialized prompts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-400 mb-3">Frontend</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>⚛️ Next.js 14</li>
                  <li>🎨 Tailwind CSS</li>
                  <li>📊 Recharts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-400 mb-3">Backend</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>🔥 Supabase (Auth + DB)</li>
                  <li>🔗 Next.js API Routes</li>
                  <li>🔒 Row Level Security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Impact */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-purple-600">500K+</p>
              <p className="text-gray-600 mt-2">Target Users — Indian students planning study abroad annually</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-emerald-600">₹750 Cr+</p>
              <p className="text-gray-600 mt-2">AUM Potential — At 1% penetration, avg ₹15L loan</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-4xl font-bold text-blue-600">Zero</p>
              <p className="text-gray-600 mt-2">Human Intervention — Entire lifecycle managed by AI agents</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ready to explore the full platform?</p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-purple-600 px-8 py-4 text-lg">
              Start Full Demo <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}