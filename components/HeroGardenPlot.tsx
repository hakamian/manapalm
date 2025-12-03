import React, { useMemo } from 'react';
import { User, AchievementId } from '../types.ts';
import { getUserLevel } from '../utils/gamification.ts';
import { SproutIcon, SaplingIcon, YoungPalmIcon, SturdyPalmIcon, AncientPalmIcon, WateringCanIcon, StoneTabletIcon, LanternIcon, CrystalIcon } from './icons-garden.tsx';
import { BookOpenIcon, HandshakeIcon } from './icons.tsx';

interface HeroGardenPlotProps {
    user: User;
}

const levelToPalmMap: { [key: number]: React.FC<any> } = {
    1: SproutIcon,
    2: SaplingIcon,
    3: YoungPalmIcon,
    4: SturdyPalmIcon,
    5: AncientPalmIcon,
    6: AncientPalmIcon, // Can be a more ornate version later
};

const achievementToOrnamentMap: { [key in AchievementId]?: React.FC<any> } = {
    'profile_complete': StoneTabletIcon,
    'first_palm': WateringCanIcon,
    'guardian': LanternIcon,
    'first_creative_act': CrystalIcon,
    'first_course': BookOpenIcon,
    'community_builder': HandshakeIcon,
};

const HeroGardenPlot: React.FC<HeroGardenPlotProps> = ({ user }) => {
    const userLevel = useMemo(() => getUserLevel(user.points), [user.points]);
    const PalmIcon = levelToPalmMap[userLevel.level] || AncientPalmIcon;

    const ornaments = useMemo(() => {
        return (user.achievements || [])
            .map(achId => achievementToOrnamentMap[achId])
            .filter(Boolean) as React.FC<any>[];
    }, [user.achievements]);

    return (
        <div className="group relative aspect-square bg-stone-800/50 border-2 border-stone-700/80 rounded-2xl p-4 flex flex-col justify-between items-center transition-all duration-300 hover:border-amber-500/50 hover:bg-stone-800">
            {/* User Info Tooltip */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-stone-900 text-white text-xs rounded-lg py-2 px-4 opacity-0 group-hover:opacity-100 group-hover:-translate-y-full transition-all duration-300 z-10 pointer-events-none">
                <p className="font-bold">{user.name}</p>
                <p className="font-semibold text-amber-300">{userLevel.name}</p>
                <p>{user.points.toLocaleString('fa-IR')} امتیاز</p>
            </div>
            
            {/* Palm Tree */}
            <div className="flex-grow flex items-center justify-center w-full">
                <PalmIcon className="w-2/3 h-2/3 text-green-400/70 group-hover:text-green-300 transition-colors duration-300" />
            </div>

            {/* Ornaments */}
            <div className="w-full h-1/4 grid grid-cols-3 gap-2 items-center justify-items-center">
                {ornaments.slice(0, 6).map((OrnamentIcon, index) => (
                    <div key={index} className="transform group-hover:scale-110 transition-transform" style={{ transitionDelay: `${index * 50}ms` }}>
                        <OrnamentIcon className="w-6 h-6 text-stone-400 group-hover:text-amber-300 transition-colors duration-300"/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroGardenPlot;