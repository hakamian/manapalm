
import React, { useRef, useEffect } from 'react';
import { TimelineEvent, Page, View } from '../../types';
import { useAppDispatch } from '../../AppContext';
import Certificate from '../Certificate';

interface LastHeritageCardProps {
    heritageItem: TimelineEvent;
}

const LastHeritageCard: React.FC<LastHeritageCardProps> = ({ heritageItem }) => {
    const dispatch = useAppDispatch();
    const setViewingHeritageItem = (item: TimelineEvent) => dispatch({ type: 'SET_VIEWING_HERITAGE_ITEM', payload: item } as any); // Needs action in reducer
    const setReflectionModalState = (state: { isOpen: boolean, heritageItem: TimelineEvent }) => dispatch({ type: 'SET_REFLECTION_MODAL_STATE', payload: state } as any); // Needs action in reducer
    const handleSetPage = (page: Page) => dispatch({ type: 'SET_VIEW', payload: page as View });

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cardElement = cardRef.current;
        if (!cardElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    cardElement.classList.add('animate-rotate-3d');
                } else {
                    cardElement.classList.remove('animate-rotate-3d');
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(cardElement);

        return () => {
            if (cardElement) {
                observer.unobserve(cardElement);
            }
        };
    }, []);

    const handleViewClick = () => {
        setViewingHeritageItem(heritageItem);
        handleSetPage(View['living-heritage']);
    };
    
    const handleAddMemoryClick = () => {
        setReflectionModalState({ isOpen: true, heritageItem: heritageItem });
    };

    return (
        <div className="group" style={{ perspective: '1000px' }}>
            <div ref={cardRef} className="relative group-hover:[animation-play-state:paused] transition-transform duration-300 group-hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-amber-400 rounded-lg blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <Certificate
                    userName={heritageItem.details.recipient || heritageItem.details.plantedBy}
                    palmName={heritageItem.details.title}
                    date={new Date(heritageItem.date).toLocaleDateString('fa-IR')}
                    certificateId={heritageItem.details.certificateId}
                />
                 <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={handleViewClick} className="bg-white text-stone-800 font-bold px-6 py-2.5 rounded-lg hover:bg-amber-100">مشاهده شناسنامه زنده</button>
                    <button onClick={handleAddMemoryClick} className="bg-white/20 text-white backdrop-blur-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/30">افزودن خاطره</button>
                </div>
            </div>
             <div className="text-center mt-4">
                <h3 className="text-xl font-bold">آخرین میراث شما</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">روی کارت نگه دارید تا گزینه‌ها را ببینید.</p>
            </div>
        </div>
    );
};

export default LastHeritageCard;
