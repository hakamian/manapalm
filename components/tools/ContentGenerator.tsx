


import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, TimelineEvent } from '../../types.ts';
import { SparklesIcon, PlusIcon } from '../icons.tsx';
import { getUserLevel } from '../../utils/gamification.ts';
import Modal from '../Modal.tsx';

interface ContentGeneratorProps {
    user: User;
    onUpdateProfile: (updatedUser: Partial<User>) => void;
}

type ContentType = 'bio' | 'reflection' | 'social' | 'idea';

const contentTypes: { id: ContentType; label: string; prompt: string }[] = [
    { id: 'bio', label: 'بیوگرافی پروفایل', prompt: "Write a short, inspiring bio (2-3 sentences) in Persian for this user's profile on the 'Nakhlestan Ma'na' platform. The tone should be reflective and hopeful. Use their recent activities and level to infer their interests and journey stage." },
    { id: 'reflection', label: 'تامل بر آخرین فعالیت', prompt: "Based on the user's most recent activity, write a short, first-person reflection (as the user) in Persian about what this moment meant to them. The tone should be personal, insightful, and connect to the broader theme of finding meaning." },
    { id: 'social', label: 'پست برای شبکه‌های اجتماعی', prompt: "Write an engaging social media post (e.g., for Instagram) in Persian for this user to share about their journey on 'Nakhlestan Ma'na'. Mention their level and one of their recent activities. End with a question to engage followers and include relevant hashtags like #نخلستان_معنا, #سفر_قهرمانی, #معنای_زندگی." },
    { id: 'idea', label: 'ایده برای اقدام خلاقانه', prompt: "Suggest a creative act for this user based on their recent activities and their current level on the platform. The output should be a single, concise idea in Persian that they can use as a prompt for the AI image/video generator or to write a story. Frame it as an inspiring suggestion, not a command." }
];

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ user, onUpdateProfile }) => {
    const [contentType, setContentType] = useState<ContentType>('bio');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const userSummary = useMemo(() => {
        const userLevel = getUserLevel(user.points);
        const recentActivities = (user.timeline || [])
            .slice(0, 3)
            .map(event => `- ${event.title} (on ${new Date(event.date).toLocaleDateString()})`)
            .join('\n');
        
        return `
        User Profile Summary:
        - Name: ${user.name}
        - Level: ${userLevel.name} (Level ${userLevel.level})
        - Growth Points: ${user.points}
        - Ma'na Points: ${user.manaPoints || 0}
        - Joined: ${new Date(user.joinDate).toLocaleDateString()}
        - Recent Activities:
        ${recentActivities || 'No recent activities.'}
        `;
    }, [user]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedText(null);
        setError(null);

        const selectedPrompt = contentTypes.find(c => c.id === contentType)?.prompt;
        if (!selectedPrompt) {
            setError('لطفا یک نوع محتوا انتخاب کنید.');
            setIsLoading(false);
            return;
        }

        const fullPrompt = `
        ${userSummary}

        Task: ${selectedPrompt}
        
        Respond ONLY with the generated Persian text. Do not include any titles, labels, or markdown formatting.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: fullPrompt,
            });
            setGeneratedText(response.text);
        } catch (err) {
            console.error("Content generation failed:", err);
            let errorMessage = "متاسفانه در تولید محتوا خطایی رخ داد. لطفا دوباره تلاش کنید.";
            if (err instanceof Error && (err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED"))) {
                errorMessage = "سهمیه شما برای استفاده از این قابلیت به پایان رسیده است.";
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (generatedText) {
            navigator.clipboard.writeText(generatedText);
            // Optionally show a "Copied!" message
        }
    };

    const handleSaveToJournal = () => {
        if (!generatedText) return;

        const newEvent: TimelineEvent = {
            id: `evt_reflection_ai_${Date.now()}`,
            date: new Date().toISOString(),
            // FIX: Correct timeline event type
            type: 'reflection',
            title: 'یک تامل با کمک هوش مصنوعی',
            description: `خلق شده با دستیار نویسنده معنا: "${generatedText.substring(0, 50)}..."`,
            details: {
                aiGenerated: true,
                contentType: contentType,
            },
            userReflection: {
                notes: generatedText
            }
        };
        
        // FIX: Correctly structure update object
        const updatedTimeline = [newEvent, ...(user.timeline || [])];
        onUpdateProfile({ timeline: updatedTimeline });
        
        setIsSaveModalOpen(false);
        setGeneratedText(null); // Clear after saving
    };

    return (
        <div className="w-full h-full bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg flex flex-col border border-stone-200/80 dark:border-stone-700">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100">دستیار نویسنده معنا</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">بر اساس سفر و دستاوردهای شما، محتوای الهام‌بخش خلق کنید.</p>
            </div>
            
            <div className="flex-1 p-4 md:p-6 flex flex-col gap-6">
                <div>
                    <label className="font-semibold block mb-2">۱. نوع محتوا را انتخاب کنید:</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {contentTypes.map(ct => (
                            <button
                                key={ct.id}
                                onClick={() => setContentType(ct.id)}
                                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                                    contentType === ct.id
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                                        : 'border-stone-200 dark:border-stone-600 hover:bg-stone-50'
                                }`}
                            >
                                {ct.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-center">
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="bg-amber-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-amber-300 flex items-center justify-center gap-2 mx-auto"
                    >
                         <SparklesIcon className="w-5 h-5"/>
                         {isLoading ? 'در حال نوشتن...' : 'خلق کن'}
                    </button>
                </div>
                <div className="flex-grow flex flex-col">
                    <label className="font-semibold block mb-2">۲. نتیجه:</label>
                    <div className="flex-grow bg-stone-50 dark:bg-stone-800 rounded-lg p-4 border dark:border-stone-700 min-h-[200px] whitespace-pre-wrap">
                        {isLoading ? (
                             <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-5/6"></div>
                                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-full"></div>
                                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4"></div>
                            </div>
                        ) : error ? (
                            <p className="text-red-500 text-sm">{error}</p>
                        ) : generatedText ? (
                            <p className="text-stone-700 dark:text-stone-200 leading-relaxed">{generatedText}</p>
                        ) : (
                            <p className="text-stone-400">محتوای خلق شده اینجا نمایش داده می‌شود.</p>
                        )}
                    </div>
                </div>

                {generatedText && (
                    <div className="flex justify-end gap-3">
                        <button onClick={handleCopyToClipboard} className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 rounded-lg">کپی متن</button>
                        <button onClick={() => setIsSaveModalOpen(true)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"><PlusIcon className="w-4 h-4" /> ثبت در گاهشمار</button>
                    </div>
                )}
            </div>

            <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
                <div className="p-4 text-center max-w-sm">
                    <h3 className="text-lg font-bold">ثبت تامل در گاهشمار</h3>
                    <p className="my-2 text-sm text-stone-600 dark:text-stone-300">
                       آیا مایلید این متن را به عنوان یک «تامل» در باغ زنده خود ثبت کنید؟
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={() => setIsSaveModalOpen(false)} className="px-6 py-2 rounded-lg bg-stone-100 dark:bg-stone-600">انصراف</button>
                        <button onClick={handleSaveToJournal} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">ثبت کن</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ContentGenerator;