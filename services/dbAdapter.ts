
import { supabase } from './supabaseClient';
import { User, Order, CommunityPost, AgentActionLog, Product } from '../types';
import { INITIAL_USERS, INITIAL_ORDERS, INITIAL_POSTS, INITIAL_PRODUCTS } from '../utils/dummyData';

// --- DB ADAPTER & REPOSITORY LAYER ---
// This layer isolates the UI from the Data Source.
// It automatically switches between Supabase (Real) and Dummy Data (Mock) based on configuration.

// Helper to check if string is a valid UUID (REMOVED: We now use Text IDs)
// const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Safe JSON parser
const safeParse = (data: any, fallback: any) => {
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch {
        return fallback;
    }
};

// Helper to map Supabase profile (snake_case) to App User (camelCase)
const mapProfileToUser = (profile: any): User => {
    const metadata = safeParse(profile.metadata, {});

    // Merge metadata with top-level columns
    // Priority: DB Columns > Metadata > Defaults
    return {
        ...metadata, // Spread metadata first so specific columns overwrite if needed
        id: profile.id,
        name: profile.full_name || metadata.name || 'کاربر',
        fullName: profile.full_name || metadata.fullName,
        email: profile.email,
        phone: profile.phone || '',
        avatar: profile.avatar_url || metadata.avatar,
        points: profile.points ?? 0,
        manaPoints: profile.mana_points ?? 0,
        level: profile.level || 'جوانه',
        isAdmin: profile.is_admin ?? false,
        isGuardian: profile.is_guardian ?? false,
        isGroveKeeper: profile.is_grove_keeper ?? false,
        joinDate: profile.created_at,

        // Ensure critical objects exist even if metadata is empty
        profileCompletion: metadata.profileCompletion || { initial: false, additional: false, extra: false },
        timeline: metadata.timeline || [],
        unlockedTools: metadata.unlockedTools || [],
        purchasedCourseIds: metadata.purchasedCourseIds || [],
    };
};

