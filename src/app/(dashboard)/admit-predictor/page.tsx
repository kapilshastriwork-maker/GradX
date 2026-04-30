"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, Sparkles, Check, AlertCircle, ChevronDown, ChevronUp, BookOpen, MessageCircle, GraduationCap, ArrowRight, CheckSquare, Square } from "lucide-react";
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

const fields = [
  "Computer Science", "Data Science & AI", "Electrical Engineering",
  "Mechanical Engineering", "MBA/Management", "Finance", "Economics", "Biology/Biotech"
];
const degrees = ["Masters", "MBA", "PhD", "PG Diploma"];
const universityTypes = ["IIT/IISc", "NIT/BITS/Top Private", "State University", "Other"];
const workExpOptions = [
  { value: "0", label: "Fresher" },
  { value: "6", label: "0-6 months" },
  { value: "12", label: "6-12 months" },
  { value: "24", label: "1-2 years" },
  { value: "36", label: "2-3 years" },
  { value: "48", label: "3+ years" },
];
const paperOptions = ["0", "1", "2", "3"];
const internshipOptions = ["0", "1", "2", "3"];
const sopStatusOptions = [
  { value: "not_started", label: "Not started" },
  { value: "drafted", label: "Drafted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "final", label: "Final draft ready" },
];
const lorStatusOptions = [
  { value: "not_arranged", label: "Not arranged" },
  { value: "1", label: "1 confirmed" },
  { value: "2", label: "2 confirmed" },
  { value: "3", label: "All 3 confirmed" },
];

const loadingMessages = [
  "Analyzing your academic profile...",
  "Comparing with 50,000+ Indian applicants...",
  "Calculating university-specific chances...",
  "Identifying your profile gaps...",
  "Generating improvement plan...",
];

export default function AdmitPredictorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [expandedUni, setExpandedUni] = useState<number | null>(null);
  const [checkedActions, setCheckedActions] = useState<number[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    field: "",
    degree: "",
    cgpa: "",
    university: "",
    gre: "",
    greQuant: "",
    ielts: "",
    toefl: "",
    workExp: "0",
    papers: "0",
    internships: "0",
    achievements: "",
    targetUniversities: "",
    sopStrength: "not_started",
    lors: "not_arranged",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setProfileData((prev: any) => ({
          ...prev,
          field: data.field_of_study || prev.field,
          cgpa: data.cgpa?.toString() || prev.cgpa,
          gre: data.gre_score?.toString() || prev.gre,
          ielts: data.ielts_score?.toString() || prev.ielts,
        }));
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const updateField = (key: string, value: string | null | undefined) => {
    setProfileData((prev: any) => ({ ...prev, [key]: value || "" }));
  };

  const toggleAction = (idx: number) => {
    setCheckedActions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handlePredict = async () => {
    setLoading(true);
    setStep(2);
    try {
      const response = await fetch("/api/admit-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileData }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getChanceColor = (label: string) => {
    if (label === "Excellent") return "bg-green-100 text-green-700";
    if (label === "Good") return "bg-green-50 text-green-600";
    if (label === "Moderate") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const formatScore = (score: number, avg: number) => {
    return score > avg ? "text-green-600" : score < avg ? "text-red-600" : "text-gray-600";
  };

  if (step === 2 && loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-purple-200 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700 animate-pulse">
          {loadingMessages[loadingMessageIndex]}
        </p>
        <div className="w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-1000"
            style={{ width: `${((loadingMessageIndex + 1) / loadingMessages.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  if (results && step === 2) {
    return (
      <div className="space-y-6">
        {/* Overall Score Gauge */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={results.overallScore > 75 ? "#10B981" : results.overallScore >= 50 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(results.overallScore / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{results.overallScore}</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold">{results.profileStrength} Profile</h2>
            <p className="text-gray-600 text-center mt-2">{results.recommendation}</p>
          </CardContent>
        </Card>

        {/* University Predictions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">University Predictions</h2>
          <div className="space-y-4">
            {results.predictions?.map((pred: any, idx: number) => (
              <Card key={idx} className="overflow-hidden">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{pred.university}</h3>
                      <p className="text-sm text-purple-600">{pred.program} {pred.country === "USA" ? "🇺🇸" : pred.country === "UK" ? "🇬🇧" : pred.country === "Canada" ? "🇨🇦" : "🇩🇪"}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(pred.chance)}`}>{pred.chance}%</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getChanceColor(pred.chanceLabel)}`}>
                        {pred.chanceLabel}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${pred.chance >= 70 ? "bg-green-500" : pred.chance >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${pred.chance}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-600">
                    <span>Avg GRE: {pred.avgGRE} | Your GRE: {pred.yourGRE || "N/A"}</span>
                    <span>Avg CGPA: {pred.avgCGPA} | Your CGPA: {pred.yourCGPA || "N/A"}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="mt-2 text-sm"
                    onClick={() => setExpandedUni(expandedUni === idx ? null : idx)}
                  >
                    {expandedUni === idx ? "Hide Details" : "See Details"}
                  </Button>
                  {expandedUni === idx && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div>
                        <p className="text-sm font-medium text-green-600">Strengths:</p>
                        <div className="flex flex-wrap gap-1">
                          {pred.strengths?.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-600">Weaknesses:</p>
                        <div className="flex flex-wrap gap-1">
                          {pred.weaknesses?.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tips:</p>
                        <ul className="text-sm text-gray-600 list-disc pl-4">
                          {pred.tips?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Profile Gaps */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Areas to Strengthen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {results.profileGaps?.map((gap: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{gap.area}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      gap.severity === "High" ? "bg-red-100 text-red-700" :
                      gap.severity === "Medium" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {gap.severity} Priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{gap.suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 90-Day Improvement Plan */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Action Plan to Improve Chances</h2>
          <div className="space-y-3">
            {results.improvementPlan?.map((plan: any, idx: number) => (
              <Card key={idx} className={checkedActions.includes(idx) ? "bg-green-50" : ""}>
                <CardContent className="pt-4 flex items-start gap-3">
                  <button onClick={() => toggleAction(idx)} className="mt-1">
                    {checkedActions.includes(idx) ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={checkedActions.includes(idx) ? "line-through text-gray-400" : ""}>
                      {plan.action}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-500">{plan.timeline}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        plan.impact === "High" ? "bg-purple-100 text-purple-700" :
                        plan.impact === "Medium" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {plan.impact} Impact
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/sop-copilot">
            <Button variant="outline" className="w-full">
              <BookOpen className="w-4 h-4 mr-2" /> Write My SOP →
            </Button>
          </Link>
          <Link href="/mentor">
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" /> Chat with Shikha →
            </Button>
          </Link>
          <Link href="/career-navigator">
            <Button variant="outline" className="w-full">
              <GraduationCap className="w-4 h-4 mr-2" /> Explore Universities →
            </Button>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => { setStep(1); setResults(null); }}>
            ← Back to Form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admission Probability Predictor</h1>
        <p className="text-gray-600">Know your real chances before you apply</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Academic Profile */}
          <div>
            <h2 className="font-semibold mb-4">Academic Profile</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field of Study *</Label>
                <Select value={profileData.field || ""} onValueChange={(v) => updateField("field", v || "")}>
                  <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Degree *</Label>
                <Select value={profileData.degree || ""} onValueChange={(v) => updateField("degree", v || "")}>
                  <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                  <SelectContent>
                    {degrees.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Your CGPA (0-10) *</Label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={profileData.cgpa}
                  onChange={(e) => updateField("cgpa", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 8.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Your University Type</Label>
                <Select value={profileData.university || ""} onValueChange={(v) => updateField("university", v || "")}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {universityTypes.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Test Scores */}
          <div>
            <h2 className="font-semibold mb-4">Test Scores (all optional)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GRE Total Score (260-340)</Label>
                <input
                  type="number"
                  min="260"
                  max="340"
                  value={profileData.gre}
                  onChange={(e) => updateField("gre", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 325"
                />
              </div>
              <div className="space-y-2">
                <Label>GRE Quant Score (130-170)</Label>
                <input
                  type="number"
                  min="130"
                  max="170"
                  value={profileData.greQuant}
                  onChange={(e) => updateField("greQuant", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 168"
                />
              </div>
              <div className="space-y-2">
                <Label>IELTS Score (0-9)</Label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={profileData.ielts}
                  onChange={(e) => updateField("ielts", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 7.5"
                />
              </div>
              <div className="space-y-2">
                <Label>TOEFL Score (0-120)</Label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={profileData.toefl}
                  onChange={(e) => updateField("toefl", e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="e.g., 105"
                />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h2 className="font-semibold mb-4">Experience & Extras</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Experience</Label>
                <Select value={profileData.workExp} onValueChange={(v) => updateField("workExp", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {workExpOptions.map((w) => <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Research Papers</Label>
                <Select value={profileData.papers} onValueChange={(v) => updateField("papers", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {paperOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Internships</Label>
                <Select value={profileData.internships} onValueChange={(v) => updateField("internships", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {internshipOptions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Significant Achievements</Label>
              <Textarea
                placeholder="Hackathons, competitions, open source contributions, patents, etc."
                value={profileData.achievements}
                onChange={(e) => updateField("achievements", e.target.value)}
              />
            </div>
          </div>

          {/* Target Universities */}
          <div>
            <h2 className="font-semibold mb-4">Target Universities</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Target Universities (one per line)</Label>
                <Textarea
                  placeholder="University of Texas at Austin&#10;University of Washington&#10;University of Waterloo"
                  value={profileData.targetUniversities}
                  onChange={(e) => updateField("targetUniversities", e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SOP Status</Label>
                  <Select value={profileData.sopStrength} onValueChange={(v) => updateField("sopStrength", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {sopStatusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>LOR Status</Label>
                  <Select value={profileData.lors} onValueChange={(v) => updateField("lors", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {lorStatusOptions.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handlePredict} className="w-full bg-purple-600 text-lg py-3">
        🎯 Predict My Chances
      </Button>
    </div>
  );
}