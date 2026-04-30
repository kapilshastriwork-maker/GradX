"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Upload, CheckCircle, X, AlertCircle, FileText, Trash2, 
  Share2, Download, FolderOpen, User, GraduationCap,
  DollarSign, Briefcase, Building, Lock
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { earnBadge } from "@/lib/gamification";

interface DocCategory {
  name: string;
  icon: any;
  docs: { name: string; required: boolean }[];
}

const categories: DocCategory[] = [
  { name: "Identity Documents", icon: User, docs: [
    { name: "Passport", required: true },
    { name: "Aadhaar Card", required: true },
    { name: "PAN Card", required: true },
  ]},
  { name: "Academic Records", icon: GraduationCap, docs: [
    { name: "10th Marksheet", required: true },
    { name: "12th Marksheet", required: true },
    { name: "Graduation Transcript", required: true },
    { name: "Degree Certificate", required: true },
  ]},
  { name: "Test Scores", icon: FileText, docs: [
    { name: "GRE Scorecard", required: true },
    { name: "IELTS/TOEFL Certificate", required: true },
  ]},
  { name: "Financial Documents", icon: DollarSign, docs: [
    { name: "Bank Statements (6 months)", required: true },
    { name: "Income Proof", required: true },
    { name: "ITR (last 2 years)", required: true },
  ]},
  { name: "Application Documents", icon: Briefcase, docs: [
    { name: "Statement of Purpose", required: true },
    { name: "Letters of Recommendation", required: true },
    { name: "Resume/CV", required: true },
  ]},
  { name: "Loan Documents", icon: Building, docs: [
    { name: "Admission Letter", required: true },
    { name: "Co-applicant ID Proof", required: false },
    { name: "Co-applicant Income Proof", required: false },
    { name: "Property Documents", required: false },
  ]},
];

const allDocNames = categories.flatMap(c => c.docs).map(d => d.name);

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState("");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id);
        setDocuments(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalRequiredDocs = categories.flatMap(c => c.docs).filter(d => d.required).length;
  const uploadedDocs = documents.length;
  const completeness = Math.round((uploadedDocs / totalRequiredDocs) * 100);

  useEffect(() => {
    if (completeness >= 100 && uploadedDocs > 0) {
      const hasEarned = localStorage.getItem('gradx_badges') || '[]';
      if (!hasEarned.includes('docs_complete')) {
        earnBadge('docs_complete');
      }
    }
  }, [completeness, uploadedDocs]);

  const isDocUploaded = (docName: string) => {
    return documents.some((d: any) => d.name === docName);
  };

  const getDocSource = (docName: string) => {
    const doc = documents.find((d: any) => d.name === docName);
    return doc?.source || null;
  };

  const handleFetchDigilocker = async () => {
    setDigilockerLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDocs = [
      { name: "Aadhaar Card", type: "Identity", file_name: "aadhaar_mock.pdf", source: "DigiLocker" },
      { name: "PAN Card", type: "Identity", file_name: "pan_mock.pdf", source: "DigiLocker" },
      { name: "10th Marksheet", type: "Academic", file_name: "10th_mock.pdf", source: "DigiLocker" },
    ];

    for (const doc of mockDocs) {
      const { error } = await supabase.from("documents").insert({
        ...doc,
        user_id: user.id,
        file_size: Math.floor(Math.random() * 500000) + 100000,
        status: "Uploaded",
        is_verified: true,
      });
      if (error) console.log(error);
    }

    const { data } = await supabase.from("documents").select("*").eq("user_id", user.id);
    setDocuments(data || []);
    setDigilockerLoading(false);
    setLastSynced("Today");
    toast.success("Documents fetched from DigiLocker!");
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!uploadDocType || !user) {
      toast.error("Please select a document type first");
      return;
    }

    const file = acceptedFiles[0];
    const { error } = await supabase.from("documents").insert({
      name: uploadDocType,
      type: categories.find(c => c.docs.some(d => d.name === uploadDocType))?.name || "Other",
      file_name: file.name,
      file_size: file.size,
      user_id: user.id,
      source: "Manual",
      notes: uploadNotes,
      expiry_date: uploadExpiry || null,
    });

    if (error) {
      toast.error("Failed to upload document");
    } else {
      toast.success("Document uploaded!");
      const { data } = await supabase.from("documents").select("*").eq("user_id", user.id);
      setDocuments(data || []);
      setUploadModalOpen(false);
      setUploadDocType("");
      setUploadNotes("");
      setUploadExpiry("");
    }
  }, [uploadDocType, uploadNotes, uploadExpiry, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDeleteDoc = async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Document deleted");
      setDocuments(documents.filter((d: any) => d.id !== id));
    }
  };

  const handleShare = () => {
    toast.success("Documents shared! Your loan officer will review them within 24 hours.");
    setShareModalOpen(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
          <p className="text-gray-500">All your application documents in one secure place</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="6" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={completeness >= 75 ? "#10B981" : completeness >= 50 ? "#F59E0B" : "#EF4444"}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${completeness * 1.76} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-sm">
              {completeness}%
            </span>
          </div>
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogTrigger>
              <Button className="bg-purple-600">
                <Upload className="w-4 h-4 mr-2" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Document Type</Label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select document...</option>
                    {allDocNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>File</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                      isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {isDragActive ? "Drop file here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-gray-400">PDF, JPG, PNG (max 10MB)</p>
                  </div>
                </div>
                <div>
                  <Label>Expiry Date (optional)</Label>
                  <Input
                    type="date"
                    value={uploadExpiry}
                    onChange={(e) => setUploadExpiry(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Input
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* DigiLocker Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Connected to DigiLocker</h3>
              <p className="text-sm text-purple-200">Fetch your Aadhaar, PAN, and academic documents instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSynced && (
              <span className="text-sm text-purple-200">Last synced: {lastSynced}</span>
            )}
            <Button 
              onClick={handleFetchDigilocker}
              disabled={digilockerLoading}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              {digilockerLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
              ) : (
                <>Fetch Documents</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Document Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const uploaded = category.docs.filter(d => isDocUploaded(d.name)).length;
          const total = category.docs.length;
          const Icon = category.icon;
          return (
            <Card key={category.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(uploaded / total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{uploaded}/{total} uploaded</p>
                </div>
                <div className="space-y-2">
                  {category.docs.map((doc) => {
                    const uploaded = isDocUploaded(doc.name);
                    const source = getDocSource(doc.name);
                    return (
                      <div key={doc.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {uploaded ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : doc.required ? (
                            <X className="w-4 h-4 text-red-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                          <span className={uploaded ? "text-gray-700" : doc.required ? "text-gray-500" : "text-gray-400"}>
                            {doc.name}
                          </span>
                        </div>
                        {uploaded && (
                          <div className="flex items-center gap-2">
                            {source === "DigiLocker" && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                DigiLocker
                              </span>
                            )}
                            <button
                              onClick={() => {
                                const foundDoc = documents.find((d: any) => d.name === doc.name);
                                if (foundDoc) handleDeleteDoc(foundDoc.id);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Share with Poonawalla */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogTrigger>
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 text-lg">
            <Share2 className="w-5 h-5 mr-2" /> Share Documents with Poonawalla Fincorp
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Documents with Poonawalla Fincorp</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              You are about to share {documents.length} documents with Poonawalla Fincorp for your loan application.
            </p>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-2 py-2 border-b last:border-0">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{doc.name}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleShare} className="w-full mt-4 bg-green-600">
              Confirm Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}