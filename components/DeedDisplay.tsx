
import React from 'react';
import { Deed } from '../types';
import { useAppDispatch, useAppState } from '../AppContext';
import { ClockForwardIcon, MicrophoneIcon, MapPinIcon, GlobeIcon, PhotoIcon, ArrowDownTrayIcon, ShareIcon, TelegramIcon, WhatsAppIcon } from './icons';

declare global {
    interface Window {
        html2canvas: any;
    }
}
const html2canvas = typeof window !== 'undefined' ? (window as any).html2canvas : null;

const SubtlePalmWatermark = () => (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full object-contain z-0 opacity-[0.03] text-stone-900 dark:text-white" aria-hidden="true" style={{ transform: 'scale(1.5)' }}>
        <path d="M 50 150 C 52 100, 48 50, 50 30 L 50 30 C 52 50, 48 100, 50 150" fill="currentColor" />
        <g transform="translate(50, 35)" fill="currentColor">
            <path d="M 0 0 C 30 -25, 60 -15, 70 10" transform="rotate(-30)" /><path d="M 0 0 C 35 -20, 65 -10, 75 15" transform="rotate(0)" /><path d="M 0 0 C 30 -15, 55 0, 65 20" transform="rotate(30)" /><path d="M 0 0 C -30 -25, -60 -15, -70 10" transform="rotate(210)" /><path d="M 0 0 C -35 -20, -65 -10, -75 15" transform="rotate(180)" /><path d="M 0 0 C -30 -15, -55 0, -65 20" transform="rotate(150)" />
        </g>
    </svg>
);

const ModernSealIcon = () => (
    <div className="relative group scale-75 origin-bottom-left">
        <svg width="80" height="80" viewBox="0 0 100 100" className="w-20 h-20 text-amber-600 dark:text-amber-400 drop-shadow-md transition-transform duration-500 group-hover:scale-110" aria-hidden="true">
            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
            <path d="M50 5 L53 15 L62 15 L55 22 L58 32 L50 26 L42 32 L45 22 L38 15 L47 15 Z" fill="currentColor" />
            <text x="50" y="42" fontFamily="Vazirmatn, sans-serif" fontSize="8" fontWeight="bold" fill="currentColor" textAnchor="middle">اصالت و معنا</text>
            <path d="M50 65 C 52 55, 48 45, 50 50 L 50 50 C 52 55, 48 55, 50 65" stroke="currentColor" strokeWidth="2" fill="none" />
            <g transform="translate(50, 52)" stroke="currentColor" strokeWidth="1.5" fill="none">
                <path d="M 0 0 C 10 -8, 20 -5, 25 2" transform="rotate(-25) scale(0.7)" />
                <path d="M 0 0 C 12 -6, 22 -3, 27 4" transform="rotate(15) scale(0.7)" />
                <path d="M 0 0 C -10 -8, -16 -5, -20 2" transform="rotate(25) scale(0.7)" />
                <path d="M 0 0 C -12 -6, -22 -3, -27 4" transform="rotate(-15) scale(0.7)" />
            </g>
            <text x="50" y="85" fontFamily="Vazirmatn, sans-serif" fontSize="9" fontWeight="bold" fill="currentColor" textAnchor="middle">تاسیس ۱۴۰۳</text>
        </svg>
        <div className="absolute inset-0 bg-amber-400/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    </div>
);

interface DeedDisplayProps {
    deed: Deed;
}

