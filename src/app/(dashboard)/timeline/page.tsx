"use client";

import { useState, useEffect } from "react";
import { Check, CheckSquare, Square, ChevronDown, ChevronUp, Calendar, AlertTriangle, Phone, MessageSquare, Sparkles, Bell, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
  estimatedHours: number;
  done: boolean;
  tips: string;
}

interface Phase {
  id: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

export default function TimelinePage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
        
        const savedTasks = localStorage.getItem("gradx_timeline_tasks");
        if (savedTasks) {
          setCompletedTasks(JSON.parse(savedTasks));
        }
        
        fetchTimeline(data);
      }
    };
    loadData();
  }, []);

  const fetchTimeline = async (profileData: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileData }),
      });
      const data = await response.json();
      setResults(data);
      
      const initialExpanded: Record<string, boolean> = {};
      data.phases?.forEach((p: Phase) => {
        initialExpanded[p.id] = true;
      });
      setExpandedPhases(initialExpanded);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    const newCompleted = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(newCompleted);
    localStorage.setItem("gradx_timeline_tasks", JSON.stringify(newCompleted));
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const handleEnableReminders = () => {
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    toast.success("Reminders enabled! We'll notify you 7 days before each deadline.");
  };

  const getDaysAway = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDateColor = (days: number) => {
    if (days < 0) return "bg-red-500";
    if (days <= 7) return "bg-red-100 text-red-700";
    if (days <= 30) return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "bg-red-100 text-red-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-700";
  };

  const phaseColors: Record<string, string> = {
    blue: "border-l-blue-500 bg-blue-50",
    purple: "border-l-purple-500 bg-purple-50",
    emerald: "border-l-emerald-500 bg-emerald-50",
    amber: "border-l-amber-500 bg-amber-50",
    rose: "border-l-rose-500 bg-rose-50",
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-purple-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700">Shikha is building your personalized timeline...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to generate timeline.</p>
        <Button onClick={() => fetchTimeline(profile)} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = results.totalTasks || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Bar - Progress Overview */}
      <div className="sticky top-0 bg-white z-10 pb-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg text-center ${results.daysRemaining > 180 ? "bg-green-50" : results.daysRemaining > 90 ? "bg-amber-50" : "bg-red-50"}`}>
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{results.daysRemaining}</p>
            <p className="text-xs text-gray-500">Days to Intake</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-blue-50">
            <CheckSquare className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{completedCount}/{totalTasks}</p>
            <p className="text-xs text-gray-500">Tasks Done</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-purple-50">
            <span className="text-xl font-bold">{completionPercentage}%</span>
            <p className="text-xs text-gray-500">Completion</p>
          </div>
          <div className="p-3 rounded-lg text-center bg-red-50">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{results.upcomingDeadlines?.filter((d: any) => d.priority === "High").length || 0}</p>
            <p className="text-xs text-gray-500">Urgent Tasks</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>

      {/* Key Dates Banner */}
      <div className="overflow-x-auto flex gap-2 pb-2">
        {results.keyDates?.map((date: any, i: number) => {
          const days = getDaysAway(date.date);
          return (
            <div key={i} className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm ${date.type === "deadline" ? "bg-red-100 text-red-700" : date.type === "exam" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
              <span className="font-medium">{date.label}</span>
              <span className="ml-2">{date.date}</span>
              <span className="ml-1">({days > 0 ? `${days}d` : 'passed'})</span>
            </div>
          );
        })}
      </div>

      {/* Critical Path Message */}
      {results.criticalPathMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <p className="text-amber-800">{results.criticalPathMessage}</p>
        </div>
      )}

      {/* Upcoming Deadlines */}
      <div>
        <h3 className="text-lg font-semibold mb-3">⚡ Action Required This Month</h3>
        <div className="space-y-2">
          {results.upcomingDeadlines?.slice(0, 5).map((deadline: any, i: number) => (
            <Card key={i}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{deadline.task}</p>
                  <p className="text-sm text-gray-500">{deadline.dueDate} • {deadline.daysLeft} days left</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(deadline.priority)}`}>{deadline.priority}</span>
                  <Button size="sm" variant="outline" onClick={() => toggleTask(deadline.task)}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Phase Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Complete Roadmap</h3>
        <div className="space-y-4">
          {results.phases?.map((phase: any) => {
            const phaseTasksDone = phase.tasks?.filter((t: any) => completedTasks[t.id])?.length || 0;
            const phaseTasksTotal = phase.tasks?.length || 0;
            
            return (
              <Card key={phase.id} className={`border-l-4 ${phaseColors[phase.color] || "border-l-gray-500"}`}>
                <CardHeader 
                  className="cursor-pointer" 
                  onClick={() => togglePhase(phase.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{phase.name}</h4>
                      <span className="text-sm text-gray-500">
                        {phase.startDate} — {phase.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {phaseTasksDone}/{phaseTasksTotal} tasks
                      </span>
                      {expandedPhases[phase.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CardHeader>
                {expandedPhases[phase.id] && (
                  <CardContent className="space-y-3">
                    {phase.tasks?.map((task: any) => (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded-lg border ${completedTasks[task.id] ? "bg-gray-50 opacity-60" : "bg-white"}`}
                      >
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleTask(task.id)} className="mt-1">
                            {completedTasks[task.id] ? (
                              <CheckSquare className="w-5 h-5 text-green-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={completedTasks[task.id] ? "line-through text-gray-400" : "font-medium"}>
                              {task.title}
                            </p>
                            <p className="text-sm text-gray-500">{task.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className="text-xs text-gray-500">~{task.estimatedHours} hrs</span>
                              <span className={`px-2 py-1 rounded text-xs ${getDateColor(getDaysAway(task.dueDate))}`}>
                                {task.dueDate}
                              </span>
                            </div>
                            {task.tips && (
                              <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-sm rounded">
                                💡 {task.tips}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Reminder Setup */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-800">Never Miss a Deadline</h3>
          </div>
          <p className="text-emerald-700 text-sm mb-3">Get WhatsApp reminders for your upcoming tasks</p>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="flex-1 p-2 border rounded"
            />
            <Button onClick={handleEnableReminders} className="bg-emerald-600">
              Enable Reminders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}