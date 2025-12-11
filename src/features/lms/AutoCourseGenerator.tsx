
import React, { useState } from 'react';
import { SparklesIcon, BookOpenIcon, ArrowPathIcon } from '../../../components/icons';
import { LMSCourse } from '../../../types/lms';
import { getAIAssistedText } from '../../../services/geminiService';

interface AutoCourseGeneratorProps {
    onCourseGenerated: (course: LMSCourse) => void;
}

const AutoCourseGenerator: React.FC<AutoCourseGeneratorProps> = ({ onCourseGenerated }) => {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        setError('');

        try {
            // In a real app, this would be a structured prompt responding in JSON
            // For now, we mock the generation or use text generation and parse it (risky)
            // or just simply create a mock course based on the topic.

            // Mocking the AI response for reliability in this demo, 
            // but effectively we "call" the AI here.

            /* 
            const prompt = `Create a structured course outline for: ${topic}. Return JSON with title, description, modules (title, lessons).`;
            const response = await getAIAssistedText({ ... }); 
            */

            // Simulating AI delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const generatedCourse: LMSCourse = {
                id: `gen_${Date.now()}`,
                title: topic,
                description: `A comprehensive AI-generated course about ${topic}. Learn the fundamentals and advanced concepts.`,
                level: 'beginner',
                durationMinutes: 60,
                pointsReward: 50,
                isPublished: false,
                modules: [
                    {
                        id: 'm1', courseId: 'gen_1', title: 'Introduction', orderIndex: 0, lessons: [
                            { id: 'l1', moduleId: 'm1', title: `What is ${topic}?`, contentType: 'video', durationMinutes: 5, orderIndex: 0 },
                            { id: 'l2', moduleId: 'm1', title: 'Key Terminology', contentType: 'article', durationMinutes: 10, orderIndex: 1 }
                        ]
                    },
                    {
                        id: 'm2', courseId: 'gen_1', title: 'Core Concepts', orderIndex: 1, lessons: [
                            { id: 'l3', moduleId: 'm2', title: 'Deep Dive', contentType: 'video', durationMinutes: 15, orderIndex: 0 },
                            { id: 'l4', moduleId: 'm2', title: 'Case Studies', contentType: 'quiz', durationMinutes: 10, orderIndex: 1 }
                        ]
                    }
                ]
            };

            onCourseGenerated(generatedCourse);
            setTopic('');
        } catch (err) {
            console.error(err);
            setError('Failed to generate course. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl p-6 border border-indigo-500/30">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-white">سازنده دوره هوشمند (AI)</h3>
            </div>

            <p className="text-gray-400 mb-6 text-sm">
                موضوع مورد نظر خود را بنویسید تا هوش مصنوعی «هوشمانا» سرفصل‌ها و ساختار دوره را برای شما طراحی کند.
            </p>

            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: مدیریت زمان، کشاورزی پایدار..."
                    className="flex-grow bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all min-w-[160px]"
                >
                    {isGenerating ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            <span>در حال ساخت...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            <span>تولید دوره</span>
                        </>
                    )}
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>
    );
};

export default AutoCourseGenerator;
