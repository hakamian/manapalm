import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "نخلستان معنا | Nakhlestan Ma'na",
        short_name: 'Manapalm',
        description: 'پلتفرم جامع معنا، کسب‌و‌کار و زندگی، مسئولیت اجتماعی و کاشت نخل',
        start_url: '/',
        display: 'standalone',
        background_color: '#111827', // dark-900
        theme_color: '#d97706', // amber-600
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
