
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Setup environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try loading from root .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TEST_USER = {
    phone: '+989001112233', // E.164 format required by Supabase
    displayPhone: '09001112233', // For display/login instructions
    password: 'ManaUser2025!', // Strong password
    email: 'reviewer@manapalm.com',
    fullName: 'کاربر تست درگاه (Reviewer)'
};

async function main() {
    console.log("🚀 Starting Test User Creation for Payment Gateway Review...");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error("❌ Error: Missing Environment Variables.");
        console.error("Please ensure .env.local contains:");
        console.error(" - VITE_SUPABASE_URL");
        console.error(" - SUPABASE_SERVICE_ROLE_KEY (Required for creating confirmed users)");
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    try {
        // 1. Check if user exists
        console.log(`🔍 Checking for existing user: ${TEST_USER.phone}`);
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        const existingUser = users.find(u => u.phone === TEST_USER.phone);

        if (existingUser) {
            console.log("⚠️ User already exists. Updating password...");
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                {
                    password: TEST_USER.password,
                    user_metadata: { full_name: TEST_USER.fullName }
                }
            );
            if (updateError) throw updateError;
            console.log("✅ Password updated successfully.");
        } else {
            console.log("🆕 Creating new verified user...");
            const { data, error: createError } = await supabase.auth.admin.createUser({
                phone: TEST_USER.phone,
                email: TEST_USER.email,
                password: TEST_USER.password,
                email_confirm: true,
                phone_confirm: true,
                user_metadata: { full_name: TEST_USER.fullName }
            });
            if (createError) throw createError;
            console.log(`✅ User created successfully! ID: ${data.user.id}`);
        }

        console.log("\n-------------------------------------------------------");
        console.log("🎉 Test User Credentials Ready for Gateway Provider:");
        console.log(`📱 Username (Phone): ${TEST_USER.displayPhone}`);
        console.log(`🔑 Password:         ${TEST_USER.password}`);
        console.log("-------------------------------------------------------");
        console.log("👉 Share these credentials with the review team.");
        console.log("👉 Ensure 'Password Login' is enabled in your Supabase Auth Providers settings.");

    } catch (err) {
        console.error("❌ Operation Failed:", err.message);
    }
}

main();
