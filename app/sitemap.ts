import { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS, PALM_TYPES_DATA } from '@/utils/dummyData';

const BASE_URL = 'https://manapalm.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes - Core Pages
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${BASE_URL}/heritage`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/checkout`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // 2. Dynamic Product Routes - Individual Product Pages
    const productRoutes: MetadataRoute.Sitemap = INITIAL_PRODUCTS.map((product) => ({
        url: `${BASE_URL}/product/${product.id}`,
        lastModified: new Date(product.dateAdded || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 3. Heritage Palm Types - High-value SEO pages
    const palmRoutes: MetadataRoute.Sitemap = PALM_TYPES_DATA.map((palm) => ({
        url: `${BASE_URL}/product/${palm.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85, // Higher priority for heritage palms
    }));

    // 4. Gift Landing Pages - Strategic SEO Landing Pages
    const giftRoutes: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/gift/wedding`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/gift/birthday`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/gift/memorial`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/gift/newborn`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.85,
        },
    ];

    // 5. Additional Content Pages
    const contentRoutes: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/articles`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/manifesto`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    // Combine all routes and remove duplicates based on URL
    const allRoutes = [...staticRoutes, ...productRoutes, ...palmRoutes, ...giftRoutes, ...contentRoutes];
    const uniqueRoutes = allRoutes.filter((route, index, self) =>
        index === self.findIndex((r) => r.url === route.url)
    );

    return uniqueRoutes;
}
