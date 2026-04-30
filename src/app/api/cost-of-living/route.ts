import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { city, country, accommodationType } = await request.json();

    const prompt = `You are a financial advisor for Indian students studying abroad. Provide a detailed monthly cost of living breakdown for a student in ${city}, ${country} living in ${accommodationType}.

Respond ONLY with valid JSON (no markdown):
{
  "city": "${city}",
  "country": "${country}",
  "currency": "USD",
  "exchangeRate": 83,
  "accommodationType": "${accommodationType}",
  "monthly": {
    "rent": 1200,
    "food": 400,
    "transport": 120,
    "utilities": 80,
    "phone": 40,
    "healthInsurance": 150,
    "books": 50,
    "entertainment": 100,
    "clothing": 50,
    "miscellaneous": 100
  },
  "totalMonthlyUSD": 2290,
  "totalMonthlyINR": 190070,
  "totalAnnualUSD": 27480,
  "totalAnnualINR": 2280840,
  "breakdown": {
    "essential": 1990,
    "lifestyle": 300
  },
  "savingTips": [
    "Cook at home — Indian grocery stores in the area are affordable",
    "Use public transit monthly pass instead of Uber",
    "Share accommodation with 2-3 roommates to halve rent"
  ],
  "partTimeWorkOffset": {
    "hoursPerWeek": 20,
    "hourlyWageUSD": 15,
    "monthlyEarningUSD": 1200,
    "netMonthlyCostUSD": 1090
  },
  "comparedToIndia": {
    "equivalentIndianCity": "Mumbai",
    "percentageHigher": 340
  },
  "neighborhoodTips": "Prefer neighborhoods like [area] near campus for best value. Avoid downtown as rent is 40% higher.",
  "indianCommunityNote": "Strong Indian community in [area] with Indian grocery stores and restaurants nearby.",
  "firstMonthExtra": 3500,
  "firstMonthNote": "First month requires deposit (usually 2 months rent) plus setup costs"
}

Provide realistic 2025-2026 figures for ${city}. All USD amounts should be realistic for a frugal student.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Cost of living error:", error);
    return NextResponse.json({ error: "Failed to calculate costs" }, { status: 500 });
  }
}