import React from 'react';
import ShopView from '../../src/features/shop/ShopView';

export const metadata = {
    title: 'فروشگاه نخل و محصولات ارگانیک | نخلستان معنا',
    description: 'خرید آنلاین نخل خرما، کاشت نهال مثمر، و سفارش محصولات ارگانیک جنوب. فروشگاه نخلستان معنا، عرضه کننده مستقیم بهترین خرما و صنایع دستی بومی.',
};

export default function ShopPage() {
    return (
        <main className="min-h-screen">
            <ShopView />
        </main>
    );
}
