
import { supabase } from './supabaseClient';
import { User, Order, CommunityPost, AgentActionLog } from '../types';
import { INITIAL_USERS, INITIAL_ORDERS, INITIAL_POSTS } from '../utils/dummyData';

// Helper to map Supabase profile to App User type
const mapProfileToUser = (profile: any): User => {
  // Safely parse metadata if it's a string (sometimes happens with JSONB in certain clients)
  const metadata = typeof profile.metadata === 'string' ? JSON.parse(profile.metadata) : (profile.metadata || {});

  return {
    id: profile.id,
    name: profile.full_name || 'کاربر',
    fullName: profile.full_name,
    email: profile.email,
    phone: profile.phone || '',
    avatar: profile.avatar_url,
    points: profile.points || 0,
    manaPoints: profile.mana_points || 0,
    level: profile.level || 'جوانه',
    isAdmin: profile.is_admin,
    isGuardian: profile.is_guardian,
    isGroveKeeper: profile.is_grove_keeper,
    joinDate: profile.created_at,
    // Load extra data from metadata JSONB column with defaults
    profileCompletion: metadata.profileCompletion || { initial: false, additional: false, extra: false },
    timeline: metadata.timeline || [],
    unlockedTools: metadata.unlockedTools || [],
    purchasedCourseIds: metadata.purchasedCourseIds || [],
    conversations: [], // Not persisted in profile yet
    notifications: [], // Not persisted in profile yet
    reflectionAnalysesRemaining: metadata.reflectionAnalysesRemaining || 0,
    ambassadorPacksRemaining: metadata.ambassadorPacksRemaining || 0,
    impactPortfolio: metadata.impactPortfolio || [],
    referralPointsEarned: metadata.referralPointsEarned || 0,
  };
};

export const dbAdapter = {
    // --- SYSTEM HEALTH CHECK ---
    async getSystemHealth(): Promise<{ status: string; scalabilityScore: number; issues: string[] }> {
        if (!supabase) {
            return { status: 'Local Mode', scalabilityScore: 0, issues: ['Supabase keys missing. Using local data.'] };
        }
        try {
            const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            if (error) throw error;
            return { status: 'Healthy', scalabilityScore: 95, issues: [] };
        } catch (e: any) {
            return { status: 'Connection Error', scalabilityScore: 50, issues: ['Database connection failed: ' + e.message] };
        }
    },

    // --- USERS ---
    async getUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<{ data: User[], total: number }> {
        if (!supabase) return { data: INITIAL_USERS, total: INITIAL_USERS.length };

        let query = supabase.from('profiles').select('*', { count: 'exact' });
        if (search) query = query.ilike('full_name', `%${search}%`);
        
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        const { data, error, count } = await query.range(from, to);
        if (error) {
            console.error('Error fetching users:', error);
            return { data: INITIAL_USERS, total: INITIAL_USERS.length }; // Fallback
        }

        const users = data.map(mapProfileToUser);
        return { data: users, total: count || 0 };
    },

    async getAllUsers(): Promise<User[]> {
        const { data } = await this.getUsers(1, 1000);
        if (data.length === 0) return INITIAL_USERS;
        return data;
    },

    async getUserById(id: string): Promise<User | null> {
        if (!supabase) return null;
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error || !data) return null;
        return mapProfileToUser(data);
    },

    async saveUser(user: User): Promise<void> {
        if (!supabase) return;
        
        // Separate top-level columns from JSON metadata
        const profileData = {
            id: user.id,
            email: user.email,
            full_name: user.fullName || user.name,
            phone: user.phone,
            avatar_url: user.avatar,
            points: user.points,
            mana_points: user.manaPoints,
            level: user.level,
            is_admin: user.isAdmin,
            is_guardian: user.isGuardian,
            is_grove_keeper: user.isGroveKeeper,
            metadata: {
                profileCompletion: user.profileCompletion,
                timeline: user.timeline,
                unlockedTools: user.unlockedTools,
                purchasedCourseIds: user.purchasedCourseIds,
                reflectionAnalysesRemaining: user.reflectionAnalysesRemaining,
                ambassadorPacksRemaining: user.ambassadorPacksRemaining,
                impactPortfolio: user.impactPortfolio,
                referralPointsEarned: user.referralPointsEarned,
                // Add other non-column fields here
            }
        };

        const { error } = await supabase.from('profiles').upsert(profileData);
        if (error) console.error('Error saving user to DB:', error);
    },

    // --- ORDERS ---
    async getOrders(userId?: string): Promise<Order[]> {
         if (!supabase) return INITIAL_ORDERS;
         
         let query = supabase.from('orders').select('*');
         if (userId) query = query.eq('user_id', userId);
         
         const { data, error } = await query.order('created_at', { ascending: false });
         if (error) return INITIAL_ORDERS;
         
         return data.map((o: any) => ({
             id: o.id,
             userId: o.user_id,
             total: o.total_amount,
             status: o.status,
             items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items || [],
             date: o.created_at,
             statusHistory: [{ status: o.status, date: o.created_at }],
             deeds: [] // We could load deeds separately if needed
         }));
    },

    async getAllOrders(): Promise<Order[]> {
        return this.getOrders();
    },

    async saveOrder(order: Order): Promise<void> {
        if (!supabase) return;
        const orderData = {
            id: order.id,
            user_id: order.userId,
            total_amount: order.total,
            status: order.status,
            items: order.items, // Supabase handles JSON array automatically
            created_at: order.date
        };
        const { error } = await supabase.from('orders').insert(orderData);
        if (error) console.error('Error saving order:', error);
    },

    // --- POSTS ---
    async getAllPosts(): Promise<CommunityPost[]> {
        if (!supabase) return INITIAL_POSTS;
        
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles(full_name, avatar_url)`)
            .order('created_at', { ascending: false });
            
        if (error) return INITIAL_POSTS;

        return data.map((p: any) => ({
            id: p.id,
            authorId: p.author_id,
            authorName: p.profiles?.full_name || 'کاربر نخلستان',
            authorAvatar: p.profiles?.avatar_url || '',
            text: p.content,
            likes: p.likes_count || 0,
            timestamp: p.created_at
        }));
    },

    async savePost(post: CommunityPost): Promise<void> {
        if (!supabase) return;
        const postData = {
            id: post.id,
            author_id: post.authorId,
            content: post.text,
            likes_count: post.likes,
            created_at: post.timestamp
        };
        await supabase.from('posts').insert(postData);
    },

    // --- AGENT LOGS (Local for now, or could use a table) ---
    async getAgentLogs(): Promise<AgentActionLog[]> {
        try {
            const stored = localStorage.getItem('nakhlestan_agent_logs');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    },

    async saveAgentLog(log: AgentActionLog): Promise<void> {
        const logs = await this.getAgentLogs();
        logs.unshift(log);
        localStorage.setItem('nakhlestan_agent_logs', JSON.stringify(logs.slice(0, 50)));
    },

    // --- SESSION ---
    getCurrentUserId(): string | null {
        return localStorage.getItem('nakhlestan_current_user_id');
    },

    setCurrentUserId(id: string | null) {
        if (id) localStorage.setItem('nakhlestan_current_user_id', id);
        else localStorage.removeItem('nakhlestan_current_user_id');
    }
};
