
import React from 'react';
import { motion } from 'framer-motion';
import {
    SitemapIcon,
    ShoppingCartIcon,
    CpuChipIcon,
    BriefcaseIcon,
    BoltIcon,
    ShieldCheckIcon,
    HeartIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    SparklesIcon
} from './icons';
import { useAppDispatch, useAppState } from '../AppContext';
import { View } from '../types';

const CollaborationView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { products } = useAppState();

    const digitalServices = [
        {
            title: 'کسب‌وکار نوپا (Landing)',
            price: '۲ نهال',
            icon: <SitemapIcon className="w-12 h-12 text-emerald-400" />,
            features: ['Next.js 15', 'سئو پیشرفته', 'مدیریت محتوا', 'دوزبانه'],
            buttonText: 'رزرو و شروع همکاری'
        },
        {
            title: 'فروشگاه حرفه‌ای و اپلیکیشن',
            price: '۱۲ نهال',
            icon: <ShoppingCartIcon className="w-12 h-12 text-emerald-400" />,
            features: ['اپلیکیشن موبایل', 'درگاه پرداخت', 'سیستم انبارداری', 'پوش نوتیفیکیشن'],
            buttonText: 'رزرو و شروع همکاری'
        },
        {
            title: 'تحول دیجیتال و هوش مصنوعی',
            price: '۶ نهال',
            icon: <CpuChipIcon className="w-12 h-12 text-emerald-400" />,
            features: ['ایجنت‌های هوشمند', 'خودکارسازی فرآیند', 'اتصال به API', 'گزارش تحلیلی'],
            buttonText: 'رزرو و شروع همکاری'
        },
        {
            title: 'پیمان استراتژیک (Enterprise)',
            price: 'از ۲۵ نهال',
            icon: <BriefcaseIcon className="w-12 h-12 text-emerald-400" />,
            features: ['مشاوره اختصاصی', 'تیم فنی تمام‌وقت', 'نگهداری ویژه', 'مقیاس‌پذیری بالا'],
            buttonText: 'رزرو و شروع همکاری'
        }
    ];

    const directSupport = [
        {
            id: 'p_support_javan',
            title: 'حامی جوانه',
            price: '۱/۲ نهال',
            icon: <BoltIcon className="w-8 h-8 text-blue-400" />,
            description: 'کمک به تحقیقات اولیه',
            buttonText: 'ثبت حمایت',
            iconBg: 'bg-blue-500/10'
        },
        {
            id: 'p_support_root',
            title: 'حامی ریشه',
            price: '۱ نهال',
            icon: <ShieldCheckIcon className="w-8 h-8 text-green-400" />,
            description: 'تأمین نهاده‌های اولیه',
            buttonText: 'ثبت حمایت',
            iconBg: 'bg-green-500/10'
        },
        {
            id: 'p_support_palm',
            title: 'حامی نخل',
            price: '۵ نهال',
            icon: <HeartIcon className="w-8 h-8 text-amber-500" />,
            description: 'حمایت از تملک زمین',
            buttonText: 'ثبت حمایت',
            iconBg: 'bg-amber-500/10'
        }
    ];

    const handleSupportClick = (supportId: string) => {
        const product = products.find(p => p.id === supportId);
        if (product) {
            dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
        }
    };

    return (
        <div className="bg-[#04140c] text-white min-h-screen pt-24 pb-20">
            {/* Digital Services Section */}
            <section className="container mx-auto px-6 mb-32">
                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-amber-400"
                    >
                        خدمات دیجیتال؛ رشد کسب‌وکار، احیای طبیعت
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-emerald-100/60 max-w-3xl mx-auto text-lg leading-relaxed"
                    >
                        در شرایط دشوار اقتصادی، ما کنار شما هستیم تا با هزینه‌ای منطقی، هم کسب‌وکارتان را مدرن کنید و هم در بزرگترین پروژه سبز کشور سهیم شوید.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block mt-8 p-4 md:p-6 rounded-3xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-sm max-w-2xl"
                    >
                        <p className="text-sm italic text-emerald-200/70 leading-relaxed font-light">
                            در فاز فعلی (The Seed)، درآمد حاصله مستقیماً صرف زیرساخت‌های نخلستان، تحقیقات خاک و تملک زمین می‌شود. هر نهال تعهدی، یک واحد سرمایه‌گذاری در آینده سبز است.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {digitalServices.map((service, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-[#0a2a1d] border border-emerald-500/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center group hover:border-emerald-500/30 transition-all"
                        >
                            <div className="mb-6 p-4 bg-emerald-900/20 rounded-3xl group-hover:scale-110 transition-transform">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-6 text-white leading-tight">{service.title}</h3>

                            <div className="mb-8 px-6 py-2 bg-emerald-900/40 rounded-full border border-emerald-500/20 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400 font-black">{service.price}</span>
                            </div>

                            <ul className="space-y-4 mb-10 w-full text-right">
                                {service.features.map((f, i) => (
                                    <li key={i} className="flex items-center justify-end gap-3 text-sm text-emerald-100/50">
                                        <span>{f}</span>
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-500/50" />
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.Contact })}
                                className="mt-auto w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                            >
                                <span>{service.buttonText}</span>
                                <ArrowLeftIcon className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Direct Support Section */}
            <section className="bg-[#020c08] py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black text-white mb-6"
                        >
                            حمایت مستقیم از نخلستان
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-emerald-100/40 max-w-2xl mx-auto"
                        >
                            اگر به خدمات دیجیتال نیاز ندارید اما می‌خواهید در احیای طبیعت سهمی داشته باشید، می‌توانید مستقیماً از فاز زیرساخت حمایت کنید.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {directSupport.map((support, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#0a2a1d] border border-emerald-500/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:bg-[#0d3525] transition-colors"
                            >
                                <div className={`mb-8 p-6 ${support.iconBg} rounded-3xl`}>
                                    {support.icon}
                                </div>

                                <h3 className="text-2xl font-bold mb-2">{support.title}</h3>
                                <div className="text-3xl font-black text-emerald-400 mb-6 flex items-center gap-2">
                                    <span>{support.price}</span>
                                    <SparklesIcon className="w-5 h-5" />
                                </div>

                                <p className="text-emerald-100/40 text-sm mb-10">
                                    {support.description}
                                </p>

                                <button
                                    onClick={() => handleSupportClick(support.id)}
                                    className="w-full py-4 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-100/70 border border-emerald-500/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <span>{support.buttonText}</span>
                                    <ArrowLeftIcon className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CollaborationView;
