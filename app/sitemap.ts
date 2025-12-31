import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://manapalm.com';

    // Static routes from your app directory
    const routes = [
        '',
        '/about',
        '/articles',
        '/contact',
        '/courses',
        '/heritage',
        '/shop',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
