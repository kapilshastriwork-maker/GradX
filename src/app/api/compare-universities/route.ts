import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { universities, studentProfile } = await request.json();

    const prompt = `You are an expert university advisor comparing programs for an Indian student. Compare these universities in detail:

Universities to compare:
${universities.map((u: any, i: number) => `${i+1}. ${u.name} - ${u.program} (${u.country})`).join('\n')}

Student Profile:
- CGPA: ${studentProfile?.cgpa || 'Not provided'}
- GRE: ${studentProfile?.gre_score || 'Not taken'}
- Budget: ${studentProfile?.budget_inr || 'Not specified'}
- Field: ${studentProfile?.field_of_study || 'Not specified'}

Respond ONLY with valid JSON (no markdown):
{
  "comparison": [
    {
      "name": "University Name",
      "country": "USA",
      "program": "MS Computer Science",
      "ranking": 45,
      "acceptanceRate": "18%",
      "avgGRE": 318,
      "avgCGPA": 3.5,
      "annualTuitionUSD": 28000,
      "annualLivingUSD": 15000,
      "totalCostINR": 3500000,
      "avgSalaryUSD": 105000,
      "breakEvenMonths": 24,
      "postStudyWorkVisa": "OPT 3 years + H1B",
      "partTimeWork": "20 hrs/week allowed",
      "indianStudents": "Large community (2000+)",
      "scholarshipAvailability": "High",
      "campusType": "Urban",
      "strengths": ["Top CS faculty", "Silicon Valley proximity", "Strong alumni network"],
      "weaknesses": ["Very competitive", "High cost of living", "Difficult parking"],
      "bestFor": "Students prioritizing industry connections and salary",
      "admissionChanceForStudent": 65
    }
  ],
  "aiRecommendation": "Based on your profile, University X offers the best balance of admission probability and ROI because...",
  "winnerByCategory": {
    "bestROI": "University Name",
    "easiestAdmission": "University Name",
    "bestSalary": "University Name",
    "lowestCost": "University Name",
    "bestPostStudyWork": "University Name"
  }
}

Provide realistic data for all universities. admissionChanceForStudent should be based on the student's actual profile.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json({ error: "Failed to compare universities" }, { status: 500 });
  }
}