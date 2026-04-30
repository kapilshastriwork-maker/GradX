"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Clock, TrendingUp, Wallet, Sparkles, Check, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";

const fields = [
  "Computer Science", "Data Science & AI", "Electrical Engineering",
  "Mechanical Engineering", "MBA/Management", "Finance", "Economics", "Medicine"
];

const countries = ["USA", "UK", "Canada", "Germany", "Australia", "Singapore"];
const tiers = ["Tier 1 — Top 50 Global", "Tier 2 — Top 200", "Tier 3 — Other Ranked"];
const durations = ["1 year", "1.5 years", "2 years", "3 years", "4-5 years PhD"];
const loanTenures = ["5", "7", "10", "12", "15"];

const loadingMessages = [
  "Analyzing salary trends for your field...",
  "Calculating loan repayment impact...",
  "Modeling 10-year income projections...",
  "Comparing with and without degree scenarios...",
];

export default function ROICalculatorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [inputs, setInputs] = useState({
    field: "",
    country: "",
    universityTier: "",
    duration: "",
    tuitionPerYear: 25,
    livingPerYear: 12,
    partTimeIncome: 0,
    loanAmount: 20,
    interestRate: 10.5,
    loanTenure: "10",
    currentSalaryLPA: 0,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setInputs((prev: any) => ({
          ...prev,
          field: data.field_of_study || prev.field,
          country: data.target_country || prev.country,
        }));
      }
    };
    loadProfile();
    
    const savedCost = localStorage.getItem('gradx_living_cost_calculated');
    if (savedCost) {
      const costInLakhs = parseFloat(savedCost);
      setInputs((prev: any) => ({ ...prev, livingPerYear: costInLakhs }));
    }
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const updateInput = (key: string, value: any) => {
    setInputs((prev: any) => ({ ...prev, [key]: value }));
  };

  const totalCost = (inputs.tuitionPerYear + inputs.livingPerYear) * (parseInt(inputs.duration?.split(" ")[0]) || 2);
  const monthlyEMI = inputs.loanAmount > 0 ? Math.round((inputs.loanAmount * 100000 * (inputs.interestRate / 100 / 12) * Math.pow(1 + inputs.interestRate / 100 / 12, parseInt(inputs.loanTenure) * 12)) / (Math.pow(1 + inputs.interestRate / 100 / 12, parseInt(inputs.loanTenure) * 12) - 1)) : 0;

  const getEstimatedSalary = () => {
    const baseSalary: Record<string, Record<string, number>> = {
      "Computer Science": { USA: 95, UK: 65, Canada: 75, Germany: 60, Australia: 70, Singapore: 80 },
      "MBA/Management": { USA: 110, UK: 85, Canada: 90, Germany: 70, Australia: 80, Singapore: 95 },
      "Finance": { USA: 100, UK: 75, Canada: 80, Germany: 65, Australia: 75, Singapore: 85 },
    };
    const fieldData = baseSalary[inputs.field] || baseSalary["Computer Science"];
    const countryData = fieldData[inputs.country] || fieldData["USA"];
    return `₹${Math.round(countryData * 83 / 100)}-${Math.round(countryData * 1.2 * 83 / 100)} LPA`;
  };

  const handleCalculate = async () => {
    setLoading(true);
    setStep(2);
    try {
      const response = await fetch("/api/roi-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
    return `₹${amount.toFixed(0)}`;
  };

  const formatSalary = (inr: number) => {
    if (inr >= 100000) return `${(inr / 100000).toFixed(1)}L`;
    return inr.toString();
  };

  if (step === 2 && loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-purple-200 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
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
        {/* Hero Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={results.breakEvenMonths < 36 ? "border-green-300" : results.breakEvenMonths > 60 ? "border-red-300" : "border-amber-300"}>
            <CardContent className="pt-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(results.totalCost)}</p>
              <p className="text-sm text-gray-500">Total Investment</p>
            </CardContent>
          </Card>
          <Card className={results.breakEvenMonths < 36 ? "border-green-300" : results.breakEvenMonths > 60 ? "border-red-300" : "border-amber-300"}>
            <CardContent className="pt-4 text-center">
              <Clock className={`w-6 h-6 mx-auto mb-2 ${results.breakEvenMonths < 36 ? "text-green-600" : results.breakEvenMonths > 60 ? "text-red-600" : "text-amber-600"}`} />
              <p className={`text-2xl font-bold ${results.breakEvenMonths < 36 ? "text-green-600" : results.breakEvenMonths > 60 ? "text-red-600" : "text-amber-600"}`}>
                {results.breakEvenMonths}
              </p>
              <p className="text-sm text-gray-500">Break-Even Months</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{results.roi10Year}%</p>
              <p className="text-sm text-gray-500">10-Year ROI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Wallet className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(results.netGainINR)}</p>
              <p className="text-sm text-gray-500">Net Gain (10 years)</p>
            </CardContent>
          </Card>
        </div>

        {/* Scenarios */}
        <div className="grid md:grid-cols-3 gap-4">
          {["conservative", "average", "optimistic"].map((scenario) => (
            <Card key={scenario} className={scenario === "average" ? "border-purple-500 border-2" : ""}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold capitalize">{scenario}</h3>
                  {scenario === "average" && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Most Likely</span>
                  )}
                </div>
                <div className="space-y-2">
                  <p><span className="text-gray-500">Year 1 Salary:</span> <span className="font-medium">{formatCurrency(results.scenarios[scenario]?.salaryYear1INR)}</span></p>
                  <p><span className="text-gray-500">Break-Even:</span> <span className="font-medium">{results.scenarios[scenario]?.breakEvenMonths} months</span></p>
                  <p><span className="text-gray-500">10-Yr ROI:</span> <span className="font-medium">{results.scenarios[scenario]?.roi10Year}%</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Your Financial Journey Year by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={results.yearByYearCashflow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="#7C3AED" strokeWidth={2} dot={{ r: 4 }} />
                {results.breakEvenMonths && (
                  <ReferenceLine
                    x={Math.ceil(results.breakEvenMonths / 12)}
                    stroke="#F59E0B"
                    strokeDasharray="5 5"
                    label={{ value: "Break-Even", fill: "#F59E0B" }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Loan EMI Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500">Monthly EMI</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(results.loanEMI)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Repayment</p>
                <p className="text-xl font-semibold">{formatCurrency(results.totalLoanRepayment)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Interest</p>
                <p className="text-xl font-semibold text-red-600">{formatCurrency(results.totalLoanRepayment - inputs.loanAmount * 100000)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Poonawalla Fincorp offers education loans starting at 9.5% with 12-month EMI waiver post-graduation
            </p>
            <Link href="/loan">
              <Button className="mt-2 bg-purple-600">Check Your Loan Eligibility</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Shikha's Insights */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Key Insights</h3>
          </div>
          <ul className="space-y-2 mb-4">
            {results.keyInsights?.map((insight: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-1 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
          <p className="text-purple-100">{results.recommendation}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => { setStep(1); setResults(null); }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Recalculate
          </Button>
          <Link href="/career-navigator">
            <Button className="bg-purple-600">Explore Universities →</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ROI Calculator</h1>
        <p className="text-gray-600">See exactly when your degree investment pays off</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Education Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Education Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <Select value={inputs.field} onValueChange={(v) => updateInput("field", v)}>
                <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>
                  {fields.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Country</Label>
              <Select value={inputs.country} onValueChange={(v) => updateInput("country", v)}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>University Tier</Label>
              <Select value={inputs.universityTier} onValueChange={(v) => updateInput("universityTier", v)}>
                <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                <SelectContent>
                  {tiers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Degree Duration</Label>
              <Select value={inputs.duration} onValueChange={(v) => updateInput("duration", v)}>
                <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                <SelectContent>
                  {durations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Annual Tuition (₹{inputs.tuitionPerYear}L)</Label>
              <input
                type="range"
                min="5"
                max="80"
                value={inputs.tuitionPerYear}
                onChange={(e) => updateInput("tuitionPerYear", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Annual Living Cost (₹{inputs.livingPerYear}L)</Label>
              <input
                type="range"
                min="5"
                max="30"
                value={inputs.livingPerYear}
                onChange={(e) => updateInput("livingPerYear", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Part-time Income (₹{inputs.partTimeIncome}L/year)</Label>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={inputs.partTimeIncome}
                onChange={(e) => updateInput("partTimeIncome", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Loan & Current */}
        <Card>
          <CardHeader>
            <CardTitle>Loan & Current Situation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Loan Amount (₹{inputs.loanAmount}L)</Label>
              <input
                type="range"
                min="0"
                max="60"
                value={inputs.loanAmount}
                onChange={(e) => updateInput("loanAmount", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Interest Rate ({inputs.interestRate}%)</Label>
              <input
                type="range"
                min="8"
                max="14"
                step="0.5"
                value={inputs.interestRate}
                onChange={(e) => updateInput("interestRate", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Loan Tenure</Label>
              <Select value={inputs.loanTenure} onValueChange={(v) => updateInput("loanTenure", v)}>
                <SelectTrigger><SelectValue placeholder="Select tenure" /></SelectTrigger>
                <SelectContent>
                  {loanTenures.map((t) => <SelectItem key={t} value={t}>{t} years</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Salary in India (₹{inputs.currentSalaryLPA}LPA, 0 if fresher)</Label>
              <input
                type="number"
                min="0"
                max="50"
                value={inputs.currentSalaryLPA}
                onChange={(e) => updateInput("currentSalaryLPA", parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Quick Summary */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-purple-700 mb-2">Quick Summary</h3>
                <div className="space-y-1 text-sm">
                  <p>Total Course Cost: <span className="font-bold">{formatCurrency(totalCost * 100000)}</span></p>
                  <p>Monthly EMI: <span className="font-bold">{formatCurrency(monthlyEMI)}</span></p>
                  <p>Expected Year 1 Salary: <span className="font-bold">{getEstimatedSalary()}</span></p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleCalculate} className="w-full bg-purple-600 text-lg py-3" disabled={!inputs.field || !inputs.country}>
        Calculate My ROI
      </Button>
    </div>
  );
}