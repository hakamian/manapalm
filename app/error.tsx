'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6" dir="rtl">
            <div className="max-w-md w-full text-center">
                {/* Animated Error Icon */}
                <div className="mb-8 relative">
                    <div className="w-28 h-28 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
                        <svg
                            className="w-14 h-14 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    {/* Decorative rings */}
                    <div className="absolute inset-0 w-28 h-28 mx-auto border border-red-500/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    مشکلی پیش آمد!
                </h1>

                {/* Subtitle */}
                <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                    متأسفانه خطایی رخ داده است. تیم فنی ما در حال بررسی است.
                </p>

                {/* Error Digest (for debugging) */}
                {error.digest && (
                    <p className="text-gray-600 text-xs mb-6 font-mono">
                        کد خطا: {error.digest}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            تلاش مجدد
                        </span>
                    </button>

                    <a
                        href="/"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            صفحه اصلی
                        </span>
                    </a>
                </div>

                {/* Support Link */}
                <div className="mt-10 pt-6 border-t border-white/5">
                    <p className="text-gray-500 text-sm">
                        مشکل برطرف نشد؟{' '}
                        <a
                            href="https://t.me/hossein_hakamian"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-4"
                        >
                            با پشتیبانی صحبت کنید
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
