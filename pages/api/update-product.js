// Unified API Route for all product operations using Service Role Key
export default async function handler(req, res) {
    // CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { createClient } = await import('@supabase/supabase-js');

    // Use service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing Supabase credentials');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 🛡️ SECURITY CHECK: Verify Admin status
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            console.error('❌ Auth error:', authError);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Check if user is admin in profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.is_admin) {
            console.warn('🚫 Unauthorized attempt by user:', user.id);
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        const { action, id, updates, product } = req.body;

        console.log('📦 Product API called:', { action, id });

        switch (action) {
            case 'update': {
                if (!id || !updates) {
                    return res.status(400).json({ error: 'Missing id or updates' });
                }

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
                    result = await supabaseAdmin
                        .from('products')
                        .update(dbUpdates)
                        .eq('id', id);
                } else {
                    result = await supabaseAdmin
                        .from('products')
                        .insert({ id, ...dbUpdates });
                }

                if (result.error) {
                    console.error('❌ Update error:', result.error);
                    return res.status(500).json({ error: result.error.message });
                }

                console.log('✅ Product updated:', id);
                return res.status(200).json({ success: true, id });
            }

            case 'create': {
                if (!product) {
                    return res.status(400).json({ error: 'Missing product data' });
                }

                const newProduct = {
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image_url: product.image,
                    description: product.description,
                    type: product.type || 'physical',
                    stock: product.stock || 0,
                    points: product.points || 0,
                    tags: product.tags || []
                };

                const { data, error } = await supabaseAdmin
                    .from('products')
                    .insert(newProduct)
                    .select()
                    .single();

                if (error) {
                    console.error('❌ Create error:', error);
                    return res.status(500).json({ error: error.message });
                }

                console.log('✅ Product created:', data.id);
                return res.status(200).json({ success: true, product: data });
            }

            case 'delete': {
                if (!id) {
                    return res.status(400).json({ error: 'Missing product id' });
                }

                const { error } = await supabaseAdmin
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('❌ Delete error:', error);
                    return res.status(500).json({ error: error.message });
                }

                console.log('✅ Product deleted:', id);
                return res.status(200).json({ success: true, id });
            }

            default:
                return res.status(400).json({ error: 'Invalid action. Use: update, create, or delete' });
        }

    } catch (error) {
        console.error('❌ API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}