/**
 * Script to delete orders for test user
 * Run: node scripts/deleteTestOrders.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://sbjrayzghjfsmmuygwbw.supabase.co';
// You need to provide your service role key here (from Supabase Dashboard > Settings > API)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const TEST_PHONE = '+989001112233'; // or 09001112233

async function deleteTestOrders() {
    if (!SUPABASE_SERVICE_KEY) {
        console.log('❌ SUPABASE_SERVICE_KEY not set!');
        console.log('');
        console.log('لطفاً از Supabase Dashboard استفاده کنید:');
        console.log('1. برو به: https://supabase.com/dashboard/project/sbjrayzghjfsmmuygwbw/sql/new');
        console.log('2. این query رو بزن:');
        console.log('');
        console.log(`-- پیدا کردن کاربر`);
        console.log(`SELECT id, phone, raw_user_meta_data->>'full_name' as name FROM auth.users WHERE phone LIKE '%9001112233%';`);
        console.log('');
        console.log(`-- پاک کردن سفارش‌ها (بعد از پیدا کردن USER_ID)`);
        console.log(`DELETE FROM orders WHERE user_id = 'USER_ID_از_کوئری_بالا';`);
        console.log('');
        return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
        // First find the user
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();

        if (userError) {
            console.error('Error listing users:', userError);
            return;
        }

        const testUser = users.users.find(u =>
            u.phone?.includes('9001112233') || u.email?.includes('test')
        );

        if (!testUser) {
            console.log('❌ کاربر تست پیدا نشد');
            return;
        }

        console.log(`✅ کاربر پیدا شد: ${testUser.id}`);
        console.log(`   Phone: ${testUser.phone}`);
        console.log(`   Name: ${testUser.user_metadata?.full_name || 'N/A'}`);

        // Delete orders
        const { data, error } = await supabase
            .from('orders')
            .delete()
            .eq('user_id', testUser.id);

        if (error) {
            console.error('Error deleting orders:', error);
            return;
        }

        console.log('✅ سفارش‌های کاربر تست پاک شد!');
    } catch (err) {
        console.error('Error:', err);
    }
}

deleteTestOrders();
