
import React from 'react';
import { Helmet } from 'react-helmet-async';

// --- Local Business Schema ---
export const LocalBusinessSchema: React.FC = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "NGO",
        "name": "نخلستان معنا",
        "alternateName": "Nakhlestan Ma'na",
        "url": "https://nakhlestanmana.com",
        "logo": "https://picsum.photos/seed/nakhlestan-logo/512/512",
        "description": "یک کسب و کار اجتماعی برای کاشت نخل، ایجاد اشتغال پایدار و توسعه معنا در زندگی.",
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
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
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
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
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
            "item": `https://nakhlestanmana.com/${item.item}`
        }))
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};
