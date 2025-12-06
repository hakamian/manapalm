
import React, { useMemo } from 'react';
import { User } from '../types';
import { SparklesIcon, HeartIcon, StarIcon, LeafIcon } from './icons';

interface SmartLandingProps {
    user: User | null;
    onStartJourneyClick: () => void;
}

const INTENT_MAP: Record<string, { title: string; subtitle: string; icon: any; color: string }> = {
    'father': {
        title: 'به یاد پدری که ریشه‌هایت از اوست',
        subtitle: 'یک نخل به نام پدر بکارید؛ نمادی از سایه‌ای که همیشه مستدام است.',
        icon: LeafIcon,
        color: 'text-green-400'
    },
    'mother': {
        title: 'برای قلب تپنده زندگی، مادر',
        subtitle: 'مهر مادر مثل نخل است؛ صبور، بخشنده و همیشگی. این عشق را جاودانه کنید.',
        icon: HeartIcon,
        color: 'text-red-400'
    },
    'success': {
        title: 'پیروزی‌ات را در خاک ثبت کن',
        subtitle: 'هر موفقیت یک بذر است. آن را بکار تا به جنگلی از دستاوردها تبدیل شود.',
        icon: StarIcon,
        color: 'text-yellow-400'
    },
    'love': {
        title: 'عشقی که رشد می‌کند',
        subtitle: 'به جای گل که می‌پژمرد، نخلی بکارید که با عشق شما قد می‌کشد.',
        icon: HeartIcon,
        color: 'text-pink-400'
    },
    'default': {
        title: 'نخل بکارید، اثر بگذارید، جاودانه شوید',
        subtitle: 'ما به شما کمک می‌کنیم با کاشت نخل‌های واقعی در جنوب ایران، هم به محیط زیست کمک کنید و هم یک یادگاری ابدی بسازید.',
        icon: SparklesIcon,
        color: 'text-amber-400'
    }
};

const SmartLanding: React.FC<SmartLandingProps> = ({ user, onStartJourneyClick }) => {
    const params = new URLSearchParams(window.location.search);
    const intentKey = params.get('intent')?.toLowerCase() || 'default';
    
    // Fallback to default if intent not found
    const content = INTENT_MAP[intentKey] || INTENT_MAP['default'];
    const Icon = content.icon;

    // 3D Parallax Effect Logic (Simplified)
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    React.useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
             const { clientX, clientY } = event;
             const { innerWidth, innerHeight } = window;
             setMousePos({ x: (clientX / innerWidth - 0.5) * 5, y: (clientY / innerHeight - 0.5) * 5 });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-[90dvh] w-full bg-gray-900 flex flex-col justify-center items-center overflow-hidden">
             {/* Dynamic Background based on Intent */}
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                 <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent ${intentKey === 'love' || intentKey === 'mother' ? 'to-pink-900/50' : intentKey === 'success' ? 'to-yellow-900/50' : 'to-green-900/50'}`}></div>
             </div>

             {/* Content */}
             <div className="relative z-10 text-center px-4 max-w-4xl" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
                 <div className={`mb-6 inline-block p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in-down`}>
                     <Icon className={`w-12 h-12 ${content.color} mx-auto`} />
                 </div>
                 
                 <h1 className="text-4xl md:text-7xl font-bold mb-6 text-white leading-tight drop-shadow-xl animate-fade-in-up">
                     {user ? `سلام ${user.name}، ` : ''}{content.title}
                 </h1>
                 
                 <p className="text-lg md:text-2xl text-gray-300 mb-10 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                     {content.subtitle}
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                     <button onClick={onStartJourneyClick} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                        {intentKey !== 'default' ? 'همین نیت را بکارید' : 'شروع میراث‌سازی'}
                     </button>
                 </div>
             </div>
             
             {/* Decorative Palm Silhouette */}
              <div className="absolute bottom-0 w-full h-1/3 pointer-events-none opacity-40">
                  <img src="https://purepng.com/public/uploads/large/purepng.com-palm-treepalm-treealms-tree-941524671653r6kcs.png" className="absolute bottom-[-10%] right-[-5%] w-[400px] filter brightness-0 invert opacity-20" alt="Decoration"/>
              </div>
        </div>
    );
};

export default SmartLanding;
