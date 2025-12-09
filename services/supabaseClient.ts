
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

// --- CONFIGURATION ---
// We prioritize Environment Variables, then fall back to Hardcoded values for the MVP.
// SECURITY NOTE: We ONLY use the 'Publishable Key' here. Never expose the 'Secret Key' in frontend code.

const PROVIDED_SUPABASE_URL = "https://sbjrayzghjfsmmuygwbw.supabase.co";
const PROVIDED_ANON_KEY = "sb_publishable_A7_rHrRypeOVpMKyEDEd2w_x_msAcBi";

// Load configuration
let supabaseUrl = getEnv('VITE_SUPABASE_URL') || PROVIDED_SUPABASE_URL;
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || PROVIDED_ANON_KEY;

// Fallback to LocalStorage (Manual Setup via UI if needed)
if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const storedKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    
    if (storedUrl) supabaseUrl = storedUrl;
    if (storedKey) supabaseAnonKey = storedKey;
}

// Initialize Supabase Client ONLY if key is present
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
      }
  }) 
  : null;

// Helper to manually set keys from UI (AuthModal)
export const setupSupabaseKeys = (url: string, key: string) => {
    if (!key) return;
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
    if (url) {
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
