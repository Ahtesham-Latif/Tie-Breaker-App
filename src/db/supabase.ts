import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "dummy";

if (supabaseUrl === "https://dummy.supabase.co") {
  console.warn("⚠️ Missing Supabase environment variables. Please check your .env file.");
} else {
  console.log("✅ Supabase initialized with URL:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
