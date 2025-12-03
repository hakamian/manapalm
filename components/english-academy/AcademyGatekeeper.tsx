
import React, { useState } from 'react';
import { GlobeIcon, ShieldCheckIcon, ArrowLeftIcon, SparklesIcon } from '../icons';
import { TargetLanguage } from '../../types';
import CourseReviews, { AddReviewForm } from '../CourseReviews';

interface AcademyGatekeeperProps {
    onLogin: () => void;
    onLanguageSelect: (lang: TargetLanguage) => void;
    isLoggedIn: boolean;
}

const AcademyGatekeeper: React.FC<AcademyGatekeeperProps> = ({ onLogin, onLanguageSelect, isLoggedIn }) => {
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in-up max-w-4xl mx-auto pb-20">
            <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-gray-800 p-6 rounded-2xl border-2 border-blue-400 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                    <GlobeIcon className="w-16 h-16 text-blue-300" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                    +150 امتیاز
                </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                زبان را <span className="text-blue-400">زندگی</span> کنید، نه حفظ!
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">
                فراموش کنید که دانش‌آموز هستید. در آکادمی هوشمانا، شما بازیگر سناریوهای واقعی زندگی هستید. 
                <br/>
                هوش مصنوعی ما، معلم خصوصی شماست که هرگز خسته نمی‌شود و شما را برای <strong>دنیای واقعی</strong> آماده می‌کند.
            </p>
            
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 w-full max-w-lg mb-12 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-400"/>
                    ماجراجویی خود را انتخاب کنید
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => onLanguageSelect('English')} className="flex items-center justify-between p-4 bg-gray-700 hover:bg-blue-900/40 border border-gray-600 hover:border-blue-500 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🇬🇧</span>
                            <div className="text-right">
                                <p className="font-bold text-white">انگلیسی (English)</p>
                                <p className="text-xs text-gray-400">برای تجارت، سفر و ارتباط جهانی</p>
                            </div>
                        </div>
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                    <button onClick={() => onLanguageSelect('German')} className="flex items-center justify-between p-4 bg-gray-700 hover:bg-amber-900/40 border border-gray-600 hover:border-amber-500 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🇩🇪</span>
                            <div className="text-right">
                                <p className="font-bold text-white">آلمانی (Deutsch)</p>
                                <p className="text-xs text-gray-400">برای مهاجرت کاری و تحصیلی</p>
                            </div>
                        </div>
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                    <button onClick={() => onLanguageSelect('French')} className="flex items-center justify-between p-4 bg-gray-700 hover:bg-purple-900/40 border border-gray-600 hover:border-purple-500 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🇫🇷</span>
                            <div className="text-right">
                                <p className="font-bold text-white">فرانسه (Français)</p>
                                <p className="text-xs text-gray-400">برای هنر، فرهنگ و عشق</p>
                            </div>
                        </div>
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>

            {!isLoggedIn && (
                <div className="mb-12">
                    <p className="text-sm text-gray-400 mb-2">قبلاً عضو نخلستان شده‌اید؟</p>
                    <button onClick={onLogin} className="text-blue-400 hover:text-blue-300 font-semibold underline">
                        ورود به حساب کاربری
                    </button>
                </div>
            )}

            {/* Social Proof */}
            <div className="w-full max-w-3xl mx-auto text-right">
                <CourseReviews 
                    courseId="service-english-academy" 
                    onAddReviewClick={() => setIsReviewFormOpen(true)} 
                />
            </div>

            <AddReviewForm 
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                courseId="service-english-academy"
            />
        </div>
    );
};

export default AcademyGatekeeper;
