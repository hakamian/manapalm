

import React from 'react';
import { WifiSlashIcon, HomeIcon, WavesIcon, SparklesIcon, ArrowLeftIcon } from './icons.tsx';

const EcoLodgePage: React.FC = () => {
    const features = [
        {
            icon: WifiSlashIcon,
            title: 'تجربه زندگی بدون تکنولوژی',
            description: 'در اقامتگاه ما، تلفن‌های همراه و دستگاه‌های دیجیتال کنار گذاشته می‌شوند تا فضایی برای آرامش و ارتباط عمیق با خود و طبیعت فراهم شود.',
            color: 'text-red-500',
            darkColor: 'text-red-400',
            bgColor: 'bg-red-100',
            darkBgColor: 'bg-red-900/20'
        },
        {
            icon: HomeIcon,
            title: 'خانه‌های کاهگلی با طراحی سنتی',
            description: 'اقامت در خانه‌هایی با معماری بومی و طراحی داخلی آرامش‌بخش که حسی از سادگی و اصالت را به شما هدیه می‌دهد.',
            color: 'text-amber-700',
            darkColor: 'text-amber-400',
            bgColor: 'bg-amber-100',
            darkBgColor: 'bg-amber-900/20'
        },
        {
            icon: WavesIcon,
            title: 'استخر ساحلی کوچک اختصاصی',
            description: 'هر اقامتگاه دارای یک استخر کوچک با طراحی ساحلی است که فضایی خصوصی و دلنشین برای استراحت و تمدد اعصاب فراهم می‌کند.',
            color: 'text-sky-500',
            darkColor: 'text-sky-400',
            bgColor: 'bg-sky-100',
            darkBgColor: 'bg-sky-900/20'
        },
        {
            icon: SparklesIcon,
            title: 'برنامه‌های ویژه معنا و آگاهی',
            description: 'شرکت در کارگاه‌های کوچینگ معنا، مدیتیشن، و یوگا که به صورت اختصاصی برای مهمانان اقامتگاه برگزار می‌شود.',
            color: 'text-indigo-500',
            darkColor: 'text-indigo-400',
            bgColor: 'bg-indigo-100',
            darkBgColor: 'bg-indigo-900/20'
        },
    ];

    return (
        <div className="space-y-20 md:space-y-28 pb-16 animate-fade-in-up">
            {/* --- Hero Section --- */}
            <section className="relative text-center py-24 md:py-32 overflow-hidden rounded-3xl">
                 <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-30"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1587979275992-95b77457782b?q=80&w=2839&auto=format&fit=crop')"}}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-800 via-stone-800/70 to-transparent dark:from-black dark:via-black/70"></div>
                
                <div className="relative container mx-auto px-4 z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                        اقامتی در آغوش معنا
                    </h1>
                    <p className="text-lg md:text-xl text-stone-200 max-w-3xl mx-auto">
                        تجربه‌ای منحصر به فرد برای اعضای ویژه نخلستان معنا. از دنیای دیجیتال فاصله بگیرید و با خودتان دوباره ارتباط برقرار کنید.
                    </p>
                </div>
            </section>

            {/* --- Philosophy Section --- */}
            <section className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100">چرا یک اقامتگاه بدون تکنولوژی؟</h2>
                <p className="text-lg text-stone-600 dark:text-stone-300 mt-4 max-w-3xl mx-auto leading-relaxed">
                    در دنیای پرشتاب امروز، لحظاتی برای بازنگری و سکوت ضروری است. ما در اقامتگاه بوم‌گردی نخلستان معنا، با حذف عامدانه نمادهای تکنولوژی مانند تلفن همراه و اینترنت، فضایی را خلق کرده‌ایم که در آن می‌توانید به صدای درون خود گوش دهید، با طبیعت یکی شوید و معنای واقعی آرامش را دوباره کشف کنید. این یک دعوت به بازگشتی به اصالت است.
                </p>
            </section>

            {/* --- Features Section --- */}
            <section className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white dark:bg-stone-800/50 p-8 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center">
                            <div className={`inline-block p-4 ${feature.bgColor} ${'dark:' + feature.darkBgColor} rounded-full mb-4`}>
                               <feature.icon className={`w-10 h-10 ${feature.color} dark:${feature.darkColor}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                            <p className="text-stone-600 dark:text-stone-300">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EcoLodgePage;
