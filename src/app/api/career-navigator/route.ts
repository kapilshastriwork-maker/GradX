import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { studentData } = await request.json();

    const prompt = `You are an expert study abroad counselor for Indian students. Based on the student profile below, provide detailed, personalized university and course recommendations.

Student Profile:
- Field of Interest: ${studentData.field}
- Target Degree: ${studentData.degree}
- CGPA: ${studentData.cgpa}/10
- GRE Score: ${studentData.gre || "Not taken"}
- IELTS Score: ${studentData.ielts || "Not taken"}
- Work Experience: ${studentData.workExp} months
- Budget: ${studentData.budget} INR per year (tuition + living)
- Preferred Countries: ${studentData.countries.join(", ")}
- Career Goal: ${studentData.careerGoal}
- Strengths: ${studentData.strengths}

Respond ONLY with a valid JSON object in exactly this structure (no markdown, no explanation, just the JSON):
{
  "summary": "2-3 sentence personalized summary of the student's profile and prospects",
  "profileStrength": 75,
  "recommendations": [
    {
      "country": "USA",
      "university": "University of Texas at Austin",
      "program": "MS in Computer Science",
      "duration": "2 years",
      "avgTuitionUSD": 25000,
      "livingCostUSD": 15000,
      "admissionChance": "Good",
      "avgGRERequired": 315,
      "avgCGPARequired": 3.2,
      "highlights": ["Strong industry connections", "Good financial aid", "Large Indian student community"],
      "matchScore": 82,
      "matchReason": "Matches your budget and profile strength"
    }
  ],
  "topCountry": "USA",
  "keyAdvice": ["advice point 1", "advice point 2", "advice point 3"],
  "nextSteps": ["step 1", "step 2", "step 3", "step 4"]
}

Provide exactly 6 university recommendations across the preferred countries. Mix safety (matchScore 85+), target (70-84), and reach (55-69) universities. Make all data realistic and specific to Indian students. admissionChance must be one of: "Excellent", "Good", "Moderate", "Reach".`;

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
    console.error("Career navigator error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}