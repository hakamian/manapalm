
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually
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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing API Keys in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanTimelines() {
    console.log('🧹 FORCE Cleaning All User Timelines & Stats...');

    try {
        const { data: profiles, error } = await supabase.from('profiles').select('id, metadata');
        if (error) throw error;

        console.log(`Found ${profiles.length} profiles. Resetting all of them...`);

        const cleanMetadata = {
            addresses: [],
            messages: [],
            recentViews: [],
            timeline: [], // Crucial: Empty array
            coursePersonalizations: {},
            discReport: null,
            notifications: [],
            purchasedCourseIds: [],
            unlockedTools: []
        };

        let updatedCount = 0;

        for (const profile of profiles) {
            // Unconditionally update everyone
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    metadata: cleanMetadata,
                    points: 0,
                    mana_points: 0,
                    level: 'جوانه',
                    is_monthly_subscriber: false
                })
                .eq('id', profile.id);

            if (updateError) {
                console.error(`❌ Failed to reset user ${profile.id}:`, updateError.message);
            } else {
                process.stdout.write('.'); // Progress indicator
                updatedCount++;
            }
        }

        console.log(`\n\n✅ Successfully reset ${updatedCount} profiles to initial state.`);
        console.log('   - Timelines cleared');
        console.log('   - Points reset to 0');
        console.log('   - Level reset to "جوانه"');

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

cleanTimelines();
