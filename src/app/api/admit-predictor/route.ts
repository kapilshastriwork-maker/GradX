import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    const prompt = `You are an expert US/UK/Canada/Germany university admissions consultant with 15 years of experience helping Indian students. Analyze this student's profile and predict admission chances.

Student Profile:
- Field: ${profile.field}
- Degree: ${profile.degree}
- CGPA: ${profile.cgpa}/10 (University: ${profile.university || "Mid-tier Indian university"})
- GRE: ${profile.gre || "Not taken"}
- IELTS: ${profile.ielts || "Not taken"}
- TOEFL: ${profile.toefl || "Not taken"}
- Work Experience: ${profile.workExp} months
- Research Papers: ${profile.papers || 0}
- Internships: ${profile.internships || 0}
- Projects/Achievements: ${profile.achievements || "Not specified"}
- Target Universities: ${profile.targetUniversities || "Not specified"}
- Statement of Purpose: ${profile.sopStrength || "Not written yet"}
- LORs: ${profile.lors || "Not arranged"}

Respond ONLY with valid JSON (no markdown):
{
  "overallScore": 72,
  "profileStrength": "Good",
  "predictions": [
    {
      "university": "University of Texas at Austin",
      "country": "USA",
      "program": "MS Computer Science",
      "chance": 78,
      "chanceLabel": "Good",
      "avgGRE": 315,
      "avgCGPA": 3.2,
      "yourGRE": 318,
      "yourCGPA": 3.5,
      "strengths": ["Strong GRE quant", "Good CGPA"],
      "weaknesses": ["Limited research experience"],
      "tips": ["Get a strong LOR from your project supervisor", "Mention specific faculty you want to work with in SOP"]
    }
  ],
  "profileGaps": [
    { "area": "Research Experience", "severity": "High", "suggestion": "Try to publish or present at a conference before applying" },
    { "area": "GRE Score", "severity": "Low", "suggestion": "Your score is competitive, maintain it" }
  ],
  "strengthAreas": ["Strong academics", "Good test scores"],
  "improvementPlan": [
    { "action": "Write a compelling SOP", "timeline": "4-6 weeks", "impact": "High" },
    { "action": "Secure 3 strong LORs", "timeline": "6-8 weeks", "impact": "High" },
    { "action": "Build a GitHub portfolio", "timeline": "2-3 months", "impact": "Medium" }
  ],
  "bestFitUniversityType": "Target universities in USA and Canada",
  "recommendation": "2-3 sentence overall recommendation for this student"
}

Generate predictions for exactly 5 universities that are realistic matches for this profile. Mix safety, target, and reach schools. chanceLabel must be one of: "Excellent" (85%+), "Good" (70-84%), "Moderate" (55-69%), "Reach" (below 55%).`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admit predictor error:", error);
    return NextResponse.json({ error: "Failed to predict admissions" }, { status: 500 });
  }
}