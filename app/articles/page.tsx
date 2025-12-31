import React from 'react';
import ArticlesView from '../../components/ArticlesView';

export const metadata = {
    title: 'مقالات درختکاری و دانش نخل | مجله نخلستان معنا',
    description: 'مرجع تخصصی مقالات کاشت نخل، درختکاری، کشاورزی پایدار و سبک زندگی معنادار. با تازه ترین مطالب نخلستان معنا همراه باشید.',
};

export default function ArticlesPage() {
    return (
        <main className="min-h-screen">
            <ArticlesView />
        </main>
    );
}
