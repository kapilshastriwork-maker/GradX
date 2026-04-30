"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Check, Share2, ChevronDown, ChevronUp, ArrowRight, RefreshCw, CheckSquare, Square } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSetupModal } from "@/components/shared/ProfileSetupModal";

interface Task {
  task: string;
  done: boolean;
  impact: string;
}

interface Dimension {
  score: number;
  maxScore: number;
  label: string;
  status: string;
  feedback: string;
  tasks: Task[];
}

export default function ReadinessScorePage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setProfile(profileData);

        const savedTasks = localStorage.getItem(`readiness_tasks_${authUser.id}`);
        if (savedTasks) {
          setCompletedTasks(JSON.parse(savedTasks));
        }

        fetchReadiness(profileData);
      }
    };
    loadData();
  }, []);

  const fetchReadiness = async (profileData: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/readiness-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileData }),
      });
      const data = await response.json();
      setResults(data);

      if (user && data.totalScore) {
        await supabase
          .from("profiles")
          .update({ readiness_score: data.totalScore })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskName: string) => {
    const newCompleted = { ...completedTasks, [taskName]: !completedTasks[taskName] };
    setCompletedTasks(newCompleted);
    if (user) {
      localStorage.setItem(`readiness_tasks_${user.id}`, JSON.stringify(newCompleted));
    }
  };

  const shareScore = () => {
    const text = results.shareText?.replace("${totalScore}", results.totalScore.toString()) || 
      `I scored ${results?.totalScore}/100 on my Study Abroad Readiness Score on GradX! 🎓`;
    navigator.clipboard.writeText(text);
  };

  const getGradeColor = (grade: string) => {
    if (grade === "A" || grade === "B") return "text-green-600";
    if (grade === "C") return "text-amber-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    if (status === "Good" || status === "Excellent" || status === "On Track") return "bg-green-100 text-green-700";
    if (status === "In Progress") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "High") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const circumference = 2 * Math.PI * 45;
  const progress = results ? (results.totalScore / 100) * circumference : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-purple-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700">Shikha is analyzing your profile...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to calculate readiness score.</p>
        <Button onClick={() => fetchReadiness(profile)} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const isProfileIncomplete = !profile?.cgpa || !profile?.target_country;

  return (
    <div className="space-y-6">
      {/* Score Hero */}
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48 mb-4">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="45"
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="45"
              stroke={results.grade === "A" || results.grade === "B" ? "#10B981" : results.grade === "C" ? "#F59E0B" : "#EF4444"}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{results.totalScore}</span>
            <span className="text-sm text-gray-500">out of 100</span>
          </div>
        </div>
        <h2 className={`text-2xl font-bold ${getGradeColor(results.grade)}`}>{results.grade}-Grade</h2>
        <p className="text-gray-600 mt-1">{results.gradeLabel}</p>
        <p className="text-gray-500 italic text-center mt-2 max-w-md">
          {results.motivationalMessage?.replace("[name]", profile?.full_name || "there")}
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={shareScore}>
            <Share2 className="w-4 h-4 mr-2" /> Share Your Score
          </Button>
          <Button variant="outline" onClick={() => fetchReadiness(profile)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Recalculate
          </Button>
        </div>
        {results.nextMilestone && (
          <div className="mt-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            🎯 Next Milestone: {results.nextMilestone}
          </div>
        )}
      </div>

      {/* Profile Completion Prompt */}
      {isProfileIncomplete && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
          <p className="text-purple-700">Your score is based on limited profile data. Complete your profile for a more accurate score.</p>
          <Button onClick={() => setShowProfileModal(true)} className="bg-purple-600">Complete Profile</Button>
        </div>
      )}

      {/* Five Dimensions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Readiness Breakdown</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {results.dimensions && Object.entries(results.dimensions).map(([key, dim]: [string, any]) => (
            <Card key={key}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{dim.label}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(dim.status)}`}>
                    {dim.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        dim.score >= 70 ? "bg-green-500" : dim.score >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <span className="font-bold">{dim.score}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{dim.feedback}</p>
                <button
                  onClick={() => setExpandedDimension(expandedDimension === key ? null : key)}
                  className="text-sm text-purple-600 flex items-center"
                >
                  {expandedDimension === key ? (
                    <>Hide Tasks <ChevronUp className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Show Tasks <ChevronDown className="w-4 h-4 ml-1" /></>
                  )}
                </button>
                {expandedDimension === key && dim.tasks && (
                  <div className="mt-3 space-y-2">
                    {dim.tasks.map((t: Task, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <button onClick={() => toggleTask(t.task)} className="mt-0.5">
                          {completedTasks[t.task] ? (
                            <CheckSquare className="w-4 h-4 text-green-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1">
                          <span className={completedTasks[t.task] ? "line-through text-gray-400" : ""}>{t.task}</span>
                          <span className={`ml-2 px-1 py-0.5 text-xs rounded ${t.impact === "High" ? "bg-red-100 text-red-600" : "bg-gray-100"}`}>
                            {t.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Priority Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Do These 3 Things First</h3>
        <div className="space-y-3">
          {results.topPriorityActions?.map((action: any, i: number) => (
            <Card key={i}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{action.action}</h4>
                  <p className="text-sm text-gray-500">{action.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getUrgencyColor(action.urgency)}`}>{action.urgency}</span>
                  <Link href={action.link}>
                    <Button size="sm">Start Now →</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
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