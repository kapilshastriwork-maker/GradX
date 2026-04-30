import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile, readinessScore, loanScore } = await request.json();

    const prompt = `Generate a motivational one-line tagline for an Indian student's GradX Score Card.

Student: ${profile.full_name || 'Student'}
Field: ${profile.field_of_study || 'Computer Science'}
Target: ${profile.target_degree || 'Masters'} in ${profile.target_country || 'USA'}
Readiness Score: ${readinessScore || 50}/100

Respond ONLY with valid JSON:
{
  "tagline": "Turning dreams into destinations, one step at a time",
  "motivationalNote": "You are 72% of the way to your dream university. Keep going!"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Score card error:", error);
    return NextResponse.json({ error: "Failed to generate score card" }, { status: 500 });
  }
}