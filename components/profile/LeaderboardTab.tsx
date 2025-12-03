
import React from 'react';
import { User, View, MIN_POINTS_FOR_MESSAGING } from '../../types';
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon, EnvelopeIcon } from '../icons';
import { useAppDispatch } from '../../AppContext';

interface LeaderboardTabProps {
    user: User;
    allUsers: User[];
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ user, allUsers }) => {
    const dispatch = useAppDispatch();

    const onStartConversation = (targetUserId: string) => {
        dispatch({ type: 'SET_VIEW', payload: View.DIRECT_MESSAGES });
    };

    const sortedUsers = [...allUsers, user].filter((value, index, self) => index === self.findIndex((t) => t.id === value.id)).sort((a, b) => b.points - a.points);
    const currentUserRank = sortedUsers.findIndex(u => u.id === user.id) + 1;
    const userToBeat = currentUserRank > 1 ? sortedUsers[currentUserRank - 2] : null;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">تابلوی قهرمانان</h2>
            <div className="bg-gray-700 p-4 rounded-lg mb-6 sticky top-20 z-10 border-2 border-green-500">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center">
                            <span className="text-2xl font-bold w-12 text-center text-green-300">{currentUserRank}</span>
                            <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full object-cover ml-3"/>
                            <p className="font-semibold">شما</p>
                    </div>
                    <div className="text-lg font-bold text-yellow-300">{user.points.toLocaleString('fa-IR')}</div>
                    </div>
                    {userToBeat && (
                    <p className="text-center text-xs text-gray-400 mt-2">
                        {(userToBeat.points - user.points + 1).toLocaleString('fa-IR')} امتیاز تا رسیدن به <span className="font-semibold text-white">{userToBeat.fullName}</span>!
                    </p>
                    )}
            </div>
            <div className="space-y-3">
                {sortedUsers.map((member, index) => {
                    if (member.id === user.id) return null;
                    const rank = index + 1;
                    let rankIcon = null;
                    let rankColor = 'bg-gray-800';
                    if (rank === 1) { rankIcon = <FirstPlaceIcon />; rankColor = 'bg-yellow-800/30 border-yellow-500'; }
                    else if (rank === 2) { rankIcon = <SecondPlaceIcon />; rankColor = 'bg-gray-700/50 border-gray-500'; }
                    else if (rank === 3) { rankIcon = <ThirdPlaceIcon />; rankColor = 'bg-orange-800/30 border-orange-600'; }

                    return (
                        <div key={member.id} className={`flex items-center p-3 rounded-lg border-2 border-transparent transition-colors ${rankColor}`}>
                            <div className="w-12 text-center font-bold text-2xl flex-shrink-0 flex justify-center">
                                {rank <= 3 ? rankIcon : <span className="text-gray-400">{rank}</span>}
                            </div>
                            <img src={member.avatar || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.fullName} className="w-12 h-12 rounded-full object-cover ml-4"/>
                            <div className="flex-grow">
                                <p className="font-semibold text-lg">{member.fullName}</p>
                                <p className="text-sm text-gray-400">{member.level}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {user.points >= MIN_POINTS_FOR_MESSAGING && (
                                    <button onClick={() => onStartConversation(member.id)} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" title="ارسال پیام">
                                        <EnvelopeIcon className="w-5 h-5"/>
                                    </button>
                                )}
                                <span className="text-xl font-bold text-yellow-300 w-20 text-left">{member.points.toLocaleString('fa-IR')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaderboardTab;
