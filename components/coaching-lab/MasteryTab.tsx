
import React, { useState } from 'react';
import { User } from '../../types';
import { bookJourneys } from '../../utils/coachingData';
import { BookJourneyCard, BookDetailView } from './MasteryComponents';
import { SparklesIcon } from '../icons';

interface MasteryTabProps {
    user: User;
    onStartSession: (topic: string) => void;
    onModuleSelect: (moduleTitle: string, moduleData: typeof bookJourneys[0]['modules'][0]) => void;
}

const MasteryTab: React.FC<MasteryTabProps> = ({ user, onStartSession, onModuleSelect }) => {
    const [selectedBook, setSelectedBook] = useState<typeof bookJourneys[0] | null>(null);

    // Filter to show only Coaching specific courses
    // Added business-coaching-mastery
    const COACHING_SPECIFIC_IDS = ['business-coaching-mastery', 'co-active-mastery', 'master-of-asking', 'income-alchemy', 'deep-work-mastery'];
    const coachingJourneys = bookJourneys.filter(book => COACHING_SPECIFIC_IDS.includes(book.id));
    
    const freeJourneys = coachingJourneys.filter(b => (b as any).price === 0);
    const paidJourneys = coachingJourneys.filter(b => (b as any).price !== 0);

    if (selectedBook) {
        return (
            <BookDetailView 
                book={selectedBook} 
                user={user}
                onBack={() => setSelectedBook(null)} 
                onStartJourney={() => onStartSession(selectedBook.title)}
                onModuleSelect={(moduleTitle, moduleData) => onModuleSelect(moduleTitle, moduleData)}
            />
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white mb-2">کتابخانه زنده کوچینگ</h2>
                <p className="text-gray-400">با مطالعه تعاملی و گام‌به‌گام، بر مهم‌ترین منابع کوچینگ جهان مسلط شوید.</p>
            </div>

            {/* Free Resources Section */}
            {freeJourneys.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6 p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg w-fit mx-auto md:mx-0">
                        <SparklesIcon className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-amber-100">هدیه ویژه: منابع رایگان و ارزشمند</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {freeJourneys.map(book => (
                            <BookJourneyCard key={book.id} book={book} onSelect={() => setSelectedBook(book)} />
                        ))}
                    </div>
                </div>
            )}

            {/* Paid Resources Section */}
            <div>
                <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2">دوره‌های تخصصی و پیشرفته</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {paidJourneys.map(book => (
                        <BookJourneyCard key={book.id} book={book} onSelect={() => setSelectedBook(book)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MasteryTab;
