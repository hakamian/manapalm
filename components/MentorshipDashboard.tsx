import React, { useMemo } from 'react';
import { User, MentorshipRequest } from '../types.ts';
import { UsersGroupIcon, ClockIcon, AwardIcon } from './icons.tsx';

interface MentorshipDashboardProps {
    allUsers: User[];
    mentorshipRequests: MentorshipRequest[];
}

const StatBox: React.FC<{ icon: React.FC<any>, value: number, label: string, color: string }> = ({ icon: Icon, value, label, color }) => (
    <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg text-center border-l-4" style={{ borderColor: color }}>
        <Icon className="w-10 h-10 mx-auto" style={{ color }} />
        <p className="text-4xl font-bold mt-2">{value.toLocaleString('fa-IR')}</p>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{label}</p>
    </div>
);


const MentorshipDashboard: React.FC<MentorshipDashboardProps> = ({ allUsers, mentorshipRequests }) => {
    
    const pendingRequestsCount = useMemo(() => 
        mentorshipRequests.filter(r => r.status === 'pending').length,
        [mentorshipRequests]
    );

    const activePairsCount = useMemo(() =>
        allUsers.reduce((count, user) => count + (user.menteeIds?.length || 0), 0),
        [allUsers]
    );

    const topMentors = useMemo(() => 
        allUsers
            .filter(u => u.isGuardian && (u.menteeIds?.length || 0) > 0)
            .sort((a, b) => (b.menteeIds?.length || 0) - (a.menteeIds?.length || 0))
            .slice(0, 5),
        [allUsers]
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox icon={ClockIcon} value={pendingRequestsCount} label="درخواست در انتظار پاسخ" color="#f59e0b" />
                <StatBox icon={UsersGroupIcon} value={activePairsCount} label="روابط مربی‌گری فعال" color="#10b981" />
                <StatBox icon={AwardIcon} value={topMentors.length} label="مربی فعال" color="#3b82f6" />
            </div>

            <div>
                <h3 className="text-xl font-bold mb-4">فعال‌ترین مربیان (نگهبانان)</h3>
                {topMentors.length > 0 ? (
                    <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg space-y-3">
                        {topMentors.map((mentor, index) => (
                            <div key={mentor.id} className="flex items-center justify-between p-3 bg-white dark:bg-stone-700/50 rounded-md">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-stone-500">{index + 1}</span>
                                    <img src={mentor.profileImageUrl || `https://ui-avatars.com/api/?name=${mentor.name}&background=a16207&color=fff&size=64`} alt={mentor.name} className="w-10 h-10 rounded-full"/>
                                    <span className="font-semibold">{mentor.name}</span>
                                </div>
                                <div className="text-sm font-bold">
                                    <span className="text-amber-600">{(mentor.menteeIds?.length || 0).toLocaleString('fa-IR')}</span>
                                    <span className="text-stone-500"> رهجو</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-stone-500 py-8">هنوز هیچ مربی فعالی وجود ندارد.</p>
                )}
            </div>
        </div>
    );
};

export default MentorshipDashboard;