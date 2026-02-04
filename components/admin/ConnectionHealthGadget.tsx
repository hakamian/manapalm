import React, { useState, useEffect } from 'react';
import { useAppState } from '../../AppContext';
import { supabase } from '../../services/infrastructure/supabase';

const ConnectionHealthGadget: React.FC = () => {
    const { user } = useAppState();
    const [latency, setLatency] = useState<number | null>(null);
    const [status, setStatus] = useState<'excellent' | 'good' | 'slow' | 'offline'>('excellent');
    const [isVisible, setIsVisible] = useState(false);

    // 🛡️ Force show gadget for SuperUser by Phone/ID
    const isSuperUser = user && (
        user.isAdmin ||
        user.id === '3e47b878-335e-4b3a-ac52-bec76be9fc08' ||
        user.phone?.includes('9222453571') ||
        user.email?.includes('hhakamian@gmail.com')
    );

    useEffect(() => {
        if (!isSuperUser) return;

        const checkHealth = async () => {

            if (!supabase) return;

            const start = Date.now();
            try {
                // Perform a very light RPC or query to check real-world latency
                const { error } = await supabase.from('profiles').select('id').limit(1).single();

                const end = Date.now();
                const diff = end - start;
                setLatency(diff);

                if (error) {
                    setStatus('offline');
                } else if (diff < 500) {
                    setStatus('excellent');
                } else if (diff < 2000) {
                    setStatus('good');
                } else {
                    setStatus('slow');
                }
            } catch (e) {
                setStatus('offline');
                setLatency(null);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [isSuperUser]);

    if (!isSuperUser) return null;

    const getStatusColor = () => {
        switch (status) {
            case 'excellent': return 'bg-emerald-500';
            case 'good': return 'bg-amber-500';
            case 'slow': return 'bg-red-500';
            case 'offline': return 'bg-gray-700';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'excellent': return 'عالی';
            case 'good': return 'معمولی';
            case 'slow': return 'کند';
            case 'offline': return 'قطع';
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-2">
            {/* Expanded Info */}
            {isVisible && (
                <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl text-xs text-white min-w-[150px] animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between mb-2 pb-2 border-b border-white/5">
                        <span className="text-gray-400">وضعیت اتصال:</span>
                        <span className={`font-bold ${status === 'excellent' ? 'text-emerald-400' : status === 'good' ? 'text-amber-400' : 'text-red-400'}`}>
                            {getStatusText()}
                        </span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-400">تاخیر (Latency):</span>
                        <span className="font-mono">{latency !== null ? `${latency}ms` : '---'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">سرور:</span>
                        <span className="text-blue-400 uppercase">Supabase API</span>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 shadow-lg transition-all hover:scale-105 active:scale-95 text-white text-[10px] font-bold ${isVisible ? 'bg-gray-800' : 'bg-black/40 backdrop-blur-sm'}`}
            >
                <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor()}`}></div>
                <span>مانیتورینگ اتصال (Admin)</span>
                {latency !== null && !isVisible && <span className="opacity-60 font-mono">{latency}ms</span>}
            </button>
        </div>
    );
};

export default ConnectionHealthGadget;
