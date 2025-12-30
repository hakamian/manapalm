
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first, then .env if needed

// Fallback to .env if .env.local doesn't have the keys (or loading logic if dotenv doesn't override)
// Actually standard dotenv usage:
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    require('dotenv').config({ path: '.env' });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env or .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
    const rawPhone = '09001112233';
    const password = 'ManaUser2025!';
    const fullName = 'کاربر تست';

    // Logic mirroring the API:
    // 1. Phone E.164
    const phone = '+98' + rawPhone.substring(1);
    // 2. Virtual Email
    const email = `${rawPhone}@manapalm.com`;

    console.log(`Creating user: ${rawPhone} / ${email}...`);

    // Check if exists first to avoid error or to update
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = listData.users.find(u => u.phone === phone || u.email === email);

    if (existingUser) {
        console.log(`User already exists (ID: ${existingUser.id}). Updating password...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
                password: password,
                email: email,
                email_confirm: true,
                phone: phone,
                phone_confirm: true,
                user_metadata: { full_name: fullName }
            }
        );

        if (updateError) {
            console.error('❌ Error updating user:', updateError);
        } else {
            console.log('✅ User updated successfully.');
        }
    } else {
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            email_confirm: true,
            phone: phone,
            phone_confirm: true,
            password: password,
            user_metadata: { full_name: fullName }
        });

        if (error) {
            console.error('❌ Error creating user:', error);
        } else {
            console.log('✅ User created successfully:', data.user.id);
        }
    }
}

createTestUser();
