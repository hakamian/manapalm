
import React from 'react';

interface ProductSchemaProps {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock';
    rating?: number;
    reviewCount?: number;
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
    name, description, image, price, currency = 'IRR', availability = 'InStock', rating = 5, reviewCount = 100
}) => {
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": name,
        "image": image,
        "description": description,
        "brand": {
            "@type": "Brand",
            "name": "نخلستان معنا"
        },
        "offers": {
            "@type": "Offer",
            "url": "https://manapalm.com",
            "priceCurrency": currency,
            "price": price * 10, // Converting Toman to Rial usually preferred for schema or keep Toman if standard
            "availability": `https://schema.org/${availability}`,
            "itemCondition": "https://schema.org/NewCondition"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating,
            "reviewCount": reviewCount
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

interface ArticleSchemaProps {
    title: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    url: string;
}

export const ArticleSchema: React.FC<ArticleSchemaProps> = ({
    title, description, image, author, datePublished, url
}) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "image": image,
        "author": {
            "@type": "Person",
            "name": author
        },
        "publisher": {
            "@type": "Organization",
            "name": "نخلستان معنا",
            "logo": {
                "@type": "ImageObject",
                "url": "https://res.cloudinary.com/dk2x11rvs/image/upload/v1765131783/manapal-logo-3d_zpdvkd.png"
            }
        },
        "datePublished": datePublished,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export const OrganizationSchema: React.FC = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "نخلستان معنا",
        "alternateName": "Mana Palm",
        "url": "https://manapalm.com",
        "logo": "https://res.cloudinary.com/dk2x11rvs/image/upload/v1765131783/manapal-logo-3d_zpdvkd.png",
        "sameAs": [
            "https://www.instagram.com/manapalm_com",
            "https://t.me/manapalm",
            "https://www.linkedin.com/company/manapalm"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+98-912-000-0000",
            "contactType": "sales",
            "areaServed": "IR",
            "availableLanguage": "Persian"
        },
        "description": "پلتفرم جامع معنا و مسئولیت اجتماعی از طریق کاشت نخل و توسعه پایدار کشاورزی."
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export const BreadcrumbSchema: React.FC<{ items: { name: string, item: string }[] }> = ({ items }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item.startsWith('http') ? item.item : `https://manapalm.com${item.item}`
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
