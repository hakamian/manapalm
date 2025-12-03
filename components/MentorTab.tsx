import React from 'react';
import { User } from '../types.ts';
import { getUserLevel } from '../utils/gamification.ts';
import { ChatBubbleLeftRightIcon, EnvelopeIcon } from './icons.tsx';

interface MentorTabProps {
    currentUser: User;
    mentor: User;
    onStartConversation: () => void;
}

const MentorTab: React.FC<MentorTabProps> = ({ currentUser, mentor, onStartConversation }) => {
    const mentorLevel = getUserLevel(mentor.points);
    const sortedCheckIns = [...(currentUser.checkIns || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 flex flex-col sm:flex-row items-center gap-6">
                <img src={mentor.profileImageUrl || `https://ui-avatars.com/api/?name=${mentor.name}&background=854d0e&color=fff&size=128`} alt={mentor.name} className="w-24 h-24 rounded-full object-cover" />
                <div className="flex-1 text-center sm:text-right">
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">مربی راهنمای شما</p>
                    <h2 className="text-2xl font-bold">{mentor.name}</h2>
                    <p className="text-stone-500 font-semibold">{mentorLevel.name}</p>
                    <blockquote className="mt-2 pt-2 border-t border-dashed dark:border-stone-700">
                        <p className="text-sm text-stone-600 dark:text-stone-300 italic">"{mentor.mentorBio || 'در مسیر معنا، همراه شما خواهم بود.'}"</p>
                    </blockquote>
                </div>
                <button onClick={onStartConversation} className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-amber-600">
                    <EnvelopeIcon className="w-5 h-5"/>
                    ارسال پیام خصوصی
                </button>
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-stone-500"/>
                    تاریخچه گفتگوهای شما
                </h3>
                {sortedCheckIns.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {sortedCheckIns.map(checkIn => (
                            <div key={checkIn.id} className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg">
                                <p className="text-xs text-stone-500 mb-2">{new Date(checkIn.date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <div className="p-3 bg-white dark:bg-stone-700/50 rounded-md border-r-4 border-amber-400">
                                    <p className="font-semibold text-sm text-stone-700 dark:text-stone-200">سوال مربی:</p>
                                    <p className="italic text-stone-600 dark:text-stone-300">"{checkIn.prompt}"</p>
                                </div>
                                {checkIn.status === 'responded' && checkIn.response ? (
                                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border-r-4 border-green-400">
                                        <p className="font-semibold text-sm text-green-800 dark:text-green-200">پاسخ شما:</p>
                                        <p className="italic text-stone-700 dark:text-stone-200">"{checkIn.response}"</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-center mt-3 text-amber-600">در انتظار پاسخ شما...</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <p className="text-stone-500">گفتگوهای شما با مربی‌تان در اینجا نمایش داده خواهد شد.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorTab;