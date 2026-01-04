import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../types';
import { REFERENCE_DATE_STR } from '../../utils/dummyData';

// Safely access environment variables
const getEnv = (key: string) => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
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

const DEFAULT_URL = 'https://sbjrayzghjfsmmuygwbw.supabase.co';
// SECURITY: Removed hardcoded API key. Must use Environment Variables.
const DEFAULT_KEY = '';

// Explicitly check process.env.NEXT_PUBLIC_* for Next.js build-time replacement
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseUrl = NEXT_PUBLIC_SUPABASE_URL || getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
let supabaseAnonKey = NEXT_PUBLIC_SUPABASE_ANON_KEY || getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const storedKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');

    // Prioritize localStorage if available to allow runtime configuration
    if (storedUrl) supabaseUrl = storedUrl;
    if (storedKey) supabaseAnonKey = storedKey;
}

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http');

export const supabase: SupabaseClient | null = isConfigured
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null;

export const setupSupabaseKeys = (url: string, key: string) => {
    if (!key) return;
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', key);
    if (url) localStorage.setItem('VITE_SUPABASE_URL', url);
    window.location.reload();
};

export const mapSupabaseUser = (sbUser: any): Partial<User> => {
    return {
        id: sbUser.id,
        email: sbUser.email,
        fullName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name,
        avatar: sbUser.user_metadata?.avatar_url,
        points: 100,
        level: 'جوانه',
        joinDate: REFERENCE_DATE_STR,
    };
};
