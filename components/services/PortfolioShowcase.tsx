'use client';

import React from 'react';
import { ArrowTopRightOnSquareIcon as ExternalLink, StarIcon as Star, CodeBracketIcon as Code, DevicePhoneMobileIcon as Smartphone, BoltIcon as Zap } from '@heroicons/react/24/outline';

interface PortfolioProject {
    id: string;
    title: string;
    category: string;
    description: string;
    link: string;
    image: string;
    highlights: { icon: React.ElementType; text: string }[];
    color: string;
}

const projects: PortfolioProject[] = [
    {
        id: 'say-it-english',
        title: 'آکادمی Say It English',
        category: 'سیستم آموزشی (LMS)',
        description: 'پلتفرم جامع آموزش زبان انگلیسی با تمرکز بر لهجه امریکن. دارای سیستم ثبت‌نام، آزمون تعیین سطح هوشمند، و داشبورد آموزش مجازی برای دانشجویان و اساتید.',
        link: 'https://say-it-english.vercel.app/',
        image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1740573215/Portfolio-SIE_vxyza1.png', // Fallback or mock image
        color: 'from-blue-600 to-teal-500',
        highlights: [
            { icon: Star, text: 'طراحی کاربرپسند و اختصاصی' },
            { icon: Smartphone, text: 'واکنش‌گرای کامل برای موبایل' },
            { icon: Zap, text: 'لودینگ بسیار سریع' }
        ]
    },
    {
        id: 'growth-hiking',
        title: 'کامیونیتی Growth Hiking',
        category: 'پلتفرم جامعه‌محور و رویداد',
        description: 'وب‌سایت اختصاصی برای عاشقان کمپینگ و کوهنوردی با تمرکز بر رشد فردی و توسعه پایدار. محیطی تاریک و جذاب برای معرفی تورها و روایت داستان برند.',
        link: 'https://growth-hiking.netlify.app/',
        image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1740573215/Portfolio-GH_abxcz2.png', // Fallback or mock image
        color: 'from-amber-600 to-orange-500',
        highlights: [
            { icon: Code, text: 'تکنولوژی لبه و مدرن' },
            { icon: Star, text: 'داستان‌سرایی بصری' },
            { icon: Zap, text: 'تجربه کاربری نرم و روان' }
        ]
    }
];

const PortfolioShowcase: React.FC = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 font-pinar tracking-tight">
                        نمونه‌کارهای <span className="text-emerald-600">برجسته‌ی ما</span>
                    </h2>
                    <p className="text-xl text-gray-600 font-dana leading-relaxed">
                        ما فقط سایت نمی‌سازیم؛ ما استانداردهای جدیدی در تعامل کاربر با برند شما خلق می‌کنیم. نگاهی به پروژه‌های اخیر ما بیندازید.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {projects.map((project) => (
                        <div key={project.id} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            {/* Visual Header Banner (Fallback if image isn't perfect) */}
                            <div className={`h-48 w-full bg-gradient-to-br ${project.color} relative p-8 flex items-end justify-between overflow-hidden`}>
                                {/* Decorative background pattern */}
                                <div className="absolute inset-0 opacity-20">
                                    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                                                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                                    </svg>
                                </div>

                                <div className="relative z-10 text-white">
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold font-pinar mb-3">
                                        {project.category}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-black font-pinar drop-shadow-md">{project.title}</h3>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-grow">
                                <p className="text-gray-600 font-dana leading-relaxed mb-8 flex-grow">
                                    {project.description}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    {project.highlights.map((highlight, index) => (
                                        <div key={index} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                                            <highlight.icon className="w-5 h-5 text-gray-400 mb-2" strokeWidth={1.5} />
                                            <span className="text-xs font-bold text-gray-700 font-pinar">{highlight.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r ${project.color} text-white shadow-md hover:shadow-lg transition-all duration-300`}
                                >
                                    <ExternalLink className="w-4 h-4 ml-1" />
                                    <span className="font-pinar">مشاهده سایت اصلی</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Project Reference */}
                <div className="mt-16 bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-emerald-900/30 mix-blend-multiply pointer-events-none" />
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[400px] h-[400px]">
                            <path d="M12 2L9 22L2 12L12 2Z" />
                            <path d="M12 2L15 22L22 12L12 2Z" />
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                            <Star className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black mb-4 font-pinar">پروژه محوری: سیستم‌عامل نخلستان معنا</h3>
                        <p className="text-gray-300 font-dana leading-relaxed mb-8">
                            همین سایتی که اکنون در آن حضور دارید، یکی از دستاوردهای افتخارآمیز تیم ماست. یک سیستم‌عامل جامع است که زیرساخت مدیریت فروش، کاربران، تولید محتوای هوش مصنوعی و اتوماسیون سازمانی را درون خود جای داده است.
                        </p>
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold font-pinar transition-colors">
                            <Zap className="w-5 h-5 ml-2 text-emerald-600" />
                            برگشت به بالای پلتفرم معنا
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PortfolioShowcase;
