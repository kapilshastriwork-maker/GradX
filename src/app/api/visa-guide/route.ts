import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { country, degree, intakeSeason, intakeYear } = await request.json();

    const prompt = `You are a visa expert specializing in student visas for Indian students. Provide a complete, accurate visa guide for studying in ${country} for a ${degree} program starting ${intakeSeason} ${intakeYear}.

Respond ONLY with valid JSON (no markdown):
{
  "country": "${country}",
  "visaType": "F-1 Student Visa",
  "governingBody": "US Department of State",
  "processingTime": "3-5 weeks",
  "visaFeeUSD": 185,
  "sevisFeeUSD": 350,
  "totalFeesINR": 44000,
  "validityPeriod": "Duration of program + 60 days grace",
  "interviewRequired": true,
  "successRate": "92% for well-prepared applicants",
  "steps": [
    {
      "id": "s1",
      "stepNumber": 1,
      "title": "Receive I-20 from University",
      "description": "After confirming enrollment and paying deposit, the university issues your I-20 form — the key document for your F-1 visa application.",
      "timeline": "2-4 weeks after enrollment confirmation",
      "daysBeforeIntake": 180,
      "cost": 0,
      "documents": ["Enrollment confirmation", "Deposit payment receipt"],
      "tips": "Make sure your name on I-20 exactly matches your passport",
      "commonMistakes": "Students often forget to check name spelling — rejection risk",
      "status": "pending"
    },
    {
      "id": "s2",
      "stepNumber": 2,
      "title": "Pay SEVIS Fee",
      "description": "Pay the Student and Exchange Visitor Information System fee online at fmjfee.com before scheduling your visa appointment.",
      "timeline": "As soon as I-20 is received",
      "daysBeforeIntake": 170,
      "cost": 350,
      "documents": ["I-20", "SEVIS ID from I-20"],
      "tips": "Save the payment receipt — you MUST bring it to the interview",
      "commonMistakes": "Not saving the I-797 receipt",
      "status": "pending"
    }
  ],
  "keyDocuments": [
    { "name": "Valid Passport", "note": "Must be valid for at least 6 months beyond your intended stay", "critical": true },
    { "name": "I-20 Form", "note": "Issued by your university after enrollment confirmation", "critical": true },
    { "name": "DS-160 Form", "note": "Online nonimmigrant visa application — takes about 90 minutes", "critical": true },
    { "name": "SEVIS Fee Receipt", "note": "I-797 payment confirmation from fmjfee.com", "critical": true },
    { "name": "Financial Proof", "note": "Bank statements showing ability to fund first year", "critical": true },
    { "name": "Admission Letter", "note": "Official acceptance letter from the university", "critical": true },
    { "name": "Academic Transcripts", "note": "All previous academic records", "critical": false },
    { "name": "GRE/IELTS Scores", "note": "Official test score reports", "critical": false },
    { "name": "Passport Photos", "note": "2 photos meeting US visa specifications", "critical": false }
  ],
  "interviewTips": [
    "Be clear and concise — answer only what is asked",
    "Bring all original documents plus one set of copies",
    "Clearly explain your study plans and intent to return to India",
    "Know your program details, university name, and start date"
  ],
  "commonRejectionReasons": [
    "Insufficient financial proof",
    "Unclear ties to home country",
    "Inconsistent answers during interview",
    "Incomplete documentation"
  ],
  "postStudyWorkVisa": "OPT for 12 months, STEM OPT extension for 24 additional months",
  "workRightsDuringStudy": "Up to 20 hours per week on campus. Off-campus with CPT authorization.",
  "emergencyContact": "US Embassy New Delhi: +91-11-2419-8000",
  "startApplicationBy": "Apply at least 4-5 months before your program start date"
}

Generate exactly 6-8 detailed steps covering the complete visa process for ${country}. Make steps specific, actionable, and accurate for Indian students in 2025-2026. daysBeforeIntake should count backwards from intake date.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Visa guide error:", error);
    return NextResponse.json({ error: "Failed to generate visa guide" }, { status: 500 });
  }
}