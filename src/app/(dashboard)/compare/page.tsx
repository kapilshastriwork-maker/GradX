"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  X, Plus, TrendingUp, Target, DollarSign, Briefcase, 
  CheckCircle, ArrowRight, Save, Lightbulb, GraduationCap,
  Sparkles
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const commonUniversities = [
  "MIT", "Stanford", "UC Berkeley", "UT Austin", "University of Toronto", 
  "University of Edinburgh", "TU Munich", "National University of Singapore"
];

const countries = ["USA", "UK", "Canada", "Germany", "Australia", "Singapore", "Ireland", "Netherlands"];

export default function ComparePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [universities, setUniversities] = useState<any[]>([
    { name: "", program: "", country: "USA" },
    { name: "", program: "", country: "USA" }
  ]);
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [highlightedWinner, setHighlightedWinner] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const addUniversity = () => {
    if (universities.length < 3) {
      setUniversities([...universities, { name: "", program: "", country: "USA" }]);
    }
  };

  const removeUniversity = (index: number) => {
    if (universities.length > 2) {
      setUniversities(universities.filter((_, i) => i !== index));
    }
  };

  const updateUniversity = (index: number, field: string, value: string) => {
    const updated = [...universities];
    (updated[index] as any)[field] = value;
    setUniversities(updated);
  };

  const handleQuickAdd = (name: string) => {
    const emptyIndex = universities.findIndex(u => !u.name);
    if (emptyIndex >= 0) {
      const updated = [...universities];
      updated[emptyIndex] = { ...updated[emptyIndex], name };
      setUniversities(updated);
    }
  };

  const handleCompare = async () => {
    const validUniversities = universities.filter(u => u.name.trim());
    if (validUniversities.length < 2) {
      toast.error("Add at least 2 universities to compare");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/compare-universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universities: validUniversities, studentProfile: profile })
      });
      const data = await res.json();
      setResults(data);
      setShowResults(true);
      earnBadge('university_compared');
    } catch (error) {
      toast.error("Failed to compare universities");
    } finally {
      setLoading(false);
    }
  };

  const saveComparison = () => {
    if (results) {
      localStorage.setItem('gradx_comparison', JSON.stringify(results));
      toast.success("Comparison saved!");
    }
  };

  const getChanceColor = (chance: number) => {
    if (chance >= 70) return "bg-green-100 text-green-700";
    if (chance >= 50) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getWinnerIcon = (category: string) => {
    const icons: Record<string, string> = {
      "bestROI": "🏆", "easiestAdmission": "🎯", "bestSalary": "💼",
      "lowestCost": "💰", "bestPostStudyWork": "🛂"
    };
    return icons[category] || "🏆";
  };

  const getWinnerName = (category: string) => {
    if (!results?.winnerByCategory) return "";
    return results.winnerByCategory[category] || "";
  };

  if (showResults && results) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">University Comparison</h1>
            <p className="text-gray-500">Side-by-side analysis with AI recommendations</p>
          </div>
          <Button variant="outline" onClick={() => { setShowResults(false); setResults(null); }}>
            Compare Different
          </Button>
        </div>

        {/* Winner Badges */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "bestROI", label: "Best ROI" },
            { key: "easiestAdmission", label: "Easiest Admission" },
            { key: "bestSalary", label: "Best Salary" },
            { key: "lowestCost", label: "Lowest Cost" },
            { key: "bestPostStudyWork", label: "Best Post-Study Work" }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setHighlightedWinner(cat.label === getWinnerName(cat.key) ? null : getWinnerName(cat.key))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                highlightedWinner && highlightedWinner !== getWinnerName(cat.key)
                  ? "bg-gray-100 text-gray-400"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              {getWinnerIcon(cat.key)} {cat.label}: {getWinnerName(cat.key)}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 bg-gray-50 border text-gray-600 font-medium">Metric</th>
                {results.comparison?.map((uni: any, i: number) => (
                  <th key={i} className={`p-3 border text-center font-semibold ${
                    highlightedWinner === uni.name ? "bg-purple-100 border-purple-300" : "bg-gray-50"
                  }`}>
                    {uni.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: "ranking", label: "QS Ranking", format: (v: any) => `#${v}` },
                { key: "acceptanceRate", label: "Acceptance Rate" },
                { key: "admissionChanceForStudent", label: "Your Admission Chance", isChance: true },
                { key: "annualTuitionUSD", label: "Annual Tuition (USD)", format: (v: number) => `$${v.toLocaleString()}`, isCost: true },
                { key: "annualLivingUSD", label: "Annual Living (USD)", format: (v: number) => `$${v.toLocaleString()}`, isCost: true },
                { key: "totalCostINR", label: "Total Cost (INR)", format: (v: number) => `₹${(v/100000).toFixed(1)}L`, isCost: true, highlight: true },
                { key: "avgSalaryUSD", label: "Avg Starting Salary (USD)", format: (v: number) => `$${v.toLocaleString()}` },
                { key: "breakEvenMonths", label: "Break-Even (months)" },
                { key: "postStudyWorkVisa", label: "Post-Study Work Visa" },
                { key: "partTimeWork", label: "Part-Time Work" },
                { key: "indianStudents", label: "Indian Student Community" },
                { key: "scholarshipAvailability", label: "Scholarship Availability" },
              ].map((row, idx) => (
                <tr key={row.key} className={row.highlight ? "bg-purple-50" : ""}>
                  <td className={`p-3 border font-medium ${row.highlight ? "text-purple-700" : "text-gray-600"}`}>{row.label}</td>
                  {results.comparison?.map((uni: any, i: number) => {
                    const value = uni[row.key as keyof typeof uni];
                    const isBest = i === 0;
                    const display = row.format ? row.format(value) : value;
                    return (
                      <td key={i} className={`p-3 border text-center ${
                        row.isChance ? getChanceColor(value) : 
                        row.isCost && isBest ? "bg-green-50 text-green-700 font-semibold" :
                        row.isCost && !isBest ? "bg-red-50 text-red-400" :
                        highlightedWinner === uni.name ? "bg-purple-100"
                        : ""
                      }`}>
                        {row.isChance ? `${value}%` : display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.comparison?.map((uni: any, i: number) => (
            <Card key={i} className={highlightedWinner === uni.name ? "border-purple-500 border-2" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{uni.name}</CardTitle>
                <p className="text-sm text-gray-500">{uni.program} • {uni.country}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="mt-1 space-y-1">
                    {uni.strengths?.map((s: string, j: number) => (
                      <li key={j} className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="text-green-500">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-700 flex items-center gap-1">
                    <X className="w-4 h-4" /> Weaknesses
                  </h4>
                  <ul className="mt-1 space-y-1">
                    {uni.weaknesses?.map((w: string, j: number) => (
                      <li key={j} className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="text-red-500">✗</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-gray-500 italic">Best for: {uni.bestFor}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Recommendation */}
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Shikha's Recommendation</h3>
                <p className="text-purple-100">{results.aiRecommendation}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/timeline">
                <Button className="bg-white text-purple-600 hover:bg-purple-50">
                  Apply to All 3 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/loan">
                <Button variant="outline" className="border-white text-white hover:bg-purple-400">
                  Check Loan for These Universities
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={saveComparison}>
            <Save className="w-4 h-4 mr-2" /> Save Comparison
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">University Comparison Tool</h1>
        <p className="text-gray-500">Compare up to 3 universities side by side</p>
      </div>

      {/* Add Universities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Universities to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add */}
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {commonUniversities.slice(0, 6).map((name) => (
                <button
                  key={name}
                  onClick={() => handleQuickAdd(name)}
                  className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm hover:bg-purple-100 transition-colors"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>

          {/* University Inputs */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {universities.map((uni, index) => (
              <div key={index} className="relative p-4 bg-gray-50 rounded-lg border">
                <button
                  onClick={() => removeUniversity(index)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                  disabled={universities.length <= 2}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">University Name</Label>
                    <Input
                      value={uni.name}
                      onChange={(e) => updateUniversity(index, "name", e.target.value)}
                      placeholder="e.g., MIT"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Program/Degree</Label>
                    <Input
                      value={uni.program}
                      onChange={(e) => updateUniversity(index, "program", e.target.value)}
                      placeholder="e.g., MS Computer Science"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Country</Label>
                    <select
                      value={uni.country}
                      onChange={(e) => updateUniversity(index, "country", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          {universities.length < 3 && (
            <Button variant="outline" onClick={addUniversity}>
              <Plus className="w-4 h-4 mr-2" /> Add Another University
            </Button>
          )}

          {/* Compare Button */}
          <Button 
            onClick={handleCompare} 
            disabled={loading || universities.filter(u => u.name).length < 2}
            className="w-full"
          >
            {loading ? "Comparing..." : "Compare Now →"}
          </Button>

          {/* Tip */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Tip: For best results, use the universities from your Career Navigator results. 
              Your profile will be used to calculate personalized admission chances for each.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}