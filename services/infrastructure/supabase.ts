import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../types';
import { REFERENCE_DATE_STR } from '../../utils/dummyData';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sbjrayzghjfsmmuygwbw.supabase.co';
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🛡️ Robust Browser Client using @supabase/ssr
// This ensures synchronization between Next.js server-side cookies and client-side auth state.
export const supabase: SupabaseClient | null = (NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ? createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : null;

/**
 * Maps Supabase Auth User metadata to the internal Application User type.
 */
export const mapSupabaseUser = (sbUser: any): Partial<User> => {
    return {
        id: sbUser.id,
        email: sbUser.email,
        fullName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'کاربر جدید',
        avatar: sbUser.user_metadata?.avatar_url,
        points: 100,
        level: 'جوانه',
        joinDate: REFERENCE_DATE_STR,
    };
};
