"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  DollarSign,
  MapPin,
  Target,
  Check,
  AlertCircle,
  Sparkles,
  Briefcase,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentData {
  field: string;
  degree: string;
  cgpa: string;
  gre: string;
  gmat: string;
  ielts: string;
  toefl: string;
  workExp: string;
  countries: string[];
  budget: string;
  careerGoal: string;
  strengths: string;
  concern: string;
  exploreLoan: boolean;
  shortlists: string[];
}

const fields = [
  "Computer Science",
  "Data Science & AI",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "MBA/Management",
  "Finance",
  "Economics",
  "Biology/Biotech",
  "Medicine/Public Health",
  "Law",
  "Psychology",
  "Arts & Design",
  "Other",
];

const countries = [
  { code: "USA", name: "USA", flag: "🇺🇸" },
  { code: "UK", name: "UK", flag: "🇬🇧" },
  { code: "Canada", name: "Canada", flag: "🇨🇦" },
  { code: "Germany", name: "Germany", flag: "🇩🇪" },
  { code: "Australia", name: "Australia", flag: "🇦🇺" },
  { code: "Singapore", name: "Singapore", flag: "🇸🇬" },
  { code: "Netherlands", name: "Netherlands", flag: "🇳🇱" },
  { code: "Ireland", name: "Ireland", flag: "🇮🇪" },
];

const workExpOptions = [
  { value: "0", label: "Fresher (0 months)" },
  { value: "6", label: "Less than 1 year" },
  { value: "12", label: "1-2 years" },
  { value: "24", label: "2-3 years" },
  { value: "36", label: "3-5 years" },
  { value: "60", label: "5+ years" },
];

const budgetOptions = [
  { value: "Under ₹15L", label: "Under ₹15L/yr" },
  { value: "₹15L-25L", label: "₹15L-25L/yr" },
  { value: "₹25L-40L", label: "₹25L-40L/yr" },
  { value: "₹40L-60L", label: "₹40L-60L/yr" },
  { value: "Above ₹60L", label: "Above ₹60L/yr" },
];

const concernOptions = [
  { value: "cost", label: "Cost / Scholarship" },
  { value: "admission", label: "Admission Chances" },
  { value: "visa", label: "Visa Process" },
  { value: "parttime", label: "Part-time Work Opportunities" },
  { value: "work", label: "Post-study Work Options" },
  { value: "return", label: "Returning to India" },
  { value: "other", label: "Other" },
];

const loadingMessages = [
  "Analyzing your academic profile...",
  "Matching with 500+ universities...",
  "Calculating admission chances...",
  "Checking scholarship opportunities...",
  "Preparing your personalized report...",
];

