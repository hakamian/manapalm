
import React from 'react';
import { Deed } from '../types';
import { useAppDispatch, useAppState } from '../AppContext';
import { ClockForwardIcon, MicrophoneIcon, MapPinIcon, GlobeIcon, PhotoIcon } from './icons';

const SubtlePalmWatermark = () => (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full object-contain z-0 opacity-[0.03] text-stone-900 dark:text-white" aria-hidden="true" style={{ transform: 'scale(1.5)' }}>
        <path d="M 50 150 C 52 100, 48 50, 50 30 L 50 30 C 52 50, 48 100, 50 150" fill="currentColor" />
        <g transform="translate(50, 35)" fill="currentColor">
            <path d="M 0 0 C 30 -25, 60 -15, 70 10" transform="rotate(-30)" /><path d="M 0 0 C 35 -20, 65 -10, 75 15" transform="rotate(0)" /><path d="M 0 0 C 30 -15, 55 0, 65 20" transform="rotate(30)" /><path d="M 0 0 C -30 -25, -60 -15, -70 10" transform="rotate(210)" /><path d="M 0 0 C -35 -20, -65 -10, -75 15" transform="rotate(180)" /><path d="M 0 0 C -30 -15, -55 0, -65 20" transform="rotate(150)" />
        </g>
    </svg>
);

const ModernSealIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="w-24 h-24 text-amber-800/80 dark:text-amber-300/80" aria-hidden="true">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" fill="none" />
        <text x="50" y="30" fontFamily="Vazirmatn, sans-serif" fontSize="10" fill="currentColor" textAnchor="middle">نخلستان معنا</text>
        <path d="M50 60 C 51 50, 49 40, 50 45 L 50 45 C 51 50, 49 50, 50 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <g transform="translate(50, 48)" stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M 0 0 C 8 -7, 16 -4, 20 2" transform="rotate(-20) scale(0.6)" />
            <path d="M 0 0 C 10 -5, 18 -2, 22 4" transform="rotate(10) scale(0.6)" />
            <path d="M 0 0 C -8 -7, -16 -4, -20 2" transform="rotate(20) scale(0.6)" />
            <path d="M 0 0 C -10 -5, -18 -2, -22 4" transform="rotate(-10) scale(0.6)" />
        </g>
        <text x="50" y="78" fontFamily="Vazirmatn, sans-serif" fontSize="10" fill="currentColor" textAnchor="middle">تاسیس ۱۴۰۳</text>
    </svg>
);

interface DeedDisplayProps {
    deed: Deed;
}

