import { createClient } from '@supabase/supabase-js';

// Server-side Supabase Client
// This should ONLY be used in Server Components (app directory)
// It does NOT have access to browser APIs like localStorage
export const createServerSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase Environment Variables");
    }

    return createClient(supabaseUrl, supabaseKey);
};
