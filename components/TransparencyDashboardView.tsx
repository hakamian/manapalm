
import React from 'react';
import { ShieldCheckIcon, SparklesIcon, SproutIcon, BriefcaseIcon, CloudIcon } from './icons';

// Animated counter hook (can be moved to utils if needed elsewhere)
const useAnimatedCounter = (endValue: number, duration = 2000) => {
    const [count, setCount] = React.useState(0);
    const ref = React.useRef<HTMLParagraphElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let startTime: number | null = null;
                    const animate = (timestamp: number) => {
                        if (!startTime) startTime = timestamp;
                        const progress = timestamp - startTime;
                        const percentage = Math.min(progress / duration, 1);
                        setCount(Math.floor(percentage * endValue));
                        if (progress < duration) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.5 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [endValue, duration]);

    return { count, ref };
};


const TransparencyDashboardView: React.FC = () => {

    const totalPalms = useAnimatedCounter(1527);
    const totalJobHours = useAnimatedCounter(5120);
    const totalCo2 = useAnimatedCounter(30540);

    const allocationData = [
        { label: 'کاشت نخل و نگهداری', value: 55, color: 'bg-green-500' },
        { label: 'ایجاد اشتغال مستقیم', value: 25, color: 'bg-blue-500' },
        { label: 'پروژه‌های توانمندسازی جامعه', value: 10, color: 'bg-yellow-500' },
        { label: 'عملیات و توسعه پلتفرم', value: 10, color: 'bg-indigo-500' },
    ];
    
    const impactStories = [
        { title: "از خاک تا امید: داستان رضا", text: "رضا، یکی از جوانان روستای ما، پیش از این برای یافتن کار به شهرهای بزرگ می‌رفت. امروز او یکی از نخل‌داران متخصص ماست و با درآمد حاصل از آن، خانواده خود را تامین می‌کند و برای آینده‌اش رویا می‌بافد." },
        { title: "یک کلاس درس زیر سایه نخل‌ها", text: "با بخشی از درآمد حاصل از مشارکت شما، توانستیم یک کلاس آموزشی برای کودکان روستا در نزدیکی نخلستان راه‌اندازی کنیم. حالا صدای خنده بچه‌ها با خش‌خش برگ نخل‌ها در هم آمیخته است." }
    ];

    return (
        <div className="bg-gray-900 text-white min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6">
                <header className="text-center mb-16">
                    <ShieldCheckIcon className="w-16 h-16 mx-auto text-green-400 mb-4" />
                    <h1 className="text-5xl font-bold text-green-400 mb-4">داشبورد شفافیت ما</h1>
                    <p className="text-xl max-w-3xl mx-auto text-gray-300">
                        ما به شفافیت در مسیر خلق معنا باور داریم. در اینجا، خلاصه‌ای از چگونگی تبدیل مشارکت شما به تاثیر واقعی را مشاهده می‌کنید.
                    </p>
                </header>

                {/* Key Impact Numbers */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {/* FIX: Changed ref type from span to paragraph to match hook */}
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center"><SproutIcon className="w-12 h-12 mx-auto text-green-400 mb-3" /><p ref={totalPalms.ref} className="text-5xl font-bold text-white">{totalPalms.count.toLocaleString('fa-IR')}+</p><p className="text-gray-400 mt-2">نخل کاشته شده</p></div>
                    {/* FIX: Changed ref type from span to paragraph to match hook */}
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center"><BriefcaseIcon className="w-12 h-12 mx-auto text-blue-400 mb-3" /><p ref={totalJobHours.ref} className="text-5xl font-bold text-white">{totalJobHours.count.toLocaleString('fa-IR')}+</p><p className="text-gray-400 mt-2">ساعت اشتغال‌زایی</p></div>
                    {/* FIX: Changed ref type from span to paragraph to match hook */}
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center"><CloudIcon className="w-12 h-12 mx-auto text-teal-400 mb-3" /><p ref={totalCo2.ref} className="text-5xl font-bold text-white">{totalCo2.count.toLocaleString('fa-IR')}</p><p className="text-gray-400 mt-2">کیلوگرم جذب CO2 (سالانه)</p></div>
                </section>

                {/* Financial Commitment */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-10">تعهد مالی ما: چگونه مشارکت شما هزینه می‌شود؟</h2>
                    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
                        <p className="text-center text-gray-400 mb-6">هدف ما حداکثر کردن تاثیر اجتماعی است. در اینجا یک نمای کلی از نحوه تخصیص منابع حاصل از مشارکت‌های شما آورده شده است:</p>
                        <div className="space-y-4">
                            {allocationData.map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                                        <span className="text-gray-200">{item.label}</span>
                                        <span className="text-white">{item.value}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div className={`${item.color} h-4 rounded-full`} style={{ width: `${item.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                 {/* Impact Stories */}
                <section>
                    <h2 className="text-3xl font-bold text-center mb-10">داستان‌هایی از نخلستان</h2>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        {impactStories.map(story => (
                             <div key={story.title} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                                <h3 className="text-xl font-semibold text-green-400 mb-3">{story.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{story.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TransparencyDashboardView;
