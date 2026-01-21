import React from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'مقالات و آکادمی نخلستان معنا | دانش و داستان‌های معنادار',
    description: 'کاوشی در دنیای کشاورزی پایدار، هوش مصنوعی، سبک زندگی معنادار و داستان‌های جامعه نخلستان معنا.',
    keywords: ['مقالات نخلستان', 'آموزش کشاورزی', 'هوش مصنوعی در کشاورزی', 'سبک زندگی ارگانیک', 'داستان‌های موفقیت'],
    openGraph: {
        title: 'مقالات و دانش نخلستان معنا',
        description: 'دانش خود را در مورد کشاورزی پایدار و سبک زندگی معنادار افزایش دهید.',
        images: ['https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2070&auto=format&fit=crop'],
    }
};

const ArticlesView = dynamic(() => import('../../components/ArticlesView'), {
    loading: () => <div className="min-h-screen pt-20 flex items-center justify-center"><div className="animate-pulse text-emerald-400">در حال بارگذاری مقالات...</div></div>,
    ssr: true
});

export default function ArticlesPage() {
    return (
        <ArticlesView />
    );
}
