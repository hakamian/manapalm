import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { View, VocabularyItem, User } from '../types';
import { getVocabularyList } from '../services/geminiService';
import { ArrowLeftIcon, BookOpenIcon, CheckCircleIcon, SparklesIcon } from './icons';

const VocabularyBuilderView: React.FC = () => {
    const { user, currentVocabularyTopic } = useAppState();
    const dispatch = useAppDispatch();
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVocabulary = async () => {
            if (!currentVocabularyTopic || !user?.englishAcademyLevel) {
                setError("No topic selected or user level not found.");
                setIsLoading(false);
                return;
            }
            try {
                const result = await getVocabularyList(currentVocabularyTopic, user.englishAcademyLevel);
                setVocabulary(result.vocabulary);
            } catch (e) {
                setError("Failed to load vocabulary. Please try again.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVocabulary();
    }, [currentVocabularyTopic, user?.englishAcademyLevel]);

    const handleMarkAsComplete = () => {
        if (!user || !currentVocabularyTopic) return;

        // Find which lesson this topic belongs to
        // This is a simplification; a real app might need a more robust mapping
        const lessonTitle = `Lesson ${currentVocabularyTopic.split(' ')[0]}`;

        const newProgress = {
            ...(user.englishAcademyProgress || {}),
            [lessonTitle]: {
                ...(user.englishAcademyProgress?.[lessonTitle] || {}),
                vocabulary: true,
            },
        };

        const updatedUser: Partial<User> = {
            englishAcademyProgress: newProgress,
        };

        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        dispatch({ type: 'SET_VIEW', payload: View.ENGLISH_ACADEMY });
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            <div className="container mx-auto px-6 max-w-3xl">
                <button onClick={() => dispatch({ type: 'SET_VIEW', payload: View.ENGLISH_ACADEMY })} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>بازگشت به نقشه راه</span>
                </button>
                <header className="text-center mb-10">
                    <BookOpenIcon className="w-16 h-16 mx-auto text-green-300 mb-4" />
                    <h1 className="text-4xl font-bold">واژه‌ساز هوشمند</h1>
                    <p className="text-lg text-green-400 font-semibold mt-2">موضوع: {currentVocabularyTopic}</p>
                </header>

                {isLoading && (
                    <div className="text-center p-8">
                        <SparklesIcon className="w-12 h-12 text-yellow-300 mx-auto animate-pulse mb-4" />
                        <p className="font-semibold">در حال آماده‌سازی کلمات برای شما...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-400 p-8">{error}</p>}

                {!isLoading && !error && (
                    <>
                        <div className="space-y-4">
                            {vocabulary.map((item, index) => (
                                <div key={index} className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                                    <h2 className="text-2xl font-bold text-white">{item.word}</h2>
                                    <p className="text-lg text-green-300 mt-1">{item.translation}</p>
                                    <p className="text-gray-300 mt-3">{item.definition}</p>
                                    <p className="italic text-gray-400 mt-2 bg-gray-700/50 p-2 rounded-md">"{item.example}"</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <button
                                onClick={handleMarkAsComplete}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 mx-auto"
                            >
                                <CheckCircleIcon className="w-6 h-6" />
                                <span>علامت‌گذاری به عنوان تکمیل شده</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VocabularyBuilderView;