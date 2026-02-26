
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split(/\r?\n/).forEach(line => {
                const [key, ...value] = line.split('=');
                if (key && value) {
                    const val = value.join('=').replace(/^["']|["']$/g, '').trim();
                    process.env[key.trim()] = val;
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env.local', e);
    }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Use Service Key to bypass RLS
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing API Keys in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function resetTransactions() {
    console.log('🗑️  Starting Full Transaction Wipe...');
    console.log('   (Orders, Subscriptions, Cart, Payments, etc.)');

    try {
        // 1. Delete Orders (Cascades to order_items, payments, shipments, certificate_deliveries)
        const { error: orderError } = await supabase
            .from('orders')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all rows

        if (orderError) console.error('❌ Error deleting orders:', orderError.message);
        else console.log('✅ All Orders (and related data) deleted.');

        // 2. Delete Subscriptions
        const { error: subError } = await supabase
            .from('user_subscriptions')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (subError) console.error('❌ Error deleting subscriptions:', subError.message);
        else console.log('✅ All User Subscriptions deleted.');

        // 3. Delete Cart Items
        const { error: cartError } = await supabase
            .from('cart')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (cartError) console.error('❌ Error deleting cart:', cartError.message);
        else console.log('✅ All Cart items deleted.');

        // 4. Delete Agent Tasks (Optional)
        const { error: taskError } = await supabase
            .from('agent_tasks')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (taskError) console.error('❌ Error deleting agent tasks:', taskError.message);
        else console.log('✅ All Agent Tasks deleted.');

        console.log('\n✨ Database transactions successfully wiped selected tables.');

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

resetTransactions();
