import React from 'react';
import AboutView from '../../components/AboutView';

export const metadata = {
    title: 'درباره نخلستان معنا | داستان درختکاری و احیای نخل‌ها',
    description: 'آشنایی با تیم نخلستان معنا و ماموریت ما برای احیای محیط زیست از طریق کاشت نخل. با ما در مسیر سبز درختکاری و توسعه پایدار همراه شوید.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen">
            <AboutView />
        </main>
    );
}
