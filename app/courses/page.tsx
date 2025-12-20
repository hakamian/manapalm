import React from 'react';
import CoursesView from '../../src/features/lms/CoursesView';

export const metadata = {
    title: 'آکادمی نخلستان معنا | یادگیری برای رشد و تاثیر',
    description: 'دوره‌های آموزشی نخلستان معنا. مهارت‌های جدید در زمینه‌های کوچینگ، کسب‌وکار و هوش مصنوعی بیاموزید.',
};

export default function CoursesPage() {
    return (
        <main className="min-h-screen">
            <CoursesView />
        </main>
    );
}
