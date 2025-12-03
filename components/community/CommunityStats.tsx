
import React from 'react';
import { UsersIcon, SproutIcon, PencilSquareIcon } from '../icons';

interface CommunityStatsProps {
    communitySize: number;
    totalPalms: number;
    totalPosts: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({ icon, value, label }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-reverse space-x-4 border border-gray-700">
        <div className="p-3 rounded-full bg-gray-700">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </div>
);

const CommunityStats: React.FC<CommunityStatsProps> = ({ communitySize, totalPalms, totalPosts }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <StatCard icon={<UsersIcon className="w-8 h-8 text-indigo-400" />} value={communitySize.toLocaleString('fa-IR')} label="عضو جامعه (تخمین)" />
            <StatCard icon={<SproutIcon className="w-8 h-8 text-green-400" />} value={totalPalms.toLocaleString('fa-IR')} label="نخل کاشته شده" />
            <StatCard icon={<PencilSquareIcon className="w-8 h-8 text-yellow-400" />} value={(totalPosts).toLocaleString('fa-IR')} label="داستان و مشارکت" />
        </div>
    );
};

export default CommunityStats;
