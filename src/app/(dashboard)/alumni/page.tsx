"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, MapPin, DollarSign, Briefcase, Link2, 
  Mail, MessageCircle, Award, Clock, ChevronDown, Copy
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AlumniPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [introMessage, setIntroMessage] = useState("");

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
        
        if (data) {
          setLoading(true);
          try {
            const res = await fetch("/api/alumni", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profile: data })
            });
            const alumniData = await res.json();
            setResults(alumniData);
          } catch (error) {
            console.error("Failed to load alumni");
          } finally {
            setLoading(false);
          }
        }
      }
    };
    fetchData();
  }, []);

  const handleConnect = (alumni: any) => {
    setSelectedAlumni(alumni);
    const message = `Subject: Seeking Guidance — Prospective ${alumni.degree} Student from India

Hi ${alumni.name.split(" ")[0]},

I'm ${profile?.full_name || "a student"} planning to pursue ${alumni.degree} in ${alumni.field || alumni.degree} at ${alumni.university}. I found your profile through GradX and was inspired by your journey from ${alumni.undergradCollege} to ${alumni.currentCompany}.

I would love to learn from your experience — specifically about ${alumni.expertise?.[0]}. Would you be open to a 15-minute call or answering a few questions over LinkedIn?

Thank you for considering this.
Best regards,
${profile?.full_name || "Student"}`;
    setIntroMessage(message);
    setConnectModalOpen(true);
    earnBadge('alumni_connected');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(introMessage);
    toast.success("Message copied! Paste it on LinkedIn.");
  };

  const filteredAlumni = results?.alumni?.filter((a: any) => {
    const matchesFilter = filter === "all" || 
      (filter === "university" && a.university) ||
      (filter === "company" && a.currentCompany) ||
      (filter === "match" && a.matchScore > 85);
    const matchesSearch = !search || 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.university.toLowerCase().includes(search.toLowerCase()) ||
      a.currentCompany.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Alumni Network</h1>
        <p className="text-gray-500">Connect with Indians who walked the path before you</p>
      </div>

      {/* Stats */}
      {results && (
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-purple-100 rounded-lg text-sm">
            <span className="font-bold">{results.totalAlumni}</span> Alumni Found
          </div>
          <div className="px-4 py-2 bg-purple-100 rounded-lg text-sm">
            Avg Match: <span className="font-bold">{results.averageMatchScore}%</span>
          </div>
          <div className="px-4 py-2 bg-purple-100 rounded-lg text-sm">
            Avg Salary: <span className="font-bold">{results.averageSalary}</span>
          </div>
        </div>
      )}

      {/* Success Insight */}
      {results?.successInsight && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4">
          <p className="font-semibold">{results.successInsight}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["all", "university", "company", "match"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                filter === f ? "bg-white text-purple-600 shadow-sm" : "text-gray-600"
              }`}
            >
              {f === "all" ? "All" : f === "university" ? "By University" : f === "company" ? "By Company" : "Highest Match"}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search by name, university, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {/* Alumni Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredAlumni?.map((alumni: any) => (
          <Card key={alumni.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="font-semibold text-purple-600">{alumni.initials}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{alumni.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      alumni.matchScore > 85 ? "bg-green-100 text-green-700" :
                      alumni.matchScore > 70 ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {alumni.matchScore}% match
                    </span>
                  </div>
                  <p className="text-sm font-medium">{alumni.currentRole} at {alumni.currentCompany}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" /> {alumni.currentCity}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {alumni.university} • {alumni.degree} • Class of {alumni.graduationYear}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {alumni.expertise?.slice(0, 3).map((exp: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{exp}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-emerald-600 font-medium">{alumni.salaryRange}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{alumni.visaStatus}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <Clock className="w-3 h-3 inline" /> {alumni.responseRate}
                  </p>
                  <p className="text-sm text-purple-600 mt-2">{alumni.matchReason}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 bg-purple-600" onClick={() => handleConnect(alumni)}>
                      <Mail className="w-3 h-3 mr-1" /> Send Introduction
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <a href={alumni.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Link2 className="w-3 h-3 mr-1" /> LinkedIn
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alumni Insights */}
      <Card>
        <CardHeader>
          <CardTitle>What Alumni Say About the Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">"The first 3 months abroad are the hardest. Build your network immediately — join Indian student associations and attend every department event."</p>
              <p className="text-xs text-gray-500 mt-2">— Neha Sharma, MS CS, CMU → Amazon</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">"Start applying for internships in September of your first semester. Don't wait until spring. Recruiters fill spots early."</p>
              <p className="text-xs text-gray-500 mt-2">— Karthik Rao, MS Data Science, UIUC → Microsoft</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">"The loan EMI waiver from Poonawalla gave me breathing room in my first year. Highly recommend planning your repayment before you land."</p>
              <p className="text-xs text-gray-500 mt-2">— Divya Menon, MBA, Ross → McKinsey</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connect Modal */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Introduction to {selectedAlumni?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={introMessage}
              onChange={(e) => setIntroMessage(e.target.value)}
              className="min-h-[250px]"
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={handleCopyMessage} className="flex-1">
                <Copy className="w-4 h-4 mr-2" /> Copy Message
              </Button>
              <Button className="flex-1 bg-purple-600">
                <a href={selectedAlumni?.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={() => setConnectModalOpen(false)}>
                  Open LinkedIn →
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}