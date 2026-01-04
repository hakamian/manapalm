import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../types';
import { REFERENCE_DATE_STR } from '../../utils/dummyData';

// 🌐 Unified Environment Configuration (Client-Side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sbjrayzghjfsmmuygwbw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined') {
    console.log("🛠️ [SupabaseInit] Configuration:", {
        url: supabaseUrl,
        hasKey: !!supabaseAnonKey,
        env: process.env.NODE_ENV
    });
}

// 🛡️ Singleton Client Instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
    if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
        supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
};

export const supabase = getSupabaseClient();

/**
 * Maps Supabase Auth User metadata to the internal Application User type.
 */
export const mapSupabaseUser = (sbUser: any): User => {
    return {
        id: sbUser.id,
        email: sbUser.email || '',
        phone: sbUser.phone || '',
        name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'کاربر جدید',
        fullName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'کاربر جدید',
        avatar: sbUser.user_metadata?.avatar_url || '',
        points: 0,
        manaPoints: 0,
        level: 'جوانه',
        joinDate: sbUser.created_at || REFERENCE_DATE_STR,
        isAdmin: false,
        isGuardian: false,
        isGroveKeeper: false,
        addresses: [],
        notifications: [],
        timeline: [],
        purchasedCourseIds: [],
        conversations: [],
        unlockedTools: [],
        recentViews: [],
        messages: [],
        profileCompletion: { initial: false, additional: false, extra: false },
        reflectionAnalysesRemaining: 0,
        ambassadorPacksRemaining: 0
    } as User;
};
