
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types';

// Safely access environment variables
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn('Error reading env var:', key);
  }
  return undefined;
};

// --- SECURITY BYPASS CONFIGURATION ---
// Instead of connecting directly to Supabase (which might be blocked),
// we connect to our own domain's "/supaproxy" path.
// The Vite/Vercel server then forwards the request to Supabase.
const PROXY_URL = typeof window !== 'undefined' ? `${window.location.origin}/supaproxy` : "https://sbjrayzghjfsmmuugwbw.supabase.co";

const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianJheXpnaGpmc21tdXlnd2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTY1NDQsImV4cCI6MjA4MDI5MjU0NH0.W7B-Dr1hiUNl9ok4_PUTPdJG8pJsBXtoOwWciItoF3Q";

let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('VITE_SUPABASE_ANON_KEY') : null;
    supabaseAnonKey = localKey || HARDCODED_KEY;
}

// Initialize Supabase with the PROXY URL
export const supabase: SupabaseClient | null = supabaseAnonKey 
  ? createClient(PROXY_URL, supabaseAnonKey, {
      auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Important: Ensure redirects come back to the main domain
          flowType: 'pkce'
      }
  }) 
  : null;

// Helper to manually set keys from UI
export const setupSupabaseKeys = (url: string, key: string) => {
    if (!key) return;
    // We ignore the URL passed by user and enforce the Proxy URL for stability
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
    window.location.reload(); 
};

// Helper to map Supabase user to App User type
export const mapSupabaseUser = (sbUser: any): Partial<User> => {
    return {
        id: sbUser.id,
        email: sbUser.email,
        fullName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name,
        avatar: sbUser.user_metadata?.avatar_url,
        points: 100,
        level: 'جوانه',
        joinDate: new Date().toISOString(),
    };
};
