import React, { useState, useMemo } from 'react';
import { User } from '../types';
import GrantPointsModal from './GrantPointsModal';
import PotentialScoreGauge from './PotentialScoreGauge.tsx';
import { timeAgo } from '../utils/time.ts';

interface UserManagementProps {
    allUsers: User[];
    onAdminUpdateUser: (userId: string, updatedData: Partial<User>) => void;
    onAdminGrantPoints: (userId: string, points: number, reason: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ allUsers, onAdminUpdateUser, onAdminGrantPoints }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const usersWithPotential = useMemo(() => {
        return allUsers.map(user => {
            // Mock potential score calculation
            const pointsScore = Math.min(user.points / 5000, 1) * 40; // Max 40 points from score
            const activityCount = user.timeline?.length || 0;
            const activityScore = Math.min(activityCount / 20, 1) * 30; // Max 30 points from activity count

            const lastEventDate = user.timeline && user.timeline.length > 0
                ? new Date(Math.max(...user.timeline.map(e => new Date(e.date).getTime())))
                : new Date(user.joinDate);
            const daysSinceLastActivity = (new Date().getTime() - lastEventDate.getTime()) / (1000 * 3600 * 24);
            const recencyScore = Math.max(0, 30 - daysSinceLastActivity); // Max 30 points from recency

            const potential = Math.round(pointsScore + activityScore + recencyScore);

            // Mock AI Rationale
            let rationale = '';
            if (potential > 75) {
                rationale = 'پتانسیل بالا: کاربر بسیار فعال و در مسیر طلایی است.';
            } else if (potential > 40) {
                rationale = 'نیاز به توجه: فعالیت خوبی دارد اما اخیراً کمی غیرفعال شده است. او را به اقدام بعدی تشویق کنید.';
            } else {
                rationale = 'ریسک بالا: کاربر برای مدتی غیرفعال بوده است. یک کمپین بازیابی برای او اجرا کنید.';
            }
            
            return { ...user, potential, rationale };
        });
    }, [allUsers]);

    return (
        <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
            <h2 className="text-xl font-bold mb-4">مدیریت کاربران ({allUsers.length})</h2>
            <div className="max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm text-right">
                    <thead className="text-xs text-stone-700 uppercase bg-stone-50 dark:bg-stone-700 dark:text-stone-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">نام</th>
                            <th scope="col" className="px-6 py-3">امتیاز</th>
                            <th scope="col" className="px-6 py-3 text-center">پتانسیل</th>
                            <th scope="col" className="px-6 py-3">آخرین فعالیت</th>
                            <th scope="col" className="px-6 py-3">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersWithPotential.map(user => {
                            const lastEvent = user.timeline && user.timeline.length > 1 ? user.timeline.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
                            return (
                                <tr key={user.id} className="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50">
                                    <td className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap dark:text-white">{user.name}</td>
                                    <td className="px-6 py-4">{user.points.toLocaleString('fa-IR')}</td>
                                    <td className="px-6 py-4">
                                        <PotentialScoreGauge score={user.potential} rationale={user.rationale} />
                                    </td>
                                    <td className="px-6 py-4 text-stone-500 dark:text-stone-400">{lastEvent ? timeAgo(lastEvent.date) : timeAgo(user.joinDate)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedUser(user)} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">اعطای امتیاز</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <GrantPointsModal 
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                onGrant={onAdminGrantPoints}
            />
        </div>
    );
};

export default UserManagement;
