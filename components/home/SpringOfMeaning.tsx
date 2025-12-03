
import React, { useState, useEffect, useMemo } from 'react';
import { User, TimelineEvent, Page, HeritageItem, View } from '../../types';
import { useAppState } from '../../AppContext';
import { useAnimatedCounter } from '../../utils/hooks';
import { heritageItems } from '../../utils/heritage';
import { iconMap, PlusIcon } from '../icons';
import InstallmentModal from '../InstallmentModal';

interface SpringOfMeaningProps {
    allUsers: User[];
    allInsights: TimelineEvent[];
    setPage: (page: Page) => void;
    activeHeritageId?: string | null;
}

const SpringOfMeaning: React.FC<SpringOfMeaningProps> = ({ allUsers, allInsights, setPage, activeHeritageId }) => {
    const { user: currentUser } = useAppState();
    const [installmentModalItem, setInstallmentModalItem] = useState<HeritageItem | null>(null);
    const heritageTypes = useMemo(() => heritageItems.filter(item => !item.isCommunity && item.id !== 'beginning_palm'), []);
    
    const [activeHeritage, setActiveHeritage] = useState<HeritageItem>(() => {
        const initialItem = activeHeritageId ? heritageTypes.find(h => h.id === activeHeritageId) : null;
        return initialItem || heritageTypes[0];
    });

    const [aiInsight, setAiInsight] = useState('');
    
    useEffect(() => {
        const newItem = activeHeritageId ? heritageTypes.find(h => h.id === activeHeritageId) : heritageTypes[0];
        if (newItem && newItem.id !== activeHeritage.id) {
            setActiveHeritage(newItem);
        }
    }, [activeHeritageId, heritageTypes, activeHeritage.id]);

    const heritageStats = useMemo(() => {
        const stats: { [key: string]: number } = {};
        heritageTypes.forEach(h => stats[h.id] = 0);
        allUsers.forEach(user => {
            user.timeline?.forEach(event => {
                if (event.type === 'palm_planted' && stats[event.details.id] !== undefined) {
                    stats[event.details.id]++;
                }
            });
        });
        return stats;
    }, [allUsers, heritageTypes]);
    
    const plantedHeritageIds = useMemo(() => {
        if (!currentUser) return new Set();
        return new Set(currentUser.timeline?.filter(e => e.type === 'palm_planted').map(e => e.details.id));
    }, [currentUser]);

    useEffect(() => {
        const fetchInsightForHeritage = async () => {
            setAiInsight('');
            const relevantInsights = allInsights.filter(insight =>
                insight.type === 'palm_planted' &&
                insight.details.id === activeHeritage.id &&
                insight.isSharedAnonymously &&
                insight.status === 'approved' &&
                insight.userReflection?.notes
            );

            if (relevantInsights.length > 0) {
                const randomInsight = relevantInsights[Math.floor(Math.random() * relevantInsights.length)];
                setAiInsight(randomInsight.userReflection!.notes);
            } else {
                setAiInsight(`هر «${activeHeritage.title}» داستانی منحصر به فرد دارد.`);
            }
        };

        fetchInsightForHeritage();
    }, [activeHeritage, allInsights]);

    const animatedCount = useAnimatedCounter(heritageStats[activeHeritage.id] || 0, 1000);

    return (
        <section className="container mx-auto px-4 animate-on-scroll" id="spring-of-meaning-section">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="lg:col-span-1">
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100">سرچشمه معنا</h2>
                    <p className="mt-3 text-stone-600 dark:text-stone-300 leading-relaxed">اینجا دلایل و نیت‌های زیبای اعضای جامعه ما را می‌بینید. هر کدام از این میراث‌ها, داستانی از یک تصمیم, یک موفقیت, یا یک قدردانی است. شما هم می‌توانید داستان خود را بکارید.</p>
                    <div className="mt-8 p-6 bg-white dark:bg-stone-800/50 rounded-2xl shadow-xl border border-stone-200/50 dark:border-stone-700/50">
                        <div className="transition-all duration-500">
                             <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-300">{activeHeritage.title}</h3>
                             <p className="text-stone-600 dark:text-stone-400 mt-2">{activeHeritage.description}</p>
                             <div className="mt-4 pt-4 border-t border-dashed dark:border-stone-700">
                                <p ref={animatedCount.ref} className="text-3xl font-bold">{animatedCount.count.toLocaleString('fa-IR')}</p>
                                <p className="text-sm text-stone-500">میراث {activeHeritage.title} کاشته شده</p>
                            </div>
                            {aiInsight && (
                                <div className="mt-4">
                                    <p className="italic text-stone-700 dark:text-stone-300">"{aiInsight}"</p>
                                    <p className="text-xs text-stone-400 mt-1">- بازتابی ناشناس از چاه معنا</p>
                                </div>
                            )}
                             <button onClick={() => setPage(View.HallOfHeritage)} className="mt-6 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-amber-600 transition-colors">
                                ثبت {activeHeritage.title} شما
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="lg:col-span-1 grid grid-cols-3 gap-4">
                    {heritageTypes.map((h, index) => {
                        const Icon = iconMap[h.icon as keyof typeof iconMap] || iconMap.default;
                        const isActive = activeHeritage.id === h.id;
                        const isMeaningPalm = h.id === 'meaning_palm';
                        const hasPlanted = plantedHeritageIds.has(h.id);
                        return (
                            <button
                                key={h.id}
                                onClick={() => setActiveHeritage(h)}
                                style={{ transitionDelay: `${index * 100}ms` }}
                                className={`animate-on-scroll group relative aspect-square rounded-2xl transition-all duration-300 overflow-hidden ${isActive ? `bg-${h.color}-100 dark:bg-${h.color}-900/30 scale-105 shadow-lg` : 'bg-stone-100 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800'} ${isMeaningPalm ? `ring-2 ring-offset-2 ring-offset-stone-100 dark:ring-offset-black ring-amber-400 shadow-lg shadow-amber-400/30` : ''}`}
                            >
                                {/* Default view */}
                                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
                                    <Icon className={`w-1/2 h-1/2 transition-colors duration-300 ${isActive ? `text-${h.color}-500 dark:text-${h.color}-400` : 'text-stone-500 dark:text-stone-400'}`} />
                                    <p className={`mt-2 text-xs font-semibold transition-colors duration-300 ${isActive ? 'text-stone-800 dark:text-stone-100' : 'text-stone-600 dark:text-stone-300'}`}>{h.title}</p>
                                </div>
                                {/* Hover view */}
                                {hasPlanted ? (
                                    <div className="absolute inset-0 p-4 bg-white/95 dark:bg-stone-800/95 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">این میراث را قبلاً کاشته‌اید.</p>
                                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 mb-3">آیا می‌خواهید دوباره آن را ثبت کنید؟</p>
                                        <div className="flex flex-col gap-2 w-full max-w-[120px]">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPage(View.HallOfHeritage); }}
                                                className="w-full flex items-center justify-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-md"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                کاشت دوباره
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setInstallmentModalItem(h); }}
                                                className="w-full text-center text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1"
                                            >
                                                پرداخت قسطی
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 p-4 bg-white/95 dark:bg-stone-800/95 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{h.description}</p>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPage(View.HallOfHeritage); }}
                                            className="mt-4 flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-amber-600 transition-colors shadow-lg transform hover:scale-105"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            ثبت این میراث
                                        </button>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
            {installmentModalItem && currentUser && (
                 <InstallmentModal
                    isOpen={!!installmentModalItem}
                    onClose={() => setInstallmentModalItem(null)}
                    item={installmentModalItem}
                    user={currentUser}
                    onAddToCartWithInstallments={() => {}} // Add handler if needed or pass from props
                />
            )}
        </section>
    );
};

export default SpringOfMeaning;
