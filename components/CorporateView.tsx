import React, { useState, useRef } from 'react';
import { BuildingOfficeIcon, UserGroupIcon, PresentationChartLineIcon, TrophyIcon, GlobeAltIcon, GiftIcon } from './icons';
import { View } from '../types';
import { useAppDispatch } from '../AppContext';

const CorporateView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({ companyName: '', contactPerson: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const contactFormRef = useRef<HTMLFormElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitMessage('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.');
            setFormData({ companyName: '', contactPerson: '', email: '', phone: '', message: '' });
            setTimeout(() => setSubmitMessage(''), 5000);
        }, 1500);
    };
    
    const scrollToContact = () => contactFormRef.current?.scrollIntoView({ behavior: 'smooth' });

    const packages = [
        {
            icon: <TrophyIcon className="w-12 h-12 text-yellow-400" />,
            title: "بسته قدردانی از کارمندان",
            description: "یک هدیه معنادار و ماندگار برای تجلیل از کارمندان نمونه و تقویت فرهنگ سازمانی.",
            features: [
                "✓ کاشت نخل به نام کارمندان",
                "✓ ارائه سند دیجیتال با برند شما",
                "✓ ایده‌آل برای مناسبت‌ها و پاداش‌ها"
            ],
            color: "yellow"
        },
        {
            icon: <GlobeAltIcon className="w-12 h-12 text-green-400" />,
            title: "بسته مسئولیت اجتماعی (CSR)",
            description: "با مشارکت در پروژه‌های بزرگ (مانند احیای یک منطقه)، تعهد سازمان خود به جامعه و محیط زیست را به نمایش بگذارید.",
            features: [
                "✓ مشارکت در پروژه‌های بزرگ مقیاس",
                "✓ داشبورد اختصاصی تاثیرگذاری",
                "✓ محتوای مشترک برای روابط عمومی"
            ],
            color: "green",
            isPopular: true
        },
        {
            icon: <GiftIcon className="w-12 h-12 text-blue-400" />,
            title: "بسته هدیه سازمانی",
            description: "برای مشتریان ویژه، شرکای تجاری یا مناسبت‌های خاص، هدیه‌ای فراتر از انتظار ارائه دهید.",
            features: [
                "✓ ارائه سند نخل به عنوان هدیه",
                "✓ امکان ارائه کدهای تخفیف گروهی",
                "✓ ایجاد یک تجربه برند به یاد ماندنی"
            ],
            color: "blue"
        }
    ];

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24">
            <div className="relative pb-24 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/corporate-hero/1920/1080')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-70"></div>
                <div className="relative container mx-auto px-6 text-center z-10">
                    <h1 className="text-5xl font-bold mb-4">شریک میراث ما شوید</h1>
                    <p className="text-xl max-w-3xl mx-auto">با «نخلستان معنا» در ساختن آینده‌ای پایدار و معنادار برای جامعه و کسب‌وکارتان همراه شوید.</p>
                </div>
            </div>
            <section className="container mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">چرا همکاری با نخلستان معنا؟</h2>
                    <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">همکاری با ما فراتر از یک حمایت مالی است؛ یک سرمایه‌گذاری استراتژیک در مسئولیت اجتماعی، برند و فرهنگ سازمانی شماست.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-gray-700"><div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><BuildingOfficeIcon className="w-8 h-8 text-green-400" /></div><h3 className="text-2xl font-semibold text-white mb-3">مسئولیت اجتماعی شرکتی (CSR)</h3><p className="text-gray-400">تعهد خود را به جامعه و محیط زیست به شکلی ملموس و ماندگار نشان دهید. هر نخل، نمادی از تاثیر مثبت شماست.</p></div>
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-gray-700"><div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><UserGroupIcon className="w-8 h-8 text-blue-400" /></div><h3 className="text-2xl font-semibold text-white mb-3">افزایش تعامل کارکنان</h3><p className="text-gray-400">با هدیه دادن نخل به کارمندان در مناسبت‌های مختلف، حس تعلق و وفاداری را در تیم خود تقویت کنید.</p></div>
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-gray-700"><div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><PresentationChartLineIcon className="w-8 h-8 text-indigo-400" /></div><h3 className="text-2xl font-semibold text-white mb-3">تقویت تصویر برند</h3><p className="text-gray-400">با مشارکت در یک پروژه نوآورانه و معتبر، برند خود را به عنوان یک رهبر مسئولیت‌پذیر و آینده‌نگر معرفی کنید.</p></div>
                </div>
            </section>
            <section className="bg-gray-800/50 py-20">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-12"><h2 className="text-4xl font-bold">بسته‌های همکاری</h2><p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">ما بسته‌های متنوعی را برای سازمان‌ها با اندازه‌ها و اهداف مختلف طراحی کرده‌ایم.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {packages.map(pkg => (
                             <div key={pkg.title} className={`bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col border-2 ${pkg.isPopular ? `border-${pkg.color}-500 transform md:scale-105` : 'border-gray-700' } relative`}>
                                 {pkg.isPopular && <span className={`bg-${pkg.color}-500 text-white text-xs font-bold px-3 py-1 rounded-full self-center absolute -top-4`}>محبوب‌ترین</span>}
                                <div className="mx-auto mb-4">{pkg.icon}</div>
                                <h3 className={`text-2xl font-bold text-center text-${pkg.color}-400 mb-2`}>{pkg.title}</h3>
                                <p className="text-center text-gray-400 mb-6 flex-grow">{pkg.description}</p>
                                <ul className="space-y-3 text-gray-300 text-sm my-4">
                                    {pkg.features.map(feature => <li key={feature}>{feature}</li>)}
                                </ul>
                                <button onClick={scrollToContact} className={`w-full mt-auto bg-${pkg.color}-600 hover:bg-${pkg.color}-700 text-white font-bold py-3 rounded-md transition-colors`}>شروع همکاری</button>
                            </div>
                        ))}
                    </div>
                 </div>
            </section>
            <section className="container mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-bold text-green-400 mb-4">داشبورد تاثیرگذاری شما</h2>
                        <p className="text-lg text-gray-300 leading-relaxed mb-6">شفافیت در قلب فعالیت‌های ماست. با داشبورد اختصاصی ما، تاثیر مثبت همکاری خود را به صورت زنده مشاهده، تحلیل و با ذی‌نفعان خود به اشتراک بگذارید.</p>
                         <ul className="space-y-3 text-gray-300"><li className="flex items-center"><PresentationChartLineIcon className="w-5 h-5 ml-2 text-green-500" /> مشاهده تعداد نخل‌های کاشته شده</li><li className="flex items-center"><PresentationChartLineIcon className="w-5 h-5 ml-2 text-green-500" /> تخمین میزان جذب CO2</li><li className="flex items-center"><PresentationChartLineIcon className="w-5 h-5 ml-2 text-green-500" /> گزارش ساعات اشتغال‌زایی ایجاد شده</li></ul>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-700"><div className="aspect-w-16 aspect-h-10 bg-gray-900 rounded-md flex items-center justify-center"><img src="https://i.ibb.co/6rW8R4f/dashboard-mockup.png" alt="Impact Dashboard Mockup" className="w-full h-full object-cover rounded-md" /></div></div>
                </div>
            </section>
            <section ref={contactFormRef} className="bg-gray-800/50 py-20">
                <div className="container mx-auto px-6 max-w-3xl">
                     <div className="text-center mb-12"><h2 className="text-4xl font-bold">برای همکاری آماده‌اید؟</h2><p className="text-lg text-gray-400 mt-4">فرم زیر را تکمیل کنید تا کارشناسان ما در اسرع وقت با شما تماس بگیرند.</p></div>
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">نام شرکت</label><input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                            <div><label htmlFor="contactPerson" className="block text-sm font-medium text-gray-300 mb-2">نام رابط</label><input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                            <div><label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">ایمیل</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                             <div><label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">تلفن تماس</label><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                        </div>
                         <div><label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">پیام شما (اختیاری)</label><textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"></textarea></div>
                         <div><button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center">{isSubmitting ? 'در حال ارسال...' : 'ارسال درخواست همکاری'}</button></div>
                        {submitMessage && <p className="text-center text-green-300 mt-4">{submitMessage}</p>}
                    </form>
                </div>
            </section>
        </div>
    );
};

export default CorporateView;