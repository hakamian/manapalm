
import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { SparklesIcon, ArrowLeftIcon, HandshakeIcon, BanknotesIcon, LeafIcon, BrainCircuitIcon, SitemapIcon, ArrowTrendingUpIcon, CheckIcon, PencilSquareIcon, ChartBarIcon } from './icons';
import { WebsitePackage, WebDevProject, CartItem } from '../types';
import WebsiteWizardModal from './WebsiteWizardModal';
import { getAIAssistedText } from '../services/geminiService';
import CourseReviews, { AddReviewForm } from './CourseReviews';

const packages: (WebsitePackage & { description: string; features: string[] })[] = [
    {
        id: 'website_seed',
        name: 'بذر دیجیتال (وب‌سایت شخصی)',
        price: 9000000,
        description: 'مناسب برای فریلنسرها و متخصصان. یک رزومه آنلاین حرفه‌ای.',
        features: ['طراحی تک صفحه‌ای (Landing)', 'فرم تماس', 'گالری نمونه کار', 'ریسپانسیو موبایل']
    },
    {
        id: 'website_sapling',
        name: 'نهال دیجیتال (سایت شرکتی)',
        price: 18000000,
        description: 'مناسب شرکت‌ها و کسب‌وکارهای کوچک. معرفی خدمات و برندینگ.',
        features: ['تا ۵ صفحه (خانه، خدمات، ...)', 'وبلاگ خبری', 'بهینه‌سازی اولیه SEO', 'پنل مدیریت آسان']
    },
    {
        id: 'website_palm',
        name: 'نخل دیجیتال (فروشگاه آنلاین)',
        price: 30000000,
        description: 'مناسب فروشگاه‌ها. یک شعبه آنلاین کامل با درگاه پرداخت.',
        features: ['فروشگاه کامل', 'اتصال به درگاه بانکی', 'سیستم عضویت کاربران', 'سرعت بالا و امنیت']
    }
];