export default function CareerNavigatorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [studentData, setStudentData] = useState<StudentData>({
    field: "",
    degree: "",
    cgpa: "",
    gre: "",
    gmat: "",
    ielts: "",
    toefl: "",
    workExp: "0",
    countries: [],
    budget: "",
    careerGoal: "",
    strengths: "",
    concern: "",
    exploreLoan: true,
    shortlists: [],
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const updateData = (key: keyof StudentData, value: any) => {
    setStudentData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCountry = (code: string) => {
    setStudentData((prev) => {
      const current = prev.countries;
      if (current.includes(code)) {
        return { ...prev, countries: current.filter((c) => c !== code) };
      }
      if (current.length < 4) {
        return { ...prev, countries: [...current, code] };
      }
      return prev;
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return studentData.field && studentData.degree && studentData.cgpa;
      case 2:
        return true;
      case 3:
        return studentData.countries.length > 0 && studentData.budget;
      case 4:
        return studentData.careerGoal && studentData.strengths;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStep(6);
    
    try {
      const response = await fetch("/api/career-navigator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentData }),
      });
      
      const data = await response.json();
      setResults(data);
      
      if (user && data.topCountry) {
        await supabase.from("profiles").update({
          target_country: data.topCountry,
          field_of_study: studentData.field,
          target_degree: studentData.degree,
        }).eq("id", user.id);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 bg-green-100";
    if (score >= 50) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  const getMatchBadge = (score: number) => {
    if (score >= 85) return { label: "Safety", color: "bg-green-100 text-green-700" };
    if (score >= 70) return { label: "Target", color: "bg-amber-100 text-amber-700" };
    return { label: "Reach", color: "bg-red-100 text-red-700" };
  };

  const toggleShortlist = (uni: string) => {
    setStudentData((prev) => ({
      ...prev,
      shortlists: prev.shortlists.includes(uni)
        ? prev.shortlists.filter((s) => s !== uni)
        : [...prev.shortlists, uni],
    }));
  };

  const formatCurrency = (usd: number) => {
    const inr = usd * 83;
    if (inr >= 10000000) return `₹${(inr / 10000000).toFixed(1)}Cr`;
    if (inr >= 100000) return `₹${(inr / 100000).toFixed(0)}L`;
    return `₹${inr.toFixed(0)}`;
  };

  if (step === 6 && loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-purple-200 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-600" />
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

  if (results && step === 6) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Personalized Study Abroad Report</h1>
            <p className="text-gray-600 mt-1">{results.summary}</p>
          </div>
          <Button variant="outline" onClick={() => { setStep(1); setResults(null); }}>
            Retake Quiz
          </Button>
        </div>

        {/* Profile Strength */}
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              results.profileStrength > 75 ? "bg-green-100 text-green-600" :
              results.profileStrength >= 50 ? "bg-amber-100 text-amber-600" :
              "bg-red-100 text-red-600"
            }`}>
              {results.profileStrength}
            </div>
            <div>
              <p className="font-semibold">Profile Strength</p>
              <p className="text-sm text-gray-500">Based on your academics, test scores, and experience</p>
            </div>
          </CardContent>
        </Card>

        {/* University Recommendations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">6 Universities Matched For You</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {results.recommendations?.map((rec: any, index: number) => {
              const badge = getMatchBadge(rec.matchScore);
              const costInr = (rec.avgTuitionUSD + rec.livingCostUSD) * (rec.duration === "2 years" ? 2 : 1) * 83;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{rec.university}</h3>
                        <p className="text-sm text-gray-500">{rec.country} {countries.find(c => c.code === rec.country)?.flag}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {rec.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-purple-600 font-medium">{rec.program}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        rec.admissionChance === "Excellent" ? "bg-green-100 text-green-700" :
                        rec.admissionChance === "Good" ? "bg-green-50 text-green-600" :
                        rec.admissionChance === "Moderate" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {rec.admissionChance} Admission
                      </span>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span>📅 {rec.duration}</span>
                      <span>💰 {formatCurrency(rec.avgTuitionUSD)}/yr tuition</span>
                      <span>🏠 {formatCurrency(rec.livingCostUSD)}/yr living</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Total: {formatCurrency(costInr)}</p>
                    <div className="flex gap-1 mt-2">
                      {rec.highlights?.slice(0, 3).map((h: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 italic mt-2">{rec.matchReason}</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">Learn More</Button>
                      <Button
                        size="sm"
                        className={`flex-1 ${studentData.shortlists.includes(rec.university) ? "bg-green-600" : "bg-purple-600"}`}
                        onClick={() => toggleShortlist(rec.university)}
                      >
                        {studentData.shortlists.includes(rec.university) ? (
                          <><Check className="w-4 h-4 mr-1" /> Shortlisted</>
                        ) : (
                          "Add to Shortlist"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Advice */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Shikha's Advice For You</h3>
          </div>
          <ul className="space-y-2">
            {results.keyAdvice?.map((advice: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-1 shrink-0" />
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div>
          <h3 className="font-semibold mb-4">Your Next Steps</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.nextSteps?.map((s: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-lg border">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </div>
          {studentData.exploreLoan && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold text-emerald-700">Based on your profile, you may be eligible for an education loan of up to ₹40 lakhs</p>
              </div>
              <Link href="/loan">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Check Loan Eligibility →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {s}
            </div>
            {s < 5 && (
              <div className={`w-12 h-1 ${step > s ? "bg-purple-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Academics */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your academics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Field of Study *</Label>
              <Select value={studentData.field} onValueChange={(v) => updateData("field", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Degree *</Label>
              <Select value={studentData.degree} onValueChange={(v) => updateData("degree", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masters">Masters (MS/MA/MEng)</SelectItem>
                  <SelectItem value="MBA">MBA</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="PG Diploma">PG Diploma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Your CGPA (out of 10) *</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g., 8.5"
                value={studentData.cgpa}
                onChange={(e) => updateData("cgpa", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Work Experience</Label>
              <Select value={studentData.workExp} onValueChange={(v) => updateData("workExp", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {workExpOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Test Scores */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Your test scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GRE Score (optional)</Label>
                <Input
                  type="number"
                  min="260"
                  max="340"
                  placeholder="e.g., 325"
                  value={studentData.gre}
                  onChange={(e) => updateData("gre", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>GMAT Score (optional)</Label>
                <Input
                  type="number"
                  min="200"
                  max="800"
                  placeholder="e.g., 720"
                  value={studentData.gmat}
                  onChange={(e) => updateData("gmat", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IELTS Score (optional)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  placeholder="e.g., 7.5"
                  value={studentData.ielts}
                  onChange={(e) => updateData("ielts", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>TOEFL Score (optional)</Label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="e.g., 105"
                  value={studentData.toefl}
                  onChange={(e) => updateData("toefl", e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">Don't have scores yet? That's okay — we'll factor that in.</p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Countries & Budget */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Where do you want to study?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Countries (1-4) *</Label>
              <div className="flex flex-wrap gap-2">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => toggleCountry(c.code)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      studentData.countries.includes(c.code)
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Budget Range *</Label>
              <Select value={studentData.budget} onValueChange={(v) => updateData("budget", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Goals */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Your goals and strengths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Career Goal *</Label>
              <Textarea
                placeholder="E.g., I want to become a Machine Learning engineer at a top tech company and return to India in 5 years to start my own AI startup"
                value={studentData.careerGoal}
                onChange={(e) => updateData("careerGoal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Your Strengths *</Label>
              <Textarea
                placeholder="E.g., Strong research background, published a paper, 2 internships at top companies, good GRE quant score"
                value={studentData.strengths}
                onChange={(e) => updateData("strengths", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Biggest Concern</Label>
              <Select value={studentData.concern} onValueChange={(v) => updateData("concern", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select concern" />
                </SelectTrigger>
                <SelectContent>
                  {concernOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Almost there! Review your inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Field:</strong> {studentData.field}</p>
              <p><strong>Degree:</strong> {studentData.degree}</p>
              <p><strong>CGPA:</strong> {studentData.cgpa}/10</p>
              <p><strong>Work Experience:</strong> {workExpOptions.find(o => o.value === studentData.workExp)?.label}</p>
              <p><strong>Countries:</strong> {studentData.countries.map(c => countries.find(x => x.code === c)?.name).join(", ")}</p>
              <p><strong>Budget:</strong> {studentData.budget}</p>
              <p><strong>GRE:</strong> {studentData.gre || "Not provided"}</p>
              <p><strong>IELTS:</strong> {studentData.ielts || "Not provided"}</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentData.exploreLoan}
                onChange={(e) => updateData("exploreLoan", e.target.checked)}
                className="w-4 h-4"
              />
              <span>I want to also explore education loan options</span>
            </label>
            <Button onClick={handleSubmit} className="w-full bg-purple-600 text-lg">
              ✨ Generate My Personalized Recommendations
            </Button>
            <p className="text-center text-sm text-gray-500">Our AI analyzes 10,000+ admission data points to match you perfectly</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {step < 5 && (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}