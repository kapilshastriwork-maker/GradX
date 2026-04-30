"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileCheck, AlertCircle, CheckCircle, Clock, Link as LinkIcon,
  Phone, ExternalLink, Lightbulb, Shield, Calendar, Download
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const countries = [
  { code: "USA", name: "USA", flag: "🇺🇸" },
  { code: "UK", name: "UK", flag: "🇬🇧" },
  { code: "Canada", name: "Canada", flag: "🇨🇦" },
  { code: "Germany", name: "Germany", flag: "🇩🇪" },
  { code: "Australia", name: "Australia", flag: "🇦🇺" },
  { code: "Singapore", name: "Singapore", flag: "🇸🇬" },
  { code: "Ireland", name: "Ireland", flag: "🇮🇪" },
  { code: "Netherlands", name: "Netherlands", flag: "🇳🇱" },
];

const visaLinks: Record<string, string> = {
  USA: "https://ceac.state.gov",
  UK: "https://www.gov.uk/student-visa",
  Canada: "https://www.canada.ca/en/immigration-refugees-citizenship",
  Germany: "https://www.auswaertiges-amt.de",
  Australia: "https://immi.homeaffairs.gov.au",
  Singapore: "https://www.ica.gov.sg",
  Ireland: "https://www.irishimmigration.ie",
  Netherlands: "https://ind.nl",
};

