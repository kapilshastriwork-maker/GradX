"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import { 
  Plus, Calendar, DollarSign, CheckCircle, Clock, AlertCircle,
  Trash2, Edit, MoreVertical, ChevronDown, FileText, Award
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

type StatusType = "Researching" | "SOP in Progress" | "Submitted" | "Under Review" | "Interview Scheduled" | "Offer Received" | "Rejected";

const statusColumns: { status: StatusType; label: string; color: string }[] = [
  { status: "Researching", label: "🔍 Researching", color: "bg-gray-100" },
  { status: "SOP in Progress", label: "✍️ SOP in Progress", color: "bg-blue-100" },
  { status: "Submitted", label: "📤 Submitted", color: "bg-purple-100" },
  { status: "Under Review", label: "⏳ Under Review", color: "bg-amber-100" },
  { status: "Interview Scheduled", label: "🎤 Interview Scheduled", color: "bg-orange-100" },
  { status: "Offer Received", label: "🎉 Offer Received", color: "bg-green-100" },
  { status: "Rejected", label: "❌ Rejected", color: "bg-red-100" },
];

const countries = ["USA", "UK", "Canada", "Germany", "Australia", "Singapore", "Ireland", "Netherlands"];
const priorities = ["Safety", "Target", "Reach"];

const priorityColors: Record<string, string> = {
  "Safety": "bg-green-100 text-green-700",
  "Target": "bg-amber-100 text-amber-700",
  "Reach": "bg-red-100 text-red-700",
};

