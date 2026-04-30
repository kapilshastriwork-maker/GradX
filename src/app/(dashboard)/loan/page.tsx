"use client";

import { useState, useEffect } from "react";
import { Check, CheckSquare, Square, ChevronRight, ChevronDown, Sparkles, Building2, Phone, Mail, FileText, Upload, Loader2, AlertCircle, Download, CreditCard, Calendar, Wallet, Banknote, Shield, Star, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VIEW = "form" | "results" | "application";

const universityTiers = ["Tier 1 — QS Top 100", "Tier 2 — QS 101-300", "Tier 3 — Other Ranked"];
const countries = ["USA", "UK", "Canada", "Germany", "Australia", "Singapore", "Netherlands", "Ireland"];
const coApplicantTypes = ["Father", "Mother", "Spouse", "Sibling", "Other"];
const incomes = ["Under ₹30K", "₹30K-50K", "₹50K-80K", "₹80K-1.2L", "Above ₹1.2L"];
const familyIncomes = ["Under ₹3L", "₹3L-5L", "₹5L-10L", "₹10L-20L", "Above ₹20L"];
const collateralTypes = ["Property", "FD", "LIC Policy", "Other"];
const admissionStatuses = ["Not applied yet", "Applied — awaiting result", "Received offer letter", "Confirmed enrollment"];
const loanTenures = ["5", "7", "10", "12", "15"];

export default function LoanPage() {
  const [view, setView] = useState<VIEW>("form");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [loanInputs, setLoanInputs] = useState({
    universityTier: "",
    country: "",
    course: "",
    totalCourseCost: 40,
    loanRequested: 30,
    admissionStatus: "",
    hasCoApplicant: false,
    coApplicantType: "",
    coApplicantIncome: "",
    hasCollateral: false,
    collateralType: "",
    collateralValue: "",
    familyIncome: "",
  });

  // Application form state
  const [appStep, setAppStep] = useState(1);
  const [appData, setAppData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    currentAddress: "",
    permanentAddress: "",
    sameAsCurrent: true,
    universityName: "",
    courseName: "",
    courseDuration: "",
    loanAmount: "",
    tenure: "",
    coApplicantName: "",
    relationship: "",
    coApplicantPAN: "",
    coApplicantMobile: "",
    coApplicantIncome: "",
    coApplicantEmployment: "",
  });
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [applicationRef, setApplicationRef] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        const { data } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
        setProfile(data);
        setLoanInputs((prev: any) => ({
          ...prev,
          country: data.target_country || "",
          course: data.field_of_study || "",
        }));
        setAppData((prev: any) => ({
          ...prev,
          fullName: data.full_name || "",
          email: authUser.email || "",
        }));
      }
    };
    loadProfile();
  }, []);

  const updateField = (field: string, value: any) => {
    setLoanInputs((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, loanInputs }),
      });
      const data = await response.json();
      setResults(data);
      setView("results");
      
      if (user && data.eligibilityScore) {
        await supabase.from("profiles").update({ loan_readiness_score: data.eligibilityScore }).eq("id", user.id);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
    return `₹${amount}`;
  };

  // VIEW 3 - Application Submission
  const handleSubmitApplication = () => {
    const ref = `PFGX${Date.now().toString().slice(-8)}`;
    setApplicationRef(ref);
    setView("application");
  };

  // Results View
  if (view === "results" && results) {
    const circumference = 2 * Math.PI * 45;
    const progress = (results.eligibilityScore / 100) * circumference;
    const gradeColor = results.eligibilityScore > 70 ? "text-green-600" : results.eligibilityScore >= 50 ? "text-amber-600" : "text-red-600";

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Eligibility Score Hero */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="45" stroke="#E5E7EB" strokeWidth="10" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke={results.eligibilityScore > 70 ? "#10B981" : results.eligibilityScore >= 55 ? "#F59E0B" : "#EF4444"}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${gradeColor}`}>{results.eligibilityScore}</span>
            </div>
          </div>
          <h2 className={`text-xl font-bold ${gradeColor}`}>{results.eligibilityLabel}</h2>
          <p className="text-green-600 font-bold">{results.approvalProbability}% chance of approval</p>
        </div>

        {/* Loan Offer Card */}
        <Card className="border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Your Estimated Loan Offer</CardTitle>
              <span className="text-emerald-600 font-bold">Poonawalla Fincorp</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-emerald-600 mb-2">
              {formatCurrency(results.estimatedLoanRange?.min)} — {formatCurrency(results.estimatedLoanRange?.max)}
            </p>
            <p className="text-xl mb-4">
              Recommended: <span className="font-bold">{formatCurrency(results.recommendedLoanAmount)}</span>
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Interest Rate</p>
                <p className="font-semibold">{results.interestRateRange?.min}% — {results.interestRateRange?.max}% p.a.</p>
              </div>
              <div>
                <p className="text-gray-500">Monthly EMI</p>
                <p className="font-semibold">~{formatCurrency(results.monthlyEMI)}/month</p>
              </div>
              <div>
                <p className="text-gray-500">Tenure</p>
                <p className="font-semibold">{results.recommendedTenure} years</p>
              </div>
              <div>
                <p className="text-gray-500">Processing Fee</p>
                <p className="font-semibold text-green-600">{formatCurrency(results.processingFee)} (waived)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Poonawalla Benefits */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle>Why Students Choose Poonawalla Fincorp</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.poonawallaBenefits?.map((benefit: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
              🎁 <strong>GradX Exclusive:</strong> Processing fee waived for all GradX users
            </div>
          </CardContent>
        </Card>

        {/* EMI Scenarios */}
        <div>
          <h3 className="font-semibold mb-3">EMI Scenarios</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-gray-200">
              <CardContent className="pt-4 text-center">
                <p className="font-semibold">Standard</p>
                <p className="text-gray-500 text-sm">Full EMI from month 1</p>
                <p className="text-lg font-bold mt-2">{formatCurrency(results.monthlyEMI)}/mo</p>
                <p className="text-sm text-gray-500">Total: {formatCurrency(results.totalRepayment)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-emerald-500 bg-emerald-50">
              <CardContent className="pt-4 text-center">
                <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded">Recommended</span>
                <p className="font-semibold mt-2">With EMI Waiver</p>
                <p className="text-gray-500 text-sm">12-month waiver then EMI</p>
                <p className="text-lg font-bold mt-2">{formatCurrency(results.monthlyEMI)}/mo*</p>
                <p className="text-sm text-gray-500">Total: {formatCurrency(results.totalRepayment - results.totalInterest * 0.2)}</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200">
              <CardContent className="pt-4 text-center">
                <p className="font-semibold">Extended</p>
                <p className="text-gray-500 text-sm">15-year tenure</p>
                <p className="text-lg font-bold mt-2">{formatCurrency(Math.round(results.monthlyEMI * 0.8))}/mo</p>
                <p className="text-sm text-gray-500">Total: {formatCurrency(results.totalRepayment + 500000)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Required Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents You'll Need</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.requiredDocuments?.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {uploadedDocs[doc.doc] ? (
                      <CheckSquare className="w-4 h-4 text-green-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                    <span>{doc.doc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      doc.status === "Required" ? "bg-red-100 text-red-700" : 
                      doc.status === "Recommended" ? "bg-amber-100 text-amber-700" : 
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {doc.status}
                    </span>
                    {doc.note && <span className="text-xs text-gray-500">{doc.note}</span>}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4">
              <Download className="w-4 h-4 mr-2" /> Download Checklist
            </Button>
          </CardContent>
        </Card>

        {/* Eligibility Factors */}
        <div>
          <h3 className="font-semibold mb-3">What's Working For You</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {results.eligibilityFactors?.map((factor: any, i: number) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{factor.factor}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      factor.impact === "Positive" ? "bg-green-100 text-green-700" :
                      factor.impact === "Negative" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {factor.impact}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{factor.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-4 space-y-2">
              {results.nextSteps?.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => setView("application")} className="flex-1 bg-emerald-600 py-6">
                Apply for Loan Now → <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="flex-1 py-6">
                Talk to a Loan Expert
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center">{results.disclaimer}</p>
      </div>
    );
  }

  // Application Success View
  if (view === "application") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Application Submitted Successfully! 🎉</h2>
        <p className="text-xl mb-4">Application Reference: <strong>{applicationRef}</strong></p>
        
        <Card className="text-left mt-8">
          <CardHeader><CardTitle>What happens next:</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium">Document Verification</p>
                  <p className="text-sm text-gray-500">1-2 business days</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium">Credit Assessment</p>
                  <p className="text-sm text-gray-500">2-3 business days</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium">Sanction Letter</p>
                  <p className="text-sm text-gray-500">3-5 business days</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button variant="outline" className="flex-1">Track Application</Button>
          <Button onClick={() => setView("form")} className="flex-1 bg-purple-600">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // VIEW 1 - Eligibility Form
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Poonawalla Branding */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl font-bold text-purple-600">GradX</span>
          <span className="text-gray-400">in partnership with</span>
          <span className="text-2xl font-bold text-emerald-600">Poonawalla Fincorp</span>
        </div>
        <p className="text-emerald-700 font-medium">India's most student-friendly education loan</p>
        <div className="flex justify-center gap-4 mt-3">
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" /> Instant Sanction
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" /> 12-Month EMI Waiver
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" /> No Hidden Charges
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Education Details */}
          <div>
            <h3 className="font-semibold mb-4">Education Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>University Tier</Label>
                <Select value={loanInputs.universityTier} onValueChange={(v) => updateField("universityTier", v)}>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    {universityTiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Country</Label>
                <Select value={loanInputs.country} onValueChange={(v) => updateField("country", v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course & Degree</Label>
                <Input
                  value={loanInputs.course}
                  onChange={(e) => updateField("course", e.target.value)}
                  placeholder="e.g., MS in Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Course Cost (₹{loanInputs.totalCourseCost}L)</Label>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={loanInputs.totalCourseCost}
                  onChange={(e) => updateField("totalCourseCost", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Loan Amount Required (₹{loanInputs.loanRequested}L)</Label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={loanInputs.loanRequested}
                  onChange={(e) => updateField("loanRequested", parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Admission Status</Label>
                <Select value={loanInputs.admissionStatus} onValueChange={(v) => updateField("admissionStatus", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {admissionStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Co-applicant Details */}
          <div>
            <h3 className="font-semibold mb-4">Co-applicant Details</h3>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => updateField("hasCoApplicant", true)}
                className={`flex-1 py-3 rounded-lg border-2 ${loanInputs.hasCoApplicant ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}
              >
                Yes, I have a co-applicant
              </button>
              <button
                onClick={() => updateField("hasCoApplicant", false)}
                className={`flex-1 py-3 rounded-lg border-2 ${!loanInputs.hasCoApplicant ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}
              >
                No co-applicant
              </button>
            </div>
            {loanInputs.hasCoApplicant && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Co-applicant Type</Label>
                  <Select value={loanInputs.coApplicantType} onValueChange={(v) => updateField("coApplicantType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {coApplicantTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Co-applicant Income</Label>
                  <Select value={loanInputs.coApplicantIncome} onValueChange={(v) => updateField("coApplicantIncome", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {incomes.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Financial Background */}
          <div>
            <h3 className="font-semibold mb-4">Financial Background</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual Family Income</Label>
                <Select value={loanInputs.familyIncome} onValueChange={(v) => updateField("familyIncome", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {familyIncomes.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Do you have collateral?</Label>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => updateField("hasCollateral", true)}
                    className={`flex-1 py-2 rounded-lg border ${loanInputs.hasCollateral ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => updateField("hasCollateral", false)}
                    className={`flex-1 py-2 rounded-lg border ${!loanInputs.hasCollateral ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleCalculate} 
        disabled={loading}
        className="w-full bg-emerald-600 py-6 text-lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Calculating your eligibility...
          </span>
        ) : (
          <>Check My Loan Eligibility →</>
        )}
      </Button>
    </div>
  );
}