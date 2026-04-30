import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    const prompt = `You are a scholarship expert specializing in opportunities for Indian students pursuing graduate education abroad. Generate a personalized scholarship list.

Student Profile:
- Field: ${profile.field_of_study || 'Computer Science'}
- Degree: ${profile.target_degree || 'Masters'}
- Country: ${profile.target_country || 'USA'}
- CGPA: ${profile.cgpa || 8.0}
- GRE: ${profile.gre_score || 'Not taken'}
- Work Experience: ${profile.work_experience_months || 0} months
- Budget: ${profile.budget_inr || 'Not specified'}

Respond ONLY with valid JSON (no markdown):
{
  "scholarships": [
    {
      "id": "sch1",
      "name": "Fulbright-Nehru Master's Fellowships",
      "provider": "US-India Educational Foundation",
      "amount": "Full funding including tuition, living stipend",
      "amountUSD": 50000,
      "country": "USA",
      "eligibility": "Indian citizens, strong academic record, leadership",
      "cgpaRequired": 3.5,
      "deadline": "July 15, 2025",
      "difficulty": "Very Competitive",
      "difficultyScore": 90,
      "matchScore": 78,
      "applicationLink": "https://www.usief.org.in",
      "tips": "Emphasize community leadership and cross-cultural exchange in essays",
      "category": "Government",
      "renewable": true,
      "includesLiving": true
    }
  ],
  "totalPotentialValue": 150000,
  "topRecommendation": "scholarship name and why it fits this student specifically",
  "strategyAdvice": "Apply to 2-3 highly competitive scholarships AND 3-4 moderate ones for best odds",
  "categories": {
    "government": 3,
    "university": 4,
    "private": 3,
    "field_specific": 2
  }
}

Generate exactly 12 scholarships. Mix government, university-specific, private foundation, and field-specific scholarships. Make them all genuinely available to Indian students. difficulty must be one of: "Moderate", "Competitive", "Very Competitive", "Highly Selective". matchScore should be based on the student's actual profile.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Scholarship error:", error);
    return NextResponse.json({ error: "Failed to find scholarships" }, { status: 500 });
  }
}