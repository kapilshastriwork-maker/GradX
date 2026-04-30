import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile, targetUniversity, targetProgram } = await request.json();

    const prompt = `You are an admissions data analyst. Compare this Indian student's profile against the typical admitted student profile for ${targetUniversity} - ${targetProgram}.

Student Profile:
- CGPA: ${profile.cgpa}/10
- GRE: ${profile.gre_score || 'Not taken'}
- IELTS: ${profile.ielts_score || 'Not taken'}
- Work Experience: ${profile.work_experience_months || 0} months
- Field: ${profile.field_of_study}
- Degree: ${profile.target_degree}

Respond ONLY with valid JSON (no markdown):
{
  "university": "${targetUniversity}",
  "program": "${targetProgram}",
  "overallMatch": 72,
  "admissionChance": 68,
  "verdict": "Strong Candidate",
  "verdictColor": "green",
  "metrics": [
    {
      "name": "CGPA",
      "yourValue": 8.4,
      "yourValueFormatted": "8.4/10",
      "avgAdmittedValue": 3.6,
      "avgAdmittedFormatted": "3.6/4.0 (equiv ~9.0/10)",
      "percentile": 65,
      "status": "Slightly Below Average",
      "statusColor": "amber",
      "tip": "Your CGPA is competitive. Highlight upward grade trend if applicable."
    },
    {
      "name": "GRE Total",
      "yourValue": 318,
      "yourValueFormatted": "318/340",
      "avgAdmittedValue": 320,
      "avgAdmittedFormatted": "320/340",
      "percentile": 72,
      "status": "On Par",
      "statusColor": "green",
      "tip": "Your GRE is competitive for this program. Strong quant score is valued."
    },
    {
      "name": "Work Experience",
      "yourValue": 12,
      "yourValueFormatted": "12 months",
      "avgAdmittedValue": 18,
      "avgAdmittedFormatted": "18 months",
      "percentile": 45,
      "status": "Below Average",
      "statusColor": "red",
      "tip": "Compensate with strong internship quality and project impact in your SOP."
    },
    {
      "name": "Research/Projects",
      "yourValue": 0,
      "yourValueFormatted": "Not specified",
      "avgAdmittedValue": 1,
      "avgAdmittedFormatted": "1-2 publications or strong projects",
      "percentile": 30,
      "status": "Needs Attention",
      "statusColor": "red",
      "tip": "Add a strong capstone project or GitHub portfolio to compensate."
    }
  ],
  "strengths": ["Competitive GRE score", "Relevant work experience", "Strong field alignment"],
  "gaps": ["Research experience below average", "Work experience slightly low"],
  "similarStudentsGotIn": [
    { "profile": "8.2 CGPA, GRE 315, 1 year exp, no publications", "result": "Admitted", "year": "2024" },
    { "profile": "8.6 CGPA, GRE 320, 6 months exp, 1 paper", "result": "Admitted", "year": "2024" },
    { "profile": "7.9 CGPA, GRE 318, 2 years exp, strong SOP", "result": "Admitted", "year": "2023" }
  ],
  "similarStudentsRejected": [
    { "profile": "8.1 CGPA, GRE 312, no work exp, weak SOP", "result": "Rejected", "year": "2024" }
  ],
  "topTip": "Your profile is competitive. The biggest differentiator will be your SOP and LOR quality. Focus there.",
  "improveBy": [
    { "action": "Take GRE again to score 322+", "scoreBoost": 8, "effort": "High" },
    { "action": "Add a strong GitHub portfolio", "scoreBoost": 5, "effort": "Medium" },
    { "action": "Get a strong LOR from a professor", "scoreBoost": 7, "effort": "Medium" }
  ]
}

Make all data realistic for Indian students applying to ${targetUniversity} for ${targetProgram} in 2025-2026.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Benchmark error:", error);
    return NextResponse.json({ error: "Failed to benchmark profile" }, { status: 500 });
  }
}