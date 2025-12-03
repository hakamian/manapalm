
import React, { useState } from 'react';
import { User } from '../../types';
import { bookJourneys } from '../../utils/coachingData';
import { BookOpenIcon, CheckCircleIcon, StarIcon, TargetIcon, TrophyIcon, GiftIcon, ArrowLeftIcon, PlayIcon, MapIcon, LockClosedIcon } from '../icons';
import CourseReviews, { AddReviewForm } from '../CourseReviews';

export const BookJourneyCard: React.FC<{ 
    book: typeof bookJourneys[0], 
    onSelect: () => void 
}> = ({ book, onSelect }) => {
    return (
        <div className={`group relative overflow-hidden rounded-2xl border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-2xl cursor-pointer bg-gray-800`} onClick={onSelect}>
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${book.coverColor}`}></div>
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${book.coverColor} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <BookOpenIcon className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-end text-xs font-semibold text-gray-400">
                        <span className="bg-gray-900/50 px-2 py-1 rounded-md border border-gray-600">{book.totalSessions} جلسه</span>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{book.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{book.subtitle}</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">{book.description}</p>
                
                <div className="mt-auto space-y-3">
                     <div className="bg-gray-700/30 p-2 rounded-lg flex items-center gap-2 text-xs text-amber-300 border border-amber-500/20">
                        <TargetIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{book.valueProp}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-3">
                        <span className="flex items-center gap-1"><TrophyIcon className="w-4 h-4 text-yellow-500"/> پاداش: {book.xpReward} XP</span>
                        <span className="flex items-center gap-1"><GiftIcon className="w-4 h-4 text-purple-500"/> {book.badge}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BookDetailView: React.FC<{ 
    book: typeof bookJourneys[0], 
    user: User,
    onBack: () => void,
    onStartJourney: () => void,
    onModuleSelect: (moduleTitle: string, moduleData: typeof bookJourneys[0]['modules'][0]) => void
}> = ({ book, user, onBack, onStartJourney, onModuleSelect }) => {
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    return (
        <div className="animate-fade-in pb-12">
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeftIcon className="w-5 h-5" /> بازگشت به کتابخانه
            </button>

            <div className={`rounded-3xl p-8 mb-8 bg-gradient-to-br ${book.coverColor} text-white shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                        <BookOpenIcon className="w-20 h-20 text-white" />
                    </div>
                    <div className="text-center md:text-right flex-1">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h2>
                        <p className="text-lg text-white/80 mb-4">{book.subtitle}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="px-3 py-1 bg-black/30 rounded-full text-sm flex items-center gap-1 border border-white/10"><CheckCircleIcon className="w-4 h-4"/> {book.totalSessions} جلسه تمرینی</span>
                            <span className="px-3 py-1 bg-black/30 rounded-full text-sm flex items-center gap-1 border border-white/10"><StarIcon className="w-4 h-4 text-yellow-400"/> {book.xpReward} امتیاز تجربه</span>
                        </div>
                    </div>
                    <button 
                        onClick={onStartJourney}
                        className="bg-white text-gray-900 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105 flex items-center gap-2"
                    >
                        <PlayIcon className="w-5 h-5" />
                        ادامه مسیر
                    </button>
                </div>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <MapIcon className="w-6 h-6 text-amber-500" /> نقشه راه شما
                </h3>
                <div className="relative pl-6 border-l-2 border-gray-700 space-y-8">
                    {book.modules.map((mod, idx) => {
                        const isUnlocked = user.isAdmin || mod.status === 'unlocked';
                        return (
                            <div key={idx} className={`relative ${!isUnlocked ? 'opacity-60' : ''}`}>
                                <div className={`absolute -left-[33px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-gray-900 ${isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {isUnlocked ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div> : <LockClosedIcon className="w-3 h-3" />}
                                </div>
                                <div className={`bg-gray-800 p-6 rounded-xl border ${isUnlocked ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-gray-700'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-bold text-white">{mod.title}</h4>
                                        <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400">{mod.sessions} جلسه</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4">{mod.desc}</p>
                                    {isUnlocked ? (
                                        <button 
                                            onClick={() => onModuleSelect(mod.title, mod)}
                                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <PlayIcon className="w-4 h-4"/>
                                            شروع یادگیری
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onModuleSelect(mod.title, mod)} // Allow clicking to see the "Locked" state modal
                                            className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 bg-gray-900/50 p-2 rounded border border-gray-700/50 hover:bg-gray-900 transition-colors"
                                        >
                                            <LockClosedIcon className="w-4 h-4" />
                                            <span>پیش‌نیاز: تکمیل ماژول قبلی (یا پرداخت)</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-amber-500/20 text-center mt-12">
                    <h4 className="text-amber-400 font-bold mb-2 flex items-center justify-center gap-2"><TrophyIcon className="w-5 h-5"/> پاداش نهایی</h4>
                    <p className="text-gray-300 text-sm">با تکمیل این مسیر، شما نشان افتخار <strong>«{book.badge}»</strong> را دریافت خواهید کرد که در پروفایل شما به عنوان نماد تسلط بر این مهارت خواهد درخشید.</p>
                </div>

                {/* Social Proof Section */}
                <CourseReviews 
                    courseId={book.id}
                    onAddReviewClick={() => setIsReviewFormOpen(true)} 
                />
            </div>

            <AddReviewForm 
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                courseId={book.id}
            />
        </div>
    );
};
