"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileSearch, AlertCircle, CheckCircle, Calendar, DollarSign, 
  Shield, Sparkles, ExternalLink, Share2, Upload, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const sampleLetter = `Dear Rahul Sharma,

Congratulations! We are pleased to offer you admission to the Master of Science program in Computer Science at The University of Texas at Austin for the Fall 2026 semester.

ADMISSION DETAILS:
- Program: MS Computer Science
- Start Date: August 25, 2026
- Application Deadline for Enrollment: May 1, 2026

FINANCIAL INFORMATION:
- Tuition (per semester): $18,500
- Total Program Estimate (2 years): $74,000
- Scholarship Awarded: Merit Scholarship - $5,000/year (renewable)
- Renewal Conditions: Maintain 3.5 GPA

IMPORTANT DEADLINES:
- Enrollment Confirmation: May 1, 2026 (CRITICAL)
- Housing Application: May 15, 2026 (CRITICAL)
- Final Transcript Submission: July 1, 2026
- Health Insurance Enrollment: August 1, 2026
- Orientation: August 20, 2026

CONDITIONS OF ADMISSION:
1. Maintain a GPA of 3.0 or above
2. Submit final transcripts by July 1, 2026
3. Complete health insurance enrollment by August 1, 2026

HOUSING: On-campus housing available. Apply by May 15 for guaranteed placement.

VISA INFORMATION: I-20 will be issued after enrollment confirmation. You will need to apply for an F-1 student visa.

We look forward to welcoming you to The University of Texas at Austin.

Best regards,
Graduate Admissions Office
University of Texas at Austin`;

export default function LetterAnalyzerPage() {
  const [letterText, setLetterText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const messages = [
    "Extracting key dates and deadlines...",
    "Identifying scholarship conditions...",
    "Calculating loan implications...",
    "Generating action plan..."
  ];

  const handleAnalyze = async () => {
    if (!letterText.trim()) {
      toast.error("Please paste your letter first");
      return;
    }
    setAnalyzing(true);
    setLoadingMessage(messages[0]);
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 2000);

    try {
      const res = await fetch("/api/analyze-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterContent: letterText })
      });
      const data = await res.json();
      setResults(data);
      clearInterval(interval);
      earnBadge('letter_analyzed');
    } catch (error) {
      toast.error("Failed to analyze letter");
    } finally {
      setAnalyzing(false);
      clearInterval(interval);
    }
  };

  const loadSample = () => {
    setLetterText(sampleLetter);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(results?.loanImplication || "");
    toast.success("Copied to clipboard!");
  };

  const getDaysChip = (days: number) => {
    if (days < 30) return "bg-red-500 text-white";
    if (days < 60) return "bg-amber-500 text-white";
    return "bg-green-500 text-white";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Acceptance Letter Analyzer</h1>
        <p className="text-gray-500">Paste your offer letter — AI extracts every important detail</p>
      </div>

      {/* Input State */}
      {!results && !analyzing && (
        <Card>
          <CardContent className="pt-6">
            <Textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              placeholder="Paste your acceptance/offer letter here... Include everything from the subject line to the signature."
              className="min-h-[300px]"
            />
            <p className="text-xs text-gray-500 mt-2">{letterText.length} characters</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={loadSample}>
                <Upload className="w-4 h-4 mr-2" /> Try with Sample Letter
              </Button>
              <Button onClick={handleAnalyze} disabled={!letterText.trim()} className="bg-purple-600 flex-1">
                <FileSearch className="w-4 h-4 mr-2" /> Analyze My Letter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {analyzing && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">{loadingMessage}</p>
        </div>
      )}

      {/* Results */}
      {results && !analyzing && (
        <div className="space-y-6 animate-fadeIn">
          {/* Letter Summary */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                  {results.letterType}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{results.university}</h2>
              <p className="text-lg text-gray-600">{results.program}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-xl font-semibold text-emerald-600">
                  Starts: {results.startDate}
                </div>
                {results.scholarshipAmount > 0 && (
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded font-semibold">
                    🎉 ${results.scholarshipAmount}/year scholarship!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Critical Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> ⏰ Action Required — Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.deadlines?.sort((a: any, b: any) => a.daysLeft - b.daysLeft).map((deadline: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{deadline.item}</p>
                      <p className="text-gray-600">{deadline.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {deadline.critical && (
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">URGENT</span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDaysChip(deadline.daysLeft)}`}>
                        {deadline.daysLeft} days
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Breakdown */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">Tuition (per semester)</p>
                <p className="text-xl font-bold">{results.tuitionPerSemester}</p>
                <p className="text-xs text-gray-500 mt-1">Total: {results.totalTuitionEstimate}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">Scholarship</p>
                <p className="text-xl font-bold text-green-600">{results.scholarshipOffered || "None"}</p>
                {results.financialAid?.renewable && (
                  <p className="text-xs text-green-600">Renewable: {results.financialAid.conditions}</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500">Estimated Loan Need</p>
                <p className="text-xl font-bold text-emerald-600">{results.loanImplication?.split('.')[0]}</p>
                <Link href="/loan">
                  <Button size="sm" className="mt-2 bg-emerald-600">
                    Calculate Exact Loan →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Conditions Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions to Maintain Your Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.conditions?.map((condition: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
              <p className="text-red-600 text-sm mt-3">⚠️ Failing any condition may result in offer withdrawal</p>
            </CardContent>
          </Card>

          {/* Visa & I-20 Info */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Visa & I-20 Information
              </h3>
              <p><strong>Visa Type:</strong> {results.visaInfo?.visaType}</p>
              <p><strong>I-20:</strong> {results.visaInfo?.sevisInfo}</p>
              <Link href="/visa-guide">
                <Button size="sm" variant="outline" className="mt-2">
                  View Visa Guide →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Shikha's Insights */}
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Shikha's Insights</span>
              </div>
              <ol className="space-y-2">
                {results.shikhaInsights?.map((insight: string, i: number) => (
                  <li key={i} className="text-purple-100">{i + 1}. {insight}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Next Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Your Next Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.nextActions?.map((action: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{action.action}</p>
                      <p className="text-sm text-gray-500">Deadline: {action.deadline}</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share with Loan Officer */}
          <Button onClick={() => toast.success("Shared! Your loan officer will review this within 24 hours.")} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4">
            <Share2 className="w-5 h-5 mr-2" /> Share Analysis with Poonawalla Fincorp
          </Button>
        </div>
      )}
    </div>
  );
}