import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // GET - Fetch all messages
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return new Response(JSON.stringify({ messages: data }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // PATCH - Update message (mark as read)
    if (req.method === 'PATCH') {
        try {
            const { id, is_read } = await req.json();

            const { error } = await supabase
                .from('contact_messages')
                .update({ is_read })
                .eq('id', id);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to update message' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // DELETE - Delete message
    if (req.method === 'DELETE') {
        try {
            const { id } = await req.json();

            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to delete message' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
    });
}
