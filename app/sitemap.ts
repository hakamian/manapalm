
import { MetadataRoute } from 'next';
import { dbAdapter } from '@/services/dbAdapter';

const BASE_URL = 'https://manapalm.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const staticRoutes = [
        '',
        '/about',
        '/contact',
        '/shop',
        '/heritage',
        '/terms',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const products = await dbAdapter.getAllProducts();
        productRoutes = products.map((product) => ({
            url: `${BASE_URL}/shop/${product.id}`,
            lastModified: new Date(product.dateAdded || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch products for sitemap:', error);
    }

    // 3. Gift Landing Pages (Strategy: "Gift of Meaning")
    const giftRoutes = [
        '/gift/wedding',  // نخل پیوند
        '/gift/birthday', // نخل میلاد
        '/gift/memorial', // نخل یادبود
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9, // High priority for SEO Landing Pages
    }));

    return [...staticRoutes, ...productRoutes, ...giftRoutes];
}
