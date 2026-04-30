"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, DollarSign, TrendingUp, Calendar, ExternalLink, 
  Plus, CheckCircle, Clock, Search, Filter, Lightbulb, 
  ArrowRight, IndianRupee, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

type StatusType = "Not Applied" | "Researching" | "Applied" | "Awarded" | "Rejected";

const difficultyColors: Record<string, string> = {
  "Highly Selective": "bg-red-100 text-red-700",
  "Very Competitive": "bg-amber-100 text-amber-700",
  "Competitive": "bg-yellow-100 text-yellow-700",
  "Moderate": "bg-green-100 text-green-700"
};

export default function ScholarshipsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("match");
  const [search, setSearch] = useState("");
  const [tracker, setTracker] = useState<Record<string, StatusType>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
        
        const stored = localStorage.getItem('gradx_scholarship_tracker');
        if (stored) {
          setTracker(JSON.parse(stored) as Record<string, StatusType>);
        }

        if (data) {
          setLoading(true);
          try {
            const res = await fetch("/api/scholarships", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profile: data })
            });
            const data2 = await res.json();
            setResults(data2);
            earnBadge('scholarship_finder');
          } catch (error) {
            console.error("Failed to fetch scholarships");
          } finally {
            setLoading(false);
          }
        }
      }
    };
    fetchData();
  }, []);

  const getFilteredScholarships = () => {
    if (!results?.scholarships) return [];
    let filtered = [...results.scholarships];
    
    if (filter !== "all") {
      filtered = filtered.filter((s: any) => s.category?.toLowerCase() === filter);
    }
    
    if (search) {
      filtered = filtered.filter((s: any) => 
        s.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (sort === "match") {
      filtered.sort((a: any, b: any) => b.matchScore - a.matchScore);
    } else if (sort === "amount") {
      filtered.sort((a: any, b: any) => b.amountUSD - a.amountUSD);
    } else if (sort === "deadline") {
      filtered.sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sort === "difficulty") {
      filtered.sort((a: any, b: any) => a.difficultyScore - b.difficultyScore);
    }
    
    return filtered;
  };

  const isDeadlineSoon = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 60 && days > 0;
  };

  const getStatusColor = (status: StatusType) => {
    const colors: Record<string, string> = {
      "Not Applied": "border-gray-200",
      "Researching": "border-amber-300",
      "Applied": "border-indigo-300 bg-indigo-50",
      "Awarded": "border-green-300 bg-green-50",
      "Rejected": "border-red-300"
    };
    return colors[status] || "border-gray-200";
  };

  const addToTracker = (scholarshipId: string) => {
    const updated = { 
      ...tracker, 
      [scholarshipId]: "Not Applied" as StatusType 
    };
    setTracker(updated);
    localStorage.setItem('gradx_scholarship_tracker', JSON.stringify(updated));
    toast.success("Added to tracker!");
  };

  const updateStatus = (scholarshipId: string, status: StatusType) => {
    const updated = { ...tracker, [scholarshipId]: status };
    setTracker(updated);
    localStorage.setItem('gradx_scholarship_tracker', JSON.stringify(updated));
  };

  const getTrackerStats = () => {
    const stats = { total: 0, applied: 0, potential: 0 };
    results?.scholarships?.forEach((s: any) => {
      if (tracker[s.id]) {
        stats.total++;
        if (tracker[s.id] === "Applied") {
          stats.applied++;
          stats.potential += s.amountUSD;
        }
      }
    });
    return stats;
  };

  const trackerStats = getTrackerStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scholarships Matched For You</h1>
          <p className="text-gray-500">Shikha is finding scholarships matched to your profile...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </div>
    );
  }

  const filteredScholarships = getFilteredScholarships();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scholarships Matched For You</h1>
        <p className="text-gray-500">Based on your profile and目标 country</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Scholarships Found</p>
            <p className="text-3xl font-bold text-purple-600">{results?.scholarships?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Potential Value</p>
            <p className="text-3xl font-bold text-green-600">${(results?.totalPotentialValue || 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Best Match</p>
            <p className="text-3xl font-bold text-indigo-600">{results?.scholarships?.[0]?.matchScore || 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Advice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-700">Strategy Advice</h3>
            <p className="text-amber-800">{results?.strategyAdvice}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["all", "government", "university", "private", "field_specific"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f === "all" ? "All" : f === "government" ? "Government" : f === "university" ? "University" : f === "private" ? "Private" : "Field-Specific"}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm"
        >
          <option value="match">Best Match</option>
          <option value="amount">Amount</option>
          <option value="deadline">Deadline</option>
          <option value="difficulty">Difficulty</option>
        </select>
        <Input
          placeholder="Search scholarships..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Scholarship Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredScholarships.map((scholarship: any) => (
          <Card 
            key={scholarship.id} 
            className={`border-2 ${getStatusColor(tracker[scholarship.id] || "Not Applied")}`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{scholarship.name}</h3>
                  <p className="text-sm text-gray-500">{scholarship.provider}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  scholarship.difficulty ? difficultyColors[scholarship.difficulty] : "bg-gray-100"
                }`}>
                  {scholarship.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xl font-bold">{scholarship.amountUSD?.toLocaleString()}</span>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                  {scholarship.category}
                </span>
                {scholarship.renewable && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" /> Renewable
                  </span>
                )}
                {scholarship.includesLiving && (
                  <span className="flex items-center gap-1 text-xs text-blue-600">
                    <CheckCircle className="w-3 h-3" /> Living
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">{scholarship.eligibility}</p>

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-sm ${isDeadlineSoon(scholarship.deadline) ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                  📅 Deadline: {scholarship.deadline}
                </span>
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded">
                  {scholarship.matchScore}% match
                </span>
              </div>

              {scholarship.tips && (
                <div className="bg-blue-50 rounded p-2 mb-3">
                  <p className="text-xs text-blue-700 flex items-start gap-1">
                    <Lightbulb className="w-3 h-3 shrink-0 mt-0.5" /> {scholarship.tips}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <a 
                  href={scholarship.applicationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="bg-purple-600">
                    Apply Now <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </a>
                {!tracker[scholarship.id] && (
                  <Button size="sm" variant="outline" onClick={() => addToTracker(scholarship.id)}>
                    <Plus className="w-3 h-3 mr-1" /> Add to Tracker
                  </Button>
                )}
                {tracker[scholarship.id] && (
                  <select
                    value={tracker[scholarship.id]}
                    onChange={(e) => updateStatus(scholarship.id, e.target.value as StatusType)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="Not Applied">Not Applied</option>
                    <option value="Researching">Researching</option>
                    <option value="Applied">Applied</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tracker Summary */}
      {trackerStats.total > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>My Scholarship Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tracked</p>
                <p className="text-2xl font-bold">{trackerStats.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applied</p>
                <p className="text-2xl font-bold text-indigo-600">{trackerStats.applied}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Potential Award</p>
                <p className="text-2xl font-bold text-green-600">${trackerStats.potential.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Impact Box */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-2">Loan Impact</h3>
          <p className="text-green-100 mb-4">
            If you win even one moderate scholarship (avg $15,000), your required loan 
            reduces from ₹40L to ₹27L — saving ₹2.8L in interest over 10 years.
          </p>
          <Link href="/loan">
            <Button className="bg-white text-green-600 hover:bg-green-50">
              Recalculate Loan with Scholarship → 
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}