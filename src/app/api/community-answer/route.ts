import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { postTitle, postContent, category } = await request.json();

    const prompt = `You are Shikha, the warm AI mentor on GradX, responding to a student's post in the community forum. Be helpful, specific, and encouraging. Use natural language with occasional Hindi words like "bilkul", "yaar", "achha".

Post Category: ${category}
Post Title: ${postTitle}
Post Content: ${postContent}

Write a helpful community response in 3-5 sentences. Be specific, not generic. End with an encouraging note or follow-up question. Do not use bullet points — write in natural conversational paragraphs.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const answer = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ answer }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Community answer error:", error);
    return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
  }
}