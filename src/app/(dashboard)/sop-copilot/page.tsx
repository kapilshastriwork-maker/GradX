"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Copy, Download, ChevronDown, ChevronUp, Wand2, MessageCircle, FileText, Check, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MODE = "form" | "editor" | "feedback";

const countries = ["USA", "UK", "Canada", "Germany", "Australia", "Singapore", "Netherlands", "Ireland"];
const wordLimits = ["500", "750", "1000", "1200", "1500"];

const quickActions = [
  { label: "Make the opening more compelling", instruction: "Make the opening hook more compelling and engaging" },
  { label: "Strengthen 'Why this university' section", instruction: "Strengthen the 'Why this specific university' section with specific details" },
  { label: "Make it more concise", instruction: "Make the SOP more concise while keeping all key points" },
  { label: "Check for grammar and flow", instruction: "Check for grammar issues and improve the flow" },
];

const loadingMessages = [
  "Crafting your opening hook...",
  "Weaving your experiences into a story...",
  "Adding specific details and achievements...",
  "Polishing your conclusion...",
];

export default function SOPCopilotPage() {
  const [mode, setMode] = useState<MODE>("form");
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const [sopData, setSopData] = useState({
    name: "",
    program: "",
    targetUniversity: "",
    country: "",
    college: "",
    cgpa: "",
    wordLimit: "1000",
    whyProgram: "",
    careerGoals: "",
    academicAchievements: "",
    researchProjects: "",
    internships: "",
    extracurriculars: "",
    whyUniversity: "",
    challenges: "",
  });

  const [currentSOP, setCurrentSOP] = useState("");
  const [improveInstruction, setImproveInstruction] = useState("");
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setProfile(data);
          setSopData((prev: any) => ({
            ...prev,
            name: data.full_name || "",
            cgpa: data.cgpa?.toString() || "",
            country: data.target_country || "",
          }));
        }
      }
    };
    loadProfile();
  }, []);

  const updateField = (field: string, value: string | null | undefined) => {
    setSopData((prev: any) => ({ ...prev, [field]: value || "" }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessageIndex(msgIndex);
      msgIndex = (msgIndex + 1) % loadingMessages.length;
    }, 2000);

    try {
      const response = await fetch("/api/sop-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          sopData: {
            ...sopData,
            wordLimit: parseInt(sopData.wordLimit),
          },
        }),
      });
      const data = await response.json();
      if (data.content) {
        setCurrentSOP(data.content);
        setVersions([data.content]);
        setMode("editor");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleImprove = async (instruction: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/sop-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "improve",
          currentSOP,
          instruction,
        }),
      });
      const data = await response.json();
      if (data.content) {
        setVersions((prev) => [data.content, ...prev.slice(0, 2)]);
        setCurrentSOP(data.content);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const response = await fetch("/api/sop-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          currentSOP,
        }),
      });
      const data = await response.json();
      if (data.data) {
        setFeedback(data.data);
        setMode("feedback");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentSOP], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Statement_of_Purpose.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSOP);
  };

  const handleVersionSelect = (index: number) => {
    setCurrentSOP(versions[index]);
    setSelectedVersion(index);
  };

  const wordCount = currentSOP.split(/\s+/).filter(Boolean).length;
  const maxWords = parseInt(sopData.wordLimit);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-purple-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700 animate-pulse">{loadingMessages[loadingMessageIndex]}</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-1000"
            style={{ width: `${((loadingMessageIndex + 1) / loadingMessages.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  if (mode === "feedback" && feedback) {
    const circumference = 2 * Math.PI * 45;
    const progress = (feedback.overallScore / 100) * circumference;
    const gradeColor = feedback.overallScore >= 75 ? "text-green-600" : feedback.overallScore >= 55 ? "text-amber-600" : "text-red-600";

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="45" stroke="#E5E7EB" strokeWidth="10" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke={feedback.overallScore >= 75 ? "#10B981" : feedback.overallScore >= 55 ? "#F59E0B" : "#EF4444"}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${gradeColor}`}>{feedback.overallScore}</span>
            </div>
          </div>
          <p className="text-gray-600">{feedback.wordCount} words</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Strengths</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-1" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-3">Areas to Improve</h3>
          <div className="space-y-3">
            {feedback.improvements?.map((imp: any, i: number) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-700">{imp.issue}</p>
                    <span className={`px-2 py-1 rounded text-xs ${imp.severity === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {imp.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Suggestion: {imp.suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">{feedback.toneAnalysis}</p>
            <p className="mt-3 italic text-gray-700">"{feedback.admissionOfficerPerspective}"</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Fixes</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal pl-4 space-y-1">
              {feedback.quickFixes?.map((fix: string, i: number) => (
                <li key={i}>{fix}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => handleImprove(feedback.quickFixes?.join(". "))} className="flex-1">
            Apply Fixes with AI
          </Button>
          <Button variant="outline" onClick={() => setMode("editor")} className="flex-1">
            Back to Editor
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "editor") {
    return (
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Left Pane - Editor */}
        <div className="w-[55%] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your SOP</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setCurrentSOP(""); setMode("form"); }}>
                Clear
              </Button>
            </div>
          </div>
          <textarea
            value={currentSOP}
            onChange={(e) => setCurrentSOP(e.target.value)}
            className="flex-1 w-full p-4 border rounded-lg font-serif text-[15px] leading-relaxed resize-none"
            placeholder="Start writing your SOP here..."
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${wordCount > maxWords ? "text-red-600" : "text-green-600"}`}>
              {wordCount} words {wordCount > maxWords ? `(${wordCount - maxWords} over limit)` : ""}
            </span>
            <div className="flex gap-2">
              {versions.length > 1 && (
                <div className="flex gap-1">
                  {versions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleVersionSelect(i)}
                      className={`px-2 py-1 text-xs rounded ${selectedVersion === i ? "bg-purple-100" : "bg-gray-100"}`}
                    >
                      v{i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane - AI Chat */}
        <div className="w-[45%] flex flex-col">
          <h2 className="font-semibold mb-3">Ask Shikha to Improve Your SOP</h2>
          <div className="space-y-2 mb-4">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => handleImprove(action.instruction)}
                disabled={loading}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={improveInstruction}
              onChange={(e) => setImproveInstruction(e.target.value)}
              placeholder="Or type your own instruction..."
              className="flex-1 p-2 border rounded"
            />
            <Button onClick={() => handleImprove(improveInstruction)} disabled={loading || !improveInstruction}>
              Apply
            </Button>
          </div>
          <Button onClick={() => handleFeedback()} className="w-full" disabled={feedbackLoading}>
            {feedbackLoading ? "Analyzing..." : "Get Detailed Feedback"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SOP Co-Pilot</h1>
        <p className="text-gray-600">Draft a world-class Statement of Purpose in minutes</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center text-purple-600 mb-4">
              Basic Info {showAdvanced ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>
            {showAdvanced && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Full Name</Label>
                  <input
                    type="text"
                    value={sopData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Program</Label>
                  <input
                    type="text"
                    value={sopData.program}
                    onChange={(e) => updateField("program", e.target.value)}
                    placeholder="e.g., MS in Computer Science"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target University (optional)</Label>
                  <input
                    type="text"
                    value={sopData.targetUniversity}
                    onChange={(e) => updateField("targetUniversity", e.target.value)}
                    placeholder="Leave blank for general SOP"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Country</Label>
                  <Select value={sopData.country || ""} onValueChange={(v) => updateField("country", v)}>
                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Your College/University</Label>
                  <input
                    type="text"
                    value={sopData.college}
                    onChange={(e) => updateField("college", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your CGPA</Label>
                  <input
                    type="number"
                    step="0.1"
                    value={sopData.cgpa}
                    onChange={(e) => updateField("cgpa", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Word Limit</Label>
                  <Select value={sopData.wordLimit || ""} onValueChange={(v) => updateField("wordLimit", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {wordLimits.map((w) => <SelectItem key={w} value={w}>{w} words</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Your Story */}
          <div>
            <h3 className="font-semibold mb-4">Your Story</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Why this program? *</Label>
                <Textarea
                  value={sopData.whyProgram}
                  onChange={(e) => updateField("whyProgram", e.target.value)}
                  placeholder="What sparked your interest in this field?"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Your Career Goals in 5-10 years *</Label>
                <Textarea
                  value={sopData.careerGoals}
                  onChange={(e) => updateField("careerGoals", e.target.value)}
                  placeholder="Be specific about your career aspirations"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Key Academic Achievements</Label>
                <Textarea
                  value={sopData.academicAchievements}
                  onChange={(e) => updateField("academicAchievements", e.target.value)}
                  placeholder="Awards, high grades, academic projects"
                />
              </div>
              <div className="space-y-2">
                <Label>Research & Projects</Label>
                <Textarea
                  value={sopData.researchProjects}
                  onChange={(e) => updateField("researchProjects", e.target.value)}
                  placeholder="Thesis, research papers, significant projects"
                />
              </div>
              <div className="space-y-2">
                <Label>Work & Internship Experience</Label>
                <Textarea
                  value={sopData.internships}
                  onChange={(e) => updateField("internships", e.target.value)}
                  placeholder="Company names, roles, achievements"
                />
              </div>
              <div className="space-y-2">
                <Label>Extracurricular Activities</Label>
                <Textarea
                  value={sopData.extracurriculars}
                  onChange={(e) => updateField("extracurriculars", e.target.value)}
                  placeholder="Leadership, clubs, volunteering"
                />
              </div>
            </div>
          </div>

          {/* University Fit */}
          <div>
            <h3 className="font-semibold mb-4">University Fit</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Why this specific university/program? *</Label>
                <Textarea
                  value={sopData.whyUniversity}
                  onChange={(e) => updateField("whyUniversity", e.target.value)}
                  placeholder="Mention specific professors, labs, courses..."
                />
              </div>
              <div className="space-y-2">
                <Label>Challenges you've overcome (optional)</Label>
                <Textarea
                  value={sopData.challenges}
                  onChange={(e) => updateField("challenges", e.target.value)}
                  placeholder="Academic setbacks, personal challenges"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleGenerate} className="flex-1 bg-purple-600 py-6 text-lg" disabled={!sopData.whyProgram || !sopData.careerGoals}>
          <Wand2 className="w-5 h-5 mr-2" /> Generate My SOP
        </Button>
        <Button variant="outline" onClick={() => setMode("editor")} className="flex-1 py-6 text-lg">
          I'll write it myself →
        </Button>
      </div>
    </div>
  );
}