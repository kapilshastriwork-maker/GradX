"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

export function ProfileSetupModal({ isOpen, onClose, userId, userEmail }: ProfileSetupModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    cgpa: "",
    greScore: "",
    ieltsScore: "",
    fieldOfStudy: "",
    workExperience: "0",
    targetDegree: "",
    targetCountry: "",
    intakeYear: "",
    intakeSeason: "",
    budgetInr: "",
  });

  const totalSteps = 3;

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value || "" }));
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.fullName && formData.cgpa && formData.fieldOfStudy;
    }
    if (step === 2) {
      return formData.targetDegree && formData.targetCountry && formData.budgetInr;
    }
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email: userEmail,
        full_name: formData.fullName,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        gre_score: formData.greScore ? parseInt(formData.greScore) : null,
        ielts_score: formData.ieltsScore ? parseFloat(formData.ieltsScore) : null,
        field_of_study: formData.fieldOfStudy,
        work_experience_months: parseInt(formData.workExperience) || 0,
        target_degree: formData.targetDegree,
        target_country: formData.targetCountry,
        intake_year: formData.intakeYear ? parseInt(formData.intakeYear) : null,
        intake_season: formData.intakeSeason,
        budget_inr: formData.budgetInr,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving profile:", error);
      } else {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fieldOfStudyOptions = [
    "Computer Science",
    "Data Science",
    "MBA",
    "Engineering",
    "Medicine",
    "Law",
    "Arts & Humanities",
    "Other",
  ];

  const countryOptions = [
    "USA",
    "UK",
    "Canada",
    "Germany",
    "Australia",
    "Singapore",
    "Netherlands",
    "Ireland",
    "Other",
  ];

  const degreeOptions = ["Masters", "PhD", "MBA", "PG Diploma"];
  const yearOptions = ["2025", "2026", "2027"];
  const seasonOptions = ["Fall", "Spring", "Summer"];
  const budgetOptions = [
    "Under 20L",
    "20L-40L",
    "40L-60L",
    "60L-80L",
    "Above 80L",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Complete Your Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Academic Background</h3>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA (0-10) *</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="e.g., 8.5"
                  value={formData.cgpa}
                  onChange={(e) => updateField("cgpa", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="greScore">GRE Score (260-340, optional)</Label>
                <Input
                  id="greScore"
                  type="number"
                  min="260"
                  max="340"
                  placeholder="e.g., 325"
                  value={formData.greScore}
                  onChange={(e) => updateField("greScore", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ieltsScore">IELTS/TOEFL Score (optional)</Label>
                <Input
                  id="ieltsScore"
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  placeholder="e.g., 7.5"
                  value={formData.ieltsScore}
                  onChange={(e) => updateField("ieltsScore", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                <Select
                  value={formData.fieldOfStudy}
                  onValueChange={(v) => updateField("fieldOfStudy", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOfStudyOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workExperience">Work Experience (months, enter 0 if fresher)</Label>
                <Input
                  id="workExperience"
                  type="number"
                  min="0"
                  placeholder="e.g., 12"
                  value={formData.workExperience}
                  onChange={(e) => updateField("workExperience", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Study Plans</h3>
              <div className="space-y-2">
                <Label htmlFor="targetDegree">Target Degree *</Label>
                <Select
                  value={formData.targetDegree}
                  onValueChange={(v) => updateField("targetDegree", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetCountry">Target Country *</Label>
                <Select
                  value={formData.targetCountry}
                  onValueChange={(v) => updateField("targetCountry", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="intakeYear">Intake Year</Label>
                <Select
                  value={formData.intakeYear}
                  onValueChange={(v) => updateField("intakeYear", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="intakeSeason">Intake Season</Label>
                <Select
                  value={formData.intakeSeason}
                  onValueChange={(v) => updateField("intakeSeason", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetInr">Budget in INR *</Label>
                <Select
                  value={formData.budgetInr}
                  onValueChange={(v) => updateField("budgetInr", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Confirmation</h3>
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGPA:</span>
                    <span className="font-medium">{formData.cgpa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Field of Study:</span>
                    <span className="font-medium">{formData.fieldOfStudy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Degree:</span>
                    <span className="font-medium">{formData.targetDegree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Country:</span>
                    <span className="font-medium">{formData.targetCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">{formData.budgetInr}</span>
                  </div>
                  {formData.greScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GRE Score:</span>
                      <span className="font-medium">{formData.greScore}</span>
                    </div>
                  )}
                  {formData.ieltsScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IELTS/TOEFL:</span>
                      <span className="font-medium">{formData.ieltsScore}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}