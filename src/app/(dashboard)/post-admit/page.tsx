"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, CheckCircle, Circle, DollarSign, Plane, Building2, 
  Phone, AlertTriangle, Clock, ChevronDown, Package, BookOpen,
  UtensilsCrossed, Wallet, Home, Shield, GraduationCap, ChevronRight,
  ExternalLink, Clock3, MapPin, Users, Banknote
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

const categoryIcons: Record<string, any> = {
  "Visa & Travel Documents": Plane,
  "Financial Setup": Wallet,
  "Accommodation": Home,
  "Health & Insurance": Shield,
  "Academic Preparation": BookOpen,
  "Packing & Logistics": Package,
};

const categoryColors: Record<string, string> = {
  "Visa & Travel Documents": "bg-blue-100 text-blue-700 border-blue-200",
  "Financial Setup": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Accommodation": "bg-amber-100 text-amber-700 border-amber-200",
  "Health & Insurance": "bg-red-100 text-red-700 border-red-200",
  "Academic Preparation": "bg-purple-100 text-purple-700 border-purple-200",
  "Packing & Logistics": "bg-gray-100 text-gray-700 border-gray-200",
};

export default function PostAdmitPage() {
  const [loading, setLoading] = useState(false);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [formData, setFormData] = useState({
    university: "",
    program: "",
    startDate: "",
    country: "USA",
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showSetup, setShowSetup] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("postAdmitData");
    if (saved) {
      setChecklistData(JSON.parse(saved));
      setShowSetup(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!formData.university || !formData.program || !formData.startDate) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/post-admit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: formData.university, program: formData.program, startDate: formData.startDate, country: formData.country }),
      });
      const data = await res.json();
      setChecklistData(data);
      localStorage.setItem("postAdmitData", JSON.stringify(data));
      setShowSetup(false);
      earnBadge("post_admit");
      toast.success("Checklist generated!");
    } catch (err) {
      toast.error("Failed to generate checklist");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (categoryId: string, itemId: string, done: boolean) => {
    if (!checklistData) return;
    const updated = { ...checklistData };
    const category = updated.checklist.find((c: any) => c.id === categoryId);
    const item = category.items.find((i: any) => i.id === itemId);
    item.done = !done;
    setChecklistData(updated);
    localStorage.setItem("postAdmitData", JSON.stringify(updated));
  };

  const getStats = () => {
    if (!checklistData) return { total: 0, done: 0, pending: 0, critical: 0, totalCost: 0 };
    let total = 0, done = 0, critical = 0, totalCost = 0;
    checklistData.checklist.forEach((cat: any) => {
      cat.items.forEach((item: any) => {
        total++;
        if (item.done) done++;
        if (item.priority === "Critical") critical++;
        totalCost += item.estimatedCostINR || 0;
      });
    });
    return { total, done, pending: total - done, critical, totalCost };
  };

  const stats = getStats();

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  if (showSetup || !checklistData) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-purple-600" />
              Pre-Departure Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>University Name *</Label>
              <Input
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="e.g., Stanford University"
              />
            </div>
            <div>
              <Label>Program Name *</Label>
              <Input
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="e.g., MS Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Country</Label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-purple-600">
              {loading ? "Generating Checklist..." : "Generate Pre-Departure Checklist"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntil = checklistData?.daysUntilDeparture || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-Departure Dashboard</h1>
          <p className="text-gray-500">{checklistData?.university} • {checklistData?.program}</p>
        </div>
        <Button variant="outline" onClick={() => { setChecklistData(null); localStorage.removeItem("postAdmitData"); setShowSetup(true); }}>
          Change University
        </Button>
      </div>

      {/* Countdown Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock3 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-4xl font-bold">{daysUntil}</div>
              <div className="text-purple-100">Days until departure</div>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.done}/{stats.total}</div>
              <div className="text-purple-100 text-sm">Tasks Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-300">{stats.critical}</div>
              <div className="text-purple-100 text-sm">Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatINR(stats.totalCost)}</div>
              <div className="text-purple-100 text-sm">Est. Cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* First Month Expenses */}
      {checklistData?.firstMonthExpenses && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              First Month Expenses (Estimated)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-emerald-600">${checklistData.firstMonthExpenses.securityDeposit}</div>
                <div className="text-xs text-gray-500">Security Deposit</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-emerald-600">${checklistData.firstMonthExpenses.firstMonthRent}</div>
                <div className="text-xs text-gray-500">First Month Rent</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-emerald-600">${checklistData.firstMonthExpenses.grocerySetup}</div>
                <div className="text-xs text-gray-500">Grocery Setup</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-emerald-600">${checklistData.firstMonthExpenses.publicTransitPass}</div>
                <div className="text-xs text-gray-500">Transit Pass</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-emerald-600">${checklistData.firstMonthExpenses.healthInsuranceSetup}</div>
                <div className="text-xs text-gray-500">Health Insurance</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-600 text-white rounded-lg">
              <span className="font-semibold">Total First Month</span>
              <span className="text-xl font-bold">${checklistData.firstMonthExpenses.totalUSD} (~{formatINR(checklistData.firstMonthExpenses.totalINR)})</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist Categories */}
      <div className="space-y-4">
        {checklistData?.checklist?.map((category: any) => {
          const Icon = categoryIcons[category.category] || CheckCircle;
          const colorClass = categoryColors[category.category] || "bg-gray-100";
          const categoryDone = category.items.filter((i: any) => i.done).length;
          
          return (
            <Card key={category.id} className={`border-l-4 ${colorClass.split(" ")[2]}`}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-base">{category.category}</CardTitle>
                      <p className="text-sm text-gray-500">{categoryDone}/{category.items.length} tasks completed</p>
                    </div>
                  </div>
                  {categoryDone === category.items.length && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {category.items.map((item: any) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        item.done ? "bg-green-50 border-green-200" : "bg-white border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(category.id, item.id, item.done)}
                        className="mt-0.5"
                      >
                        {item.done ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${item.done ? "line-through text-gray-400" : ""}`}>
                            {item.task}
                          </span>
                          {item.priority === "Critical" && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        {item.tips && !item.done && (
                          <p className="text-sm text-amber-700 mt-1">💡 {item.tips}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.daysBeforeDeparture} days before
                          </span>
                          {item.estimatedCostINR > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatINR(item.estimatedCostINR)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Day One Checklist */}
      {checklistData?.dayOneChecklist && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Your Day One Priority List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checklistData.dayOneChecklist.map((task: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-2">
                  <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{task}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indian Community Tips */}
      {checklistData?.indianCommunityTips && (
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Indian Community Connection Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {checklistData.indianCommunityTips.map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Loan Reminder */}
      {checklistData?.loanRepaymentReminder && (
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="w-5 h-5 text-slate-600" />
              Loan Repayment Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100 rounded-lg">
                <div className="text-sm text-gray-500">Grace Period</div>
                <div className="text-lg font-semibold">{checklistData.loanRepaymentReminder.gracePeriod}</div>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg">
                <div className="text-sm text-gray-500">Est. Monthly EMI</div>
                <div className="text-lg font-semibold">₹{checklistData.loanRepaymentReminder.estimatedEMI?.toLocaleString()}</div>
              </div>
            </div>
            <p className="mt-4 text-gray-600 italic">💡 "{checklistData.loanRepaymentReminder.tipFromPoonawalla}"</p>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {checklistData?.emergencyContacts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {checklistData.emergencyContacts.map((contact: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-purple-600">{contact.phone}</div>
                  <div className="text-sm text-gray-500">{contact.available}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}