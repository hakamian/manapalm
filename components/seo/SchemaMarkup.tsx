
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

export const OrganizationSchema: React.FC = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "نخلستان معنا",
        "url": "https://manapalm.com",
        "logo": "https://picsum.photos/seed/nakhlestan-logo/512/512",
        "sameAs": [
            "https://www.instagram.com/nakhlestan",
            "https://twitter.com/nakhlestan"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+98-21-00000000",
            "contactType": "Customer Service",
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
