import React from 'react';
import ContactView from '../../components/ContactView';

export const metadata = {
    title: 'تماس با نخلستان معنا | با ما در ارتباط باشید',
    description: 'راه‌های ارتباطی با نخلستان معنا. از طریق فرم تماس، ایمیل یا شبکه‌های اجتماعی با ما در تماس باشید.',
};

export default function ContactPage() {
    return (
        <main className="min-h-screen">
            <ContactView />
        </main>
    );
}
