
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { SproutIcon, SaplingIcon, TreeIcon, MatureTreeIcon, BrainCircuitIcon, HeartIcon, ShareIcon, ChevronDownIcon } from '../icons';
import { getGrowthLevel } from '../../services/gamificationService';

interface ProfileHeaderProps {
    user: User;
    animatedBarkatProgress: number;
    circumference: number;
    strokeDashoffset: number;
    activeTab: string;
    setActiveTab: (id: string) => void;
    tabs: { id: string; label: string; icon: React.ReactNode }[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    user, 
    animatedBarkatProgress, 
    circumference, 
    strokeDashoffset,
    activeTab,
    setActiveTab,
    tabs
}) => {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    const [referralCopySuccess, setReferralCopySuccess] = useState('');
    
    const activeTabLabel = tabs.find(t => t.id === activeTab)?.label;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileNavRef.current && !mobileNavRef.current.contains(event.target as Node)) {
                setIsMobileNavOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShareProfile = async () => {
        const palmsPlanted = (user.timeline || []).filter(e => e.type === 'palm_planted').length;
        const shareData = {
            title: `پروفایل ${user.fullName} در نخلستان معنا`,
            text: `سفر قهرمانی ${user.fullName} را در نخلستان معنا دنبال کنید! کاشته شده: ${palmsPlanted} نخل | امتیاز: ${user.points.toLocaleString('fa-IR')}`,
            url: `https://nakhlestanmana.com/profile/${user.id}`
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                setReferralCopySuccess('لینک پروفایل کپی شد!');
                setTimeout(() => setReferralCopySuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const getLevelIcon = (levelName: string) => {
        switch (levelName) {
            case 'جوانه': return <SproutIcon className="w-6 h-6" />;
            case 'نهال': return <SaplingIcon className="w-6 h-6" />;
            case 'درخت جوان': return <TreeIcon className="w-6 h-6" />;
            case 'درخت تنومند': return <MatureTreeIcon className="w-6 h-6" />;
            default: return <SproutIcon className="w-6 h-6" />;
        }
    };

    return (
        <header className="relative bg-gray-800/50 rounded-lg border border-gray-700 mb-8 p-6 pt-12 md:pt-6 text-center md:text-right">
            <img src="https://picsum.photos/seed/profile-bg-2/1000/300" alt="Profile background" className="absolute inset-0 w-full h-full object-cover opacity-20 z-0 rounded-lg"/>
            
            <button onClick={handleShareProfile} className="absolute top-4 left-4 z-20 p-2 bg-gray-900/50 rounded-full text-white hover:bg-gray-900 transition-colors" title="اشتراک‌گذاری پروفایل">
                <ShareIcon className="w-5 h-5" />
            </button>
            {referralCopySuccess && (
                <div className="absolute top-4 left-16 z-20 px-3 py-1.5 bg-green-600 text-white text-xs rounded-full animate-fade-in-out">
                    {referralCopySuccess}
                </div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="8" className="text-gray-700" />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeLinecap="round"
                            className="text-green-400"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                                transition: 'stroke-dashoffset 1.5s ease-out'
                            }}
                        />
                    </svg>
                    <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="User Avatar" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full object-cover border-4 border-gray-800" />
                </div>

                <div className="flex-grow">
                    <h1 className="text-4xl font-bold">{user.fullName || 'کاربر مهمان'}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2 font-semibold">
                       <div className="flex items-center gap-2 text-green-300">
                            {getLevelIcon(user.level)}
                            <span>{user.level}</span>
                       </div>
                       <div className="flex items-center gap-2 text-indigo-300">
                            <BrainCircuitIcon className="w-6 h-6" />
                            <span>{getGrowthLevel(user.manaPoints || 0).name}</span>
                        </div>
                        {user.isMonthlySubscriber && (
                            <div className="flex items-center gap-1.5 text-sm text-yellow-300 bg-yellow-900/50 px-3 py-1 rounded-full border border-yellow-700/50">
                                <HeartIcon className="w-4 h-4" />
                                <span>حامی ماهانه</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 grid grid-cols-2 gap-x-6 gap-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-300">{user.points.toLocaleString('fa-IR')}</p>
                        <p className="text-xs text-gray-400">امتیاز برکت</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-300">{(user.manaPoints || 0).toLocaleString('fa-IR')}</p>
                        <p className="text-xs text-gray-400">امتیاز معنا</p>
                    </div>
                </div>
            </div>
            
            <div className="md:hidden relative mt-6" ref={mobileNavRef}>
                <button onClick={() => setIsMobileNavOpen(prev => !prev)} className="w-full flex justify-between items-center p-3 bg-gray-800 border border-gray-700 rounded-md">
                    <span>{activeTabLabel}</span>
                    <ChevronDownIcon />
                </button>
                {isMobileNavOpen && (
                    <div className="absolute top-full right-0 w-full bg-gray-800 border border-gray-700 rounded-md mt-1 z-20 max-h-60 overflow-y-auto shadow-xl">
                        {tabs.map(tab => {
                            const isGroveKeeperTab = tab.id === 'grovekeeper';
                            const isActive = activeTab === tab.id;
                            let buttonClasses = "w-full text-right px-4 py-3 flex items-center gap-3 transition-colors ";
                            if (isActive) buttonClasses += 'bg-green-700 text-white';
                            else if (isGroveKeeperTab) buttonClasses += 'bg-amber-800/50 text-amber-200 hover:bg-amber-700/50';
                            else buttonClasses += 'hover:bg-gray-700';
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setIsMobileNavOpen(false); }}
                                    className={buttonClasses}
                                >
                                    {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </header>
    );
};

export default ProfileHeader;