const DeedDisplay = React.forwardRef<HTMLDivElement, DeedDisplayProps>(({ deed }, ref) => {
    const dispatch = useAppDispatch();
    const { user } = useAppState();

    const [activeTab, setActiveTab] = React.useState<'certificate' | 'timeline'>('certificate');
    const [memoryText, setMemoryText] = React.useState('');
    const [memoryPhoto, setMemoryPhoto] = React.useState<string | null>(null);

    const deedEvents = React.useMemo(() => {
        return (user?.timeline || [])
            .filter((e: any) => e.deedId === deed.id)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [user?.timeline, deed.id]);

    const handleAddMemory = () => {
        if (!memoryText.trim() && !memoryPhoto) return;

        dispatch({
            type: 'ADD_TIMELINE_EVENT',
            payload: {
                id: `evt_mem_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'memory', // using 'memory' type
                title: 'خاطره نخل',
                description: memoryText,
                deedId: deed.id,
                deedIntention: deed.intention,
                details: {},
                memoryText: memoryText,
                memoryImage: memoryPhoto
            }
        });
        setMemoryText('');
        setMemoryPhoto(null);
    };

    const handlePhotoUpload = () => {
        // Simulating upload
        const randomImage = `https://picsum.photos/seed/${Date.now()}/400/300`;
        setMemoryPhoto(randomImage);
    };

    const handleFutureVision = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'OPEN_FUTURE_VISION_MODAL', payload: deed });
    };

    const handleVoiceOfPalm = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: 'OPEN_VOICE_OF_PALM_MODAL', payload: deed });
    };

    const openMap = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (deed.gpsCoordinates) {
            window.open(`https://www.google.com/maps?q=${deed.gpsCoordinates.lat},${deed.gpsCoordinates.lng}`, '_blank');
        }
    };

    return (
        <div ref={ref} className="max-w-md w-full bg-[#fcfaf5] dark:bg-stone-900 text-stone-800 dark:text-stone-200 rounded-lg shadow-2xl border border-stone-300 dark:border-stone-700 relative overflow-hidden flex flex-col max-h-[90vh]">

            {/* Tab Navigation */}
            <div className="flex border-b border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800">
                <button
                    onClick={() => setActiveTab('certificate')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'certificate' ? 'bg-white dark:bg-stone-900 text-amber-700 border-b-2 border-amber-600' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    گواهی کاشت
                </button>
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'timeline' ? 'bg-white dark:bg-stone-900 text-amber-700 border-b-2 border-amber-600' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    خاطرات و گاهشمار
                </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-2">
                {activeTab === 'certificate' ? (
                    <div className="relative p-2">
                        {/* Background Photo (If Planted) */}
                        {deed.plantedPhotoUrl && (
                            <div className="absolute inset-0 z-0 opacity-10 rounded-lg overflow-hidden pointer-events-none">
                                <img src={deed.plantedPhotoUrl} alt="Planted Palm" className="w-full h-full object-cover grayscale" />
                            </div>
                        )}

                        <div className="border-2 border-amber-700/50 dark:border-amber-400/30 p-6 rounded-md relative overflow-hidden z-10 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
                            <SubtlePalmWatermark />

                            <div className="relative z-10 text-center space-y-6">
                                <header className="space-y-1 border-b-2 border-double border-amber-800/30 dark:border-amber-300/20 pb-4">
                                    <p className="text-sm tracking-widest text-amber-800/70 dark:text-amber-300/70">نخلستان معنا</p>
                                    <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-200" style={{ fontFamily: 'Vazirmatn, serif' }}>سند کاشت نخل میراث</h2>
                                    <p className="text-xs text-stone-500">HERITAGE PALM PLANTING DEED</p>
                                </header>

                                <div className="text-lg space-y-4 py-2">
                                    <p className="text-stone-600 dark:text-stone-400">گواهی می‌شود که یک اصله نخل میراث با نیتِ</p>
                                    <p className="font-bold text-3xl text-green-700 dark:text-green-400">"{deed.intention}"</p>
                                    <p className="text-stone-600 dark:text-stone-400">به نامِ</p>
                                    <p className="font-semibold text-4xl text-stone-900 dark:text-stone-100">{deed.name}</p>
                                    {deed.fromName && <p className="text-stone-500 dark:text-stone-400 text-base">از طرفِ <strong className="text-stone-700 dark:text-stone-200">{deed.fromName}</strong></p>}
                                </div>

                                {deed.message && (
                                    <blockquote className="bg-stone-100/80 dark:bg-stone-800/80 border-r-4 border-amber-500 text-right p-4 my-4 rounded-r-lg">
                                        <p className="text-md italic text-stone-700 dark:text-stone-300">"{deed.message}"</p>
                                    </blockquote>
                                )}

                                {deed.gpsCoordinates && (
                                    <div
                                        onClick={openMap}
                                        className="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                        title="مشاهده موقعیت دقیق در گوگل مپ"
                                    >
                                        <MapPinIcon className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-mono text-blue-700 dark:text-blue-300">
                                            {deed.gpsCoordinates.lat.toFixed(4)}, {deed.gpsCoordinates.lng.toFixed(4)}
                                        </span>
                                        <GlobeIcon className="w-3 h-3 text-blue-400 ml-1" />
                                    </div>
                                )}

                                <footer className="pt-6 mt-4 flex justify-between items-end">
                                    <div className="text-right text-xs">
                                        <p className="font-semibold text-stone-500 dark:text-stone-400">تاریخ ثبت:</p>
                                        <p className="font-bold text-base text-stone-700 dark:text-stone-200">{new Date(deed.date).toLocaleDateString('fa-IR')}</p>
                                        <p className="font-mono text-[10px] text-stone-400 dark:text-stone-500 mt-2">ID: {deed.id}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            <button onClick={handleVoiceOfPalm} className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-800/50 flex items-center gap-1 transition-colors" title="پیام نخل">
                                                <MicrophoneIcon className="w-3 h-3" />
                                                صدای نخل
                                            </button>
                                            <button onClick={handleFutureVision} className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800/50 flex items-center gap-1 transition-colors" title="ماشین زمان نخلستان">
                                                <ClockForwardIcon className="w-3 h-3" />
                                                آینده نخل
                                            </button>
                                        </div>
                                        <ModernSealIcon />
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                        {/* Add Memory Form */}
                        <div className="bg-white dark:bg-stone-800 p-4 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700">
                            <h3 className="font-semibold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
                                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                                ثبت خاطره جدید
                            </h3>
                            <textarea
                                value={memoryText}
                                onChange={(e) => setMemoryText(e.target.value)}
                                placeholder="اینجا بنویسید... (چه حسی دارید؟ چه اتفاقی افتاده؟)"
                                className="w-full bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-600 rounded-md p-3 text-sm min-h-[100px] mb-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                            />

                            {memoryPhoto && (
                                <div className="mb-3 relative group inline-block">
                                    <img src={memoryPhoto} alt="Preview" className="w-24 h-24 object-cover rounded-md border border-stone-300" />
                                    <button
                                        onClick={() => setMemoryPhoto(null)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={handlePhotoUpload}
                                    className="text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center gap-1 text-xs font-medium"
                                >
                                    <PhotoIcon className="w-5 h-5" />
                                    <span>افزودن تصویر</span>
                                </button>
                                <button
                                    onClick={handleAddMemory}
                                    disabled={!memoryText.trim() && !memoryPhoto}
                                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-6 rounded-full transition-all shadow-md active:scale-95"
                                >
                                    ثبت در گاهشمار
                                </button>
                            </div>
                        </div>

                        {/* Timeline List */}
                        <div className="space-y-4">
                            {deedEvents.length > 0 ? (
                                deedEvents.map((event: any) => (
                                    <div key={event.id} className="relative pl-6 pb-6 border-l-2 border-stone-200 dark:border-stone-700 last:border-0 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-stone-900 shadow-sm"></div>
                                        <div className="text-xs text-stone-400 mb-1">{new Date(event.date).toLocaleDateString('fa-IR')}</div>
                                        <div className="bg-white dark:bg-stone-800 p-3 rounded-lg border border-stone-100 dark:border-stone-700 shadow-sm">
                                            <p className="font-semibold text-stone-800 dark:text-stone-200 mb-1">{event.title}</p>
                                            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                                            {event.memoryImage && (
                                                <img src={event.memoryImage} alt="Memory" className="mt-3 rounded-lg w-full h-auto object-cover max-h-48" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-stone-400">
                                    <ClockForwardIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>هنوز خاطره‌ای برای این نخل ثبت نشده است.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DeedDisplay;
