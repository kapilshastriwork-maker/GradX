import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { profile, university, program, startDate, country } = await request.json();

    const prompt = `You are an expert pre-departure advisor for Indian students going abroad. Create a complete pre-departure checklist and first expenses guide for this student.

Student: Going to ${university} for ${program} starting ${startDate} in ${country}.
Field: ${profile?.field_of_study || 'Computer Science'}
Budget: ${profile?.budget_inr || 'Not specified'}

Respond ONLY with valid JSON (no markdown):
{
  "university": "${university}",
  "program": "${program}",
  "country": "${country}",
  "startDate": "${startDate}",
  "daysUntilDeparture": 120,
  "checklist": [
    {
      "id": "c1",
      "category": "Visa & Travel Documents",
      "icon": "🛂",
      "color": "blue",
      "items": [
        {
          "id": "i1",
          "task": "Apply for student visa (F-1/Study Permit)",
          "description": "Submit DS-160, pay SEVIS fee, schedule visa interview at nearest US consulate",
          "deadline": "90 days before departure",
          "daysBeforeDeparture": 90,
          "priority": "Critical",
          "estimatedCostINR": 15000,
          "tips": "Book the earliest available slot — visa appointment slots fill up 4-6 weeks out",
          "done": false
        }
      ]
    },
    {
      "id": "c2",
      "category": "Financial Setup",
      "icon": "💰",
      "color": "emerald",
      "items": []
    },
    {
      "id": "c3",
      "category": "Accommodation",
      "icon": "🏠",
      "color": "amber",
      "items": []
    },
    {
      "id": "c4",
      "category": "Health & Insurance",
      "icon": "🏥",
      "color": "red",
      "items": []
    },
    {
      "id": "c5",
      "category": "Academic Preparation",
      "icon": "📚",
      "color": "purple",
      "items": []
    },
    {
      "id": "c6",
      "category": "Packing & Logistics",
      "icon": "🧳",
      "color": "gray",
      "items": []
    }
  ],
  "firstMonthExpenses": {
    "securityDeposit": 2400,
    "firstMonthRent": 1200,
    "grocerySetup": 200,
    "kitchenEssentials": 150,
    "bedding": 100,
    "simCard": 30,
    "publicTransitPass": 90,
    "universityFees": 500,
    "healthInsuranceSetup": 200,
    "miscellaneous": 300,
    "totalUSD": 5170,
    "totalINR": 429110
  },
  "dayOneChecklist": [
    "Pick up keys from landlord or housing office",
    "Buy a local SIM card (T-Mobile or AT&T)",
    "Get a 30-day transit pass",
    "Visit nearest Indian grocery store",
    "Set up US bank account (Chase or Bank of America — bring passport and I-20)",
    "Connect to university WiFi and activate student ID"
  ],
  "indianCommunityTips": [
    "Join the Indian Students Association (ISA) in your first week",
    "Find the nearest Patel Brothers or Indian grocery store",
    "Join Facebook groups: Indians in [city] and [University] Indian Students"
  ],
  "loanRepaymentReminder": {
    "gracePeriod": "6 months after graduation",
    "estimatedEMI": 36000,
    "tipFromPoonawalla": "The 12-month EMI waiver gives you breathing room in your first year. Use it wisely — save aggressively in months 1-6 abroad."
  },
  "emergencyContacts": [
    { "name": "Indian Embassy/Consulate", "phone": "+1-202-939-7000", "available": "24/7 for emergencies" },
    { "name": "University International Office", "phone": "Check university website", "available": "Business hours" },
    { "name": "Poonawalla Fincorp Support", "phone": "1800-XXX-XXXX", "available": "9 AM - 6 PM IST" }
  ]
}

Fill ALL 6 checklist categories with 4-6 realistic, specific tasks each. Total should be 25-35 tasks. Make everything specific to ${country} and realistic for Indian students in 2026. estimatedCostINR should be realistic.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("Post-admit error:", error);
    return NextResponse.json({ error: "Failed to generate checklist" }, { status: 500 });
  }
}