import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    const prompt = `You are generating a realistic alumni network for an Indian student platform. Create a list of Indian alumni who match this student's interests and could mentor them.

Student Profile:
- Field: ${profile.field_of_study || 'Computer Science'}
- Target Country: ${profile.target_country || 'USA'}
- Target Degree: ${profile.target_degree || 'Masters'}
- Target Universities: ${profile.target_universities?.join(', ') || 'Top universities'}

Respond ONLY with valid JSON (no markdown):
{
  "alumni": [
    {
      "id": "a1",
      "name": "Rahul Agarwal",
      "initials": "RA",
      "graduationYear": 2022,
      "university": "University of Texas at Austin",
      "degree": "MS Computer Science",
      "currentRole": "Software Engineer II",
      "currentCompany": "Google",
      "currentCity": "Mountain View, CA",
      "linkedinUrl": "https://linkedin.com",
      "responseRate": "Usually replies in 2-3 days",
      "expertise": ["Machine Learning", "System Design", "US Job Search"],
      "indiaCity": "Pune",
      "undergradCollege": "BITS Pilani",
      "cgpaWhenApplied": 8.7,
      "greScore": 322,
      "yearsOfExp": 1,
      "salaryRange": "$130,000 - $150,000",
      "scholarshipWon": "None",
      "visaStatus": "H1B Approved",
      "willingToMentor": true,
      "mentoringAreas": ["Application review", "Interview prep", "Career guidance"],
      "testimonial": "GradX helped me find the right universities for my profile. Happy to help students from similar backgrounds navigate the process.",
      "matchScore": 92,
      "matchReason": "Same field, same target country, similar profile strength"
    }
  ],
  "totalAlumni": 8,
  "averageMatchScore": 78,
  "topCompanies": ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
  "averageSalary": "$125,000",
  "successInsight": "85% of alumni from your target universities secured jobs within 3 months of graduation"
}

Generate exactly 8 realistic Indian alumni profiles. Mix different universities, companies, and backgrounds. Make names authentically Indian. matchScore should be based on how well they match the student's profile. All LinkedIn URLs should be https://linkedin.com (placeholder). Make salaries, companies, and roles realistic for 2024-2026.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Alumni error:", error);
    return NextResponse.json({ error: "Failed to load alumni" }, { status: 500 });
  }
}