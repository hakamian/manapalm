import React from 'react';
import ContactView from '../../components/ContactView';

export const metadata = {
    title: 'تماس با نخلستان معنا | ارتباط برای کاشت نخل و همکاری',
    description: 'ارتباط با تیم نخلستان معنا برای مشاوره کاشت نخل، خرید محصولات یا همکاری در پروژه های درختکاری. منتظر شنیدن نظرات شما هستیم.',
};

export default function ContactPage() {
    return (
        <main className="min-h-screen">
            <ContactView />
        </main>
    );
}
