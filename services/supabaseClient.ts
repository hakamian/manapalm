
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

// Default Project URL (Safe to expose as it requires a key to work)
const DEFAULT_SUPABASE_URL = "https://sbjrayzghjfsmmuygwbw.supabase.co";

// Load configuration
let supabaseUrl = getEnv('VITE_SUPABASE_URL');
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Fallback to LocalStorage (Manual Setup via UI)
if (typeof window !== 'undefined') {
    if (!supabaseUrl || supabaseUrl === 'undefined') {
        supabaseUrl = localStorage.getItem('VITE_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
    }
    if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
        supabaseAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '';
    }
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
