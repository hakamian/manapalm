
import React, { useState } from 'react';
import { User, CoachingRole } from '../../types';
import { PlusIcon, ChevronDownIcon, UserCircleIcon, CheckCircleIcon, BrainCircuitIcon, UsersIcon } from '../icons';
import { coachingTopics } from '../../utils/coachingData';
import CourseReviews, { AddReviewForm } from '../CourseReviews';

interface PracticeTabProps {
    user: User;
    onOpenAccessModal: () => void;
    onStartSession: (role: CoachingRole, topic?: string) => void;
}

const PracticeTab: React.FC<PracticeTabProps> = ({ user, onOpenAccessModal, onStartSession }) => {
    const [selectedTopic, setSelectedTopic] = useState('');
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    return (
        <div className="animate-fade-in">
            {/* Stats */}
            <div className="max-w-4xl mx-auto mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                    <p className="text-xs text-gray-400 mb-1">ساعات پرواز (Flight Hours)</p>
                    <p className="text-xl font-bold text-white">۱۲ ساعت</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                    <p className="text-xs text-gray-400 mb-1">جلسات موفق</p>
                    <p className="text-xl font-bold text-green-400">۸</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                    <p className="text-xs text-gray-400 mb-1">سطح مهارت</p>
                    <p className="text-xl font-bold text-amber-400">کوچ سطح ۱</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center cursor-pointer hover:bg-gray-700 transition-colors" onClick={onOpenAccessModal}>
                    <p className="text-xs text-gray-400 mb-1">وضعیت اشتراک</p>
                    <p className="text-sm font-bold text-blue-300 flex items-center justify-center gap-1">
                        {user.coachingLabAccess && new Date(user.coachingLabAccess.expiresAt) > new Date() ? <span className="text-green-400">فعال</span> : <span>غیرفعال <PlusIcon className="w-3 h-3"/></span>}
                    </p>
                </div>
            </div>
            
            <section className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-xl p-6 md:p-8 mb-16">
                    
                    {/* Topic Selector */}
                    <div className="mb-10 max-w-lg mx-auto">
                        <label className="block text-sm font-semibold text-gray-300 mb-3 text-center">موضوع تمرین امروز چیست؟</label>
                        <div className="relative">
                            <select 
                                value={selectedTopic} 
                                onChange={(e) => setSelectedTopic(e.target.value)} 
                                className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl focus:ring-amber-500 focus:border-amber-500 block p-3 pr-10 appearance-none cursor-pointer hover:border-amber-400 transition-colors"
                            >
                                <option value="">انتخاب موضوع (تصادفی)</option>
                                {coachingTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                            </select>
                            <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Role Cards */}
                        <div className="flex flex-col h-full bg-gray-700/30 rounded-2xl border border-gray-600 hover:border-amber-500 hover:bg-gray-700/50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">محبوب</div>
                            <div className="p-6 flex-grow text-center">
                                <div className="bg-amber-500/20 p-4 rounded-full mb-4 inline-block group-hover:scale-110 transition-transform">
                                    <UserCircleIcon className="w-8 h-8 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">نقش کوچ (Coach)</h3>
                                <p className="text-sm text-gray-300 mb-4">شما کوچ هستید و هوش مصنوعی مراجع.</p>
                                <ul className="text-xs text-gray-400 space-y-2 text-right bg-black/20 p-3 rounded-lg">
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-green-500"/> تمرین پرسشگری قدرتمند</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-green-500"/> مدیریت جلسه واقعی</li>
                                </ul>
                            </div>
                            <button onClick={() => onStartSession('coach', selectedTopic)} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors">
                                شروع تمرین
                            </button>
                        </div>

                        <div className="flex flex-col h-full bg-gray-700/30 rounded-2xl border border-gray-600 hover:border-blue-500 hover:bg-gray-700/50 transition-all group">
                            <div className="p-6 flex-grow text-center">
                                <div className="bg-blue-500/20 p-4 rounded-full mb-4 inline-block group-hover:scale-110 transition-transform">
                                    <BrainCircuitIcon className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">نقش مراجع (Coachee)</h3>
                                <p className="text-sm text-gray-300 mb-4">تجربه کوچینگ شدن توسط هوش مصنوعی.</p>
                                <ul className="text-xs text-gray-400 space-y-2 text-right bg-black/20 p-3 rounded-lg">
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-green-500"/> درک حس مراجع</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-green-500"/> یادگیری مدل‌های سوال</li>
                                </ul>
                            </div>
                            <button onClick={() => onStartSession('coachee', selectedTopic)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                                تجربه جلسه
                            </button>
                        </div>

                        <div className="flex flex-col h-full bg-gray-700/30 rounded-2xl border border-gray-600 hover:border-purple-500 hover:bg-gray-700/50 transition-all group">
                            <div className="p-6 flex-grow text-center">
                                <div className="bg-purple-500/20 p-4 rounded-full mb-4 inline-block group-hover:scale-110 transition-transform">
                                    <UsersIcon className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">نقش ناظر (Observer)</h3>
                                <p className="text-sm text-gray-300 mb-4">مشاهده و تحلیل جلسه بین دو AI.</p>
                                <ul className="text-xs text-gray-400 space-y-2 text-right bg-black/20 p-3 rounded-lg">
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-green-500"/> تشخیص صلاحیت‌ها</li>
                                    <li className="flex items-center gap-2"><CheckCircleIcon className="w-3 h-3 text-green-500"/> یادگیری بدون فشار</li>
                                </ul>
                            </div>
                            <button onClick={() => onStartSession('observer', selectedTopic)} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors">
                                شروع مشاهده
                            </button>
                        </div>
                    </div>
                </div>

                {/* Social Proof Section */}
                <CourseReviews 
                    courseId="service-coaching-lab" 
                    onAddReviewClick={() => setIsReviewFormOpen(true)} 
                />
            </section>
            
            <AddReviewForm 
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                courseId="service-coaching-lab"
            />
        </div>
    );
};

export default PracticeTab;
