import React from 'react';
import { Providers } from './providers';
import Script from 'next/script';
import './globals.css';
import ClientWrapper from '../components/ClientWrapper';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        default: "نخلستان معنا | پلتفرم کاشت نخل و درختکاری هوشمند",
        template: "%s | نخلستان معنا"
    },
    description: "نخلستان معنا؛ سامانه جامع کاشت نخل، درختکاری و احیای محیط زیست. با خرید و کاشت نخل خرما، هم به طبیعت کمک کنید و هم سرمایه معنوی و ماندگاری برای خود و عزیزانتان بسازید.",
    applicationName: "Nakhlestan Ma'na",
    authors: [{ name: "Manapalm Team", url: "https://manapalm.com" }],
    keywords: [
        "نخلستان معنا",
        "کاشت نخل",
        "درختکاری",
        "کاشت درخت",
        "نخل خرما",
        "خرید نخل",
        "احیای محیط زیست",
        "خیریه هوشمند",
        "خیرات اموات",
        "هدیه سازمانی",
        "مسئولیت اجتماعی",
        "سرمایه گذاری سبز"
    ],
    metadataBase: new URL('https://manapalm.com'),
    openGraph: {
        title: "نخلستان معنا | کاشت نخل و درختکاری برای آینده",
        description: "با کاشت هر نخل، زندگی و معنا را به زمین هدیه دهید. همین امروز در نخلستان معنا درخت بکارید.",
        url: 'https://manapalm.com',
        siteName: "نخلستان معنا",
        locale: 'fa_IR',
        type: 'website',
        images: [
            {
                url: 'https://manapalm.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Nakhlestan Mana - Tree Planting Platform',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: "نخلستان معنا | درختکاری و احیای نخلستان‌ها",
        description: "پلتفرمی برای پیوند معنا، زندگی و طبیعت. نخل خود را بکارید.",
        images: ['https://manapalm.com/og-image.jpg'],
    },
    icons: {
        icon: '/icon-192.png',
        shortcut: '/icon-192.png',
        apple: '/icon-192.png',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fa" dir="rtl">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet" />
                <link rel="icon" href="https://picsum.photos/seed/nakhlestan-logo/32/32" />


                <style dangerouslySetInnerHTML={{
                    __html: `
                    /* Font Optimization */
                    body {
                        font-family: 'Vazirmatn', sans-serif;
                        overflow-x: hidden;
                    }
                    
                    /* --- SCROLL ANIMATION STYLES (Sync with index.html) --- */
                    @keyframes slide-in-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes slide-in-left { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
                    @keyframes slide-in-right { from { opacity: 0; transform: translateX(50px); } to { transform: translateX(0); } }
                    @keyframes draw-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                    @keyframes sprout { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes spread-out-left { from { transform: translateX(100%) scale(0.8); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
                    @keyframes spread-out-center { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes spread-out-right { from { transform: translateX(-100%) scale(0.8); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } }
                    @keyframes gradient-sweep { 0% { background-position: 150% 0; } 100% { background-position: -50% 0; } }
                    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                    @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                    .scroll-animate { animation-duration: 0.8s; animation-fill-mode: forwards; animation-timing-function: cubic-bezier(0.1, 0.8, 0.2, 1); }
                    .scroll-slide-up { animation-name: slide-in-up; }
                    .scroll-slide-left { animation-name: slide-in-left; }
                    .scroll-slide-right { animation-name: slide-in-right; }
                    .scroll-draw-line { animation-name: draw-line; transform-origin: center; }
                    .scroll-sprout { animation-name: sprout; transform-origin: bottom; }
                    .scroll-spread-left { animation-name: spread-out-left; }
                    .scroll-spread-center { animation-name: spread-out-center; }
                    .scroll-spread-right { animation-name: spread-out-right; }
                    
                    .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                    .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
                    .animate-fade-in-scale { animation: fade-in-scale 0.3s ease-out forwards; }
                    .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
                ` }} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "نخلستان معنا",
                            "alternateName": "Nakhlestan Mana",
                            "url": "https://manapalm.com",
                            "logo": "https://manapalm.com/icon-512.png",
                            "sameAs": [
                                "https://www.instagram.com/manapalm",
                                "https://twitter.com/manapalm"
                            ]
                        }),
                    }}
                />
            </head>
            <body>
                <Providers>
                    <ClientWrapper>
                        {children}
                    </ClientWrapper>
                </Providers>

                {/* External External Scripts (Boring Solution - Keep legacy JS) */}
                <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
            </body>
        </html>
    );
}
