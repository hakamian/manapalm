// API Route for updating products using Service Role Key
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { createClient } = await import('@supabase/supabase-js');

    // Use service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Missing Supabase credentials');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const { id, updates } = req.body;

        if (!id || !updates) {
            return res.status(400).json({ error: 'Missing id or updates' });
        }

        console.log('📦 Updating product via API:', id);

        // Map frontend field names to database column names
        const dbUpdates = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.image) dbUpdates.image_url = updates.image;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
        if (updates.points !== undefined) dbUpdates.points = updates.points;
        if (updates.tags) dbUpdates.tags = updates.tags;

        // Check if product exists
        const { data: existing } = await supabaseAdmin
            .from('products')
            .select('id')
            .eq('id', id)
            .single();

        let result;
        if (existing) {
            // Update existing product
            result = await supabaseAdmin
                .from('products')
                .update(dbUpdates)
                .eq('id', id);
        } else {
            // Insert new product
            result = await supabaseAdmin
                .from('products')
                .insert({ id, ...dbUpdates });
        }

        if (result.error) {
            console.error('❌ Database error:', result.error);
            return res.status(500).json({ error: result.error.message });
        }

        console.log('✅ Product updated successfully:', id);
        return res.status(200).json({ success: true, id });

    } catch (error) {
        console.error('❌ API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
