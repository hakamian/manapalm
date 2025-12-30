'use client';

import React from 'react';
import TeamView from './TeamView';
import { View } from '../types';
import { useAppDispatch } from '../AppContext';

const AboutView: React.FC = () => {
    const dispatch = useAppDispatch();
    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });

    return (
        <div className="bg-gray-900 text-white pb-24">
            {/* Hero Section */}
            {/* Hero Section */}
            <div className="relative pb-20 bg-cover bg-center" style={{ backgroundImage: "url('/assets/about/palm-path.jpg')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-70"></div>
                <div className="relative container mx-auto px-6 text-center hero-header-clearance">
                    <h1 className="text-5xl font-bold mb-4">داستان ما: ریشه‌ها در خاک، نگاه به آینده</h1>
                    <p className="text-xl max-w-3xl mx-auto mb-12">
                        ما باور داریم که هر دانه می‌تواند جنگلی را بسازد و هر انسان می‌تواند معنایی عمیق در زندگی خود و دیگران بکارد.
                    </p>
                    <img
                        src="/assets/about/aerial-complex.jpg"
                        alt="A thriving palm grove under a hopeful sky"
                        className="rounded-lg shadow-2xl w-full max-w-5xl mx-auto object-cover h-auto"
                    />
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                {/* Mission and Vision - Business Focused */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-4xl font-bold text-green-400 mb-4">مدل کسب‌وکار ما</h2>
                        <h3 className="text-xl font-bold text-white mb-2">تلفیق تجارت و کشاورزی پایدار</h3>
                        <p className="text-lg text-gray-300 leading-relaxed text-justify">
                            «نخلستان معنا» یک بنگاه اقتصادی فعال در حوزه کشاورزی و فروش محصولات ارگانیک است. ما خدمات حرفه‌ای کاشت و نگهداری درختان نخل را به مشتریان ارائه می‌دهیم و در کنار آن، محصولات جانبی و باکیفیت نخلستان (مانند خرما، شیره، و صنایع دستی) را مستقیماً به بازار عرضه می‌کنیم. رویکرد ما «تجارت مسئولانه» است؛ به این معنا که سودآوری اقتصادی را با توسعه زیرساخت‌های کشاورزی و اشتغال‌زایی برای مردم منطقه گره زده‌ایم. شما با خرید از ما، یک کالا یا خدمت مشخص و باکیفیت دریافت می‌کنید که پشتوانه آن، سال‌ها تجربه و تخصص در صنعت کشاورزی است.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <img src="/assets/about/memorial-family.jpg" alt="Our Business Model" className="rounded-lg shadow-2xl object-cover w-full h-80" />
                    </div>
                </div>

                {/* Values Section - Commercial & Quality Focused */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold mb-10">ارزش‌های تجاری ما</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold text-green-400 mb-3">کیفیت تضمین شده</h3>
                            <p className="text-gray-400 leading-7">تعهد ما ارائه محصولات ارگانیک و خدمات کشاورزی با بالاترین استانداردهای کیفی است. مشتری حق دارد در ازای هزینه پرداختی، بهترین محصول را دریافت کند.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold text-green-400 mb-3">شفافیت مالی و عملکردی</h3>
                            <p className="text-gray-400 leading-7">ما یک خیریه نیستیم؛ بلکه کسب‌وکاری شفاف هستیم که گزارش‌های عملکردی و مالی پروژه‌های کاشت و فروش را به صورت روشن در اختیار مشتریان و شرکا قرار می‌دهیم.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold text-green-400 mb-3">توسعه اقتصاد ملی</h3>
                            <p className="text-gray-400 leading-7">با سرمایه‌گذاری در کشاورزی نوین و فروش محصولات بومی، به چرخه تولید ثروت در کشور کمک کرده و برای جامعه محلی درآمد پایدار ایجاد می‌کنیم.</p>
                        </div>
                    </div>
                </div>

                {/* Impact Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-10">تأثیر ما تا امروز</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۱۵۰۰+</p>
                            <p className="text-gray-400 mt-2">نخل کاشته شده</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۵۰+</p>
                            <p className="text-gray-400 mt-2">خانواده بهره‌مند</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۱۰ هکتار</p>
                            <p className="text-gray-400 mt-2">زمین احیا شده</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۵</p>
                            <p className="text-gray-400 mt-2">محصول جدید</p>
                        </div>
                    </div>
                    <div className="mt-12">
                        <button onClick={onStartPlantingFlow} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-[0_5px_15px_rgba(74,222,128,0.4)]">
                            شما هم در این تاثیر سهیم شوید
                        </button>
                    </div>
                </div>
            </div>

            {/* Founder Message Section */}
            <div className="container mx-auto px-6 mb-20">
                <div className="bg-gray-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-xl border border-gray-700">
                    <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                        <img src="https://picsum.photos/seed/founder/300/300" alt="حسین حکمیان" className="w-full h-full object-cover rounded-full border-4 border-green-500 shadow-lg" />
                    </div>
                    <div className="flex-grow text-center md:text-right">
                        <h2 className="text-3xl font-bold text-white mb-2">حسین حکمیان</h2>
                        <h3 className="text-xl text-green-400 mb-6">بنیان‌گذار نخلستان معنا</h3>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            «نخلستان معنا» یک پلتفرم تجاری متمرکز بر کشاورزی مدرن است. هدف ما این است که با ارائه مدلی کارآمد از "کشاورزی قراردادی" و "فروش مستقیم محصولات ارگانیک"، هم بازدهی اقتصادی برای سرمایه‌گذاران و خریداران ایجاد کنیم و هم به توسعه زیرساخت‌های تولیدی کشور کمک نماییم. ما اینجا تجارت می‌کنیم، اما تجارتی که در آن سود مالی با ارزش‌های زیست‌محیطی و ملی هم‌سو است. تعهد من، مدیریت حرفه‌ای این سرمایه‌ها و تضمین کیفیت خدمات و محصولات ارائه شده به شماست.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <a href="mailto:info@manapalm.com" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                ارتباط مستقیم با بنیان‌گذار
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="container mx-auto px-6 mb-12">
                <h2 className="text-4xl font-bold text-center mb-10">تیم ما</h2>
                <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">ما تیمی از متخصصان کشاورزی، مهندسان نرم‌افزار و عاشقان طبیعت هستیم که گرد هم آمده‌ایم تا این رویا را محقق کنیم.</p>
                <TeamView />
            </div>

            <div className="container mx-auto px-6 text-center pb-8">
                <p className="text-gray-400 mb-4">آیا سوالی دارید یا می‌خواهید با بخش خاصی از تیم صحبت کنید؟</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => onNavigate(View.Contact)} className="text-green-400 hover:text-green-300 border-b border-green-400 hover:border-green-300 pb-1 transition-all">
                        ارتباط با تیم پشتیبانی و فنی
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(AboutView);