const DeedDisplay = React.forwardRef<HTMLDivElement, DeedDisplayProps>(({ deed }, ref) => {
    const dispatch = useAppDispatch();
    const { user } = useAppState();
    const certificateRef = React.useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = React.useState<'certificate' | 'timeline'>('certificate');
    const [memoryText, setMemoryText] = React.useState('');
    const [memoryPhoto, setMemoryPhoto] = React.useState<string | undefined>(undefined);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [bgStyle, setBgStyle] = React.useState<'modern' | 'classic'>('modern');

    const DEED_BACKGROUNDS = {
        modern: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1767202287/deed-bg-modern_yihffm.png',
        classic: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1767202286/deed-bg-classic_e3r0ja.png'
    };

    const deedEvents = React.useMemo(() => {
        return (user?.timeline || [])
            .filter((e: any) => e.deedId === deed.id)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [user?.timeline, deed.id]);

    const handleDownload = async () => {
        if (typeof html2canvas === 'undefined') {
            console.error('html2canvas library not loaded');
            alert('خطا: ابزار ذخیره تصویر در دسترس نیست.');
            return;
        }

        if (!certificateRef.current) return;

        setIsDownloading(true);
        try {
            // Wait a moment for icons/images to fully render if needed
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: null, // Transparent background if possible, or matches div
                logging: false,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Manapalm-Deed-${deed.name || 'Certificate'}.png`;
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
            alert('متاسفانه ذخیره تصویر انجام نشد.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'سند نخل میراث - نخلستان معنا',
            text: `من یک نخل میراث با نیت "${deed.intention}" در نخلستان معنا کاشتم! 🌱\nبه نام: ${deed.name}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            alert('لینک و متن کپی شد!');
        }
    };

    const handleSocialShare = (platform: 'telegram' | 'whatsapp') => {
        const text = encodeURIComponent(`من یک نخل میراث با نیت "${deed.intention}" در نخلستان معنا کاشتم! 🌱\nبه نام: ${deed.name}\n${window.location.href}`);
        let url = '';

        if (platform === 'telegram') {
            url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${text}`;
        } else if (platform === 'whatsapp') {
            url = `https://wa.me/?text=${text}`;
        }

        window.open(url, '_blank');
    };

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
        setMemoryPhoto(undefined);
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
                    <div className="relative">
                        {/* Downloadable Area Ref */}
                        <div
                            ref={certificateRef}
                            className="relative bg-black overflow-hidden min-h-[700px] flex flex-col justify-between text-center"
                        >
                            {/* Full Background Image */}
                            <div
                                className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
                                style={{
                                    backgroundImage: `url(${DEED_BACKGROUNDS[bgStyle]})`,
                                }}
                            />

                            {/* Certificate Content - Precise Alignment based on blue highlighted zones */}
                            <div className={`absolute inset-0 z-10 select-none ${bgStyle === 'classic' ? 'text-amber-950' : 'text-white'}`}>

                                {/* TOP BLUE BOX: Title & Brand */}
                                <div className="absolute top-[9.5%] left-[14%] w-[50%] text-right space-y-0.5">
                                    <p className={`text-[10px] tracking-[0.5em] uppercase font-light truncate ${bgStyle === 'classic' ? 'text-amber-900/60' : 'text-white/50'}`}>نخلستان معنا</p>
                                    <h2 className="text-2xl font-bold tracking-wide transition-colors duration-500"
                                        style={{
                                            fontFamily: 'Vazirmatn, serif',
                                            textShadow: bgStyle === 'classic' ? '0 0 15px rgba(255,255,255,0.8), 0 2px 4px rgba(120,60,0,0.3)' : '0 2px 10px rgba(0,0,0,0.9)'
                                        }}>
                                        سند کاشت نخل میراث
                                    </h2>
                                </div>

                                {/* PALM TREE ZONE: Keep clear (25% to 52%) */}
                                <div className="absolute top-[25%] left-0 right-0 h-[30%]" aria-hidden="true" />

                                {/* MIDDLE HORIZONTAL BLUE BOX: Intention */}
                                <div className="absolute top-[54%] left-[12%] right-[12%] h-[6%] flex items-center justify-center">
                                    <p className="text-[22px] font-bold leading-tight text-center transition-colors duration-500"
                                        style={{
                                            textShadow: bgStyle === 'classic' ? '0 0 10px rgba(255,255,255,0.9), 0 1px 3px rgba(120,60,0,0.2)' : '0 2px 10px rgba(0,0,0,0.9)'
                                        }}>
                                        "{deed.intention}"
                                    </p>
                                </div>

                                {/* LARGE BOTTOM BLUE BOX: All Remaining Details */}
                                <div className="absolute top-[63%] left-[12%] right-[12%] bottom-[6%] flex flex-col justify-between py-6">
                                    {/* Name & Donor Section */}
                                    <div className="space-y-1 text-center">
                                        <p className={`text-[11px] font-medium tracking-widest uppercase ${bgStyle === 'classic' ? 'text-amber-900/40' : 'text-amber-200/50'}`}>به نام</p>
                                        <p className="text-[34px] font-bold tracking-tight leading-none transition-colors duration-500"
                                            style={{
                                                fontFamily: 'Vazirmatn, serif',
                                                textShadow: bgStyle === 'classic' ? '0 0 20px rgba(255,255,255,1), 0 2px 4px rgba(120,60,0,0.2)' : '0 4px 15px rgba(0,0,0,1)'
                                            }}>
                                            {deed.name}
                                        </p>
                                        {deed.fromName && (
                                            <p className={`text-xs italic mt-1 ${bgStyle === 'classic' ? 'text-stone-800' : 'text-amber-100/60'}`}>
                                                اهدا از طرف <span className="font-bold">{deed.fromName}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Message / Quote Section */}
                                    {deed.message && (
                                        <div className={`px-6 py-4 mx-auto max-w-[280px] border-y ${bgStyle === 'classic' ? 'border-amber-900/10 bg-white/5' : 'border-white/5 bg-black/5'} backdrop-blur-[1px]`}>
                                            <p className={`text-sm italic leading-relaxed font-serif text-center ${bgStyle === 'classic' ? 'text-amber-900' : 'text-white/80'}`}>
                                                "{deed.message}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Bottom Info Row (Date, ID, Seal) */}
                                    <div className="flex justify-between items-end w-full px-2">
                                        {/* Seal */}
                                        <div className="scale-90 origin-bottom-left">
                                            <ModernSealIcon />
                                        </div>

                                        {/* Footer Info */}
                                        <div className="text-right space-y-1">
                                            {deed.gpsCoordinates && (
                                                <div className={`flex items-center justify-end gap-1 mb-1 ${bgStyle === 'classic' ? 'text-amber-900/30' : 'text-white/20'}`}>
                                                    <MapPinIcon className="w-2.5 h-2.5" />
                                                    <span className="text-[7px] font-mono tracking-widest">
                                                        GPS: {deed.gpsCoordinates.lat.toFixed(4)}, {deed.gpsCoordinates.lng.toFixed(4)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="space-y-0.5">
                                                <p className={`text-[9px] uppercase font-bold tracking-tighter ${bgStyle === 'classic' ? 'text-amber-900/40' : 'text-white/30'}`}>Registration Date</p>
                                                <p className={`text-lg font-bold leading-none ${bgStyle === 'classic' ? 'text-amber-950' : 'text-white'}`}>
                                                    {new Date(deed.date).toLocaleDateString('fa-IR')}
                                                </p>
                                                <p className={`font-mono text-[8px] tracking-[0.2em] ${bgStyle === 'classic' ? 'text-amber-900/20' : 'text-white/10'}`}>
                                                    ID: {deed.id.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background Style Selector */}
                        <div className="flex justify-center gap-3 mt-4" data-html2canvas-ignore="true">
                            <span className="text-xs text-stone-500 dark:text-stone-400 self-center">طرح سند:</span>
                            <button
                                onClick={() => setBgStyle('modern')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${bgStyle === 'modern'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                                    }`}
                            >
                                🌿 مدرن
                            </button>
                            <button
                                onClick={() => setBgStyle('classic')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${bgStyle === 'classic'
                                    ? 'bg-amber-600 text-white shadow-md'
                                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
                                    }`}
                            >
                                📜 کلاسیک
                            </button>
                        </div>

                        {/* Action Buttons (Download/Share) */}
                        <div className="flex justify-center flex-wrap gap-4 mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 py-2 px-4 rounded-full transition-colors text-sm font-semibold disabled:opacity-50"
                            >
                                <ArrowDownTrayIcon className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                                {isDownloading ? 'در حال ذخیره...' : 'دانلود تصویر سند'}
                            </button>

                            <div className="flex gap-2">
                                <button onClick={handleShare} className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 p-2 rounded-full text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors" title="اشتراک‌گذاری">
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleSocialShare('telegram')} className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 p-2 rounded-full text-blue-500 hover:text-blue-600 transition-colors" title="ارسال در تلگرام">
                                    <TelegramIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleSocialShare('whatsapp')} className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 p-2 rounded-full text-green-600 hover:text-green-700 transition-colors" title="ارسال در واتس‌اپ">
                                    <WhatsAppIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                        {/* Memory Tab Content (Same as before) */}
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
                                        onClick={() => setMemoryPhoto(undefined)}
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

                        {/* Timeline List (Same as before) */}
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
