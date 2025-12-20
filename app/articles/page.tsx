import React from 'react';
import ArticlesView from '../../components/ArticlesView';

export const metadata = {
    title: 'مقالات و دانش نخلستان معنا | مرجع تخصصی کشاورزی و معنا',
    description: 'مجموعه مقالات تخصصی نخلستان معنا در زمینه‌های کشاورزی پایدار، هوش مصنوعی، سبک زندگی و داستان‌های موفقیت جامعه.',
};

export default function ArticlesPage() {
    return (
        <main className="min-h-screen">
            <ArticlesView />
        </main>
    );
}
