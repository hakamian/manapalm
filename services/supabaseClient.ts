import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

// Safely access environment variables
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Debugging helper
if (!supabaseUrl) console.warn('VITE_SUPABASE_URL is missing in environment variables.');
if (!supabaseAnonKey) console.warn('VITE_SUPABASE_ANON_KEY is missing in environment variables.');

// Initialize Supabase only if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.error(
    'Supabase Client not initialized. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

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