
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};

// These environment variables should be set in your .env.local file
// Example:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
