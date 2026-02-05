
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

// --- DATA & CONFIG ---
type Occasion = 'wedding' | 'birthday' | 'memorial';

const OCCASIONS: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    keywords: string[];
    emoji: string;
    color: string;
    intention: string;
    heroImage: string; // Placeholder for now, can be specific Cloudinary later
}> = {
    wedding: {
        title: 'هدیه جاودانه برای پیوند عشق',
        subtitle: 'کاشت نخل به نام عروس و داماد، عشقی که با ریشه کردن در خاک، ابدی می‌شود.',
        description: 'بهترین هدیه ازدواج، هدیه‌ای است که رشد می‌کند. با کاشت یک نخل به نام زوج جوان، عشق آن‌ها را در قلب زمین جاودانه کنید. گواهی کاشت نخل، خاص‌ترین یادگاری مراسم عروسی.',
        keywords: ['هدیه ازدواج', 'کادو عروسی', 'کاشت درخت برای عروس و داماد', 'نخل پیوند', 'گیفت عروسی خاص', 'یادگاری ماندگار'],
        emoji: '💍',
        color: 'from-pink-500 to-rose-600',
        intention: 'به نیت پیوند آسمانی و عشق پایدار',
        heroImage: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1768905595/Gemini_Generated_Image_psyf3epsyf3epsyf_uckzp1.png'
    },
    birthday: {
        title: 'تولدی دوباره با رویش یک نخل',
        subtitle: 'هدیه‌ای که با گذشت زمان بزرگ‌تر و پربارتر می‌شود، درست مثل صاحب تولد.',
        description: 'برای تولد عزیزان‌تان، به جای هدایای تکراری، به نامشان یک نخل بکارید. این نخل در جنوب ایران کاشته شده و ثمره آن صرف امور خیریه می‌شود. یک هدیه تولد متفاوت و معنادار.',
        keywords: ['هدیه تولد خاص', 'کادو تولد متفاوت', 'کاشت درخت تولد', 'نخل میلاد', 'خرید درخت به نام دوست', 'سوپرایز تولد'],
        emoji: '🎂',
        color: 'from-amber-400 to-orange-600',
        intention: 'به شکرانه زادروز و آغاز بهاری دیگر',
        heroImage: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1767202359/Oasis_Dream_s4s29f.png'
    },
    memorial: {
        title: 'یادبودی سبز برای آنکه دیگر نیست',
        subtitle: 'نامشان را با ریشه کردن در خاک زنده نگه دارید. صدقه جاریه‌ای که تا ابد باقی می‌ماند.',
        description: 'کاشت نخل یادبود، راهی زیبا برای گرامیداشت یاد رفتگان است. ثواب خرماهای این نخل هر سال به روح عزیز از دست رفته اهدا می‌شود. زنده‌ترین یادبود برای عزیزترین‌ها.',
        keywords: ['نخل یادبود', 'خیرات برای اموات', 'کاشت درخت برای متوفی', 'صدقه جاریه درخت', 'یادبود سبز', 'هدیه ختم'],
        emoji: '🕯️',
        color: 'from-teal-500 to-emerald-700',
        intention: 'به یاد و نام عزیز سفرکرده',
        heroImage: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1767202287/deed-bg-modern_yihffm.png'
    }
};

type Props = {
    params: { occasion: string };
};

// --- METADATA GENERATION ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const occasion = params.occasion;
    const data = OCCASIONS[occasion];

    if (!data) return { title: 'هدیه معنادار | نخلستان معنا' };

    return {
        title: `${data.title} | نخلستان معنا`,
        description: data.description,
        keywords: [...data.keywords, 'نخل معنا', 'درختکاری', 'هدیه معنوی'],
        openGraph: {
            title: data.title,
            description: data.subtitle,
            images: [data.heroImage],
        }
    };
}

// --- PAGE COMPONENT ---
export default function GiftLandingPage({ params }: Props) {
    const { occasion } = params;
    const data = OCCASIONS[occasion];

    if (!data) notFound();

    return (
        <div className="min-h-screen bg-gray-900 pt-24 pb-12 relative overflow-hidden">
            {/* Background Ambience */}
            <div className={`absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b ${data.color} opacity-20 blur-[120px] rounded-b-full pointer-events-none`} />

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">

                {/* Emoji Badge */}
                <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-6xl shadow-2xl mb-8 animate-fade-in-up">
                    {data.emoji}
                </div>

                {/* Hero Text */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 leading-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 animate-slide-in">
                    {data.title}
                </h1>

                <p className="text-lg md:text-xl text-center text-gray-300 max-w-2xl mb-12 leading-relaxed animate-fade-in-up delay-100">
                    {data.subtitle}
                </p>

                {/* CTA Button */}
                <Link
                    href={`/shop?intention=${encodeURIComponent(data.intention)}`}
                    className={`group bg-gradient-to-r ${data.color} hover:brightness-110 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg shadow-amber-900/20 transition-all active:scale-95 flex items-center gap-2 mb-16`}
                >
                    <span>همین حالا هدیه دهید</span>
                    <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    {[
                        { title: 'گواهی به نام', desc: 'سند رسمی کاشت نخل به نام هدیه‌گیرنده صادر می‌شود.' },
                        { title: 'صفحه اختصاصی', desc: 'یک صفحه وب دائمی برای ثبت خاطرات و مشاهده رشد نخل.' },
                        { title: 'اثر ابدی', desc: 'ثمره این نخل سال‌ها صرف امور خیریه خواهد شد.' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                            <h3 className="text-xl font-bold mb-2 text-amber-400">{item.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* SEO Text Block (Hidden from visual noise but good for bots/readers) */}
                <div className="mt-20 p-8 rounded-3xl bg-gray-900/50 border border-white/5 max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-200">چرا {data.keywords[0]}؟</h2>
                    <p className="text-gray-400 leading-loose text-justify">
                        {data.description} در دنیای امروز که هدایا فانی و زودگذر هستند، کاشت یک موجود زنده انتخابی هوشمندانه برای کسانی است که به دنبال معنا هستند. نخلستان معنا این امکان را فراهم کرده تا شما بتوانید از راه دور و تنها با چند کلیک، در جنوب ایران درخت بکارید و گواهی آن را به عزیزانتان تقدیم کنید. این {data.keywords[1]} نه تنها محیط زیست را حفظ می‌کند، بلکه اثری ماندگار از عشق و محبت شما بر روی کره زمین باقی می‌گذارد.
                    </p>
                </div>

            </div>
        </div>
    );
}
