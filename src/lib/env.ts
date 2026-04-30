function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  supabase: {
    url: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
  groq: {
    apiKey: getEnv("GROQ_API_KEY"),
  },
};

export function getSupabaseUrl() {
  return env.supabase.url;
}

export function getSupabaseAnonKey() {
  return env.supabase.anonKey;
}

export function getGroqApiKey() {
  return env.groq.apiKey;
}