export const dbAdapter = {
    // Check if we are running on Supabase or Mock Data
    isLive(): boolean {
        return !!supabase;
    },

    // System Health Check
    async getSystemHealth(): Promise<{ status: string; scalabilityScore: number; issues: string[] }> {
        if (!this.isLive()) {
            return { status: 'Local Mock Mode', scalabilityScore: 0, issues: ['Running on local dummy data (No DB connection).'] };
        }
        try {
            // Lightweight check
            const { error } = await supabase!.from('profiles').select('id', { count: 'exact', head: true });
            if (error) throw error;
            return { status: 'Healthy (Connected)', scalabilityScore: 95, issues: [] };
        } catch (e: any) {
            console.error("DB Health Check Failed:", e);
            return { status: 'Connection Error', scalabilityScore: 0, issues: ['Database connection failed', e.message] };
        }
    },

    // --- USER METHODS ---

    async getUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<{ data: User[], total: number }> {
        if (!this.isLive()) {
            // Mock filtering
            const filtered = search
                ? INITIAL_USERS.filter(u => u.fullName?.includes(search) || u.name.includes(search))
                : INITIAL_USERS;
            return { data: filtered.slice(0, limit), total: filtered.length };
        }

        let query = supabase!.from('profiles').select('*', { count: 'exact' });
        if (search) query = query.ilike('full_name', `%${search}%`);

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await query.range(from, to);

        if (error) {
            console.error('DB Error (getUsers):', error.message);
            return { data: [], total: 0 };
        }

        return { data: (data || []).map(mapProfileToUser), total: count || 0 };
    },

    async getAllUsers(): Promise<User[]> {
        // In a real app with 10k users, you should NEVER call this without pagination.
        // For MVP/Admin dashboard, we limit it to 100 to prevent crashes.
        if (!this.isLive()) return INITIAL_USERS;
        const { data } = await this.getUsers(1, 100);
        return data;
    },

    async getUserById(id: string): Promise<User | null> {
        if (!this.isLive()) {
            return INITIAL_USERS.find(u => u.id === id) || null;
        }
        // If ID is not a UUID (e.g., mock IDs like 'user_1'), return mock data even if DB is connected
        // if (!isUUID(id)) return INITIAL_USERS.find(u => u.id === id) || null;

        const { data, error } = await supabase!.from('profiles').select('*').eq('id', id).single();
        if (error || !data) return null;
        return mapProfileToUser(data);
    },

    async saveUser(user: User): Promise<void> {
        if (!this.isLive()) {
            console.log("[Mock DB] User saved:", user.id);
            return;
        }

        // if (!isUUID(user.id)) return; // Skip saving mock users to real DB

        const profileData = {
            id: user.id,
            email: user.email,
            full_name: user.fullName || user.name,
            phone: user.phone,
            avatar_url: user.avatar,
            points: user.points,
            mana_points: user.manaPoints,
            level: user.level,
            isAdmin: user.isAdmin,
            isGuardian: user.isGuardian,
            isGroveKeeper: user.isGroveKeeper,
            // JSONB Metadata column for flexible schema
            metadata: {
                // ... map user fields to metadata if needed, but profileData covers main ones
                profileCompletion: user.profileCompletion,
                timeline: user.timeline ? user.timeline.slice(0, 50) : [],
                unlockedTools: user.unlockedTools,
                purchasedCourseIds: user.purchasedCourseIds,
                reflectionAnalysesRemaining: user.reflectionAnalysesRemaining,
                ambassadorPacksRemaining: user.ambassadorPacksRemaining,
                impactPortfolio: user.impactPortfolio,
                referralPointsEarned: user.referralPointsEarned,
                address: user.address,
                maritalStatus: user.maritalStatus,
                childrenCount: user.childrenCount,
                birthYear: user.birthYear,
                nationalId: user.nationalId,
                fatherName: user.fatherName,
                motherName: user.motherName,
                occupation: user.occupation,
                meaningCoachHistory: user.meaningCoachHistory,
                languageConfig: user.languageConfig
            }
        };

        const { error } = await supabase!.from('profiles').upsert(profileData);
        if (error) console.error('Error saving user to DB:', error.message);
    },

    // --- TRANSACTION METHODS ---

    async spendBarkatPoints(amount: number): Promise<boolean> {
        if (!this.isLive()) return true;

        // Use RPC (Remote Procedure Call) for atomic transactions if function exists
        // Otherwise, update via client (less secure but works for MVP)
        try {
            const { error } = await supabase!.rpc('spend_points', { amount });
            if (error) throw error;
            return true;
        } catch (e) {
            console.warn("RPC spend_points not found or failed, relying on client-side update via saveUser.");
            return true;
        }
    },

    async spendManaPoints(amount: number): Promise<boolean> {
        if (!this.isLive()) return true;

        try {
            const { error } = await supabase!.rpc('spend_mana', { amount });
            if (error) throw error;
            return true;
        } catch (e) {
            console.warn("RPC spend_mana not found or failed, relying on client-side update via saveUser.");
            return true;
        }
    },

    // --- ORDER METHODS ---

    async getOrders(userId?: string): Promise<Order[]> {
        if (!this.isLive()) return INITIAL_ORDERS;

        let query = supabase!.from('orders').select('*');

        if (userId) {
            if (userId.startsWith('user_')) return INITIAL_ORDERS.filter(o => o.userId === userId); // Mock user check
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
        if (error) {
            console.error("Error fetching orders:", error);
            return [];
        }

        return data.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            total: o.total_amount,
            status: o.status,
            items: safeParse(o.items, []),
            date: o.created_at,
            statusHistory: safeParse(o.status_history, [{ status: o.status, date: o.created_at }]),
            deeds: [] // Deeds usually fetched separately or joined
        }));
    },

    async getAllOrders(): Promise<Order[]> {
        return this.getOrders();
    },

    async saveOrder(order: Order): Promise<void> {
        if (!this.isLive()) return;
        // if (!isUUID(order.userId)) return;

        const orderData = {
            id: order.id, // (isUUID(order.id) ? order.id : undefined) -> Let DB handle ID or pass provided ID
            user_id: order.userId,
            total_amount: order.total,
            status: order.status,
            items: order.items, // Automatically stringified by Supabase client for JSONB
            status_history: order.statusHistory,
            created_at: order.date
        };

        const { error } = await supabase!.from('orders').insert(orderData);
        if (error) console.error('Error saving order:', error.message);
    },

    // --- CONTENT & COMMUNITY ---

    async getAllPosts(): Promise<CommunityPost[]> {
        if (!this.isLive()) return INITIAL_POSTS;

        const { data, error } = await supabase!
            .from('posts')
            .select(`*, profiles(full_name, avatar_url)`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error fetching posts:", error.message);
            return INITIAL_POSTS;
        }

        return data.map((p: any) => ({
            id: p.id,
            authorId: p.author_id,
            authorName: p.profiles?.full_name || 'کاربر ناشناس',
            authorAvatar: p.profiles?.avatar_url || '',
            text: p.content,
            likes: p.likes_count || 0,
            timestamp: p.created_at
        }));
    },

    async savePost(post: CommunityPost): Promise<void> {
        if (!this.isLive()) return;
        // if (!isUUID(post.authorId)) return;

        const postData = {
            id: post.id,
            author_id: post.authorId,
            content: post.text,
            likes_count: post.likes,
            created_at: post.timestamp
        };
        const { error } = await supabase!.from('posts').insert(postData);
        if (error) console.error("Error saving post:", error);
    },

    // --- PRODUCT MANAGEMENT ---

    async getAllProducts(): Promise<Product[]> {
        if (!this.isLive()) return INITIAL_PRODUCTS;

        const { data, error } = await supabase!
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return INITIAL_PRODUCTS;
        }

        return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            image: p.image_url, // Map from DB snake_case to App camelCase
            description: p.description,
            type: p.type || 'physical',
            stock: p.stock,
            points: p.points,
            popularity: p.popularity || 0,
            dateAdded: p.created_at,
            tags: p.tags || [],
            downloadUrl: p.download_url,
            fileType: p.file_type
        }));
    },

    async createProduct(product: Omit<Product, 'id' | 'dateAdded' | 'popularity'>): Promise<Product | null> {
        if (!this.isLive()) return null;

        // Generate ID here or let DB do it. For consistency with frontend mocks, we use a text ID if provided, or generate one.
        const newProduct = {
            name: product.name,
            price: product.price,
            category: product.category,
            image_url: product.image,
            description: product.description,
            type: product.type,
            stock: product.stock,
            points: product.points,
            tags: product.tags,
            download_url: product.downloadUrl,
            file_type: product.fileType
        };

        const { data, error } = await supabase!.from('products').insert(newProduct).select().single();

        if (error) {
            console.error("Error creating product:", error);
            throw error;
        }

        // Map back to App Type
        return {
            ...product,
            id: data.id,
            dateAdded: data.created_at,
            popularity: data.popularity,
            image: data.image_url
        };
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        if (!this.isLive()) return;

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.image) dbUpdates.image_url = updates.image;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.points !== undefined) dbUpdates.points = updates.points;
        if (updates.tags) dbUpdates.tags = updates.tags;
        if (updates.downloadUrl) dbUpdates.download_url = updates.downloadUrl;
        if (updates.fileType) dbUpdates.file_type = updates.fileType;

        const { error } = await supabase!.from('products').update(dbUpdates).eq('id', id);
        if (error) throw error;
    },

    async deleteProduct(id: string): Promise<void> {
        if (!this.isLive()) return;
        const { error } = await supabase!.from('products').delete().eq('id', id);
        if (error) throw error;
    },

    // --- AGENT LOGS ---
    // Stored in agent_tasks for consistency with SQL schema provided
    async getAgentLogs(): Promise<AgentActionLog[]> {
        if (!this.isLive()) {
            try {
                const stored = localStorage.getItem('nakhlestan_agent_logs');
                return stored ? JSON.parse(stored) : [];
            } catch { return []; }
        }

        const { data, error } = await supabase!
            .from('agent_tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) return [];

        return data.map((t: any) => ({
            id: t.id,
            action: t.type,
            details: typeof t.payload === 'string' ? t.payload : JSON.stringify(t.payload), // Map payload to details string for UI
            timestamp: t.created_at
        }));
    },

    async saveAgentLog(log: AgentActionLog): Promise<void> {
        // Mock storage
        const logs = await this.getAgentLogs();
        if (!this.isLive()) {
            logs.unshift(log);
            localStorage.setItem('nakhlestan_agent_logs', JSON.stringify(logs.slice(0, 50)));
            return;
        }

        // DB storage
        await supabase!.from('agent_tasks').insert({
            // id: log.id, // Let DB gen ID if needed, or pass if valid
            type: log.action,
            status: 'completed', // Logs are completed actions
            payload: { details: log.details },
            created_at: log.timestamp
        });
    },

    async spendAICredits(seconds: number): Promise<boolean> {
        if (!this.isLive()) return true;
        const userId = this.getCurrentUserId();
        if (!userId) return false;

        const user = await this.getUserById(userId);
        if (!user) return false;

        const currentSeconds = user.hoshmanaLiveAccess?.remainingSeconds || 0;
        const newSeconds = Math.max(0, currentSeconds - seconds);

        const metadata = {
            ...(user as any).metadata,
            hoshmanaLiveAccess: {
                ...(user.hoshmanaLiveAccess || {}),
                remainingSeconds: newSeconds
            }
        };

        const { error } = await supabase!.from('profiles').update({ metadata }).eq('id', userId);
        if (error) {
            console.error('Error deducting AI credits:', error.message);
            return false;
        }
        return true;
    },

    // --- LOCAL STORAGE HELPERS (Session Management) ---
    getCurrentUserId(): string | null {
        return localStorage.getItem('nakhlestan_current_user_id');
    },

    setCurrentUserId(id: string | null) {
        if (id) localStorage.setItem('nakhlestan_current_user_id', id);
        else localStorage.removeItem('nakhlestan_current_user_id');
    }
};
