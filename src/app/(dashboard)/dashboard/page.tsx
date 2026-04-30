"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  TrendingUp,
  Target,
  Star,
  PenLine,
  MessageCircle,
  IndianRupee,
  AlertCircle,
  Lightbulb,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  User,
  GitCompare,
  Award,
  ClipboardList,
  FolderOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSetupModal } from "@/components/shared/ProfileSetupModal";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
        
        const { data: appsData } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("deadline", { ascending: true });
        setApplications(appsData || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const quickActions = [
    { icon: Compass, title: "Career Navigator", description: "Find your perfect university match", href: "/career-navigator", new: false },
    { icon: GitCompare, title: "University Compare", description: "Compare universities side by side", href: "/compare", new: true },
    { icon: Award, title: "Scholarships", description: "Find scholarships matched to you", href: "/scholarships", new: true },
    { icon: ClipboardList, title: "Application Tracker", description: "Track your applications", href: "/applications", new: true },
    { icon: FolderOpen, title: "Document Vault", description: "Manage your documents", href: "/documents", new: true },
    { icon: TrendingUp, title: "ROI Calculator", description: "Calculate your return on investment", href: "/roi-calculator", new: false },
    { icon: Target, title: "Admit Predictor", description: "Know your admission chances", href: "/admit-predictor", new: false },
    { icon: Star, title: "Readiness Score", description: "Track your application readiness", href: "/readiness-score", new: false },
    { icon: PenLine, title: "SOP Co-Pilot", description: "Draft a world-class SOP", href: "/sop-copilot", new: false },
    { icon: IndianRupee, title: "Education Loan", description: "Finance your education", href: "/loan", new: false },
  ];

  const tips = [
    "Apply to at least 8 universities: 2 reach, 4 target, 2 safety. Diversification is your best strategy.",
    "Start your SOP at least 3 months before deadlines. Great SOPs are rewritten, not written.",
    "A GRE score above 320 quant opens doors at 90% of top CS programs in the USA.",
    "Your LOR writers need at least 6 weeks notice. Ask them today, not next month.",
    "Check if your target universities offer fee waivers — many do for international students.",
    "The 12-month EMI waiver from Poonawalla Fincorp can save you ₹4-6 lakhs in early repayment stress.",
    "Connect with current students at your target university on LinkedIn — they reply more than you think.",
  ];

  const tip = tips[new Date().getDay()];

  const getDaysLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  const upcomingDeadlines = (applications || []).filter((a: any) => {
    const days = getDaysLeft(a.deadline);
    return days != null && days > 0;
  }).slice(0, 3);

  const getDaysToDeadline = () => {
    if (!profile?.intake_year || !profile?.intake_season) return null;
    const seasonMap: Record<string, number> = { Fall: 7, Spring: 0, Summer: 4 };
    const month = seasonMap[profile.intake_season] || 7;
    const targetDate = new Date(profile.intake_year, month, 15);
    const today = new Date();
    const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };

  const daysToDeadline = getDaysToDeadline();

  const getStageProgress = () => {
    const stages = [
      { name: "Profile Setup", complete: !!(profile?.cgpa && profile?.target_country) },
      { name: "University Research", complete: !!(profile?.target_universities?.length > 0) },
      { name: "Application Prep", complete: (profile?.readiness_score || 0) > 60 },
      { name: "Loan Planning", complete: (profile?.loan_readiness_score || 0) > 0 },
      { name: "Loan Applied", complete: false },
    ];
    return stages;
  };

  const stages = getStageProgress();
  const currentStage = stages.findIndex(s => !s.complete);
  const completedStages = stages.filter(s => s.complete).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>

      {/* Profile Incomplete Banner */}
      {profile && (!profile.cgpa || !profile.target_country) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-purple-600" />
            <span className="text-purple-700">Complete your profile to unlock personalized recommendations</span>
          </div>
          <Button onClick={() => setShowProfileModal(true)} className="bg-purple-600">Complete Profile</Button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke={profile?.readiness_score > 70 ? "#10B981" : profile?.readiness_score > 40 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(profile?.readiness_score || 0) * 1.005} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {profile?.readiness_score || "—"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Readiness Score</p>
              {profile?.readiness_score ? (
                <p className="font-semibold text-green-600">{profile.readiness_score}/100</p>
              ) : (
                <Link href="/readiness-score" className="text-xs text-purple-600 hover:underline">Set up profile →</Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#E5E7EB" strokeWidth="4" fill="none" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke={profile?.loan_readiness_score > 70 ? "#10B981" : profile?.loan_readiness_score > 40 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(profile?.loan_readiness_score || 0) * 1.005} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {profile?.loan_readiness_score || "—"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Loan Eligibility</p>
              {profile?.loan_readiness_score ? (
                <p className="font-semibold text-green-600">{profile.loan_readiness_score}/100</p>
              ) : (
                <Link href="/loan" className="text-xs text-purple-600 hover:underline">Check eligibility →</Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Applications Tracked</p>
            <p className="text-2xl font-bold text-indigo-600">
              {applications.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Days to Deadline</p>
            {daysToDeadline ? (
              <p className={`text-2xl font-bold ${daysToDeadline > 180 ? "text-green-600" : daysToDeadline > 90 ? "text-amber-600" : "text-red-600"}`}>
                {daysToDeadline}
              </p>
            ) : (
              <p className="text-lg font-semibold text-gray-400">Set deadline</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Journey Progress Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto">
            {stages.map((stage, index) => (
              <div key={stage.name} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stage.complete
                        ? "bg-green-500 text-white"
                        : index === currentStage
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stage.complete ? "✓" : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-600 whitespace-nowrap">{stage.name}</span>
                </div>
                {index < stages.length - 1 && (
                  <div className={`w-8 md:w-12 h-1 mx-1 rounded ${stage.complete ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shikha's Tip */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-700">Shikha's Tip of the Day:</h3>
            <p className="text-gray-700 mt-1">{tip}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-lg hover:scale-105 hover:border-purple-300 transition-all cursor-pointer h-full">
                  <CardContent className="pt-4 flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        {action.new && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">NEW</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
              <Link href="/applications" className="text-sm text-purple-600 hover:underline">View All →</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingDeadlines.map((app: any) => {
                const daysLeft = getDaysLeft(app.deadline) ?? 0;
                return (
                  <div key={app.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{app.university_name}</span>
                      <span className="text-gray-500 ml-2">| {app.program}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{app.deadline}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        daysLeft <= 14 ? "bg-red-100 text-red-600" : 
                        daysLeft <= 30 ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"
                      }`}>
                        {daysLeft} days
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Setup Modal */}
      {user && (
        <ProfileSetupModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={user.id}
          userEmail={user.email || ""}
        />
      )}
    </div>
  );
}