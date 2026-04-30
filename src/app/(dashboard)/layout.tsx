"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  TrendingUp,
  Target,
  Star,
  PenLine,
  Calendar,
  MessageCircle,
  IndianRupee,
  Menu,
  X,
  LogOut,
  User,
  Trophy,
  GitCompare,
  Award,
  ClipboardList,
  FolderOpen,
  DollarSign,
  FileCheck,
  Users,
  MessageSquare,
  BarChart2,
  FileSearch,
  GraduationCap,
  Plane,
  Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { FloatingShikha } from "@/components/shared/FloatingShikha";
import { getStreakData } from "@/lib/gamification";

const navGroups = [
  {
    title: "Getting Started",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
      { href: "/career-navigator", icon: Compass, label: "Career Navigator" },
      { href: "/profile", icon: User, label: "Profile" },
    ]
  },
  {
    title: "University Applications",
    items: [
      { href: "/compare", icon: GitCompare, label: "University Compare" },
      { href: "/scholarships", icon: Award, label: "Scholarships" },
      { href: "/applications", icon: ClipboardList, label: "Application Tracker" },
      { href: "/documents", icon: FolderOpen, label: "Document Vault" },
    ]
  },
  {
    title: "Living Abroad",
    items: [
      { href: "/cost-of-living", icon: DollarSign, label: "Cost of Living" },
      { href: "/visa-guide", icon: FileCheck, label: "Visa Guide" },
      { href: "/post-admit", icon: Plane, label: "Pre-Departure" },
    ]
  },
  {
    title: "Community",
    items: [
      { href: "/community", icon: Users, label: "Peer Community" },
      { href: "/cohort-chat", icon: MessageSquare, label: "Cohort Chat" },
      { href: "/benchmark", icon: BarChart2, label: "Profile Benchmark" },
      { href: "/letter-analyzer", icon: FileSearch, label: "Letter Analyzer" },
      { href: "/alumni", icon: GraduationCap, label: "Alumni Network" },
    ]
  },
  {
    title: "Tools",
    items: [
      { href: "/roi-calculator", icon: TrendingUp, label: "ROI Calculator" },
      { href: "/admit-predictor", icon: Target, label: "Admit Predictor" },
      { href: "/readiness-score", icon: Star, label: "Readiness Score" },
      { href: "/sop-copilot", icon: PenLine, label: "SOP Co-Pilot" },
      { href: "/timeline", icon: Calendar, label: "Timeline" },
    ]
  },
  {
    title: "Support",
    items: [
      { href: "/mentor", icon: MessageCircle, label: "AI Mentor Shikha" },
      { href: "/loan", icon: IndianRupee, label: "Education Loan" },
    ]
  },
  {
    title: "Achievements",
    items: [
      { href: "/score-card", icon: Share2, label: "Score Card" },
    ]
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [streak, setStreak] = useState({ currentStreak: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        setStreak(getStreakData());
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b h-14 flex items-center justify-between px-4">
        <span className="text-xl font-bold text-purple-600">GradX</span>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r transform transition-transform z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="text-xl font-bold text-purple-600">GradX</span>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-purple-100 text-purple-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Judge Demo Link */}
            <Link
              href="/demo"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-amber-600 hover:bg-amber-50 mt-4 pt-4 border-t"
            >
              <Trophy className="h-5 w-5" />
              <span className="text-sm font-medium">🏆 Judge Demo</span>
            </Link>
          </nav>
          
          {/* Streak */}
          <div className="px-4 py-2 border-t">
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <span>🔥</span>
              <span>{streak.currentStreak} day streak</span>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <p className="text-xs text-gray-500 mb-2 truncate">{user.email}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-14 lg:pt-0">
        <main className="p-6">{children}</main>
      </div>

      {/* Floating Shikha */}
      <FloatingShikha />
    </div>
  );
}