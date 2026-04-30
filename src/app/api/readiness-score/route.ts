import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    const prompt = `You are an expert study abroad counselor. Calculate a detailed readiness score for this Indian student planning to study abroad.

Student Profile:
- Full Name: ${profile.full_name || "Student"}
- CGPA: ${profile.cgpa || "Not provided"}
- GRE Score: ${profile.gre_score || "Not taken"}
- IELTS Score: ${profile.ielts_score || "Not taken"}
- Target Country: ${profile.target_country || "Not decided"}
- Target Degree: ${profile.target_degree || "Not decided"}
- Field of Study: ${profile.field_of_study || "Not specified"}
- Budget: ${profile.budget_inr || "Not specified"}
- Work Experience: ${profile.work_experience_months || 0} months
- Intake: ${profile.intake_season || "Not set"} ${profile.intake_year || ""}
- Target Universities: ${profile.target_universities?.join(", ") || "Not shortlisted yet"}

Respond ONLY with valid JSON (no markdown):
{
  "totalScore": 62,
  "grade": "B",
  "gradeLabel": "Good Progress",
  "dimensions": {
    "profileStrength": {
      "score": 70,
      "maxScore": 100,
      "label": "Profile Strength",
      "status": "Good",
      "feedback": "Your CGPA is strong. Consider taking GRE to strengthen your profile further.",
      "tasks": [
        { "task": "Take GRE exam", "done": false, "impact": "High" },
        { "task": "Get IELTS score above 7.0", "done": false, "impact": "High" },
        { "task": "Update your LinkedIn profile", "done": false, "impact": "Medium" }
      ]
    },
    "universityShortlist": {
      "score": 30,
      "maxScore": 100,
      "label": "University Shortlist",
      "status": "Needs Work",
      "feedback": "You haven't shortlisted universities yet. Use the Career Navigator to find the right fit.",
      "tasks": [
        { "task": "Shortlist 8-10 universities", "done": false, "impact": "High" },
        { "task": "Research admission requirements", "done": false, "impact": "High" },
        { "task": "Check application deadlines", "done": false, "impact": "Medium" }
      ]
    },
    "financialPlanning": {
      "score": 50,
      "maxScore": 100,
      "label": "Financial Planning",
      "status": "In Progress",
      "feedback": "You have a budget in mind. Now calculate your exact ROI and explore loan options.",
      "tasks": [
        { "task": "Calculate total cost of education", "done": false, "impact": "High" },
        { "task": "Check loan eligibility", "done": false, "impact": "High" },
        { "task": "Research scholarships", "done": false, "impact": "Medium" }
      ]
    },
    "documentReadiness": {
      "score": 20,
      "maxScore": 100,
      "label": "Document Readiness",
      "status": "Not Started",
      "feedback": "Start gathering your documents early. Delays in documents are the #1 reason for missed deadlines.",
      "tasks": [
        { "task": "Request official transcripts", "done": false, "impact": "High" },
        { "task": "Get passport if not done", "done": false, "impact": "High" },
        { "task": "Draft Statement of Purpose", "done": false, "impact": "High" },
        { "task": "Arrange 3 Letters of Recommendation", "done": false, "impact": "High" }
      ]
    },
    "timelineAdherence": {
      "score": 60,
      "maxScore": 100,
      "label": "Timeline Adherence",
      "status": "On Track",
      "feedback": "Your timeline looks manageable. Keep following the checklist to stay on track.",
      "tasks": [
        { "task": "Set application deadline reminders", "done": false, "impact": "Medium" },
        { "task": "Create week-by-week plan", "done": false, "impact": "High" }
      ]
    }
  },
  "topPriorityActions": [
    { "action": "Take GRE exam", "reason": "Highest impact on admission chances", "urgency": "High", "link": "/admit-predictor" },
    { "action": "Shortlist universities", "reason": "Defines your entire application strategy", "urgency": "High", "link": "/career-navigator" },
    { "action": "Check loan eligibility", "reason": "Plan your finances before deadlines", "urgency": "Medium", "link": "/loan" }
  ],
  "motivationalMessage": "You are making great progress, [name]! Every step you take brings you closer to your dream university. Keep going!",
  "nextMilestone": "Get your GRE score — it will unlock Excellent chances at 80% of your target universities",
  "shareText": "I scored the totalScore value on my Study Abroad Readiness Score on GradX! 🎓 How ready are you?"
}

Calculate scores realistically based on what's filled vs missing in the profile. totalScore is weighted average: profileStrength 30%, universityShortlist 25%, financialPlanning 20%, documentReadiness 15%, timelineAdherence 10%. grade: A (85+), B (70-84), C (55-69), D (40-54), F (below 40).`;

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
    console.error("Readiness score error:", error);
    return NextResponse.json({ error: "Failed to calculate readiness score" }, { status: 500 });
  }
}