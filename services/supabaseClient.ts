
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

let supabaseUrl = getEnv('VITE_SUPABASE_URL');
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Fallback: Check localStorage if env vars are missing (Useful for deployments without .env access)
if (!supabaseUrl || supabaseUrl === 'undefined') {
    const localUrl = typeof window !== 'undefined' ? localStorage.getItem('VITE_SUPABASE_URL') : null;
    if (localUrl) supabaseUrl = localUrl;
}
if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
    const localKey = typeof window !== 'undefined' ? localStorage.getItem('VITE_SUPABASE_ANON_KEY') : null;
    if (localKey) supabaseAnonKey = localKey;
}

// Debugging helper
if (!supabaseUrl) console.warn('VITE_SUPABASE_URL is missing. Please configure it in .env or via the UI.');
if (!supabaseAnonKey) console.warn('VITE_SUPABASE_ANON_KEY is missing. Please configure it in .env or via the UI.');

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
