
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon, GlobeAmericasIcon, HeartIcon } from '@heroicons/react/24/solid';

export const metadata: Metadata = {
    title: 'مانیفست معنا | چرا نخلستان معنا؟',
    description: 'در جستجوی معنای گمشده زندگی مدرن. نخلستان معنا، پلتفرمی برای خلق اثر جاودانه، حفاظت از محیط زیست و فقرزدایی از طریق کاشت نخل.',
    keywords: ['معنا', 'فلسفه معنا', 'نخلستان معنا', 'زندگی معنادار', 'اثرگذاری', 'جاودانگی', 'مسئولیت اجتماعی'],
    openGraph: {
        title: 'مانیفست معنا: ریشه‌هایی برای جاودانگی',
        description: 'چرا کاشتن یک نخل، کاشتن معناست؟',
        images: ['https://res.cloudinary.com/dk2x11rvs/image/upload/v1767202359/Oasis_Dream_s4s29f.png'],
    }
};

export default function ManifestoPage() {
    return (
        <div className="min-h-screen bg-[#050b14] text-gray-100 font-sans leading-relaxed selection:bg-amber-500/30">

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dk2x11rvs/image/upload/v1768908658/Gemini_Generated_Image_mpvjtqmpvjtqmpvj_vup9c0.png')] bg-cover bg-center opacity-30 blur-sm scale-110 animate-slow-zoom"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-[#050b14]/80 to-transparent"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm mb-6 uppercase tracking-widest backdrop-blur-md">
                        The Manifesto
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-9xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                        معنا کجاست؟
                    </h1>
                    <p className="text-xl md:text-3xl text-gray-300 max-w-3xl mx-auto font-light leading-normal">
                        ما در جهانی پر از "موفقیت" زندگی می‌کنیم، اما تشنه‌ی <span className="text-amber-400 font-bold border-b border-amber-400/50">معنا</span> هستیم.
                    </p>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Chapters Container */}
            <div className="container mx-auto px-4 md:px-0 max-w-4xl py-24 space-y-32">

                {/* Chapter 1: The Void */}
                <section className="group">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-6xl font-black text-gray-800 group-hover:text-amber-500/20 transition-colors duration-500">01</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">گم‌شده در هیاهو</h2>
                    </div>
                    <p className="text-lg md:text-xl text-gray-400 text-justify">
                        انسان امروز بیش از هر زمان دیگری ابزار دارد، اما کمتر از همیشه می‌داند "چرا" زندگی می‌کند. ما می‌دویم، می‌سازیم و مصرف می‌کنیم، اما در پایان روز، حفره‌ای در قلبمان باقی می‌ماند. حفره‌ای که با خریدن، لایک گرفتن و دیده شدن پر نمی‌شود. ما به دنبال راهی برای جاودانگی هستیم، راهی برای اینکه بگوییم: <span className="italic text-white">«من اینجا بودم و این جهان را جای بهتری کردم.»</span>
                    </p>
                </section>

                {/* Chapter 2: The Solution */}
                <section className="group">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-6xl font-black text-gray-800 group-hover:text-emerald-500/20 transition-colors duration-500">02</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">ریشه در خاک، سر در آسمان</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <p className="text-lg md:text-xl text-gray-400 text-justify">
                            پاسخ ما به این جستجو، بازگشت به ریشه‌هاست. <span className="text-emerald-400 font-bold">کاشت نخل</span> تنها یک عمل کشاورزی نیست؛ یک آیین معنوی است. نخل، نماد سخاوت و استقامت است. در سخت‌ترین شرایط کویر رشد می‌کند و شیرین‌ترین میوه را می‌دهد. وقتی نخلی می‌کارید، شما بخشی از وجودتان را در زمین به امانت می‌گذارید. این نخل، نماینده زنده شما بر روی زمین است که حتی وقتی نیستید، نفس می‌کشد و ثمر می‌دهد.
                        </p>
                        <div className="bg-emerald-900/10 p-8 rounded-3xl border border-emerald-500/20 relative overflow-hidden">
                            <GlobeAmericasIcon className="w-32 h-32 absolute -right-10 -bottom-10 text-emerald-500/10" />
                            <h3 className="text-xl font-bold text-emerald-400 mb-4">اثر پروانه‌ای نخل معنا</h3>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex gap-2 items-center"><CheckIcon className="w-5 h-5 text-emerald-500" /> تولید اکسیژن و تصفیه هوا</li>
                                <li className="flex gap-2 items-center"><CheckIcon className="w-5 h-5 text-emerald-500" /> مبارزه با بیابان‌زایی</li>
                                <li className="flex gap-2 items-center"><CheckIcon className="w-5 h-5 text-emerald-500" /> ایجاد اشتغال پایدار در روستا</li>
                                <li className="flex gap-2 items-center"><CheckIcon className="w-5 h-5 text-emerald-500" /> تولید غذای سالم (خرما)</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Chapter 3: The Legacy */}
                <section className="group">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-6xl font-black text-gray-800 group-hover:text-rose-500/20 transition-colors duration-500">03</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">میراثی که نام شما را می‌خواند</h2>
                    </div>
                    <p className="text-lg md:text-xl text-gray-400 text-justify mb-8">
                        در نخلستان معنا، هر نخل شناسنامه دارد. مختصات جغرافیایی دارد. صاحب دارد. این مالکیت مادی نیست، مالکیت معنوی است. ثمره این نخل‌ها صرف امور خیریه و توسعه چرخه برکت می‌شود، اما "نام" و "یاد" بر روی آن نخل متعلق به شماست. صد سال بعد، وقتی این نخل همچنان سایه می‌افکند، نام شما در سایه آن زنده است.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/gift/wedding" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-center group/card">
                            <HeartIcon className="w-10 h-10 mx-auto text-rose-500 mb-4 group-hover/card:animate-pulse" />
                            <h4 className="font-bold text-lg mb-2">برای عشق</h4>
                            <p className="text-xs text-gray-400">کاشت نخل به نام کسی که دوستش دارید.</p>
                        </Link>
                        <Link href="/gift/memorial" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-center group/card">
                            <SparklesIcon className="w-10 h-10 mx-auto text-amber-500 mb-4 group-hover/card:spin-slow" />
                            <h4 className="font-bold text-lg mb-2">برای یادبود</h4>
                            <p className="text-xs text-gray-400">زنده‌ترین یادبود برای رفتگان.</p>
                        </Link>
                        <Link href="/heritage" className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-center group/card">
                            <GlobeAmericasIcon className="w-10 h-10 mx-auto text-sky-500 mb-4 group-hover/card:rotate-12" />
                            <h4 className="font-bold text-lg mb-2">برای زمین</h4>
                            <p className="text-xs text-gray-400">مسئولیت اجتماعی در قبال سیاره ما.</p>
                        </Link>
                    </div>
                </section>

            </div>

            {/* Philosophy Quote */}
            <section className="py-24 bg-gradient-to-r from-amber-900/20 to-black border-y border-amber-900/30">
                <div className="container mx-auto px-4 text-center">
                    <blockquote className="text-2xl md:text-4xl font-serif italic text-amber-200/80 max-w-4xl mx-auto leading-relaxed">
                        "ما با آنچه به دست می‌آوریم زندگی می‌کنیم، اما با آنچه می‌بخشیم، زندگی می‌سازیم."
                    </blockquote>
                    <p className="mt-6 text-amber-500/50 uppercase tracking-widest text-sm">— وینستون چرچیل</p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">معنای خود را بکارید</h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        همین امروز، نهالی بکارید که فردا، سایه‌بان امید باشد.
                    </p>
                    <Link href="/shop" className="inline-flex items-center gap-3 bg-amber-500 text-black font-bold text-xl py-4 px-12 rounded-full hover:bg-amber-400 hover:scale-105 transition-all shadow-xl shadow-amber-900/40">
                        شروع کنید <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                </div>
            </section>

        </div>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
        </svg>
    )
}
