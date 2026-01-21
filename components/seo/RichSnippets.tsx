
import React from 'react';

// --- Local Business Schema ---
export const LocalBusinessSchema: React.FC = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "NGO",
        "name": "نخلستان معنا",
        "alternateName": "Mana Palm Enterprise",
        "url": "https://manapalm.com",
        "logo": "https://res.cloudinary.com/dk2x11rvs/image/upload/v1765131783/manapal-logo-3d_zpdvkd.png",
        "description": "نخلستان معنا: پلتفرم جامع کاشت نخل، خرید خرما ارگانیک و مسئولیت اجتماعی برای توسعه پایدار و اشتغال‌زایی معنادار.",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "نخلستان مرکزی",
            "addressLocality": "دشتستان",
            "addressRegion": "بوشهر",
            "postalCode": "75000",
            "addressCountry": "IR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 29.2666,
            "longitude": 51.2167
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+98-912-345-6789",
            "contactType": "customer service",
            "areaServed": "IR",
            "availableLanguage": "Persian"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// --- FAQ Schema ---
interface FAQItem {
    question: string;
    answer: string;
}

export const FAQSchema: React.FC<{ items: FAQItem[] }> = ({ items }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// --- Breadcrumb Schema ---
interface BreadcrumbItem {
    name: string;
    item: string;
}

export const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `https://manapalm.com/${item.item}`
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
