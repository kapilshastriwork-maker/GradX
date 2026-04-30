"use client";

import { useState, useEffect, useRef } from "react";
import {
  Share2, Download, Award, Target, GraduationCap,
  Users, TrendingUp, Clock, CheckCircle, Sparkles,
  Link2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";
import html2canvas from "html2canvas";

export default function ScoreCardPage() {
  const [loading, setLoading] = useState(false);
  const [tagline, setTagline] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    fieldOfStudy: "",
    targetCountry: "",
    targetDegree: "",
    readinessScore: 75,
    applicationsSubmitted: 3,
    scholarshipsWon: 1,
    linkedinConnections: 50,
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("scoreCardData");
    if (saved) {
      const data = JSON.parse(saved);
      setFormData(data);
      setTagline({ tagline: data.tagline, motivationalNote: data.motivationalNote });
      setGenerated(true);
    }
  }, []);

  const handleGenerate = async () => {
    if (!formData.fullName || !formData.fieldOfStudy) {
      toast.error("Please fill in your name and field of study");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/score-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            full_name: formData.fullName,
            field_of_study: formData.fieldOfStudy,
            target_country: formData.targetCountry,
            target_degree: formData.targetDegree,
          },
          readinessScore: formData.readinessScore,
        }),
      });
      const data = await res.json();
      setTagline(data);
      
      const fullData = { ...formData, ...data };
      localStorage.setItem("scoreCardData", JSON.stringify(fullData));
      setGenerated(true);
      earnBadge("score_card_shared");
      toast.success("Score Card generated!");
    } catch (err) {
      toast.error("Failed to generate score card");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        background: "#1e1b4b",
      } as any);
      const link = document.createElement("a");
      link.download = `GradX-ScoreCard-${formData.fullName.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Score Card downloaded!");
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  const handleCopyLinkedin = () => {
    const text = `🎓 GradX Score Card\n\n👤 ${formData.fullName}\n🎯 Target: ${formData.targetDegree} in ${formData.fieldOfStudy}\n📊 Readiness Score: ${formData.readinessScore}%\n\n🏆 ${formData.scholarshipsWon} Scholarship${formData.scholarshipsWon !== 1 ? "s" : ""} Won\n💼 ${formData.linkedinConnections} LinkedIn Connections\n\n"${tagline?.tagline || "Making my dream of studying abroad a reality!"}"\n\n#GradX #StudyAbroad #HigherEducation`;
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard! Share on LinkedIn.");
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-400 to-emerald-500";
    if (score >= 60) return "from-amber-400 to-orange-500";
    return "from-red-400 to-rose-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  if (!generated) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Generate Your GradX Score Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label>Field of Study *</Label>
              <Input
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Country</Label>
                <select
                  value={formData.targetCountry}
                  onChange={(e) => setFormData({ ...formData, targetCountry: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              <div>
                <Label>Target Degree</Label>
                <select
                  value={formData.targetDegree}
                  onChange={(e) => setFormData({ ...formData, targetDegree: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                  <option value="MBA">MBA</option>
                  <option value="Bachelor">Bachelor</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Readiness Score: {formData.readinessScore}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.readinessScore}
                onChange={(e) => setFormData({ ...formData, readinessScore: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Applications Submitted</Label>
                <Input
                  type="number"
                  value={formData.applicationsSubmitted}
                  onChange={(e) => setFormData({ ...formData, applicationsSubmitted: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Scholarships Won</Label>
                <Input
                  type="number"
                  value={formData.scholarshipsWon}
                  onChange={(e) => setFormData({ ...formData, scholarshipsWon: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>LinkedIn Connections</Label>
              <Input
                type="number"
                value={formData.linkedinConnections}
                onChange={(e) => setFormData({ ...formData, linkedinConnections: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-purple-600">
              {loading ? "Generating..." : "Generate Score Card"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GradX Score Card</h1>
          <p className="text-gray-500">Share your achievements on LinkedIn</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setGenerated(false)}>
            Edit
          </Button>
        </div>
      </div>

      {/* Score Card Preview */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="w-[400px] bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl"></div>
          
          {/* Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-400" />
                <span className="font-bold text-lg">GradX</span>
              </div>
              <div className="px-3 py-1 bg-purple-500/30 rounded-full text-xs">
                Score Card
              </div>
            </div>

            {/* Name & Target */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{formData.fullName}</h2>
              <p className="text-purple-300">
                🎯 {formData.targetDegree} in {formData.fieldOfStudy}
                {formData.targetCountry && ` • ${formData.targetCountry}`}
              </p>
            </div>

            {/* Main Score */}
            <div className="flex items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(formData.readinessScore)} flex flex-col items-center justify-center`}>
                <span className="text-4xl font-bold">{formData.readinessScore}</span>
                <span className="text-xs text-white/80">Readiness</span>
              </div>
            </div>
            <div className="text-center mb-6">
              <span className={`px-3 py-1 bg-gradient-to-r ${getScoreColor(formData.readinessScore)} rounded-full text-sm font-medium`}>
                {getScoreLabel(formData.readinessScore)}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <div className="text-xl font-bold">{formData.applicationsSubmitted}</div>
                <div className="text-xs text-purple-300">Applications</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <div className="text-xl font-bold text-amber-400">🏆{formData.scholarshipsWon}</div>
                <div className="text-xs text-purple-300">Scholarships</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl">
                <div className="text-xl font-bold">{formData.linkedinConnections}</div>
                <div className="text-xs text-purple-300">Connections</div>
              </div>
            </div>

            {/* Tagline */}
            <div className="text-center">
              <p className="text-lg font-medium italic">"{tagline?.tagline || "Making my dream of studying abroad a reality!"}"</p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-purple-300">
                <Sparkles className="w-3 h-3" />
                <span>Generated by GradX</span>
              </div>
              <div className="text-xs text-purple-300">
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={handleDownload} className="bg-purple-600">
          <Download className="w-4 h-4 mr-2" />
          Download as Image
        </Button>
        <Button variant="outline" onClick={handleCopyLinkedin}>
          <Link2 className="w-4 h-4 mr-2" />
          Copy for LinkedIn
        </Button>
      </div>

      {/* Motivational Note */}
      {tagline?.motivationalNote && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-purple-700 font-medium">💪 {tagline.motivationalNote}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}