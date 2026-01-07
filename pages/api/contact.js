import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { name, email, subject, message } = await req.json();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return new Response(JSON.stringify({ error: 'همه فیلدها الزامی هستند' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate email format
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return new Response(JSON.stringify({ error: 'ایمیل نامعتبر است' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase credentials');
            return new Response(JSON.stringify({ error: 'خطای سرور' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('contact_messages')
            .insert([{ name, email, subject, message }])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return new Response(JSON.stringify({ error: 'خطا در ذخیره پیام' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, id: data[0]?.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Contact API error:', error);
        return new Response(JSON.stringify({ error: 'خطای سرور' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
