'use client';

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import ServicePricingSection from './ServicePricingSection';
import PortfolioShowcase from './PortfolioShowcase';

const ServicesAgencyPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col pt-20">
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-emerald-900 text-white py-24 relative overflow-hidden text-center px-4" dir="rtl">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500 via-emerald-800 to-transparent"></div>
                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                        <span className="inline-block px-4 py-2 bg-emerald-800/50 backdrop-blur-md rounded-full text-sm font-bold text-amber-300 font-pinar mb-6 border border-emerald-700">
                            آژانس طراحی و توسعه نخلستان معنا
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 font-pinar drop-shadow-lg leading-tight">
                            شتاب‌دهنده کسب‌وکارهای <br className="hidden md:block" />آنلاین با طعم معنا
                        </h1>
                        <p className="text-xl md:text-2xl text-emerald-100 font-dana max-w-2xl mx-auto leading-relaxed">
                            طراحی فروشگاه، اپلیکیشن و راه‌کارهای هوش مصنوعی برای برند شما، و سرمایه‌گذاری متقابل در پروژه‌های تأثیرگذار اجتماعی.
                        </p>
                    </div>
                </section>

                {/* Pricing & Offers Section */}
                <ServicePricingSection />

                {/* Previous Work Showcase */}
                <PortfolioShowcase />
            </main>
            <Footer />
        </div>
    );
};

export default ServicesAgencyPage;