export default function ApplicationsPage() {
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editApp, setEditApp] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    university_name: "",
    program: "",
    country: "USA",
    deadline: "",
    priority: "Target",
    application_fee_usd: 0,
    fee_paid: false,
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("deadline", { ascending: true });
        setApplications(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getStats = () => {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      total: applications.length,
      offers: applications.filter((a: any) => a.status === "Offer Received").length,
      deadlinesThisMonth: applications.filter((a: any) => {
        if (!a.deadline) return false;
        const d = new Date(a.deadline);
        return d >= now && d <= thirtyDays;
      }).length,
      feesPaid: applications.filter((a: any) => a.fee_paid).reduce((sum: number, a: any) => sum + (a.application_fee_usd || 0), 0),
    };
  };

  const stats = getStats();

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleSubmit = async () => {
    if (!formData.university_name || !formData.program) {
      toast.error("University and Program are required");
      return;
    }

    if (editApp) {
      const { error } = await supabase
        .from("applications")
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq("id", editApp.id);
      if (error) {
        toast.error("Failed to update application");
      } else {
        toast.success("Application updated!");
        const { data } = await supabase.from("applications").select("*").eq("user_id", user.id).order("deadline", { ascending: true });
        setApplications(data || []);
        setEditApp(null);
        setAddModalOpen(false);
      }
    } else {
      const { error } = await supabase
        .from("applications")
        .insert({ ...formData, user_id: user.id });
      if (error) {
        toast.error("Failed to add application");
      } else {
        toast.success("Application added!");
        if (applications.length === 0) {
          earnBadge('first_application');
        }
        const { data } = await supabase.from("applications").select("*").eq("user_id", user.id).order("deadline", { ascending: true });
        setApplications(data || []);
        setAddModalOpen(false);
      }
    }
    setFormData({ university_name: "", program: "", country: "USA", deadline: "", priority: "Target", application_fee_usd: 0, fee_paid: false, notes: "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Application deleted");
      setApplications(applications.filter((a: any) => a.id !== id));
    }
    setMenuOpen(null);
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    const app = applications.find((a: any) => a.id === appId);
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, offer_received: newStatus === "Offer Received", updated_at: new Date().toISOString() })
      .eq("id", appId);
    
    if (!error) {
      if (newStatus === "Offer Received" && app.status !== "Offer Received") {
        toast.success("Congratulations! Now is the perfect time to check your loan eligibility →");
        const currentOffers = applications.filter((a: any) => a.status === "Offer Received").length;
        if (currentOffers === 0) {
          earnBadge('offer_received');
        }
      }
      const { data } = await supabase.from("applications").select("*").eq("user_id", user.id);
      setApplications(data || []);
    }
    setMenuOpen(null);
  };

  const openEdit = (app: any) => {
    setFormData({
      university_name: app.university_name,
      program: app.program,
      country: app.country || "USA",
      deadline: app.deadline || "",
      priority: app.priority || "Target",
      application_fee_usd: app.application_fee_usd || 0,
      fee_paid: app.fee_paid || false,
      notes: app.notes || "",
    });
    setEditApp(app);
    setAddModalOpen(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-500">Track every university application in one place</p>
        </div>
        <Dialog open={addModalOpen} onOpenChange={(open) => { setAddModalOpen(open); if (!open) setEditApp(null); }}>
          <DialogTrigger>
            <Button className="bg-purple-600">
              <Plus className="w-4 h-4 mr-2" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editApp ? "Edit Application" : "Add New Application"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>University Name *</Label>
                <Input
                  value={formData.university_name}
                  onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                  placeholder="e.g., MIT"
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
                  <Label>Country</Label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Application Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Application Fee (USD)</Label>
                  <Input
                    type="number"
                    value={formData.application_fee_usd}
                    onChange={(e) => setFormData({ ...formData, application_fee_usd: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.fee_paid}
                  onChange={(e) => setFormData({ ...formData, fee_paid: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label className="text-sm">Fee Paid</Label>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>
              <Button onClick={handleSubmit} className="bg-purple-600">
                {editApp ? "Update Application" : "Add Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="px-4 py-2 bg-gray-100 rounded-lg">
          <span className="text-sm text-gray-600">Total: </span>
          <span className="font-bold">{stats.total}</span>
        </div>
        <div className="px-4 py-2 bg-green-100 rounded-lg">
          <span className="text-sm text-green-700">Offers: </span>
          <span className="font-bold text-green-700">{stats.offers}</span>
        </div>
        <div className="px-4 py-2 bg-amber-100 rounded-lg">
          <span className="text-sm text-amber-700">Deadlines This Month: </span>
          <span className="font-bold text-amber-700">{stats.deadlinesThisMonth}</span>
        </div>
        <div className="px-4 py-2 bg-purple-100 rounded-lg">
          <span className="text-sm text-purple-700">Fees Paid: </span>
          <span className="font-bold text-purple-700">${stats.feesPaid}</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {statusColumns.map((col) => {
            const colApps = applications.filter((a: any) => a.status === col.status);
            return (
              <div key={col.status} className="w-72 flex-shrink-0">
                <div className={`px-3 py-2 rounded-t-lg ${col.color} flex items-center justify-between`}>
                  <span className="font-medium text-sm">{col.label}</span>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full">{colApps.length}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-b-lg min-h-[200px]">
                  {colApps.map((app: any) => {
                    const daysLeft = getDaysLeft(app.deadline);
                    const isOfferReceived = app.status === "Offer Received";
                    return (
                      <Card key={app.id} className={`mb-2 border-l-4 ${
                      app.priority === "Safety" ? "border-l-green-500" : app.priority === "Target" ? "border-l-amber-500" : "border-l-red-500"
                    } ${isOfferReceived ? "ring-2 ring-green-500" : ""}`}>
                        <CardContent className="p-3 relative">
                          {isOfferReceived && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 text-2xl animate-bounce">🎉</div>
                          )}
                          {isOfferReceived && (
                            <a 
                              href="/letter-analyzer"
                              className="text-xs text-purple-600 font-medium hover:underline mt-2 block"
                            >
                              📄 Analyze Offer Letter →
                            </a>
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{app.university_name}</h3>
                              <p className="text-xs text-gray-500">{app.program}</p>
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setMenuOpen(menuOpen === app.id ? null : app.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {menuOpen === app.id && (
                                <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg z-10 w-32">
                                  <button
                                    onClick={() => openEdit(app)}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                  >
                                    Edit
                                  </button>
                                  <div className="border-t" />
                                  {statusColumns.filter(c => c.status !== app.status).map((c) => (
                                    <button
                                      key={c.status}
                                      onClick={() => handleStatusChange(app.id, c.status)}
                                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                    >
                                      Move to {c.status}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => handleDelete(app.id)}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-sm">{app.country === "USA" ? "🇺🇸" : app.country === "UK" ? "🇬🇧" : app.country === "Canada" ? "🇨🇦" : app.country === "Germany" ? "🇩🇪" : "🌍"} {app.country}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${priorityColors[app.priority]}`}>
                              {app.priority}
                            </span>
                          </div>
                          {daysLeft !== null && app.deadline && (
                            <div className={`mt-2 text-xs ${
                              daysLeft <= 14 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-gray-500"
                            }`}>
                              {daysLeft === 0 ? "Deadline passed" : `${daysLeft} days left`}
                            </div>
                          )}
                          {app.application_fee_usd > 0 && (
                            <div className={`mt-1 text-xs ${app.fee_paid ? "text-green-600" : "text-red-600"}`}>
                              {app.fee_paid ? "✓ Fee Paid" : "Fee Pending"}
                            </div>
                          )}
                          {isOfferReceived && (
                            <Link href="/loan">
                              <Button size="sm" className="mt-2 bg-green-600 w-full">
                                Check Loan Eligibility →
                              </Button>
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">All Applications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">University</th>
                  <th className="pb-2">Program</th>
                  <th className="pb-2">Country</th>
                  <th className="pb-2">Deadline</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Priority</th>
                  <th className="pb-2">Fee</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app: any) => (
                  <tr key={app.id} className="border-b">
                    <td className="py-2">{app.university_name}</td>
                    <td className="py-2 text-gray-500">{app.program}</td>
                    <td className="py-2">{app.country}</td>
                    <td className="py-2">{app.deadline || "-"}</td>
                    <td className="py-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        {statusColumns.map((c) => (
                          <option key={c.status} value={c.status}>{c.status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${priorityColors[app.priority]}`}>
                        {app.priority}
                      </span>
                    </td>
                    <td className="py-2">{app.fee_paid ? "✓" : app.application_fee_usd ? `$${app.application_fee_usd}` : "-"}</td>
                    <td className="py-2">
                      <button onClick={() => openEdit(app)} className="text-gray-500 hover:text-purple-600 mr-2">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(app.id)} className="text-gray-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Loan Readiness Insight */}
      {stats.offers > 0 && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-2">You have {stats.offers} offer{stats.offers > 1 ? "s" : ""}!</h3>
            <p className="text-green-100 mb-4">
              Poonawalla Fincorp can sanction your loan within 5 working days of your offer letter. Start now to avoid delays.
            </p>
            <div className="flex gap-2">
              <Link href="/loan">
                <Button className="bg-white text-green-600 hover:bg-green-50">
                  Check Loan Eligibility →
                </Button>
              </Link>
              <Link href="/post-admit">
                <Button className="bg-purple-600">
                  <Plane className="w-4 h-4 mr-2" />
                  Pre-Departure Checklist
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}