const PackageCard: React.FC<{ packageInfo: (typeof packages)[0], onAnalyze: () => void }> = ({ packageInfo, onAnalyze }) => (
    <div className="bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border-2 border-stone-200/50 dark:border-stone-700/50 flex flex-col p-6 text-center transition-all duration-300 hover:border-amber-400 dark:hover:border-amber-500 hover:scale-105">
        <h3 className="text-2xl font-bold">{packageInfo.name}</h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">{packageInfo.description}</p>
        
        <div className="my-6 opacity-80">
            <span className="text-3xl font-bold">{packageInfo.price.toLocaleString('fa-IR')}</span>
            <span className="text-sm font-semibold"> تومان</span>
        </div>
        
        <ul className="space-y-2 text-sm text-right flex-grow mb-6">
            {packageInfo.features.map(feature => (
                <li key={feature} className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>

        <button onClick={onAnalyze} className="w-full bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            <BrainCircuitIcon className="w-5 h-5 text-amber-400" />
            <span>تحلیل ارزش و سفارش</span>
        </button>
        <p className="text-[10px] text-stone-400 mt-2">قبل از پرداخت، خروجی و ارزش را ببینید.</p>
    </div>
);

const MoneyFlowChart = () => (
    <div className="my-8 bg-stone-800 p-6 rounded-2xl border border-stone-700">
        <h3 className="text-lg font-bold text-white mb-6 text-center">شفافیت مالی: پول شما کجا می‌رود؟</h3>
        <div className="relative h-12 w-full bg-stone-700 rounded-full overflow-hidden flex">
            <div className="h-full bg-green-500 flex items-center justify-center text-white font-bold text-sm transition-all hover:bg-green-400 cursor-help relative group" style={{ width: '90%' }}>
                ۹۰٪
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-stone-900 text-xs p-2 rounded text-white whitespace-nowrap z-10 border border-stone-600">
                    سرمایه‌گذاری اجتماعی (کاشت نخل، اشتغال‌زایی)
                </div>
            </div>
            <div className="h-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm transition-all hover:bg-blue-400 cursor-help relative group" style={{ width: '10%' }}>
                ۱۰٪
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-stone-900 text-xs p-2 rounded text-white whitespace-nowrap z-10 border border-stone-600">
                    هزینه‌های فنی و پلتفرم
                </div>
            </div>
        </div>
        <div className="flex justify-between mt-3 text-xs text-stone-400 px-2">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>تاثیر مستقیم اجتماعی</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>توسعه پلتفرم</span>
            </div>
        </div>
    </div>
);

const DigitalHeritageArchitectPage: React.FC = () => {
    const { user: currentUser } = useAppState();
    const dispatch = useAppDispatch();
    const [preSelectedPackage, setPreSelectedPackage] = useState<WebsitePackage | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    const setIsAuthModalOpen = (isOpen: boolean) => {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: isOpen });
    };

    const handleAddToCart = (pkg: WebsitePackage, data: WebDevProject['initialRequest']) => {
        const cartItem: CartItem = {
            id: `${pkg.id}-${Date.now()}`,
            productId: pkg.id,
            name: `معمار میراث دیجیتال: ${pkg.name}`,
            price: pkg.price,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop', // Placeholder
            stock: 999,
            type: 'service',
            points: Math.floor(pkg.price / 1000), // Give points for purchase
            webDevDetails: data,
            popularity: 100,
            dateAdded: new Date().toISOString(),
        };
        
        dispatch({ 
            type: 'ADD_TO_CART', 
            payload: { 
                product: cartItem, 
                quantity: 1,
            } 
        });
        dispatch({ type: 'TOGGLE_CART', payload: true });
    };

    const handleStartWizard = (pkg?: WebsitePackage) => {
        if (!currentUser) {
            setIsAuthModalOpen(true);
        } else {
            setPreSelectedPackage(pkg || null);
            setIsWizardOpen(true);
        }
    };

    const handleWizardComplete = (data: WebDevProject['initialRequest'], selectedPkg: WebsitePackage) => {
        handleAddToCart(selectedPkg, data);
        setIsWizardOpen(false);
    };

    return (
        <>
            <div className="space-y-20 md:space-y-28 pb-16 animate-fade-in-up">
                {/* Hero Section - AUDIT FIX: Clearer Copy */}
                <section className="relative text-center py-24 md:py-32 overflow-hidden rounded-3xl bg-stone-800 text-white">
                     <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2940&auto=format&fit=crop')"}}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
                    
                    <div className="relative container mx-auto px-4 z-10">
                        <SparklesIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                            طراحی وب‌سایت حرفه‌ای <br/> 
                            <span className="text-amber-400 text-3xl md:text-5xl block mt-2">+ سرمایه‌گذاری اجتماعی</span>
                        </h1>
                        <p className="text-lg md:text-xl text-stone-200 max-w-3xl mx-auto mb-8">
                            ما بهترین وب‌سایت را برای کسب‌وکار شما می‌سازیم، و ۹۰٪ هزینه آن را صرف آبادانی ایران می‌کنیم.
                            <br/>
                            <span className="text-amber-200 font-semibold">یک تیر و دو نشان: رشد بیزینس شما + رشد جامعه.</span>
                        </p>
                        <button 
                            onClick={() => handleStartWizard()}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-amber-500/30 transition-transform transform hover:scale-105 flex items-center gap-3 mx-auto"
                        >
                            <ChartBarIcon className="w-6 h-6" />
                            محاسبه هزینه و شروع
                        </button>
                    </div>
                </section>
                
                {/* Packages Section */}
                <section className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100">بسته‌های طراحی سایت</h2>
                        <p className="text-stone-500 dark:text-stone-400 mt-2">سرویس حرفه‌ای با قیمت رقابتی.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {packages.map(p => (
                            <PackageCard key={p.id} packageInfo={p} onAnalyze={() => handleStartWizard(p)} />
                        ))}
                    </div>
                </section>

                {/* Social Impact Section */}
                <section className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100">چرا «معمار میراث» متفاوت است؟</h2>
                    <p className="mt-2 text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">برخلاف آژانس‌های معمولی، سود ما صرف خرید ویلا نمی‌شود! صرف ساختن آینده می‌شود.</p>
                    
                    <div className="max-w-3xl mx-auto">
                        <MoneyFlowChart />
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center">
                            <HandshakeIcon className="w-12 h-12 text-amber-500 mb-3" />
                            <h3 className="font-bold text-xl">اشتغال‌زایی</h3>
                            <p className="text-sm text-stone-500 mt-2">هزینه سایت شما حقوق باغبانان و کارگران مناطق محروم را تامین می‌کند.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <BanknotesIcon className="w-12 h-12 text-green-500 mb-3" />
                            <h3 className="font-bold text-xl">حمایت از کسب‌وکارهای کوچک</h3>
                            <p className="text-sm text-stone-500 mt-2">بخشی از سود به صندوق وام‌های خرد برای کارآفرینان روستایی می‌رود.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <LeafIcon className="w-12 h-12 text-teal-500 mb-3" />
                            <h3 className="font-bold text-xl">احیای نخلستان‌ها</h3>
                            <p className="text-sm text-stone-500 mt-2">کاشت نهال‌های جدید و مبارزه با بیابان‌زایی در جنوب کشور.</p>
                        </div>
                    </div>
                </section>

                {/* Social Proof Section */}
                <section className="container mx-auto px-4 max-w-5xl">
                    <CourseReviews 
                        courseId="service-digital-architect" 
                        onAddReviewClick={() => setIsReviewFormOpen(true)} 
                    />
                </section>
            </div>
            
            {isWizardOpen && currentUser && (
                <WebsiteWizardModal
                    isOpen={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                    user={currentUser}
                    preSelectedPackage={preSelectedPackage}
                    packages={packages}
                    onComplete={handleWizardComplete}
                />
            )}
            
            <AddReviewForm 
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                courseId="service-digital-architect"
            />
        </>
    );
};

export default DigitalHeritageArchitectPage;
