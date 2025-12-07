
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

// --- DIRECT CONNECTION CONFIGURATION ---
// We use the direct Supabase URL to ensure OAuth links are generated exactly as required:
// https://sbjrayzghjfsmmuygwbw.supabase.co/auth/v1/authorize...
const SUPABASE_PROJECT_URL = "https://sbjrayzghjfsmmuygwbw.supabase.co";

const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianJheXpnaGpmc21tdXlnd2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTY1NDQsImV4cCI6MjA4MDI5MjU0NH0.W7B-Dr1hiUNl9ok4_PUTPdJG8pJsBXtoOwWciItoF3Q";

let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('VITE_SUPABASE_ANON_KEY') : null;
    supabaseAnonKey = localKey || HARDCODED_KEY;
}

// Initialize Supabase Client
export const supabase: SupabaseClient | null = supabaseAnonKey 
  ? createClient(SUPABASE_PROJECT_URL, supabaseAnonKey, {
      auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
      }
  }) 
  : null;

// Helper to manually set keys from UI
export const setupSupabaseKeys = (url: string, key: string) => {
    if (!key) return;
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
    // Even if user provides a custom URL, we default to the known working project URL for consistency in this version
    // unless it's completely different
    if (url && url !== SUPABASE_PROJECT_URL) {
        localStorage.setItem('VITE_SUPABASE_URL', url);
    }
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
