
import { supabase } from '../infrastructure/supabase';
import { User, Order, CommunityPost, AgentActionLog, Product } from '../../types';
import { INITIAL_USERS, INITIAL_ORDERS, INITIAL_POSTS, INITIAL_PRODUCTS } from '../../utils/dummyData';

// --- DB ADAPTER & REPOSITORY LAYER ---
// This layer isolates the UI from the Data Source.

const safeParse = (data: any, fallback: any) => {
    if (data && typeof data === 'object') return data;
    if (typeof data === 'string' && data.trim() !== '') {
        try {
            return JSON.parse(data);
        } catch {
            return fallback;
        }
    }
    return fallback;
};

// 🛡️ Helper to prevent hanging database calls
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
    let timeoutHandle: any;
    const timeoutPromise = new Promise<T>((resolve) => {
        timeoutHandle = setTimeout(() => {
            console.warn(`⏳ [DB Timeout] Operation exceeded ${timeoutMs}ms. Using fallback.`);
            resolve(fallback);
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        return result;
    } catch (err) {
        clearTimeout(timeoutHandle);
        console.error("❌ [DB Error]", err);
        return fallback;
    }
};

const mapProfileToUser = (profile: any): User => {
    const rawMetadata = profile.metadata;
    let metadata = {};

    if (rawMetadata) {
        if (typeof rawMetadata === 'object') {
            metadata = rawMetadata;
        } else if (typeof rawMetadata === 'string') {
            try {
                metadata = JSON.parse(rawMetadata);
            } catch (e) {
                console.error("❌ Failed to parse metadata string:", rawMetadata);
            }
        }
    }

    let addresses = (metadata as any)?.addresses || [];

    // 🛡️ RECOVERY: If server returns empty addresses but we have a local backup, use the backup.
    // This prevents addresses from disappearing during hydration or sync delays.
    if (addresses.length === 0 && typeof localStorage !== 'undefined') {
        try {
            const localBackup = JSON.parse(localStorage.getItem(`user_backup_${profile.id}`) || 'null');
            if (localBackup && localBackup.addresses && localBackup.addresses.length > 0) {
                console.log(`📡 [DB] Recovered ${localBackup.addresses.length} addresses from LocalStorage for ${profile.id}`);
                addresses = localBackup.addresses;
            }
        } catch (e) {
            console.error("❌ Failed to recover addresses from backup", e);
        }
    }

    return {
        id: profile.id,
        name: profile.full_name || (metadata as any)?.name || 'کاربر',
        fullName: profile.full_name || (metadata as any)?.fullName,
        email: profile.email,
        phone: profile.phone || '',
        avatar: profile.avatar_url || (metadata as any)?.avatar,
        points: profile.points ?? 0,
        manaPoints: profile.mana_points ?? 0,
        level: profile.level || 'جوانه',
        isAdmin: profile.is_admin ?? false,
        isGuardian: profile.is_guardian ?? false,
        isGroveKeeper: profile.is_grove_keeper ?? false,
        joinDate: profile.created_at,

        ...metadata,

        addresses: addresses,
        profileCompletion: (metadata as any)?.profileCompletion || { initial: false, additional: false, extra: false },
        timeline: (metadata as any)?.timeline || [],
        unlockedTools: (metadata as any)?.unlockedTools || [],
        purchasedCourseIds: (metadata as any)?.purchasedCourseIds || [],
        messages: (metadata as any)?.messages || [],
        recentViews: (metadata as any)?.recentViews || [],

        // 🛡️ Mapped missing mandatory fields to prevent hydration failure
        conversations: (metadata as any)?.conversations || [],
        notifications: (metadata as any)?.notifications || [],
        reflectionAnalysesRemaining: (metadata as any)?.reflectionAnalysesRemaining || 0,
        ambassadorPacksRemaining: (metadata as any)?.ambassadorPacksRemaining || 0,
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
        // 🧪 Handle Test/Mock IDs: Check LocalStorage backup FIRST, then fallback to INITIAL_USERS
        if (id && (id === 'user_test_manapalm' || id === 'user_admin_hh' || id.startsWith('user_gen_'))) {
            if (typeof localStorage !== 'undefined') {
                const localBackup = localStorage.getItem(`user_backup_${id}`);
                if (localBackup) {
                    try {
                        console.log("💾 [DB] Loading Mock User from LocalStorage backup:", id);
                        return JSON.parse(localBackup);
                    } catch (e) {
                        console.error("❌ Failed to parse mock user backup", e);
                    }
                }
            }
            const mockUser = INITIAL_USERS.find(u => u.id === id);
            if (mockUser) return mockUser;
        }

        if (!this.isLive()) {
            return INITIAL_USERS.find(u => u.id === id) || null;
        }

        const fetchUser = async () => {
            console.log("🔍 [DB StallTrace] Starting getUserById for:", id);
            try {
                const { data, error } = await supabase!
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (error) {
                    console.error("❌ [DB StallTrace] Error in getUserById:", error.message);
                    return null;
                }

                if (!data) {
                    // Fallback to initial users if not found in DB (e.g. migration period)
                    const fallback = INITIAL_USERS.find(u => u.id === id);
                    if (fallback) return fallback;

                    console.log("⚠️ [DB StallTrace] User profile not found in DB or Initial data for:", id);
                    return null;
                }

                const user = mapProfileToUser(data);
                console.log("📥 [DB StallTrace] Profile hydrated successfully:", user.id);
                return user;
            } catch (err: any) {
                console.error("❌ [DB StallTrace] getUserById failed:", err.message);
                return null;
            }
        };

        return withTimeout(fetchUser(), 12000, null);
    },

    async saveUser(user: User): Promise<User | null> {
        if (!this.isLive()) {
            console.log("[Mock DB] User saved:", user.id);
            return user;
        }

        if (user.id.startsWith('user_') && typeof localStorage !== 'undefined' && localStorage.getItem('supabase.auth.token')) {
            console.warn("⚠️ Blocked save of temporary user over active session:", user.id);
            return null;
        }

        try {
            const userId = user.id;
            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            console.log('📤 [Client Auth] Checking Session for User:', userId);

            if (!token) {
                console.warn('⚠️ [Client Auth] No token found. Saving to LocalStorage fallback.');
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('nakhlestan_current_user_id', user.id);
                    localStorage.setItem(`user_backup_${user.id}`, JSON.stringify(user));
                }
                return user;
            }

            console.log('✅ [Client Auth] Token found, sending request...');

            const response = await fetch('/api/update-user-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Mana-Token': token
                },
                body: JSON.stringify({ user })
            });

            const result = await response.json();

            if (result.success) {
                console.log("✅ User successfully saved via Server API", result.debug || '');

                // 🛡️ Map the result from DB back to User type
                const savedUser = mapProfileToUser(result.user);

                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('nakhlestan_current_user_id', savedUser.id);
                    localStorage.setItem(`user_backup_${savedUser.id}`, JSON.stringify(savedUser));
                }
                return savedUser;
            } else {
                console.error('❌ Server API Error:', result.error || 'Unknown error');
                return null;
            }
        } catch (e: any) {
            console.error('❌ Critical Error in saveUser:', e.message);
            return null;
        }
    },

    async spendBarkatPoints(amount: number): Promise<boolean> {
        if (!this.isLive()) return true;

        const { data: { session } } = await supabase!.auth.getSession();
        if (!session?.access_token) {
            console.log("ℹ️ [Client Auth] Dummy user: Skipping remote point sync.");
            return true;
        }

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

        const { data: { session } } = await supabase!.auth.getSession();
        if (!session?.access_token) {
            console.log("ℹ️ [Client Auth] Dummy user: Skipping remote mana sync.");
            return true;
        }

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
            deliveryType: o.delivery_type || 'digital',
            physicalAddress: safeParse(o.physical_address, null),
            digitalAddress: safeParse(o.digital_address, null),
            createdAt: o.created_at,
            date: o.created_at,
            statusHistory: safeParse(o.status_history, [{ status: o.status, date: o.created_at }]),
            deeds: safeParse(o.deeds, [])
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
            deeds: order.deeds || [],
            created_at: order.date,
            updated_at: new Date().toISOString()
        };

        const { error: orderError } = await supabase!.from('orders').upsert(orderData);
        if (orderError) {
            console.error('Error saving order:', orderError.message);
            return;
        }

        // 🛡️ Also save to normalized order_items table for reporting
        if (order.items && order.items.length > 0) {
            const itemsToInsert = order.items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price,
                created_at: new Date().toISOString()
            }));

            const { error: itemsError } = await supabase!.from('order_items').insert(itemsToInsert);
            if (itemsError) console.warn('Warning: Could not save order_items (Non-critical):', itemsError.message);
        }
    },

    async updateOrderStatus(orderId: string, status: string, refId?: string): Promise<void> {
        if (!this.isLive()) return;

        const { data: order } = await supabase!.from('orders').select('status_history').eq('id', orderId).single();
        const currentHistory = safeParse(order?.status_history, []);

        const newHistory = [...currentHistory, { status, date: new Date().toISOString(), refId }];

        const updateData: any = {
            status: status,
            status_history: newHistory
        };

        const { error } = await supabase!.from('orders').update(updateData).eq('id', orderId);
        if (error) console.error('Error updating order status:', error.message);
    },

    // --- NEW E-COMMERCE METHODS (NORMALIZED) ---

    /**
     * Finalizes a checkout by creating an order and its constituent items.
     * This follows the new normalized schema with order_items table.
     */
    async processCheckout(userId: string, cartItems: any[]) {
        if (!this.isLive()) return { success: false, error: 'Database disconnected' };

        try {
            // 1. Create the main Order record
            const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const { data: order, error: orderErr } = await supabase!
                .from('orders')
                .insert({
                    user_id: userId,
                    total_amount: total,
                    status: 'pending',
                    items: cartItems // Keep items JSON for legacy compatibility
                })
                .select()
                .single();

            if (orderErr) throw orderErr;

            // 2. Insert into Order_Items table (Normalized)
            const itemsToInsert = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }));

            const { error: itemsErr } = await supabase!
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsErr) throw itemsErr;

            // 3. Clear User's Persistent Cart
            await supabase!.from('cart').delete().eq('user_id', userId);

            return { success: true, orderId: order.id };
        } catch (err: any) {
            console.error("❌ Checkout Failed:", err.message);
            return { success: false, error: err.message };
        }
    },

    /**
     * Synchronizes a single item in the persistent user cart.
     */
    async syncCartItem(userId: string, productId: string, quantity: number) {
        if (!this.isLive()) return;
        try {
            if (quantity <= 0) {
                await supabase!.from('cart').delete().match({ user_id: userId, product_id: productId });
            } else {
                await supabase!.from('cart').upsert({
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity
                });
            }
        } catch (e) {
            console.warn("Cart Sync Failed:", e);
        }
    },

    /**
     * Fetches the persistent cart for a user.
     */
    async getPersistentCart(userId: string) {
        if (!this.isLive()) return [];
        const { data, error } = await supabase!
            .from('cart')
            .select(`
                quantity,
                products (*)
            `)
            .eq('user_id', userId);

        if (error) return [];
        return (data || []).map((c: any) => ({
            ...c.products,
            quantity: c.quantity
        }));
    },

    async getAllPosts(): Promise<CommunityPost[]> {
        if (!this.isLive()) return INITIAL_POSTS;

        const fetchPosts = async () => {
            const { data, error } = await supabase!
                .from('posts')
                .select(`*, profiles(full_name, avatar_url)`)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return (data || []).map((p: any) => ({
                id: p.id,
                authorId: p.author_id,
                authorName: p.profiles?.full_name || 'کاربر ناشناس',
                authorAvatar: p.profiles?.avatar_url || '',
                text: p.content,
                likes: p.likes_count || 0,
                timestamp: p.created_at
            }));
        };

        return withTimeout(fetchPosts(), 4000, INITIAL_POSTS);
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
        if (!this.isLive()) return INITIAL_PRODUCTS;

        const fetchProducts = async () => {
            const { data, error } = await supabase!
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            return (data || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                image: p.image_url,
                description: p.description,
                type: p.type || 'physical',
                stock: p.stock ?? 0,
                points: p.points ?? 0,
                popularity: p.popularity || 0,
                dateAdded: p.created_at,
                tags: p.tags || [],
                downloadUrl: p.download_url,
                fileType: p.file_type,
                isActive: p.is_active ?? true
            }));
        };

        const dbProducts = await withTimeout(fetchProducts(), 4000, []);

        // Merge with initial for robust display
        const merged = [...INITIAL_PRODUCTS.map(p => ({ ...p, isActive: true }))];
        dbProducts.forEach(dbP => {
            const index = merged.findIndex(p => p.id === dbP.id);
            if (index > -1) merged[index] = dbP;
            else merged.unshift(dbP);
        });

        return merged as Product[];
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

        // Use API route with service role key for reliable writes
        console.log("🔄 Creating product via API:", product.name);

        try {
            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/update-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ action: 'create', product })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("❌ API Error:", result.error);
                throw new Error(result.error);
            }

            console.log("✅ Product created successfully:", result.product?.id);
            return {
                ...product,
                id: result.product.id,
                dateAdded: result.product.created_at,
                popularity: result.product.popularity || 0,
                image: result.product.image_url
            };
        } catch (error) {
            console.error("❌ Failed to create product:", error);
            throw error;
        }
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        if (!this.isLive()) {
            if (typeof localStorage === 'undefined') return;
            const allProducts = await this.getAllProducts();
            const updatedList = allProducts.map(p => p.id === id ? { ...p, ...updates } : p);
            localStorage.setItem('nakhlestan_local_products', JSON.stringify(updatedList));
            return;
        }

        // Use API route with service role key for reliable writes
        console.log("🔄 Updating product via API:", { id, updates });

        try {
            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/update-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ id, updates })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("❌ API Error:", result.error);
                throw new Error(result.error);
            }

            console.log("✅ Product updated successfully:", id);
        } catch (error) {
            console.error("❌ Failed to update product:", error);
            throw error;
        }
    },

    async deleteProduct(id: string): Promise<void> {
        if (!this.isLive()) {
            if (typeof localStorage === 'undefined') return;
            const allProducts = await this.getAllProducts();
            const updatedList = allProducts.filter(p => p.id !== id);
            localStorage.setItem('nakhlestan_local_products', JSON.stringify(updatedList));
            return;
        }

        // Use API route with service role key for reliable writes
        console.log("🔄 Deleting product via API:", id);

        try {
            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/update-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ action: 'delete', id })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("❌ API Error:", result.error);
                throw new Error(result.error);
            }

            console.log("✅ Product deleted successfully:", id);
        } catch (error) {
            console.error("❌ Failed to delete product:", error);
            throw error;
        }
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

    async signOut() {
        console.log("🚪 Logging out: Clearing sessions and tokens...");
        if (supabase) {
            try {
                // Use global scope to sign out from all devices/sessions
                await supabase.auth.signOut({ scope: 'global' });
            } catch (e) {
                console.error("Supabase signOut error:", e);
            }
        }

        this.setCurrentUserId(null);
        if (typeof window !== 'undefined') {
            // Hard clear all potential auth and app keys
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('nakhlestan_current_user_id');

            // Clear any backup keys and supabase internal storage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('user_backup_') || key.toLowerCase().includes('supabase') || key.includes('sb-')) {
                    localStorage.removeItem(key);
                }
            });

            // Clear cookies
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // Also clear session storage
            sessionStorage.clear();
        }
    },

    getCurrentUserId(): string | null {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem('nakhlestan_current_user_id');
    },

    setCurrentUserId(id: string | null) {
        if (typeof localStorage === 'undefined') return;
        if (id) localStorage.setItem('nakhlestan_current_user_id', id);
        else localStorage.removeItem('nakhlestan_current_user_id');
    }
};