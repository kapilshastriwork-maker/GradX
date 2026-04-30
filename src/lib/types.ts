export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  cgpa: number;
  gre_score: number | null;
  ielts_score: number | null;
  target_country: string;
  target_degree: string;
  budget_inr: number;
  work_experience_months: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface University {
  name: string;
  country: string;
  ranking: number;
  acceptance_rate: number;
  avg_tuition_usd: number;
  programs: string[];
}

export interface LoanEstimate {
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  tenure_years: number;
  monthly_emi: number;
}

export interface ReadinessScore {
  total: number;
  profile_strength: number;
  university_shortlist: number;
  financial_planning: number;
  document_readiness: number;
  timeline_adherence: number;
}