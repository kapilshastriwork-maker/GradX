import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { action, sopData, currentSOP, instruction } = await request.json();

    let prompt = "";

    if (action === "generate") {
      prompt = `You are an expert SOP (Statement of Purpose) writer who has helped 5000+ Indian students get admitted to top universities worldwide. Write a compelling, authentic, and personalized SOP based on the student's information below.

Student Information:
- Name: ${sopData.name}
- Target Program: ${sopData.program} at ${sopData.targetUniversity || "top universities"}
- Target Country: ${sopData.country}
- CGPA: ${sopData.cgpa}/10 from ${sopData.college}
- Work Experience: ${sopData.workExp}
- Why this program: ${sopData.whyProgram}
- Career Goals (5-10 years): ${sopData.careerGoals}
- Key Academic Achievements: ${sopData.academicAchievements}
- Research/Projects: ${sopData.researchProjects}
- Internships/Work highlights: ${sopData.internships}
- Extracurriculars: ${sopData.extracurriculars}
- Why this specific university: ${sopData.whyUniversity}
- Challenges overcome: ${sopData.challenges || "Not specified"}
- Word limit: ${sopData.wordLimit || 1000} words

Write a complete, polished SOP that:
1. Opens with a compelling hook (not "I have always been passionate about...")
2. Flows naturally through: hook → background → why this field → key experiences → why this program/university → future goals → conclusion
3. Is specific and personal — avoid generic statements
4. Shows rather than tells (use specific examples and numbers)
5. Has a strong, memorable conclusion
6. Sounds like a real person, not an AI
7. Is approximately ${sopData.wordLimit || 1000} words

Write only the SOP text — no introduction, no "Here is your SOP:", just the essay itself.`;

    } else if (action === "improve") {
      prompt = `You are an expert SOP editor. The student has written an SOP and needs specific improvements.

Current SOP:
${currentSOP}

Student's instruction: ${instruction}

Make the requested changes while maintaining the student's authentic voice. Return only the complete improved SOP text — no explanation, just the revised essay.`;

    } else if (action === "feedback") {
      prompt = `You are an expert SOP reviewer. Analyze this SOP and provide detailed, actionable feedback.

SOP to review:
${currentSOP}

Respond ONLY with valid JSON (no markdown):
{
  "overallScore": 78,
  "wordCount": 950,
  "strengths": [
    "Strong opening hook that immediately engages the reader",
    "Clear articulation of career goals"
  ],
  "improvements": [
    { "issue": "The third paragraph is too generic", "suggestion": "Add a specific project name and measurable outcome", "severity": "High" },
    { "issue": "Why this university section is weak", "suggestion": "Mention 2-3 specific faculty members or research labs", "severity": "High" }
  ],
  "toneAnalysis": "Professional and confident. Slightly formal in places — could be warmer.",
  "admissionOfficerPerspective": "This SOP tells a coherent story but needs more specificity in the middle section to stand out from thousands of similar applications.",
  "quickFixes": ["Add professor names in paragraph 4", "Change opening of paragraph 3", "Strengthen the conclusion call-to-action"]
}`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: action === "generate" ? 0.8 : 0.5,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || "";

    if (action === "feedback") {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      return NextResponse.json({ type: "feedback", data: result });
    }

    return NextResponse.json({ type: "text", content });
  } catch (error) {
    console.error("SOP copilot error:", error);
    return NextResponse.json({ error: "Failed to process SOP request" }, { status: 500 });
  }
}