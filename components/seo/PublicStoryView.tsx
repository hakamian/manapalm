
import React, { useMemo } from 'react';
import { useAppState } from '../../AppContext';
import { Deed } from '../../types';
import SEOHead from './SEOHead';
import { QuoteIcon, LeafIcon, UserCircleIcon } from '../icons';

const PublicStoryView: React.FC = () => {
    const { allDeeds } = useAppState();
    
    // Extract ID from URL params (e.g. ?view=STORY&id=123)
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id');
    
    const deed = useMemo(() => {
        return allDeeds.find(d => d.id === storyId);
    }, [allDeeds, storyId]);

    if (!deed) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">داستان یافت نشد</h1>
                    <p className="text-gray-400">متاسفانه داستانی با این شناسه وجود ندارد یا حذف شده است.</p>
                    <a href="/" className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors">بازگشت به خانه</a>
                </div>
            </div>
        );
    }

    const title = `داستان نخل ${deed.palmType}: ${deed.intention}`;
    const description = deed.message || `یک نخل ${deed.palmType} به نام ${deed.name} در نخلستان معنا کاشته شد.`;

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-24 pb-20">
            <SEOHead 
                title={title}
                description={description}
                type="article"
                // Assuming dynamic image generation later
                image="https://picsum.photos/seed/palm-story/1200/630"
            />
            
            <div className="container mx-auto px-4 max-w-3xl">
                <article className="bg-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <header className="relative z-10 text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4 border border-green-500/30 text-green-400">
                            <LeafIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{title}</h1>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <UserCircleIcon className="w-4 h-4" />
                            <span>به نام: <strong className="text-white">{deed.name}</strong></span>
                            <span className="mx-2">•</span>
                            <span>{new Date(deed.date).toLocaleDateString('fa-IR')}</span>
                        </div>
                    </header>

                    {deed.plantedPhotoUrl && (
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-gray-700">
                            <img src={deed.plantedPhotoUrl} alt={title} className="w-full h-auto object-cover max-h-[500px]" />
                            <div className="bg-black/50 p-2 text-center text-xs text-white/80">
                                تصویر واقعی نخل کاشته شده
                            </div>
                        </div>
                    )}

                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="bg-gray-900/50 p-8 rounded-2xl border-r-4 border-amber-500 relative">
                            <QuoteIcon className="absolute top-4 right-4 w-8 h-8 text-amber-500/20" />
                            <p className="italic text-gray-200 text-xl leading-relaxed relative z-10">
                                "{deed.message}"
                            </p>
                        </div>
                        
                        <div className="mt-10">
                            <h3 className="text-2xl font-bold text-green-400 mb-4">درباره این میراث</h3>
                            <p className="text-gray-300 leading-relaxed">
                                این نخل بخشی از پروژه بزرگ نخلستان معناست. با کاشت این درخت، نه تنها یک یادگاری زنده ثبت شده است، بلکه به اشتغال‌زایی در مناطق محروم و احیای محیط زیست نیز کمک شده است. هر نخل در این باغ، داستانی منحصر به فرد دارد که ریشه در خاک دوانده است.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-right">
                            <p className="font-bold text-white text-lg">شما هم داستانی دارید؟</p>
                            <p className="text-sm text-gray-400">همین حالا نخل خود را بکارید و میراث‌سازی کنید.</p>
                        </div>
                        <a href="/?view=HALL_OF_HERITAGE" className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                            کاشت نخل جدید
                        </a>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default PublicStoryView;
