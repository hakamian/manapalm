
import React, { useState, useMemo } from 'react';
import { Page, User, View } from '../types.ts';
import { QuoteIcon, HeartIcon, LeafIcon, GlobeIcon, ArrowLeftIcon, BuildingOfficeIcon, UserPlusIcon } from './icons.tsx';
import { useAnimatedCounter } from '../utils/hooks.ts';

interface OurStoryPageProps {
    setPage: (page: Page) => void;
    currentUser: User | null;
    onLoginClick: () => void;
}

const ImpactStatCard: React.FC<{
    icon: React.FC<any>,
    color: string,
    endValue: number,
    label: string,
    userStat: number | null,
    userLabel: string,
    ctaText: string,
    ctaPage: Page,
    currentUser: User | null,
    onLoginClick: () => void,
    setPage: (page: Page) => void
}> = ({ icon: Icon, color, endValue, label, userStat, userLabel, ctaText, ctaPage, currentUser, onLoginClick, setPage }) => {
    const { count, ref } = useAnimatedCounter(endValue);
    const [isHovered, setIsHovered] = useState(false);

    const handleCtaClick = () => {
        if (!currentUser) {
            onLoginClick();
        } else {
            setPage(ctaPage);
        }
    }
    
    return (
        <div 
            className="bg-white dark:bg-stone-800/50 p-8 rounded-2xl shadow-lg text-center relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                <Icon className={`w-12 h-12 text-${color}-500 mx-auto mb-3`} />
                <span ref={ref} className={`text-5xl font-extrabold text-${color}-600 dark:text-${color}-400`}>{count.toLocaleString('fa-IR')}+</span>
                <p className="text-stone-600 dark:text-stone-300 mt-2 font-semibold">{label}</p>
            </div>
            <div className={`absolute inset-0 p-8 flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {!currentUser ? (
                    <>
                        <p className="font-semibold text-lg">برای دیدن تاثیر شخصی خود، وارد شوید.</p>
                        <button onClick={onLoginClick} className="mt-4 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-lg">ورود / ثبت‌نام</button>
                    </>
                ) : userStat !== null && userStat > 0 ? (
                    <>
                        <p className="text-2xl font-bold">تبریک!</p>
                        <p className="mt-2 text-lg">شما <span className={`font-extrabold text-2xl text-${color}-500`}>{userStat.toLocaleString('fa-IR')}</span> {userLabel}</p>
                        <button onClick={handleCtaClick} className="mt-4 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-lg">{ctaText}</button>
                    </>
                ) : (
                    <>
                        <p className="font-semibold text-lg">هر داستان بزرگی با یک قدم کوچک آغاز می‌شود.</p>
                        <p className="mt-1 text-sm text-stone-500">شما هنوز تأثیری در این بخش ثبت نکرده‌اید.</p>
                        <button onClick={handleCtaClick} className="mt-4 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-lg">{ctaText}</button>
                    </>
                )}
            </div>
        </div>
    );
};

const OurStoryPage: React.FC<OurStoryPageProps> = ({ setPage, currentUser, onLoginClick }) => {
    
    const totalPalms = 1250;
    const totalJobs = 45;
    const totalMembers = 2800;

    const userPalms = useMemo(() => currentUser?.timeline?.filter(e => e.type === 'palm_planted').length ?? null, [currentUser]);
    const userJobsContribution = useMemo(() => currentUser?.contributions?.length ?? 0 > 0 ? 1 : 0, [currentUser]);
    
    const timelineEvents = [
        { year: '۱۳۹۵', title: 'جرقه ایده', description: 'ایده اولیه نخلستان معنا در ذهن دکتر حمید حکیمیان شکل گرفت: پیوند دادن معنای شخصی با یک حرکت اجتماعی پایدار.' },
        { year: '۱۳۹۷', title: 'تحقیقات و برنامه‌ریزی', description: 'دو سال صرف تحقیقات میدانی، امکان‌سنجی و طراحی مدل کسب‌وکار اجتماعی پروژه شد.' },
        { year: '۱۳۹۹', title: 'کاشت اولین نخل', description: 'اولین نخل به صورت نمادین کاشته شد و پروژه رسماً آغاز به کار کرد.' },
        { year: '۱۴۰۱', title: 'شروع تأثیرگذاری', description: 'با مشارکت همراهان، اولین پروژه‌های اشتغال‌زایی محلی کلید خورد و تأثیرات اجتماعی نمایان شد.' },
        { year: '۱۴۰۳', title: 'راه‌اندازی پلتفرم آنلاین', description: 'برای گسترش جنبش و دعوت از افراد بیشتر، وب‌سایت نخلستان معنا به عنوان یک پلتفرم دیجیتال راه‌اندازی شد.' },
    ];
    
    return (
         <div className="space-y-20 md:space-y-32 pb-16 animate-fade-in">
            <section className="relative text-center py-24 md:py-32 overflow-hidden bg-stone-800 text-white rounded-3xl">
                 <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{backgroundImage: "url('https://images.unsplash.com/photo-1516633630671-d65b75b0660a?q=80&w=2940&auto=format&fit=crop')"}}
                ></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
                
                <div className="relative container mx-auto px-4 z-10">
                    <QuoteIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                    <blockquote className="text-xl md:text-2xl lg:text-3xl text-stone-100 max-w-4xl mx-auto italic leading-relaxed md:leading-loose">
                        "ما نخل نمی‌کاریم، بلکه معنا می‌کاریم. هر درخت، ریشه در یک داستان انسانی دارد و سایه‌اش، آینده‌ای روشن‌تر برای یک جامعه است."
                    </blockquote>
                    <p className="mt-6 text-lg font-semibold text-amber-300">- دکتر حمید حکیمیان، بنیان‌گذار نخلستان معنا</p>
                </div>
            </section>
            
            <section className="container mx-auto px-4">
                 <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100">رسالت ما در سه کلمه</h2>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8 bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                        <div className="inline-block p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                           <HeartIcon className="w-10 h-10 text-red-500 dark:text-red-400"/>
                        </div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">معنا</h3>
                        <p className="text-stone-600 dark:text-stone-300">ما به افراد کمک می‌کنیم تا با نمادگرایی و ثبت لحظات مهم، به زندگی خود عمق و معنای بیشتری ببخشند.</p>
                    </div>
                     <div className="text-center p-8 bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                        <div className="inline-block p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                            <LeafIcon className="w-10 h-10 text-green-500 dark:text-green-400"/>
                        </div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">جنبش</h3>
                        <p className="text-stone-600 dark:text-stone-300">ما یک کسب‌وکار اجتماعی هستیم که سود حاصل از آن را برای اشتغال‌زایی و توانمندسازی جوامع محلی سرمایه‌گذاری می‌کنیم.</p>
                    </div>
                     <div className="text-center p-8 bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                        <div className="inline-block p-4 bg-sky-100 dark:bg-sky-900/20 rounded-full mb-4">
                           <GlobeIcon className="w-10 h-10 text-sky-500 dark:text-sky-400"/>
                        </div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">میراث</h3>
                        <p className="text-stone-600 dark:text-stone-300">با هر نخل، میراثی زنده برای نسل‌های آینده و گامی مثبت برای حفاظت از محیط زیست و آبادانی کشور برمی‌داریم.</p>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100">سفر ما تا امروز</h2>
                </div>
                <div className="mt-12 relative">
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-stone-200 dark:bg-stone-700 -translate-x-1/2"></div>
                    {timelineEvents.map((event, index) => (
                        <div key={index} className="relative mb-12">
                            <div className={`flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                <div className="w-5/12">
                                    <div className={`p-6 bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                        <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400">{event.title}</h3>
                                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">{event.description}</p>
                                    </div>
                                </div>
                                <div className="w-2/12 flex justify-center">
                                    <div className="relative">
                                        <div className="w-6 h-6 rounded-full bg-amber-500 border-4 border-white dark:border-stone-900"></div>
                                        <span className={`absolute top-1/2 -translate-y-1/2 text-lg font-bold text-stone-700 dark:text-stone-200 ${index % 2 === 0 ? '-right-12' : '-left-12'}`}>{event.year}</span>
                                    </div>
                                </div>
                                <div className="w-5/12"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <section className="bg-amber-50 dark:bg-amber-900/10 py-20">
                <div className="container mx-auto px-4 text-center">
                     <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-stone-100">تأثیر ما در یک نگاه</h2>
                     <p className="text-lg text-stone-600 dark:text-stone-300 mt-3 max-w-2xl mx-auto">اعدادی که داستان تلاش‌ها و همراهی شما را روایت می‌کنند.</p>
                     <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ImpactStatCard 
                           icon={LeafIcon}
                           color="green"
                           endValue={totalPalms}
                           label="نخل کاشته شده"
                           userStat={userPalms}
                           userLabel="اصله از این نخل‌ها را کاشته‌اید."
                           ctaText="تأثیرت را بیشتر کن"
                           // FIX: Replace string literal with View enum
                           ctaPage={View.HallOfHeritage}
                           currentUser={currentUser}
                           onLoginClick={onLoginClick}
                           setPage={setPage}
                        />
                        <ImpactStatCard 
                           icon={BuildingOfficeIcon}
                           color="sky"
                           endValue={totalJobs}
                           label="شغل ایجاد شده"
                           userStat={userJobsContribution ? 1 : 0}
                           userLabel="شغل با مشارکت شما ایجاد شده."
                           ctaText="در پروژه‌ها سهیم شو"
                           // FIX: Replace string literal with View enum
                           ctaPage={View['community-projects']}
                           currentUser={currentUser}
                           onLoginClick={onLoginClick}
                           setPage={setPage}
                        />
                         <ImpactStatCard 
                           icon={UserPlusIcon}
                           color="purple"
                           endValue={totalMembers}
                           label="عضو خانواده نخلستان"
                           userStat={currentUser ? 1 : null} // User is always 1 member if logged in
                           userLabel="نفر از این خانواده بزرگ هستید."
                           ctaText="باغ خود را ببین"
                           // FIX: Replace string literal with View enum
                           ctaPage={View.UserProfile}
                           currentUser={currentUser}
                           onLoginClick={onLoginClick}
                           setPage={setPage}
                        />
                     </div>
                </div>
            </section>

            <section className="container mx-auto px-4">
                <div className="relative bg-gradient-to-r from-stone-800 to-stone-900 dark:from-stone-800/80 dark:to-stone-900/90 text-white rounded-3xl p-12 text-center shadow-2xl overflow-hidden">
                     <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold">شما فصل بعدی این داستان هستید</h2>
                        <p className="mt-4 max-w-xl mx-auto text-stone-300">با کاشتن اولین میراث خود، نه تنها زندگی خود را معنادارتر می‌کنید، بلکه به رشد این جنبش و ساختن آینده‌ای بهتر برای همه ما کمک می‌کنید.</p>
                         <button onClick={() => setPage(View.HallOfHeritage)} className="mt-8 bg-amber-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-amber-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
                            <span>بخشی از داستان ما شوید</span>
                            <ArrowLeftIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </section>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default OurStoryPage;