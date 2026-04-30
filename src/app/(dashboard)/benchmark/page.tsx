"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, AlertCircle, CheckCircle, XCircle, ArrowRight,
  Sparkles, Lightbulb, GraduationCap, Briefcase, BookOpen, Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const comparisonUniversities = ["MIT", "Stanford", "Carnegie Mellon"];

export default function BenchmarkPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");

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
        if (data?.target_universities?.[0]) setUniversity(data.target_universities[0]);
        if (data?.field_of_study) setProgram(`MS ${data.field_of_study}`);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleBenchmark = async () => {
    if (!university || !program) {
      toast.error("Please enter university and program");
      return;
    }
    setCalculating(true);
    try {
      const res = await fetch("/api/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, targetUniversity: university, targetProgram: program })
      });
      const data = await res.json();
      setResults(data);
      localStorage.setItem('gradx_benchmark', JSON.stringify(data));
      earnBadge('benchmarked');
    } catch (error) {
      toast.error("Failed to benchmark");
    } finally {
      setCalculating(false);
    }
  };

  const getStatusIcon = (statusColor: string) => {
    if (statusColor === "green") return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (statusColor === "amber") return <AlertCircle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (statusColor: string) => {
    if (statusColor === "green") return "bg-green-100 text-green-700";
    if (statusColor === "amber") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Benchmarking</h1>
        <p className="text-gray-500">See exactly how you compare to admitted students</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Target University</label>
              <Input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g., University of Texas at Austin"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Target Program</label>
              <Input
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g., MS Computer Science"
              />
            </div>
            <Button onClick={handleBenchmark} disabled={calculating} className="bg-purple-600">
              {calculating ? "Comparing..." : "Benchmark My Profile"}
            </Button>
          </div>
          
          {/* Profile Preview */}
          {profile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex flex-wrap gap-4 text-sm">
              <span><strong>CGPA:</strong> {profile.cgpa}/10</span>
              <span><strong>GRE:</strong> {profile.gre_score || 'N/A'}</span>
              <span><strong>IELTS:</strong> {profile.ielts_score || 'N/A'}</span>
              <span><strong>Work:</strong> {profile.work_experience_months || 0} months</span>
              <span><strong>Field:</strong> {profile.field_of_study}</span>
              <Link href="/profile" className="text-purple-600 hover:underline">Update Profile</Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {calculating && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Comparing your profile against admitted students at {university}...</p>
        </div>
      )}

      {/* Results */}
      {results && !calculating && (
        <div className="space-y-6 animate-fadeIn">
          {/* Verdict Hero */}
          <Card className={`border-l-4 ${results.verdictColor === 'green' ? 'border-l-green-500' : results.verdictColor === 'amber' ? 'border-l-amber-500' : 'border-l-red-500'}`}>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div>
                  <p className="text-gray-500">{results.university}</p>
                  <p className="text-lg font-semibold">{results.program}</p>
                </div>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={results.verdictColor === 'green' ? '#10B981' : results.verdictColor === 'amber' ? '#F59E0B' : '#EF4444'}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${results.overallMatch * 3.52} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                      {results.overallMatch}%
                    </span>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <span className={`text-2xl font-bold px-3 py-1 rounded ${getStatusColor(results.verdictColor)}`}>
                    {results.verdict}
                  </span>
                  <p className="text-3xl font-bold mt-2">{results.admissionChance}%</p>
                  <p className="text-gray-500 text-sm">Admission Chance</p>
                </div>
              </div>
              <p className="text-center mt-4 text-purple-700 italic">{results.topTip}</p>
            </CardContent>
          </Card>

          {/* Metrics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile vs Admitted Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.metrics?.map((metric: any, i: number) => (
                  <div key={i} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{metric.name}</span>
                      {getStatusIcon(metric.statusColor)}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded ${getStatusColor(metric.statusColor)}`}>
                        {metric.yourValueFormatted}
                      </div>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600">{metric.avgAdmittedFormatted}</span>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${metric.statusColor === 'green' ? 'bg-green-500' : metric.statusColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${metric.percentile}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">You are in the {metric.percentile}th percentile</p>
                    </div>
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">Show tip</summary>
                      <p className="text-xs text-blue-700 mt-1 bg-blue-50 p-2 rounded">{metric.tip}</p>
                    </details>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Similar Students */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">✅ Got In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.similarStudentsGotIn?.map((student: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-green-50 rounded">
                      <p>{student.profile}</p>
                      <p className="text-xs text-gray-500">{student.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">❌ Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.similarStudentsRejected?.map((student: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-red-50 rounded">
                      <p>{student.profile}</p>
                      <p className="text-xs text-gray-500">{student.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How to Improve */}
          <Card>
            <CardHeader>
              <CardTitle>3 Actions to Boost Your Chances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {results.improveBy?.map((action: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{action.action}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">+{action.scoreBoost}</span>
                    </div>
                    <p className="text-xs text-gray-500">Effort: {action.effort}</p>
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      Start Now <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Compare */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">Also benchmark:</span>
            {comparisonUniversities.map((uni) => (
              <button
                key={uni}
                onClick={() => { setUniversity(uni); handleBenchmark(); }}
                className="text-sm text-purple-600 hover:underline"
              >
                {uni}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}