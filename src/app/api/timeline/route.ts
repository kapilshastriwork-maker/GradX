import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json();

    const today = new Date().toISOString().split('T')[0];

    const prompt = `You are an expert study abroad application timeline planner. Create a detailed, personalized week-by-week application timeline for this student.

Today's Date: ${today}
Student Profile:
- Target Degree: ${profile.target_degree || "Masters"}
- Target Country: ${profile.target_country || "USA"}
- Field: ${profile.field_of_study || "Computer Science"}
- Intake: ${profile.intake_season || "Fall"} ${profile.intake_year || "2026"}
- GRE Status: ${profile.gre_score ? "Done - Score: " + profile.gre_score : "Not taken"}
- IELTS Status: ${profile.ielts_score ? "Done - Score: " + profile.ielts_score : "Not taken"}
- Budget: ${profile.budget_inr || "Not specified"}

Respond ONLY with valid JSON (no markdown):
{
  "intakeDate": "2026-08-15",
  "daysRemaining": 245,
  "completionPercentage": 15,
  "phases": [
    {
      "id": "phase1",
      "name": "Test Preparation",
      "color": "blue",
      "icon": "BookOpen",
      "startDate": "2026-01-01",
      "endDate": "2026-03-31",
      "tasks": [
        {
          "id": "t1",
          "title": "Register for GRE exam",
          "description": "Book your GRE slot at least 2 months before your target test date. ETS website: ets.org/gre",
          "dueDate": "2026-01-15",
          "priority": "High",
          "category": "Test Prep",
          "estimatedHours": 1,
          "done": false,
          "tips": "Book early — popular slots fill up fast. Target a score above 315 for top programs."
        }
      ]
    }
  ],
  "upcomingDeadlines": [
    { "task": "GRE Registration", "dueDate": "2026-01-15", "daysLeft": 45, "priority": "High" }
  ],
  "keyDates": [
    { "label": "Application Deadline (Early)", "date": "2026-10-15", "type": "deadline" },
    { "label": "Application Deadline (Regular)", "date": "2026-12-15", "type": "deadline" },
    { "label": "Target Test Date", "date": "2026-04-01", "type": "exam" },
    { "label": "Intake Start", "date": "2026-08-15", "type": "milestone" }
  ],
  "totalTasks": 24,
  "completedTasks": 0,
  "criticalPathMessage": "Your most urgent action is registering for GRE. Missing this delays everything downstream."
}

Create 4-5 phases covering: Test Preparation, University Research & Shortlisting, Application Documents (SOP, LOR, Resume), Submission & Visa, Financial Planning & Loan. Each phase should have 4-6 specific, actionable tasks with realistic dates based on the intake season. Make dates relative to today (${today}). All dates must be in YYYY-MM-DD format.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result);
  } catch (error) {
    console.error("Timeline error:", error);
    return NextResponse.json({ error: "Failed to generate timeline" }, { status: 500 });
  }
}