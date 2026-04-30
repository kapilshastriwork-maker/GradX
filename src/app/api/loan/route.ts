import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile, loanInputs } = await request.json();

    const prompt = `You are a loan eligibility expert at Poonawalla Fincorp, an NBFC in India specializing in education loans. Calculate a personalized loan eligibility assessment.

Student Profile:
- University Quality: ${loanInputs.universityTier || "Top 200 global"}
- Course: ${profile.field_of_study || "Computer Science"} - ${profile.target_degree || "Masters"}
- Country: ${profile.target_country || "USA"}
- CGPA: ${profile.cgpa || 7.5}/10
- Co-applicant: ${loanInputs.hasCoApplicant ? "Yes - " + loanInputs.coApplicantIncome + " LPA income" : "No"}
- Co-applicant Type: ${loanInputs.coApplicantType || "Parent"}
- Annual Family Income: ${loanInputs.familyIncome || "5-10 LPA"}
- Collateral Available: ${loanInputs.hasCollateral ? "Yes - " + loanInputs.collateralType : "No"}
- Total Course Cost: ${loanInputs.totalCourseCost || "40"} lakhs INR
- Loan Amount Requested: ${loanInputs.loanRequested || "30"} lakhs INR
- Admission Status: ${loanInputs.admissionStatus || "Not yet admitted"}

Respond ONLY with valid JSON (no markdown):
{
  "eligibilityScore": 78,
  "eligibilityLabel": "High Eligibility",
  "approvalProbability": 82,
  "estimatedLoanRange": { "min": 2000000, "max": 3500000 },
  "recommendedLoanAmount": 2800000,
  "interestRateRange": { "min": 9.5, "max": 11.5 },
  "recommendedTenure": 10,
  "monthlyEMI": 36000,
  "processingFee": 15000,
  "totalRepayment": 4320000,
  "totalInterest": 1520000,
  "poonawallaBenefits": [
    "12-month EMI waiver after graduation",
    "No collateral required up to ₹40 lakhs for top universities",
    "Instant sanction letter for application purposes",
    "Flexible repayment: 5 to 15 years",
    "Part disbursement as per semester schedule"
  ],
  "requiredDocuments": [
    { "doc": "Admission letter from university", "status": "Required", "note": "Can apply with provisional letter" },
    { "doc": "Academic transcripts (10th, 12th, Graduation)", "status": "Required", "note": "Certified copies needed" },
    { "doc": "Co-applicant income proof (last 3 months salary slips)", "status": "Required", "note": "" },
    { "doc": "Co-applicant bank statements (6 months)", "status": "Required", "note": "" },
    { "doc": "Aadhaar card (Student + Co-applicant)", "status": "Required", "note": "" },
    { "doc": "PAN card (Student + Co-applicant)", "status": "Required", "note": "" },
    { "doc": "Passport copy", "status": "Required", "note": "Must be valid for at least 2 years" },
    { "doc": "GRE/IELTS score card", "status": "Recommended", "note": "Improves loan terms" },
    { "doc": "Collateral documents", "status": "Optional", "note": "Required for loans above ₹40L" }
  ],
  "eligibilityFactors": [
    { "factor": "University Ranking", "impact": "Positive", "detail": "Top 200 university significantly boosts eligibility" },
    { "factor": "CGPA", "impact": "Positive", "detail": "Strong academic record improves approval chances" },
    { "factor": "Co-applicant Income", "impact": "Positive", "detail": "Stable income provides repayment assurance" },
    { "factor": "No Collateral", "impact": "Neutral", "detail": "Collateral-free loans available up to ₹40L for top universities" },
    { "factor": "Admission Status", "impact": "Neutral", "detail": "Pre-admission sanction letter available" }
  ],
  "nextSteps": [
    "Apply for pre-admission sanction letter now — use it for your university application",
    "Keep your admission letter ready for final sanction",
    "Connect with a GradX loan advisor for personalized guidance"
  ],
  "disclaimer": "This is an indicative assessment. Final loan amount and interest rate will be determined by Poonawalla Fincorp based on complete application review."
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result);
  } catch (error) {
    console.error("Loan error:", error);
    return NextResponse.json({ error: "Failed to calculate loan eligibility" }, { status: 500 });
  }
}