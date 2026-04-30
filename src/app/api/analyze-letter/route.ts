import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { letterContent } = await request.json();

    const prompt = `You are an expert education consultant analyzing a university acceptance or offer letter for an Indian student. Extract all key information and provide actionable insights.

Letter Content:
${letterContent}

Respond ONLY with valid JSON (no markdown):
{
  "letterType": "Acceptance Letter",
  "university": "University Name",
  "program": "MS Computer Science",
  "startDate": "August 25, 2026",
  "applicationDeadline": "May 1, 2026",
  "tuitionPerSemester": "$18,500",
  "totalTuitionEstimate": "$74,000",
  "scholarshipOffered": "Merit Scholarship - $5,000/year",
  "scholarshipAmount": 5000,
  "conditions": [
    "Maintain GPA of 3.0 or above",
    "Submit final transcripts by July 1",
    "Complete health insurance enrollment by August 1"
  ],
  "deadlines": [
    { "item": "Enrollment Confirmation", "date": "May 1, 2026", "daysLeft": 45, "critical": true },
    { "item": "Housing Application", "date": "May 15, 2026", "daysLeft": 59, "critical": true },
    { "item": "Final Transcript Submission", "date": "July 1, 2026", "daysLeft": 106, "critical": true },
    { "item": "Health Insurance Enrollment", "date": "August 1, 2026", "daysLeft": 137, "critical": false },
    { "item": "Orientation", "date": "August 20, 2026", "daysLeft": 156, "critical": false }
  ],
  "financialAid": {
    "hasAid": true,
    "type": "Merit Scholarship",
    "amount": "$5,000/year",
    "renewable": true,
    "conditions": "Maintain 3.5 GPA"
  },
  "visaInfo": {
    "i20Available": true,
    "sevisInfo": "I-20 will be issued after enrollment confirmation",
    "visaType": "F-1"
  },
  "housingInfo": "On-campus housing available. Apply by May 15 for guaranteed placement.",
  "healthInsurance": "University health insurance required. Cost approx $2,500/year. Waiver available with qualifying plan.",
  "importantContacts": [
    { "role": "Graduate Admissions Office", "email": "gradadmissions@university.edu" },
    { "role": "International Student Office", "email": "iso@university.edu" }
  ],
  "redFlags": [],
  "shikhaInsights": [
    "Confirm your enrollment immediately — this is your most urgent action",
    "The scholarship is renewable — protect your GPA from day one",
    "Apply for housing before May 15 — good on-campus spots fill up within days",
    "Start your visa process immediately after confirming enrollment"
  ],
  "loanImplication": "With the $5,000 scholarship, your annual gap is approximately $31,000. At ₹83/dollar, that is ₹25.7 lakhs per year or ₹51.4 lakhs total. Consider a loan of ₹45-50 lakhs after accounting for personal savings.",
  "nextActions": [
    { "action": "Confirm enrollment online", "deadline": "May 1, 2026", "link": "" },
    { "action": "Apply for on-campus housing", "deadline": "May 15, 2026", "link": "" },
    { "action": "Start F-1 visa process", "deadline": "Immediately", "link": "" },
    { "action": "Request I-20 from university", "deadline": "After enrollment confirmation", "link": "" }
  ]
}

Extract ALL information present in the letter. If information is not present, use null. Be precise with dates and amounts.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Letter analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze letter" }, { status: 500 });
  }
}