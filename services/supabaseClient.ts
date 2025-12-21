
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types';
import { REFERENCE_DATE_STR } from '../utils/dummyData';

// Safely access environment variables
const getEnv = (key: string) => {
    try {
        // Priority to process.env (Next.js)
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
        // Fallback to import.meta.env (Vite)
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
// The CORRECT URL has 'uyg' in it. The typo was 'uug'.
const DEFAULT_URL = 'https://sbjrayzghjfsmmuygwbw.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianJheXpnaGpmc21tdXlnd2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MTY1NDQsImV4cCI6MjA4MDI5MjU0NH0.W7B-Dr1hiUNl9ok4_PUTPdJG8pJsBXtoOwWciItoF3Q';

// Known bad URLs to automatically clean up from user's cache
const BAD_URLS = [
    'https://sbjrayzghjfsmmuugwbw.supabase.co', // The typo version (uug)
];

let supabaseUrl = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

// Fallback to LocalStorage with Auto-Fix
if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const storedKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');

    // Auto-fix: Check if stored URL is one of the known bad ones OR contains the specific typo
    const isBadUrl = storedUrl && (BAD_URLS.includes(storedUrl) || storedUrl.includes('uugwbw'));

    if (isBadUrl) {
        console.warn("⚠️ Detected incorrect Supabase URL in cache (uug). Cleaning up and enforcing correct URL (uyg)...");
        localStorage.removeItem('VITE_SUPABASE_URL');
        localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
        supabaseUrl = DEFAULT_URL; // Force correct URL immediately
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
        joinDate: REFERENCE_DATE_STR,
    };
};
