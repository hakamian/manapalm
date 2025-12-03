import React, { useMemo } from 'react';
import { User } from '../types.ts';
import HeroGardenPlot from './HeroGardenPlot.tsx';
import { PalmTreeIcon, UsersIcon } from './icons.tsx';

interface GardenOfHeroesPageProps {
    allUsers: User[];
    currentUser: User | null;
    onLoginClick: () => void;
}

const GardenOfHeroesPage: React.FC<GardenOfHeroesPageProps> = ({ allUsers, currentUser, onLoginClick }) => {
    
    // Filter for users who have reached at least level 2 and sort them by points
    const heroes = useMemo(() => {
        return allUsers
            .filter(user => user.points >= 250) // Level 2 threshold
            .sort((a, b) => b.points - a.points);
    }, [allUsers]);

    return (
        <div className="space-y-12 animate-fade-in-up">
            <section className="text-center container mx-auto px-4">
                <PalmTreeIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrapold text-amber-900 dark:text-amber-200 mb-4 leading-tight">
                    باغ قهرمانان
                </h1>
                <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                    اینجا باغی است که در آن، سفر و دستاوردهای برجسته‌ترین اعضای جامعه ما به نمایش درآمده است. هر نخل، داستان یک قهرمان است.
                </p>
            </section>
            
            <section 
                className="container mx-auto px-4 py-10 rounded-3xl"
                style={{
                    backgroundImage: 'radial-gradient(circle at top, #1c1917 20%, #292524 100%)',
                    background: 'radial-gradient(circle at 50% 0%, hsl(26 10% 15%) 20%, hsl(26 10% 12%) 100%)'
                }}
            >
                {heroes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {heroes.map(hero => (
                            <HeroGardenPlot key={hero.id} user={hero} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <UsersIcon className="w-20 h-20 text-stone-500 mx-auto" />
                        <p className="mt-4 text-stone-400">باغ قهرمانان در حال آماده‌سازی است...</p>
                        <p className="text-stone-500">با رسیدن به سطح «شریک کوشا»، شما هم صاحب یک قطعه در این باغ خواهید شد.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default GardenOfHeroesPage;