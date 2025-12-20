import React from 'react';
import AboutView from '../../components/AboutView';

export const metadata = {
    title: 'درباره نخلستان معنا | ریشه‌ها و رسالت ما',
    description: 'با داستان نخلستان معنا، تیم ما و رسالت ما در ایجاد اشتغال پایدار و احیای محیط زیست آشنا شوید.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen">
            <AboutView />
        </main>
    );
}
