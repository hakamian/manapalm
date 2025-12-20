'use client';
import React from 'react';
import { Providers } from './providers';
import Script from 'next/script';
import '../index.css';

export const metadata = {
    title: 'نخلستان معنا | Nakhlestan Ma\'na',
    description: 'پلتفرم جامع معنا، کسب‌و‌کار و زندگی، مسئولیت اجتماعی و کاشت نخل',
};

import Header from '../components/Header';
import Footer from '../components/Footer';
import LiveActivityBanner from '../components/LiveActivityBanner';

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
                <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

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
            </head>
            <body>
                <Providers>
                    <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100">
                        {/* 1. Atmospheric Background */}
                        <div className="aurora-bg">
                            <div className="aurora-blob blob-1"></div>
                            <div className="aurora-blob blob-2"></div>
                            <div className="aurora-blob blob-3"></div>
                        </div>
                        <div className="noise-overlay"></div>

                        <LiveActivityBanner />
                        <Header />

                        <div className="relative z-10">
                            {children}
                        </div>

                        <Footer />
                    </div>
                </Providers>

                {/* External External Scripts (Boring Solution - Keep legacy JS) */}
                <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
                <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="lazyOnload" />
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
            </body>
        </html>
    );
}
