import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          cgpa: number | null;
          gre_score: number | null;
          ielts_score: number | null;
          target_country: string | null;
          target_degree: string | null;
          budget_inr: string | null;
          work_experience_months: number | null;
          target_universities: string[] | null;
          field_of_study: string | null;
          intake_year: number | null;
          intake_season: string | null;
          loan_readiness_score: number | null;
          readiness_score: number | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};