import React, { useState } from 'react';
import AIImageUploader from './AIImageUploader';
import { PhotoIcon, SparklesIcon, ArrowDownTrayIcon } from '../icons';
import '../../styles/admin-dashboard.css';

const Square3Stack3DIcon = ({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
    </svg>
);

const AiArtStudioDashboard: React.FC = () => {
    // در یک اپ واقعی، این لیست را از دیتابیس یا کلودینری می‌خوانیم.
    // فعلا برای دمو، عکس‌های تولید شده را در استیت نگه می‌داریم.
    const [gallery, setGallery] = useState<{ id: string; url: string; title: string; type: string }[]>([]);

    const handleNewImage = (url: string, publicId: string) => {
        setGallery(prev => [{
            id: publicId,
            url: url,
            title: `Art Piece #${prev.length + 1}`,
            type: 'AI Generated'
        }, ...prev]);
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg shadow-purple-900/30">
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="admin-heading-1" style={{ marginBottom: '0.25rem' }}>
                                استودیوی هنری هوش مصنوعی
                            </h1>
                            <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                                تولید، ویرایش و مدیریت دارایی‌های تصویری با قدرت Generative AI
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Generator Tool */}
                <div className="lg:col-span-1 space-y-6">
                    <AIImageUploader onImageReady={handleNewImage} />

                    {/* Quick Stats / Info Card */}
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Square3Stack3DIcon className="w-5 h-5 text-blue-400" />
                            وضعیت منابع
                        </h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>فضای Cloudinary</span>
                                <span className="text-white">25GB Free</span>
                            </div>
                            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 w-[15%] h-full rounded-full"></div>
                            </div>

                            <div className="flex justify-between text-gray-400 mt-2">
                                <span>اعتبار OpenAI</span>
                                <span className="text-white">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Gallery & Showcase */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 min-h-[600px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <PhotoIcon className="w-6 h-6 text-pink-400" />
                                گالری آثار اخیر
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 hidden md:inline">برای استفاده در محصول: لینک را کپی کنید و در فرم محصول قرار دهید.</span>
                                <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">{gallery.length} مورد</span>
                            </div>
                        </div>

                        {gallery.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                                <SparklesIcon className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium text-gray-400">گالری خالی است</p>
                                <p className="text-sm mt-2">از پنل سمت راست برای خلق اولین اثر هنری خود استفاده کنید!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {gallery.map((item) => (
                                    <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-lg hover:shadow-purple-500/10 transition-all hover:scale-[1.02]">
                                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-white font-bold text-sm truncate">{item.title}</p>
                                            <p className="text-xs text-gray-300 mb-2">{item.type}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded backdrop-blur-sm border border-white/10 flex items-center justify-center gap-1"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(item.url);
                                                        alert('لینک تصویر کپی شد');
                                                    }}
                                                >
                                                    کپی لینک
                                                </button>
                                                <button
                                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-1.5 rounded backdrop-blur-sm border border-white/10 flex items-center justify-center gap-1"
                                                    onClick={() => window.open(item.url, '_blank')}
                                                >
                                                    <ArrowDownTrayIcon className="w-3 h-3" />
                                                    نمایش
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiArtStudioDashboard;
