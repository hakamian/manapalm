
import { supabase } from '../infrastructure/supabase';
import { User, Order, CommunityPost, AgentActionLog, Product } from '../../types';
import { INITIAL_USERS, INITIAL_ORDERS, INITIAL_POSTS, INITIAL_PRODUCTS } from '../../utils/dummyData';

// --- DB ADAPTER & REPOSITORY LAYER ---
// This layer isolates the UI from the Data Source.

const safeParse = (data: any, fallback: any) => {
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch {
        return fallback;
    }
};

const mapProfileToUser = (profile: any): User => {
    const metadata = safeParse(profile.metadata, {});
    return {
        ...metadata,
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
        profileCompletion: metadata.profileCompletion || { initial: false, additional: false, extra: false },
        timeline: metadata.timeline || [],
        unlockedTools: metadata.unlockedTools || [],
        purchasedCourseIds: metadata.purchasedCourseIds || [],
    };
};

export const dbAdapter = {
    isLive(): boolean {
        return !!supabase;
    },

    async getSystemHealth(): Promise<{ status: string; scalabilityScore: number; issues: string[] }> {
        if (!this.isLive()) {
            return { status: 'Local Mock Mode', scalabilityScore: 0, issues: ['Running on local dummy data (No DB connection).'] };
        }
        try {
            // Optimization: Just check for connectivity, don't count all rows.
            const { error } = await supabase!.from('products').select('id').limit(1).maybeSingle();
            if (error) throw error;
            return { status: 'Healthy (Connected)', scalabilityScore: 95, issues: [] };
        } catch (e: any) {
            console.error("DB Health Check Failed:", e);
            return { status: 'Connection Error', scalabilityScore: 0, issues: ['Database connection failed', e.message] };
        }
    },

    async getUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<{ data: User[], total: number }> {
        if (!this.isLive()) {
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
        if (!this.isLive()) return INITIAL_USERS;
        const { data } = await this.getUsers(1, 100);
        return data;
    },

    async getUserById(id: string): Promise<User | null> {
        if (!this.isLive()) {
            return INITIAL_USERS.find(u => u.id === id) || null;
        }

        const { data, error } = await supabase!.from('profiles').select('*').eq('id', id).single();
        if (error || !data) return null;
        return mapProfileToUser(data);
    },

    async saveUser(user: User): Promise<void> {
        if (!this.isLive()) {
            console.log("[Mock DB] User saved:", user.id);
            return;
        }

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
            metadata: {
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

    async spendBarkatPoints(amount: number): Promise<boolean> {
        if (!this.isLive()) return true;
        try {
            const { error } = await supabase!.rpc('spend_points', { amount });
            if (error) throw error;
            return true;
        } catch (e) {
            console.warn("RPC spend_points failed.");
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
            console.warn("RPC spend_mana failed.");
            return true;
        }
    },

    async getOrders(userId?: string): Promise<Order[]> {
        if (!this.isLive()) return INITIAL_ORDERS;

        let query = supabase!.from('orders').select('*');

        if (userId) {
            if (userId.startsWith('user_')) return INITIAL_ORDERS.filter(o => o.userId === userId);
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
            totalAmount: o.total_amount,
            total: o.total_amount,
            status: o.status,
            items: safeParse(o.items, []),
            createdAt: o.created_at,
            date: o.created_at,
            statusHistory: safeParse(o.status_history, [{ status: o.status, date: o.created_at }]),
            deeds: []
        }));
    },

    async getAllOrders(): Promise<Order[]> {
        return this.getOrders();
    },

    async saveOrder(order: Order): Promise<void> {
        if (!this.isLive()) return;

        const orderData = {
            id: order.id,
            user_id: order.userId,
            total_amount: order.total,
            status: order.status,
            items: order.items,
            status_history: order.statusHistory,
            created_at: order.date
        };

        const { error } = await supabase!.from('orders').insert(orderData);
        if (error) console.error('Error saving order:', error.message);
    },

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

    async getAllProducts(): Promise<Product[]> {
        if (!this.isLive()) {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('nakhlestan_local_products');
                if (stored) {
                    try {
                        const localProducts = JSON.parse(stored);
                        // Merge initial products with local changes if needed, or just return local if it bootstraps from initial
                        // Strategy: Local storage acts as the "live" DB in mock mode.
                        // If local is empty, we initialize it? No, getAllProducts just returns what's there.
                        // But we want to see INITIAL_PRODUCTS too.
                        // Let's assume nakhlestan_local_products contains ALL products (initial + added).
                        // If it doesn't exist, we return INITIAL_PRODUCTS.
                        return localProducts;
                    } catch (e) {
                        console.error("Error parsing local products", e);
                    }
                }
                // Initialize local storage with initial products for first run
                const initial = INITIAL_PRODUCTS.map(p => ({
                    ...p,
                    isActive: p.isActive ?? true,
                    description: p.description || '',
                    stock: p.stock || 0
                }));
                // Don't write to localStorage here to avoid side-effects in getters, 
                // but returning INITIAL_PRODUCTS is safe.
                return initial as Product[];
            }
            return INITIAL_PRODUCTS;
        }

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
            image: p.image_url,
            description: p.description,
            type: p.type || 'physical',
            stock: p.stock,
            points: p.points,
            popularity: p.popularity || 0,
            dateAdded: p.created_at,
            tags: p.tags || [],
            downloadUrl: p.download_url,
            fileType: p.file_type,
            isActive: p.is_active ?? true
        }));
    },

    async createProduct(product: Omit<Product, 'id' | 'dateAdded' | 'popularity'>): Promise<Product | null> {
        if (!this.isLive()) {
            // Local Storage Persistence
            if (typeof localStorage === 'undefined') return null;

            const allProducts = await this.getAllProducts();
            const newId = `p_local_${Date.now()}`;
            const newProduct: Product = {
                ...product,
                id: newId,
                dateAdded: new Date().toISOString(),
                popularity: 0,
                isActive: true,
                tags: product.tags || []
            };

            const updatedList = [newProduct, ...allProducts];
            localStorage.setItem('nakhlestan_local_products', JSON.stringify(updatedList));
            return newProduct;
        }

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

        return {
            ...product,
            id: data.id,
            dateAdded: data.created_at,
            popularity: data.popularity,
            image: data.image_url
        };
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        if (!this.isLive()) {
            if (typeof localStorage === 'undefined') return;
            const allProducts = await this.getAllProducts();
            const updatedList = allProducts.map(p => p.id === id ? { ...p, ...updates } : p);
            localStorage.setItem('nakhlestan_local_products', JSON.stringify(updatedList));
            return;
        }
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
        if (!this.isLive()) {
            if (typeof localStorage === 'undefined') return;
            const allProducts = await this.getAllProducts();
            const updatedList = allProducts.filter(p => p.id !== id);
            localStorage.setItem('nakhlestan_local_products', JSON.stringify(updatedList));
            return;
        }
        const { error } = await supabase!.from('products').delete().eq('id', id);
        if (error) throw error;
    },

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
            details: typeof t.payload === 'string' ? t.payload : JSON.stringify(t.payload),
            timestamp: t.created_at
        }));
    },

    async saveAgentLog(log: AgentActionLog): Promise<void> {
        if (!this.isLive()) {
            const logs = await this.getAgentLogs();
            logs.unshift(log);
            localStorage.setItem('nakhlestan_agent_logs', JSON.stringify(logs.slice(0, 50)));
            return;
        }

        await supabase!.from('agent_tasks').insert({
            type: log.action,
            status: 'completed',
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
        if (error) return false;
        return true;
    },

    getCurrentUserId(): string | null {
        return localStorage.getItem('nakhlestan_current_user_id');
    },

    setCurrentUserId(id: string | null) {
        if (id) localStorage.setItem('nakhlestan_current_user_id', id);
        else localStorage.removeItem('nakhlestan_current_user_id');
    }
};
