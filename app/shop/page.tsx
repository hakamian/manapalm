import React from 'react';
import ShopView from '../../src/features/shop/ShopView';

export const metadata = {
    title: 'فروشگاه نخلستان معنا | خرید نخل و محصولات ارگانیک',
    description: 'خرید آنلاین نخل، محصولات خرما، صنایع دستی و محصولات دیجیتال. با هر خرید، در احیای محیط زیست و اشتغال‌زایی سهیم شوید.',
};

export default function ShopPage() {
    return (
        <main className="min-h-screen">
            <ShopView />
        </main>
    );
}
