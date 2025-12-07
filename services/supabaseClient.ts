
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

// User provided credentials
const HARDCODED_URL = "https://sbjrayzghjfsmmuugwbw.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianJheXpnaGpmc21tdXlnd2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTY1NDQsImV4cCI6MjA4MDI5MjU0NH0.W7B-Dr1hiUNl9ok4_PUTPdJG8pJsBXtoOwWciItoF3Q";

let supabaseUrl = getEnv('VITE_SUPABASE_URL');
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Fallback: Check localStorage or use Hardcoded values
if (!supabaseUrl || supabaseUrl === 'undefined') {
    const localUrl = typeof window !== 'undefined' ? localStorage.getItem('VITE_SUPABASE_URL') : null;
    supabaseUrl = localUrl || HARDCODED_URL;
}
if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('VITE_SUPABASE_ANON_KEY') : null;
    supabaseAnonKey = localKey || HARDCODED_KEY;
}

// Debugging helper
if (!supabaseUrl) console.warn('VITE_SUPABASE_URL is missing.');
if (!supabaseAnonKey) console.warn('VITE_SUPABASE_ANON_KEY is missing.');

// Initialize Supabase only if keys are present
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to manually set keys from UI
export const setupSupabaseKeys = (url: string, key: string) => {
    if (!url || !key) return;
    localStorage.setItem('VITE_SUPABASE_URL', url);
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
    window.location.reload(); // Reload to apply changes
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