export default function VisaGuidePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const [selectedCountry, setSelectedCountry] = useState("");
  const [intakeSeason, setIntakeSeason] = useState("Fall");
  const [intakeYear, setIntakeYear] = useState("2025");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
        
        if (data?.target_country) {
          setSelectedCountry(data.target_country);
          if (data.intake_season) setIntakeSeason(data.intake_season);
          if (data.intake_year) setIntakeYear(data.intake_year.toString());
        }
        
        const savedSteps = localStorage.getItem(`gradx_visa_steps_${data?.target_country}`);
        if (savedSteps) setCompletedSteps(JSON.parse(savedSteps));
        
        const savedDocs = localStorage.getItem(`gradx_visa_docs_${data?.target_country}`);
        if (savedDocs) setCheckedDocs(JSON.parse(savedDocs));
        
        const savedGuide = localStorage.getItem(`gradx_visa_guide_${data?.target_country}`);
        if (savedGuide) setResults(JSON.parse(savedGuide));
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedCountry) {
      toast.error("Please select a country");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/visa-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry,
          degree: profile?.target_degree || "Masters",
          intakeSeason,
          intakeYear,
        }),
      });
      const data = await res.json();
      setResults(data);
      localStorage.setItem(`gradx_visa_guide_${selectedCountry}`, JSON.stringify(data));
      earnBadge('visa_guide');
    } catch (error) {
      toast.error("Failed to generate visa guide");
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId: string) => {
    const updated = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];
    setCompletedSteps(updated);
    localStorage.setItem(`gradx_visa_steps_${selectedCountry}`, JSON.stringify(updated));
  };

  const toggleDoc = (docName: string) => {
    const updated = checkedDocs.includes(docName)
      ? checkedDocs.filter((d) => d !== docName)
      : [...checkedDocs, docName];
    setCheckedDocs(updated);
    localStorage.setItem(`gradx_visa_docs_${selectedCountry}`, JSON.stringify(updated));
  };

  const completedCount = results?.steps?.filter((s: any) => completedSteps.includes(s.id)).length || 0;
  const totalSteps = results?.steps?.length || 0;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visa Guide & Tracker</h1>
        <p className="text-gray-500">Step-by-step visa process tailored to your destination</p>
      </div>

      {/* Country Selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`px-4 py-2 rounded-lg text-lg transition-all ${
                  selectedCountry === c.code
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c.flag} {c.name}
              </button>
            ))}
          </div>
          {selectedCountry && (
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Intake Season</label>
                <select
                  value={intakeSeason}
                  onChange={(e) => setIntakeSeason(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Year</label>
                <select
                  value={intakeYear}
                  onChange={(e) => setIntakeYear(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-purple-600"
              >
                {loading ? "Generating..." : "Generate My Visa Guide"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Generating your personalized visa guide for {selectedCountry}...</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Visa Overview */}
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold">{results.visaType}</h2>
                  <p className="text-purple-200">{results.governingBody}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-white/20 rounded text-sm">
                      {results.processingTime}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      results.interviewRequired ? "bg-red-500" : "bg-green-500"
                    }`}>
                      {results.interviewRequired ? "Interview Required" : "No Interview"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-purple-200">Total Fees</p>
                  <p className="text-3xl font-bold">₹{results.totalFeesINR?.toLocaleString()}</p>
                  <p className="text-sm text-purple-200 mt-1">{results.successRate}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-purple-200 text-sm">Start Application By</p>
                  <p className="font-semibold text-amber-300">{results.startApplicationBy}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Post-Study Work</p>
                  <p className="font-medium">{results.postStudyWorkVisa}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Work Rights</p>
                  <p className="font-medium">{results.workRightsDuringStudy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Your Visa Application Steps</h3>
                <span className="text-sm text-gray-500">
                  {completedCount} of {totalSteps} steps completed
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Steps Timeline */}
          <div className="space-y-4">
            {results.steps?.map((step: any, index: number) => {
              const isCompleted = completedSteps.includes(step.id);
              return (
                <Card 
                  key={step.id}
                  className={`transition-all ${isCompleted ? "bg-green-50 border-green-300" : ""}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted ? "bg-green-500 text-white" : "bg-purple-100 text-purple-600"
                      }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${isCompleted ? "line-through text-green-700" : ""}`}>
                            {step.title}
                          </h3>
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleStep(step.id)}
                            className="w-5 h-5"
                          />
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            step.daysBeforeIntake > 90 ? "bg-green-100 text-green-700" :
                            step.daysBeforeIntake > 60 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {step.daysBeforeIntake} days before
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            step.cost > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                          }`}>
                            {step.cost > 0 ? `$${step.cost}` : "Free"}
                          </span>
                        </div>
                        {step.tips && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                            <Lightbulb className="w-4 h-4 inline mr-1" /> {step.tips}
                          </div>
                        )}
                        {step.commonMistakes && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 inline mr-1" /> {step.commonMistakes}
                          </div>
                        )}
                        {step.documents && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {step.documents?.map((doc: string, i: number) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                📄 {doc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Documents Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents You Need</CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast.success("Checklist downloaded!")}>
                  <Download className="w-4 h-4 mr-2" /> Download Checklist
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {results.keyDocuments?.map((doc: any) => (
                  <div
                    key={doc.name}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                      doc.critical ? "border-2 border-red-200" : "border"
                    }`}
                    onClick={() => toggleDoc(doc.name)}
                  >
                    <input
                      type="checkbox"
                      checked={checkedDocs.includes(doc.name)}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                    <span className={doc.critical ? "font-medium" : ""}>{doc.name}</span>
                    {doc.critical && <span className="text-xs text-red-500">(Critical)</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Preparation */}
          {results.interviewRequired && (
            <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3">Interview Tips</h3>
                <ol className="space-y-2">
                  {results.interviewTips?.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ol>
                <Link href="/mentor">
                  <Button className="mt-4 bg-white text-amber-600 hover:bg-amber-50">
                    Practice with Shikha
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Common Rejection Reasons */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-red-700 mb-3">⚠️ Don't Make These Mistakes</h3>
              <ul className="space-y-2">
                {results.commonRejectionReasons?.map((reason: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-red-600">
                    <span className="text-red-500">✗</span> {reason}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Emergency Contacts & Links</h3>
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{results.emergencyContact}</span>
              </div>
              <a
                href={visaLinks[selectedCountry]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" /> Official Visa Application
              </a>
            </CardContent>
          </Card>

          {/* Loan Link */}
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="pt-6">
              <p className="mb-3">
                Visa fees are part of your total education cost. Include them in your loan planning.
              </p>
              <p className="text-2xl font-bold mb-3">Total Visa Fees: ₹{results.totalFeesINR?.toLocaleString()}</p>
              <Link href="/loan">
                <Button className="bg-white text-green-600 hover:bg-green-50">
                  Add Visa Fees to Loan Calculator →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}