
import React, { useState, useMemo } from 'react';
import { ChevronDownIcon } from './icons';
import { View, User } from '../types';
import { useAppDispatch, useAppState } from '../AppContext';

const generalFaqs = [
    { question: 'نخلستان معنا چیست؟', answer: 'نخلستان معنا یک کسب و کار اجتماعی است که با کاشت نخل به دنبال ایجاد معنا برای افراد، اشتغال‌زایی برای جوامع محلی، و حفاظت از محیط زیست است. هر نخل کاشته شده، نماد یک داستان و میراث انسانی است.' },
    { question: 'آیا کاشت نخل‌ها واقعی است؟', answer: 'بله، کاملاً. تمام نخل‌ها در مناطق مشخص شده در پروژه‌های اجتماعی ما (مانند استان بوشهر) توسط تیم‌های محلی کاشته می‌شوند.' },
    { question: 'چگونه می‌توانم مشارکت کنم؟', answer: 'شما می‌توانید با «کاشت یک میراث»، خرید از «فروشگاه»، یا شرکت در «دوره‌ها» در این جنبش سهیم باشید. هر فعالیت شما به رشد این حرکت کمک می‌کند.' },
    { question: 'سود حاصل از فروش صرف چه اموری می‌شود؟', answer: 'تمام سود حاصل از فروش، صرف توسعه نخلستان، ایجاد اشتغال پایدار برای جوامع محلی، و پروژه‌های توانمندسازی و رفع محرومیت در منطقه می‌شود. شما می‌توانید گزارش‌های کلی را در «داشبورد شفافیت» دنبال کنید.', cta: { text: 'مشاهده داشبورد شفافیت', actionType: 'navigate', view: View.TransparencyDashboard } },
    { question: 'آیا می‌توانم یک نخل را به کسی هدیه دهم؟', answer: 'بله! شما می‌توانید هنگام کاشت نخل، نام فرد مورد نظر خود را به عنوان گیرنده ثبت کرده و یک پیام تقدیمی شخصی برای او بنویسید. سند دیجیتال نخل به نام آن فرد صادر خواهد شد.' },
    { question: 'امتیازها و سطوح کاربری چه کاربردی دارند؟', answer: "امتیازها بخشی از «سفر قهرمانی» شماست. با فعالیت در سایت، امتیاز کسب می‌کنید و به سطوح بالاتری می‌رسید که مزایای ویژه‌ای مانند امکان پرداخت قسطی و دسترسی به محتوای خاص را برای شما باز می‌کند.", cta: { text: 'مشاهده سفر قهرمانی', actionType: 'navigate', view: View.HEROS_JOURNEY_INTRO } },
    { question: '«سفر قهرمانی» چیست؟', answer: 'یک مسیر هدایت‌شده برای کشف عمیق‌ترین ارزش‌ها، استعدادها و رسالت شخصی شماست که با ابزارهای خودشناسی و همراهی مربی هوشمند، به شما در این راه کمک می‌کند.' },
    { question: 'چگونه از پول من استفاده می‌شود؟', answer: '۹۰٪ از هزینه خرید نخل شما مستقیماً صرف هزینه‌های کاشت، نگهداری و ایجاد اشتغال می‌شود و ۱۰٪ باقیمانده برای توسعه و نگهداری پلتفرم استفاده می‌گردد.' },
    { question: '«کانون» چه فضایی است؟', answer: '«کانون» قلب تپنده جامعه ماست. جایی برای گفتگو، به اشتراک گذاشتن داستان‌ها، و مشارکت در پروژه‌های هم‌آفرینی.', cta: { text: 'ورود به کانون', actionType: 'navigate', view: View.CommunityHub } },
    { question: 'آیا امکان بازدید از نخلستان‌ها وجود دارد؟', answer: 'بله، ما برنامه‌های بازدید از نخلستان را در فصول مشخصی از سال برگزار می‌کنیم. برای اطلاعات بیشتر به بخش «رویدادها» در کانون مراجعه کنید.' },
];

const newUserFaqs = [
    { question: 'چطور می‌توانم اولین نخلم را بکارم؟', answer: 'از صفحه اصلی روی «همین حالا شروع کنید» کلیک کنید یا مستقیماً به «تالار میراث» بروید. سپس نیت خود را انتخاب کرده و مراحل را دنبال نمایید.', cta: { text: 'شروع کاشت نخل', actionType: 'startPlantingFlow' } },
    { question: 'امتیاز چیست و چگونه آن را سریع‌تر کسب کنم؟', answer: 'امتیازها پاداش شما برای مشارکت است. سریع‌ترین راه برای شروع، تکمیل کردن پروفایل کاربری‌تان است که تا ۱۵۰ امتیاز به شما هدیه می‌دهد.', cta: { text: 'تکمیل پروفایل', actionType: 'navigateToProfileTab', tab: 'profile' } },
    { question: '«سفر قهرمانی» چیست و چگونه آن را شروع کنم؟', answer: 'یک مسیر هدایت‌شده برای خودشناسی است. برای شروع، باید قفل آن را با گفتگو با «مربی معنا» باز کنید. این گفتگو به شما کمک می‌کند تا ارزش‌های اصلی خود را بشناسید.', cta: { text: 'شروع گفتگو با مربی', actionType: 'navigate', view: View.CompassUnlockChat } },
    ...generalFaqs.slice(3, 10) // Add some general FAQs to pad it out
];

