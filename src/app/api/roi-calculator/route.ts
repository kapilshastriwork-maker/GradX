import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { inputs } = await request.json();

    const prompt = `You are a financial analyst specializing in education ROI for Indian students studying abroad. Calculate a detailed, realistic ROI analysis based on these inputs:

Student Inputs:
- Field of Study: ${inputs.field}
- Target Country: ${inputs.country}
- University Tier: ${inputs.universityTier} (Tier 1 = top 50 global, Tier 2 = top 200, Tier 3 = others)
- Degree Duration: ${inputs.duration} years
- Annual Tuition: ₹${inputs.tuitionPerYear} lakhs
- Annual Living Cost: ₹${inputs.livingPerYear} lakhs
- Current Salary in India (if working): ₹${inputs.currentSalaryLPA || 0} LPA
- Expected Part-time Income Abroad: ₹${inputs.partTimeIncome || 0} lakhs/year
- Loan Amount: ₹${inputs.loanAmount} lakhs at ${inputs.interestRate}% interest for ${inputs.loanTenure} years

Respond ONLY with valid JSON (no markdown):
{
  "totalCost": 8500000,
  "totalTuition": 5000000,
  "totalLiving": 2500000,
  "loanEMI": 45000,
  "totalLoanRepayment": 5400000,
  "expectedSalaryYear1USD": 95000,
  "expectedSalaryYear1INR": 7885000,
  "expectedSalaryYear5INR": 12000000,
  "salaryWithoutDegreeYear5INR": 800000,
  "breakEvenMonths": 28,
  "roi10Year": 285,
  "netGainINR": 25000000,
  "opportunityCostINR": 1200000,
  "scholarshipPotential": "₹5-15 lakhs",
  "partTimeEarnings": 800000,
  "scenarios": {
    "conservative": { "salaryYear1INR": 6000000, "breakEvenMonths": 38, "roi10Year": 180 },
    "average": { "salaryYear1INR": 7885000, "breakEvenMonths": 28, "roi10Year": 285 },
    "optimistic": { "salaryYear1INR": 10000000, "breakEvenMonths": 18, "roi10Year": 420 }
  },
  "yearByYearCashflow": [
    { "year": 1, "income": 0, "expense": -2500000, "cumulative": -2500000 },
    { "year": 2, "income": 500000, "expense": -2500000, "cumulative": -4500000 },
    { "year": 3, "income": 7885000, "expense": -540000, "cumulative": 845000 },
    { "year": 4, "income": 8500000, "expense": -540000, "cumulative": 8805000 },
    { "year": 5, "income": 9200000, "expense": -540000, "cumulative": 17465000 }
  ],
  "keyInsights": [
    "insight 1 specific to this student",
    "insight 2",
    "insight 3"
  ],
  "recommendation": "2-3 sentence overall recommendation"
}

Make all numbers realistic for ${inputs.field} graduates from ${inputs.country} in 2026. yearByYearCashflow should cover years 1 through 7 where years 1-${inputs.duration} are study years.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result);
  } catch (error) {
    console.error("ROI calculator error:", error);
    return NextResponse.json({ error: "Failed to calculate ROI" }, { status: 500 });
  }
}