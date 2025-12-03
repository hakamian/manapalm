
import React, { useMemo, useState, useEffect } from 'react';
import { User, TimelineEvent, Page, View } from '../types.ts';
import { useAppDispatch } from '../AppContext.tsx';
import { iconMap, HeartIcon, ChatBubbleOvalLeftEllipsisIcon, UsersIcon } from './icons.tsx';

interface CommunityOrchardPageProps {
    allUsers: User[];
}

const CommunitySkeleton: React.FC = () => (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700"></div>
                    <div>
                        <div className="h-4 w-24 bg-stone-200 dark:bg-stone-700 rounded"></div>
                        <div className="h-3 w-16 bg-stone-200 dark:bg-stone-700 rounded mt-1.5"></div>
                    </div>
                </div>
                <div className="flex items-start gap-3 pl-2 mt-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex-shrink-0 mt-1"></div>
                    <div className="w-full">
                        <div className="h-4 w-4/5 bg-stone-200 dark:bg-stone-700 rounded"></div>
                        <div className="h-4 w-3/5 bg-stone-200 dark:bg-stone-700 rounded mt-2"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);


const CommunityEventCard: React.FC<{ event: TimelineEvent; author: User }> = ({ event, author }) => {
    const Icon = iconMap[event.type as keyof typeof iconMap] || iconMap.default;
    // AUDIT FIX: Add local state for likes to simulate social interaction immediately
    const [likes, setLikes] = useState(Math.floor(Math.random() * 10));
    const [isLiked, setIsLiked] = useState(false);
    const [isResonating, setIsResonating] = useState(false);

    const handleResonateClick = () => {
        if (isResonating) return; 
        setIsResonating(true);
        
        if (isLiked) {
             setLikes(prev => prev - 1);
             setIsLiked(false);
        } else {
             setLikes(prev => prev + 1);
             setIsLiked(true);
        }

        setTimeout(() => {
            setIsResonating(false);
        }, 500); 
    };

    return (
        <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 space-y-3 transition-all hover:border-amber-500/30">
            <div className="flex items-center gap-3">
                <img src={author.profileImageUrl || `https://ui-avatars.com/api/?name=${author.name}&background=random`} alt={author.name} className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 ring-green-500 transition-all" title="مشاهده پروفایل (بزودی)" />
                <div>
                    <p className="font-bold cursor-pointer hover:text-amber-400 transition-colors">{author.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(event.date).toLocaleDateString('fa-IR')}</p>
                </div>
            </div>
            <div className="flex items-start gap-3 pl-2">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-stone-100 dark:bg-stone-700 rounded-full mt-1">
                    <Icon className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                </div>
                <div>
                    <h4 className="font-semibold text-stone-800 dark:text-stone-100">{event.title}</h4>
                    <p className="text-sm text-stone-600 dark:text-stone-300">{event.description}</p>
                </div>
            </div>
            <div className="flex justify-end gap-4 text-sm text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-stone-700">
                <button 
                    onClick={handleResonateClick}
                    className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}
                >
                    <HeartIcon className={`w-4 h-4 ${isLiked ? 'fill-current' : ''} ${isResonating ? 'animate-heartbeat' : ''}`} /> 
                    <span>{likes > 0 ? likes : 'همدلی'}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-amber-600"><ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" /> دیدگاه</button>
            </div>
        </div>
    );
};

const CommunityOrchardPage: React.FC<CommunityOrchardPageProps> = ({ allUsers }) => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const handleSetPage = (page: Page) => dispatch({ type: 'SET_VIEW', payload: page as View });

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const publicFeed = useMemo(() => {
        const feed: { event: TimelineEvent; author: User }[] = [];
        allUsers.forEach(user => {
            user.timeline?.forEach(event => {
                if (event.type === 'palm_planted' || event.type === 'community_contribution') {
                    feed.push({ event, author: user });
                }
            });
        });
        return feed.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
    }, [allUsers]);

    return (
        <>
            <style>{`
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.4); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .animate-heartbeat {
                    animation: heartbeat 0.5s ease-in-out;
                }
            `}</style>
            <div className="space-y-12 animate-fade-in-up">
                <section className="text-center">
                    <h1 id="community-title" className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4">
                        باغ عمومی نخلستان
                    </h1>
                    <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                        آخرین فعالیت‌های اعضای خانواده نخلستان معنا را ببینید، با آنها همدلی کنید و در داستان‌هایشان سهیم شوید.
                    </p>
                </section>
                
                <section className="max-w-2xl mx-auto space-y-6">
                    {isLoading ? (
                        <CommunitySkeleton />
                    ) : publicFeed.length > 0 ? (
                        publicFeed.map(item => <CommunityEventCard key={item.event.id} event={item.event} author={item.author} />)
                    ) : (
                        <div className="text-center py-16 flex flex-col items-center justify-center">
                            <UsersIcon className="w-20 h-20 text-stone-300 dark:text-stone-600 mx-auto" />
                            <h3 className="mt-4 text-xl font-bold text-stone-600 dark:text-stone-300">باغ عمومی هنوز ساکت است.</h3>
                            <p className="text-stone-500 dark:text-stone-400 mt-2">با کاشتن اولین میراث، اولین داستان را به اشتراک بگذارید و این باغ را زنده کنید.</p>
                            <button onClick={() => handleSetPage(View.HallOfHeritage)} className="mt-6 bg-amber-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-transform hover:scale-105 shadow-lg">
                                اولین میراثم را می‌کارم
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default CommunityOrchardPage;