const planterFaqs = [
    { question: 'چگونه می‌توانم خاطره‌ای برای نخل کاشته شده‌ام ثبت کنم؟', answer: 'به پروفایل کاربری خود بروید و وارد بخش «گاهشمار معنا» شوید. در کنار رویداد کاشت نخل، گزینه‌ای برای افزودن یا ویرایش خاطره وجود دارد.', cta: { text: 'رفتن به گاهشمار', actionType: 'navigateToProfileTab', tab: 'timeline' } },
    { question: 'چگونه می‌توانم سند نخل خود را به اشتراک بگذارم؟', answer: 'در «گاهشمار معنا»، روی رویداد کاشت نخل کلیک کنید تا سند آن نمایش داده شود. در آنجا گزینه‌هایی برای دانلود و اشتراک‌گذاری سند وجود دارد.' },
    { question: 'چگونه می‌توانم در پروژه‌های اجتماعی مشارکت کنم؟', answer: 'شما می‌توانید با اهدای امتیاز یا خرید «نخل همیاری»، در پروژه‌های بزرگ‌تر مانند ساخت مدرسه یا چاه آب سهیم شوید. این پروژه‌ها در بخش «هم‌آفرینی» معرفی می‌شوند.', cta: { text: 'مشاهده پروژه‌ها', actionType: 'navigate', view: View.CoCreation } },
    ...generalFaqs.slice(3, 10)
];

const guardianFaqs = [
    { question: 'نقش من به عنوان یک «نگهبان» چیست؟', answer: 'شما به عنوان یک نگهبان، راهنما و الگوی جامعه هستید. نقش شما الهام‌بخشی به اعضای جدیدتر، و کمک به حفظ ارزش‌های اصلی جنبش نخلستان معناست.' },
    { question: 'چگونه می‌توانم یک «رهجو» را راهنمایی کنم؟', answer: 'در پروفایل خود، بخش «مربی‌گری» برای شما فعال شده است. از آنجا می‌توانید به درخواست‌های مربی‌گری پاسخ دهید و با رهجویان خود در ارتباط باشید.', cta: { text: 'رفتن به پنل مربی‌گری', actionType: 'navigateToProfileTab', tab: 'mentorship' } },
    { question: 'چگونه در تصمیم‌گیری‌های آینده جنبش مشارکت کنم؟', answer: 'حلقه نگهبانان به عنوان یک شورای مشورتی عمل می‌کند. نظرات شما از طریق کانال‌های ارتباطی ویژه شنیده خواهد شد و در جلسات آنلاین فصلی می‌توانید مستقیماً مشارکت کنید.' },
    ...generalFaqs.slice(3, 10)
];


interface FAQItemProps {
    item: {
        question: string;
        answer: string;
        cta?: { text: string; actionType: string; view?: View; tab?: string };
    };
    isOpen: boolean;
    onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ item, isOpen, onToggle }) => {
    const dispatch = useAppDispatch();
    const handleCTAClick = () => {
        if (!item.cta) return;
        if (item.cta.actionType === 'navigate' && item.cta.view) {
            dispatch({ type: 'SET_VIEW', payload: item.cta.view });
        } else if (item.cta.actionType === 'startPlantingFlow') {
            dispatch({ type: 'START_PLANTING_FLOW' });
        } else if (item.cta.actionType === 'navigateToProfileTab' && item.cta.tab) {
            dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: item.cta.tab });
        }
    };

    return (
        <div className="border-b border-gray-700">
            <button
                onClick={onToggle}
                className="w-full text-right flex justify-between items-center p-6 hover:bg-gray-700/50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.question}`}
            >
                <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><ChevronDownIcon /></span>
            </button>
            <div id={`faq-answer-${item.question}`} role="region" className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-gray-300 leading-relaxed">
                        <p>{item.answer}</p>
                        {item.cta && (
                            <div className="mt-4 text-left">
                                <button onClick={handleCTAClick} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">{item.cta.text}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FAQView: React.FC = () => {
    const { user } = useAppState();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqData = useMemo(() => {
        if (!user) {
            return generalFaqs;
        }
        if (user.isGuardian) {
            return guardianFaqs;
        }
        // Check timeline for PLANTED_PALM event
        const hasPlanted = user.timeline?.some(e => e.type === 'palm_planted');
        if (hasPlanted) {
            return planterFaqs;
        }
        // A simple way to define a "new user"
        if ((user.timeline?.length || 0) < 3 && user.points < 200) {
            return newUserFaqs;
        }
        return generalFaqs;
    }, [user]);

    const handleToggle = (index: number) => setOpenIndex(openIndex === index ? null : index);

    return (
        <section className="bg-gray-800 text-white py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">سوالات متداول</h2>
                    <p className="text-lg text-gray-400 mt-4">پاسخ برخی از سوالات پرتکرار شما را در اینجا گردآوری کرده‌ایم.</p>
                </div>
                <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    {faqData.map((item, index) => (
                        <FAQItem key={index} item={item} isOpen={openIndex === index} onToggle={() => handleToggle(index)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default React.memo(FAQView);
