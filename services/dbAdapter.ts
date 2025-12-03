
import { supabase } from './supabaseClient';
import { User, Order, CommunityPost, AgentActionLog } from '../types';
import { INITIAL_USERS, INITIAL_ORDERS, INITIAL_POSTS } from '../utils/dummyData';

const STORAGE_KEYS = {
    USERS: 'nakhlestan_users',
    ORDERS: 'nakhlestan_orders',
    POSTS: 'nakhlestan_posts',
    CURRENT_USER_ID: 'nakhlestan_current_user_id',
    AGENT_LOGS: 'nakhlestan_agent_logs',
};

// --- Helper for Local Storage (Simulating Database) ---
const loadLocal = <T>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
        console.error(`Error loading ${key} from local storage`, e);
        return fallback;
    }
};

const saveLocal = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving ${key} to local storage`, e);
    }
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dbAdapter = {
    // --- SYSTEM HEALTH CHECK (ENGINEERING AUDIT) ---
    async getSystemHealth(): Promise<{ status: string; scalabilityScore: number; issues: string[] }> {
        const issues: string[] = [];
        let score = 100;

        // Check Database Connection
        if (!supabase) {
            score -= 40;
            issues.push("CRITICAL: دیتابیس ابری (Supabase) متصل نیست. سیستم روی حافظه موقت مرورگر اجرا می‌شود.");
            issues.push("RISK: پاک شدن کوکی‌های مرورگر منجر به از دست رفتن تمام اطلاعات کاربران می‌شود.");
        } else {
             // Mock checking connection
             try {
                 const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
                 if (error) throw error;
             } catch (e) {
                 score -= 20;
                 issues.push("WARNING: اتصال به دیتابیس ابری ناپایدار است.");
             }
        }

        // Check Local Storage Limits
        const storageUsage = JSON.stringify(localStorage).length;
        if (storageUsage > 4 * 1024 * 1024) { // > 4MB
            score -= 30;
            issues.push("CRITICAL: حافظه لوکال در حال پر شدن است. اپلیکیشن به زودی کرش می‌کند.");
        }

        // Architecture Check
        issues.push("INFO: معماری فعلی (Client-Side Rendering) برای SEO و سرعت در مقیاس میلیونی بهینه نیست.");

        return {
            status: score > 80 ? 'Healthy' : score > 50 ? 'At Risk' : 'Critical',
            scalabilityScore: score,
            issues
        };
    },

    // --- USERS ---
    async getUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<{ data: User[], total: number }> {
        if (supabase) {
            let query = supabase.from('users').select('*', { count: 'exact' });
            if (search) query = query.ilike('fullName', `%${search}%`);
            
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            
            const { data, error, count } = await query.range(from, to);
            if (!error && data) return { data: data as User[], total: count || 0 };
        }
        
        // Local Mock with Pagination
        await delay(100); // Simulate latency
        let users = loadLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
        
        if (search) {
            const lowerSearch = search.toLowerCase();
            users = users.filter(u => 
                (u.fullName?.toLowerCase().includes(lowerSearch)) || 
                (u.phone?.includes(lowerSearch))
            );
        }
        
        const total = users.length;
        const start = (page - 1) * limit;
        const paginatedUsers = users.slice(start, start + limit);
        
        return { data: paginatedUsers, total };
    },

    // Keep for backward compatibility but warn
    async getAllUsers(): Promise<User[]> {
        // console.warn("Performance Warning: getAllUsers called. Use getUsers with pagination.");
        return this.getUsers(1, 1000).then(r => r.data);
    },

    async getUserById(id: string): Promise<User | null> {
        if (supabase) {
            const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
            if (!error) return data as User;
        }
        const users = loadLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
        return users.find(u => u.id === id) || null;
    },

    async saveUser(user: User): Promise<void> {
        if (supabase) {
             await supabase.from('users').upsert(user);
        }
        const users = loadLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) {
            users[index] = user;
        } else {
            users.push(user);
        }
        saveLocal(STORAGE_KEYS.USERS, users);
        
        const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
        // Assuming session sync might happen here
    },

    // --- ORDERS ---
    async getOrders(userId?: string): Promise<Order[]> {
         if (supabase) {
            let query = supabase.from('orders').select('*');
            if (userId) query = query.eq('userId', userId);
            const { data, error } = await query;
            if (!error && data) return data as Order[];
        }
        
        const orders = loadLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
        if (userId) {
            return orders.filter(o => o.userId === userId);
        }
        return orders;
    },

    // Compatibility alias
    async getAllOrders(): Promise<Order[]> {
        return this.getOrders();
    },

    async saveOrder(order: Order): Promise<void> {
        if (supabase) {
            await supabase.from('orders').insert(order);
        }
        const orders = loadLocal<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
        orders.push(order);
        saveLocal(STORAGE_KEYS.ORDERS, orders);
    },

    // --- POSTS ---
    async getPosts(page: number = 1, limit: number = 10): Promise<CommunityPost[]> {
        if (supabase) {
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            const { data, error } = await supabase.from('posts').select('*').order('timestamp', { ascending: false }).range(from, to);
            if (!error && data) return data as CommunityPost[];
        }
        
        const posts = loadLocal<CommunityPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
        const start = (page - 1) * limit;
        return posts.slice(start, start + limit);
    },

    // Compatibility
    async getAllPosts(): Promise<CommunityPost[]> {
        return this.getPosts(1, 50);
    },

    async savePost(post: CommunityPost): Promise<void> {
        if (supabase) {
             await supabase.from('posts').insert(post);
        }
        const posts = loadLocal<CommunityPost[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
        posts.unshift(post); 
        saveLocal(STORAGE_KEYS.POSTS, posts);
    },

    // --- AGENT LOGS ---
    async getAgentLogs(): Promise<AgentActionLog[]> {
        if (supabase) {
            const { data, error } = await supabase.from('agent_logs').select('*').order('timestamp', { ascending: false }).limit(50);
            if (!error && data) return data as AgentActionLog[];
        }
        return loadLocal<AgentActionLog[]>(STORAGE_KEYS.AGENT_LOGS, []);
    },

    async saveAgentLog(log: AgentActionLog): Promise<void> {
        if (supabase) {
             await supabase.from('agent_logs').insert(log);
        }
        const logs = loadLocal<AgentActionLog[]>(STORAGE_KEYS.AGENT_LOGS, []);
        logs.unshift(log);
        if (logs.length > 50) logs.pop();
        saveLocal(STORAGE_KEYS.AGENT_LOGS, logs);
    },

    // --- SESSION ---
    getCurrentUserId(): string | null {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    },

    setCurrentUserId(id: string | null) {
        if (id) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
        }
    }
};
