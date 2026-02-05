import React from 'react';
import { Metadata } from 'next';
import ProductDetailsView from '../../../components/ProductDetailsView';
import { INITIAL_PRODUCTS } from '../../../utils/dummyData';

interface Props {
    params: {
        id: string;
    };
}

// Generate Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = INITIAL_PRODUCTS.find((p) => p.id === params.id);

    if (!product) {
        return {
            title: 'محصول یافت نشد | نخلستان معنا',
            description: 'محصول مورد نظر شما در فروشگاه نخلستان معنا یافت نشد.',
        };
    }

    return {
        title: `${product.name} | فروشگاه نخلستان معنا`,
        description: product.description || `خرید ${product.name} از نخلستان معنا. با هر خرید، در زنجیره مسئولیت اجتماعی و اشتغال‌زایی سهیم شوید.`,
        openGraph: {
            title: `${product.name} | نخلستان معنا`,
            description: product.description || 'تجربه طعم واقعی خرما و مشارکت در مسیر معنا.',
            images: [
                {
                    url: product.image || (product as any).imageUrl || '',
                    width: 800,
                    height: 600,
                    alt: product.name,
                },
            ],
        },
    };
}

// Generate Static Params for SSG (Optional but good for known products)
export async function generateStaticParams() {
    return INITIAL_PRODUCTS.map((product) => ({
        id: product.id,
    }));
}

export default function ProductPage({ params }: Props) {
    return <ProductDetailsView productId={params.id} />;
}
