
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
const DEFAULT_URL = 'https://sbjrayzghjfsmmuygwbw.supabase.co'; // Correct URL (uyg)
const DEFAULT_KEY = 'sb_publishable_A7_rHrRypeOVpMKyEDEd2w_x_msAcBi';

// Typos or old URLs to automatically clean up from user's cache
const BAD_URLS = [
    'https://sbjrayzghjfsmmuugwbw.supabase.co', // The typo version
];

let supabaseUrl = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

// Fallback to LocalStorage
if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const storedKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    
    // Auto-fix: Check if stored URL is one of the known bad ones
    if (storedUrl && BAD_URLS.includes(storedUrl)) {
        console.warn("Detected incorrect Supabase URL in cache. Cleaning up...");
        localStorage.removeItem('VITE_SUPABASE_URL');
        localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
        // Force reload to apply clean state might be needed, but for now we just ignore the stored value
    } else {
        if (storedUrl) supabaseUrl = storedUrl;
        if (storedKey) supabaseAnonKey = storedKey;
    }
}

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http');

if (!isConfigured) {
    console.warn("Supabase credentials missing. App running in offline/demo mode.");
}

// Initialize Supabase Client
export const supabase: SupabaseClient | null = isConfigured
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
